import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  Card,
  CardContent,
  Divider,
  MenuItem,
  Menu,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  Collapse,
  Pagination
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  FilterAlt as FilterIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Sort as SortIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { DeleteConfirmDialog, ApproveConfirmDialog, ActionSuccessDialog } from '../components/ConfirmationDialog';
import { getAllExports, getExportDetails, updateExportStatus, deleteExport } from '../services/exportService';
import API_BASE_URL from '../config/api';

// Status chip color mapping
const STATUS_COLORS = {
  'ລໍຖ້າອະນຸມັດ': {
    backgroundColor: '#FFA726'  // Orange for pending
  },
  'ນຳອອກແລ້ວ': {
    backgroundColor: '#66BB6A'  // Green for approved
  },
  'ຍົກເລີກ': {
    backgroundColor: '#F44336'  // Red for canceled
  }
};

function ExportDetail() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // States for exports data
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exportHistory, setExportHistory] = useState([]);
  const [filteredExports, setFilteredExports] = useState([]);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filterExpanded, setFilterExpanded] = useState(false);
  
  // Sort states
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  // Selected export states
  const [selectedExport, setSelectedExport] = useState(null);
  const [selectedExportItems, setSelectedExportItems] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  
  // Print dialog state
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const printRef = useRef(null);
  
  // Action menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuExportId, setMenuExportId] = useState(null);
  
  // Confirmation dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedExportId, setSelectedExportId] = useState(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [selectedApproveId, setSelectedApproveId] = useState(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const isAdmin = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user && user.role === 'admin';
  };
  
  // Fetch export history when component mounts
  useEffect(() => {
    fetchExportHistory();
  }, []);
  
  // Update filtered exports when filters change
  useEffect(() => {
    applyFiltersAndSort(exportHistory, searchTerm, statusFilter, startDate, endDate, sortField, sortDirection);
  }, [searchTerm, statusFilter, startDate, endDate, sortField, sortDirection, exportHistory]);
  
  // Update filter based on tab selection
  useEffect(() => {
    let status = 'all';
    
    switch (tabValue) {
      case 0: // All
        status = 'all';
        break;
      case 1: // Pending
        status = 'ລໍຖ້າອະນຸມັດ';
        break;
      case 2: // Approved
        status = 'ນຳອອກແລ້ວ';
        break;
      default:
        status = 'all';
    }
    
    setStatusFilter(status);
  }, [tabValue]);

  // ດຶງຂໍ້ມູນປະຫວັດການນຳອອກສິນຄ້າ
  const fetchExportHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ດຶງຂໍ້ມູນຈາກ API
      const data = await getAllExports();
      
      if (data && data.length > 0) {
        // Process each export to ensure item counts are available
        const processedExports = await Promise.all(data.map(async (exportItem) => {
          // If we already have items or item_count, no need for further processing
          if ((exportItem.items && exportItem.items.length > 0) || 
              (exportItem.export_details && exportItem.export_details.length > 0) ||
              typeof exportItem.item_count === 'number') {
            return exportItem;
          }
          
          // Get the export ID from either export_id or id field
          const exportId = exportItem.export_id || exportItem.id;
          
          // For exports without item info, try to get item count from API
          try {
            const details = await getExportDetails(exportId);
            if (details && details.length > 0) {
              return {
                ...exportItem,
                // Store both the details and the count
                items: details,
                item_count: details.length
              };
            }
          } catch (detailError) {
            console.error(`Could not load details for export ${exportId}:`, detailError);
          }
          
          return exportItem;
        }));
        
        setExportHistory(processedExports);
        applyFiltersAndSort(processedExports, searchTerm, statusFilter, startDate, endDate, sortField, sortDirection);
      } else {
        setExportHistory([]);
        setFilteredExports([]);
        setError("ບໍ່ພົບຂໍ້ມູນການນຳອອກສິນຄ້າ");
      }
    } catch (error) {
      console.error('ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນປະຫວັດການນຳອອກສິນຄ້າ:', error);
      setError("ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນປະຫວັດການນຳອອກສິນຄ້າ");
    } finally {
      setLoading(false);
    }
  };
  
  // ດຶງຂໍ້ມູນລາຍລະອຽດການນຳອອກສິນຄ້າ
  const fetchExportDetails = async (exportId) => {
    try {
      setDetailsLoading(true);
      
      // ດຶງຂໍ້ມູນລາຍລະອຽດຈາກ API
      const details = await getExportDetails(exportId);
      
      if (details && details.length > 0) {
        setSelectedExportItems(details);
      } else {
        setSelectedExportItems([]);
      }
    } catch (error) {
      console.error('ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນລາຍລະອຽດການນຳອອກສິນຄ້າ:', error);
      setSelectedExportItems([]);
      showSnackbar("ບໍ່ສາມາດດຶງຂໍ້ມູນລາຍລະອຽດໄດ້", "error");
    } finally {
      setDetailsLoading(false);
    }
  };
  
  // Apply filters and sorting function
  const applyFiltersAndSort = (exports, search, status, dateStart, dateEnd, field, direction) => {
    if (!exports || exports.length === 0) {
      setFilteredExports([]);
      return;
    }
    
    // Apply filters
    let filtered = exports.filter(exportItem => {
      // Text search filtering
      const matchesSearch = !search || 
        (exportItem.id && exportItem.id.toString().includes(search)) ||
        (exportItem.export_id && exportItem.export_id.toString().includes(search)) ||
        (exportItem.date && exportItem.date.includes(search)) ||
        (exportItem.export_date && exportItem.export_date.includes(search)) ||
        (exportItem.items && exportItem.items.some(product => 
          (product.name && product.name.toLowerCase().includes(search.toLowerCase())) ||
          (product.ProductName && product.ProductName.toLowerCase().includes(search.toLowerCase())) ||
          (product.exportReason && product.exportReason.toLowerCase().includes(search.toLowerCase())) ||
          (product.reason && product.reason.toLowerCase().includes(search.toLowerCase()))
        ));
      
      // Status filtering
      const exportStatus = getExportStatus(exportItem);
      const matchesStatus = status === 'all' || exportStatus === status;
      
      // Date filtering
      let matchesDateRange = true;
      if (dateStart || dateEnd) {
        const exportDate = new Date(exportItem.date || exportItem.export_date || exportItem.exp_date);
        
        if (dateStart) {
          const startDateObj = new Date(dateStart);
          matchesDateRange = matchesDateRange && exportDate >= startDateObj;
        }
        
        if (dateEnd) {
          const endDateObj = new Date(dateEnd);
          // Set time to end of day for inclusive end date
          endDateObj.setHours(23, 59, 59, 999);
          matchesDateRange = matchesDateRange && exportDate <= endDateObj;
        }
      }
      
      return matchesSearch && matchesStatus && matchesDateRange;
    });
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (field) {
        case 'date':
          aValue = new Date(a.date || a.export_date || a.exp_date);
          bValue = new Date(b.date || b.export_date || b.exp_date);
          break;
        case 'status':
          aValue = getExportStatus(a);
          bValue = getExportStatus(b);
          break;
        case 'items':
          aValue = getItemCount(a);
          bValue = getItemCount(b);
          break;
        default:
          aValue = new Date(a.date || a.export_date || a.exp_date);
          bValue = new Date(b.date || b.export_date || b.exp_date);
      }
      
      // Handle numeric values
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Handle date objects
      if (aValue instanceof Date && bValue instanceof Date) {
        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Handle strings
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return 0;
    });
    
    setFilteredExports(filtered);
  };
  
  // Calculate pagination indexes
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredExports.slice(indexOfFirstItem, indexOfLastItem);
  
  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    
    try {
      // Check if it's ISO format
      if (dateStr.includes('T')) {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
      }
      
      // If it's already in DD/MM/YYYY format, return as is
      if (dateStr.includes('/')) {
        return dateStr;
      }
      
      // Try to convert other string formats
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    } catch (error) {
      console.error("Date formatting error:", error);
      return dateStr;
    }
  };
  
  // Utility functions for accessing export data with different possible field names
  
  // Get item count from export item
  const getItemCount = (exportItem) => {
    if (exportItem.items && Array.isArray(exportItem.items)) {
      return exportItem.items.length;
    }
    
    if (exportItem.export_details && Array.isArray(exportItem.export_details)) {
      return exportItem.export_details.length;
    }
    
    if (typeof exportItem.item_count === 'number') {
      return exportItem.item_count;
    }
    
    if (typeof exportItem.count === 'number') {
      return exportItem.count;
    }
    
    return "—";
  };

  // Get export date from different possible properties
  const getExportDate = (exportItem) => {
    return formatDate(exportItem.date || exportItem.export_date || exportItem.exp_date);
  };

  // Get export id from different possible properties
  const getExportId = (exportItem) => {
    return exportItem.id || exportItem.export_id || exportItem.exp_id;
  };

  // Get status from export item
  const getExportStatus = (exportItem) => {
    return exportItem.status || 'ລໍຖ້າອະນຸມັດ';
  };

  // Get product name from item
  const getProductName = (item) => {
    const nameFields = ['name', 'ProductName', 'product_name'];
    
    for (const field of nameFields) {
      if (item[field] && typeof item[field] === 'string' && item[field].trim() !== '') {
        return item[field];
      }
    }
    
    return 'ບໍ່ລະບຸຊື່ສິນຄ້າ';
  };

  // Get export quantity from item
  const getExportQuantity = (item) => {
    return item.exportQuantity || item.qty || 0;
  };

  // Get export location from item
  const getExportLocation = (item) => {
    const locationFields = ['exportLocation', 'location', 'zone'];
    
    for (const field of locationFields) {
      if (item[field] && typeof item[field] === 'string' && item[field].trim() !== '') {
        return item[field];
      }
    }
    
    if (item.zone_id) {
      return `Zone ${item.zone_id}`;
    }
    
    return 'ບໍ່ລະບຸສະຖານທີ່';
  };

  // Get export reason from item
  const getExportReason = (item) => {
    return item.exportReason || item.reason || '-';
  };
  
  // Get status chip color
  const getStatusChipColor = (status) => {
    return STATUS_COLORS[status]?.backgroundColor || '#9E9E9E';
  };
  
  // Event handlers
  
  // Handle view export details
  const handleViewExport = (exportData) => {
    setSelectedExport(exportData);
    setDetailDialogOpen(true);
    
    const exportId = exportData.export_id || exportData.id;
    
    if (!exportData.items || exportData.items.length === 0) {
      fetchExportDetails(exportId);
    } else {
      setSelectedExportItems(exportData.items);
    }
  };

  // Handle print export
  const handlePrintExport = (exportData) => {
    setSelectedExport(exportData);
    
    if (!exportData.items || exportData.items.length === 0) {
      const exportId = exportData.export_id || exportData.id;
      fetchExportDetails(exportId);
    } else {
      setSelectedExportItems(exportData.items);
    }
    
    setPrintDialogOpen(true);
  };

  // Handle delete export
  const handleDeleteExport = (id) => {
    if (!isAdmin()) {
      showSnackbar('ທ່ານບໍ່ມີສິດລົບ', 'error');
      return;
    }
    setSelectedExportId(id);
    setDeleteDialogOpen(true);
  };

  // Handle approve export
  const handleApproveExport = (id) => {
    if (!isAdmin()) {
      showSnackbar('ທ່ານບໍ່ມີສິດອະນຸມັດການນຳເຂົ້າ', 'error');
      return;
    }
  
    setSelectedApproveId(id);
    setApproveDialogOpen(true);
  };
  
  
  // Handle sort menu
  const handleOpenSortMenu = (event) => {
    setSortAnchorEl(event.currentTarget);
  };
  
  const handleCloseSortMenu = () => {
    setSortAnchorEl(null);
  };
  
  // Handle sort selection
  const handleSort = (field, direction) => {
    setSortField(field);
    setSortDirection(direction);
    setSortAnchorEl(null);
  };
  
  // Toggle filter expansion
  const toggleFilterExpansion = () => {
    setFilterExpanded(!filterExpanded);
  };
  
  // Handle action menu
  const handleOpenActionMenu = (event, exportId) => {
    setAnchorEl(event.currentTarget);
    setMenuExportId(exportId);
  };
  
  const handleCloseActionMenu = () => {
    setAnchorEl(null);
    setMenuExportId(null);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle pagination
  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };
  
  // Open filter dialog
  const handleOpenFilterDialog = () => {
    setFilterDialogOpen(true);
  };
  
  const handleCloseFilterDialog = () => {
    setFilterDialogOpen(false);
  };
  
  // Apply filters
  const applyFilters = () => {
    applyFiltersAndSort(exportHistory, searchTerm, statusFilter, startDate, endDate, sortField, sortDirection);
    setFilterDialogOpen(false);
    showSnackbar("ການກັ່ນຕອງສຳເລັດແລ້ວ", "success");
  };
  
  // Reset filters
  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
    setStatusFilter('all');
    setTabValue(0);
    setCurrentPage(1);
    setFilterDialogOpen(false);
    applyFiltersAndSort(exportHistory, '', 'all', '', '', sortField, sortDirection);
  };
  
  // Confirm delete action
  const confirmDelete = async (id) => {
    try {
      setLoading(true);
      const exportIdToDelete = id || selectedExportId;
      
      await deleteExport(exportIdToDelete);
      
      setExportHistory(prevHistory => 
        prevHistory.filter(item => 
          (item.id !== exportIdToDelete) && (item.export_id !== exportIdToDelete)
        )
      );
      
      setFilteredExports(prevFiltered => 
        prevFiltered.filter(item => 
          (item.id !== exportIdToDelete) && (item.export_id !== exportIdToDelete)
        )
      );
      
      setDeleteDialogOpen(false);
      setActionType('delete');
      setSuccessDialogOpen(true);
    } catch (error) {
      console.error('ເກີດຂໍ້ຜິດພາດໃນການລຶບການນຳອອກສິນຄ້າ:', error);
      showSnackbar("ເກີດຂໍ້ຜິດພາດໃນການລຶບການນຳອອກສິນຄ້າ", "error");
    } finally {
      setLoading(false);
      setSelectedExportId(null);
    }
  };

  // Confirm approve action
  const confirmApprove = async (id) => {
    try {
      setLoading(true);
      const exportIdToApprove = id || selectedApproveId;
      
      await updateExportStatus(exportIdToApprove, 'ນຳອອກແລ້ວ');
      
      setExportHistory(prevHistory => 
        prevHistory.map(item => {
          if ((item.id === exportIdToApprove) || (item.export_id === exportIdToApprove)) {
            return {...item, status: 'ນຳອອກແລ້ວ'};
          }
          return item;
        })
      );
      
      setFilteredExports(prevFiltered => 
        prevFiltered.map(item => {
          if ((item.id === exportIdToApprove) || (item.export_id === exportIdToApprove)) {
            return {...item, status: 'ນຳອອກແລ້ວ'};
          }
          return item;
        })
      );
      
      setApproveDialogOpen(false);
      setActionType('approve');
      setSuccessDialogOpen(true);
    } catch (error) {
      console.error('ເກີດຂໍ້ຜິດພາດໃນການອະນຸມັດການນຳອອກສິນຄ້າ:', error);
      showSnackbar("ເກີດຂໍ້ຜິດພາດໃນການອະນຸມັດການນຳອອກສິນຄ້າ", "error");
    } finally {
      setLoading(false);
      setSelectedApproveId(null);
    }
  };
  
  // Dialog handlers
  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedExport(null);
    setSelectedExportItems([]);
  };

  const handleClosePrintDialog = () => {
    setPrintDialogOpen(false);
    setSelectedExport(null);
    setSelectedExportItems([]);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedExportId(null);
  };

  const handleCloseApproveDialog = () => {
    setApproveDialogOpen(false);
    setSelectedApproveId(null);
  };

  const handleCloseActionSuccessDialog = () => {
    setSuccessDialogOpen(false);
  };
  
  // Handle print
  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current;
      const windowUrl = 'about:blank';
      const windowName = 'Print';
      const windowFeatures = 'width=800,height=600,left=50,top=50';
      
      const printWindow = window.open(windowUrl, windowName, windowFeatures);
      
      printWindow.document.write('<html><head><title>ໃບນຳອອກສິນຄ້າ</title>');
      printWindow.document.write('<style>');
      printWindow.document.write(`
        body { font-family: 'Noto Sans Lao', 'Phetsarath OT', sans-serif; padding: 20px; }
        .export-header { text-align: center; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th, td { padding: 8px; border: 1px solid #ddd; text-align: center; }
        thead { background-color: #f0f0f0; }
        .signatures { display: flex; justify-content: space-around; margin-top: 50px; }
        .signature-box { width: 200px; text-align: center; }
        .signature-line { border-top: 1px solid #000; margin-top: 70px; padding-top: 10px; }
        @media print {
          body { margin: 0; padding: 0.5cm; }
          table { page-break-inside: avoid; }
        }
      `);
      printWindow.document.write('</style></head><body>');
      printWindow.document.write(printContent.innerHTML);
      printWindow.document.write('</body></html>');
      
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        setPrintDialogOpen(false);
      }, 500);
    }
  };
  
  // Show snackbar notification
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };
  
  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <Layout title="ປະຫວັດການນຳອອກສິນຄ້າ">
      {/* Snackbar notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog 
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={confirmDelete}
        itemId={selectedExportId}
        loading={loading}
      />
      
      {/* Approve Confirmation Dialog */}
      <ApproveConfirmDialog 
        open={approveDialogOpen}
        onClose={handleCloseApproveDialog}
        onConfirm={confirmApprove}
        itemId={selectedApproveId}
        loading={loading}
      />
      
      {/* Success Dialog */}
      <ActionSuccessDialog 
        open={successDialogOpen}
        onClose={handleCloseActionSuccessDialog}
        title={actionType === 'approve' ? "ອະນຸມັດສຳເລັດ" : "ລຶບສຳເລັດ"}
        message={actionType === 'approve' ? "ການນຳອອກໄດ້ຖືກອະນຸມັດແລ້ວ" : "ລາຍການນຳອອກຖືກລຶບສຳເລັດແລ້ວ"}
        actionType={actionType}
      />
      
      {/* Filter Dialog */}
      <Dialog
        open={filterDialogOpen}
        onClose={handleCloseFilterDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', py: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">ຕົວກັ່ນຕອງຂໍ້ມູນ</Typography>
            <IconButton
              aria-label="close"
              onClick={handleCloseFilterDialog}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ວັນທີເລີ່ມຕົ້ນ"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ວັນທີສິ້ນສຸດ"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="ສະຖານະການນຳອອກ"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">- ທັງໝົດ -</MenuItem>
                <MenuItem value="ລໍຖ້າອະນຸມັດ">ລໍຖ້າອະນຸມັດ</MenuItem>
                <MenuItem value="ນຳອອກແລ້ວ">ນຳອອກແລ້ວ</MenuItem>
                <MenuItem value="ຍົກເລີກ">ຍົກເລີກ</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={resetFilters} 
            color="error"
            startIcon={<RefreshIcon />}
          >
            ລ້າງຂໍ້ມູນ
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={applyFilters}
            startIcon={<FilterIcon />}
          >
            ນຳໃຊ້ຕົວກັ່ນຕອງ
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Export Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={handleCloseDetailDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', py: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">ລາຍລະອຽດນຳອອກສິນຄ້າ</Typography>
            <Button 
              variant="contained" 
              color="error" 
              onClick={handleCloseDetailDialog}
              size="small"
            >
              ປິດ
            </Button>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {selectedExport && (
            <Box sx={{ mt: 2, mb: 3 }}>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">ລະຫັດການນຳອອກ</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {getExportId(selectedExport)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">ວັນທີ</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {getExportDate(selectedExport)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">ສະຖານະ</Typography>
                      <Chip 
                        label={getExportStatus(selectedExport)}
                        sx={{ 
                          bgcolor: getStatusChipColor(getExportStatus(selectedExport)), 
                          color: 'white',
                          mt: 0.5
                        }}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">ຈຳນວນລາຍການ</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {getItemCount(selectedExport)} ລາຍການ
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              
              <Typography variant="h6" gutterBottom>
                ລາຍການສິນຄ້າທີ່ນຳອອກ
              </Typography>
              
              {detailsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              ) : selectedExportItems.length > 0 ? (
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                  <Table>
                    <TableHead sx={{ bgcolor: 'background.default' }}>
                      <TableRow>
                        <TableCell align="center" width="5%">#</TableCell>
                        <TableCell align="center">ຊື່ສິນຄ້າ</TableCell>
                        <TableCell align="center">ຈຳນວນ</TableCell>
                        <TableCell align="center">ບ່ອນຈັດວາງ</TableCell>
                        <TableCell align="center">ສາເຫດການນຳອອກ</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedExportItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell align="center">{index + 1}</TableCell>
                          <TableCell align="center">{getProductName(item)}</TableCell>
                          <TableCell align="center">{getExportQuantity(item)}</TableCell>
                          <TableCell align="center">{getExportLocation(item)}</TableCell>
                          <TableCell align="center">
                            <Tooltip title={getExportReason(item)}>
                              <Typography variant="body2" sx={{ maxWidth: 200 }} noWrap>
                                {getExportReason(item)}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info" sx={{ mb: 3 }}>ບໍ່ພົບຂໍ້ມູນລາຍລະອຽດສິນຄ້າ</Alert>
              )}
              
              <Divider sx={{ my: 3 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                <Box sx={{ textAlign: 'center', width: '200px' }}>
                  <Typography variant="body2">ຜູ້ນຳອອກ</Typography>
                  <Box sx={{ borderTop: '1px solid #ccc', mt: 8, pt: 1 }}>
                    <Typography variant="body2">ລາຍເຊັນ</Typography>
                  </Box>
                </Box>
                <Box sx={{ textAlign: 'center', width: '200px' }}>
                  <Typography variant="body2">ຜູ້ອະນຸມັດ</Typography>
                  <Box sx={{ borderTop: '1px solid #ccc', mt: 8, pt: 1 }}>
                    <Typography variant="body2">ລາຍເຊັນ</Typography>
                  </Box>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  startIcon={<PrintIcon />}
                  onClick={() => handlePrintExport(selectedExport)}
                >
                  ພິມ
                </Button>
                
                {getExportStatus(selectedExport) === 'ລໍຖ້າອະນຸມັດ' && (
              <Button 
  variant="contained" 
  color="success" 
  startIcon={<CheckCircleIcon />}
  onClick={() => {
    handleCloseDetailDialog();
    handleApproveExport(getExportId(selectedExport));
  }}
  disabled={!isAdmin()} // ปิดปุ่มถ้าไม่ใช่แอดมิน
>
  ອະນຸມັດ
</Button>
                )}
                
                <Button 
                  variant="contained" 
                  color="error" 
                  startIcon={<DeleteIcon />}
                  onClick={() => {
                    handleCloseDetailDialog();
                    handleDeleteExport(getExportId(selectedExport));
                  }}
                  disabled={!isAdmin()} // ปิดปุ่มถ้าไม่ใช่แอดมิน
                >
                  ລຶບ
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Print Dialog */}
      <Dialog
        open={printDialogOpen}
        onClose={handleClosePrintDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', py: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">ພິມໃບນຳອອກສິນຄ້າ</Typography>
            <Button 
              variant="contained" 
              color="error" 
              onClick={handleClosePrintDialog}
              size="small"
            >
              ປິດ
            </Button>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ mt: 2 }}>
          {selectedExport && (
            <div ref={printRef}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" align="center" sx={{ mb: 1, fontWeight: 'bold' }}>
                  ໃບນຳອອກສິນຄ້າ
                </Typography>
                <Typography variant="h6" align="center" sx={{ mb: 3 }}>
                  ວັນທີ: {getExportDate(selectedExport)}
                </Typography>
                
                {detailsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : selectedExportItems.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                    <Table>
                      <TableHead sx={{ bgcolor: 'background.default' }}>
                        <TableRow>
                          <TableCell align="center" width="5%">#</TableCell>
                          <TableCell align="center">ຊື່ສິນຄ້າ</TableCell>
                          <TableCell align="center">ຈຳນວນ</TableCell>
                          <TableCell align="center">ບ່ອນຈັດວາງ</TableCell>
                          <TableCell align="center">ສາເຫດການນຳອອກ</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedExportItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell align="center">{index + 1}</TableCell>
                            <TableCell align="center">{getProductName(item)}</TableCell>
                            <TableCell align="center">{getExportQuantity(item)}</TableCell>
                            <TableCell align="center">{getExportLocation(item)}</TableCell>
                            <TableCell align="center">{getExportReason(item)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Alert severity="info" sx={{ mb: 3 }}>ບໍ່ພົບຂໍ້ມູນລາຍລະອຽດສິນຄ້າ</Alert>
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 5 }}>
                  <Box sx={{ textAlign: 'center', width: '200px' }}>
                    <Typography variant="body2">ຜູ້ນຳອອກ</Typography>
                    <Box sx={{ borderTop: '1px solid #ccc', mt: 8, pt: 1 }}>
                      <Typography variant="body2">ລາຍເຊັນ</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'center', width: '200px' }}>
                    <Typography variant="body2">ຜູ້ອະນຸມັດ</Typography>
                    <Box sx={{ borderTop: '1px solid #ccc', mt: 8, pt: 1 }}>
                      <Typography variant="body2">ລາຍເຊັນ</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<PrintIcon />}
            onClick={handlePrint}
          >
            ພິມ
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Sort menu */}
      <Menu
        anchorEl={sortAnchorEl}
        open={Boolean(sortAnchorEl)}
        onClose={handleCloseSortMenu}
      >
        <MenuItem onClick={() => handleSort('date', 'desc')}>
          <Typography variant="body2" sx={{ mr: 1 }}>ວັນທີ (ຫຼ້າສຸດ)</Typography>
          {sortField === 'date' && sortDirection === 'desc' && <CheckCircleIcon color="primary" fontSize="small" />}
        </MenuItem>
        <MenuItem onClick={() => handleSort('date', 'asc')}>
          <Typography variant="body2" sx={{ mr: 1 }}>ວັນທີ (ເກົ່າສຸດ)</Typography>
          {sortField === 'date' && sortDirection === 'asc' && <CheckCircleIcon color="primary" fontSize="small" />}
        </MenuItem>
        <MenuItem onClick={() => handleSort('items', 'desc')}>
          <Typography variant="body2" sx={{ mr: 1 }}>ລາຍການ (ຫຼາຍ-ໜ້ອຍ)</Typography>
          {sortField === 'items' && sortDirection === 'desc' && <CheckCircleIcon color="primary" fontSize="small" />}
        </MenuItem>
        <MenuItem onClick={() => handleSort('items', 'asc')}>
          <Typography variant="body2" sx={{ mr: 1 }}>ລາຍການ (ໜ້ອຍ-ຫຼາຍ)</Typography>
          {sortField === 'items' && sortDirection === 'asc' && <CheckCircleIcon color="primary" fontSize="small" />}
        </MenuItem>
      </Menu>
      
      {/* Action menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseActionMenu}
      >
        <MenuItem onClick={() => {
          const export_item = exportHistory.find(item => getExportId(item) === menuExportId);
          if (export_item) {
            handleViewExport(export_item);
          }
          handleCloseActionMenu();
        }}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2">ເບິ່ງລາຍລະອຽດ</Typography>
        </MenuItem>
        
        <MenuItem onClick={() => {
          const export_item = exportHistory.find(item => getExportId(item) === menuExportId);
          if (export_item) {
            handlePrintExport(export_item);
          }
          handleCloseActionMenu();
        }}>
          <PrintIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2">ພິມໃບນຳອອກ</Typography>
        </MenuItem>
        
        <MenuItem 
          onClick={() => {
            handleApproveExport(menuExportId);
            handleCloseActionMenu();
          }}
          disabled={exportHistory.find(item => getExportId(item) === menuExportId)?.status === 'ນຳອອກແລ້ວ'}
        >
          <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2">ອະນຸມັດ</Typography>
        </MenuItem>
        
        <Divider />
        
        <MenuItem 
          onClick={() => {
            handleDeleteExport(menuExportId);
            handleCloseActionMenu();
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2">ລຶບ</Typography>
        </MenuItem>
      </Menu>
      
      {/* Header and search area */}
      <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" fontWeight="bold" color="primary">
          ປະຫວັດການນຳອອກສິນຄ້າ
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            color="primary" 
            startIcon={<FilterIcon />}
            onClick={handleOpenFilterDialog}
            sx={{ mr: 2 }}
          >
            ຕົວກັ່ນຕອງ
          </Button>
          <Button 
            variant="outlined" 
            color="info" 
            startIcon={<RefreshIcon />}
            onClick={fetchExportHistory}
            sx={{ mr: 2 }}
            disabled={loading}
          >
            ໂຫຼດຄືນໃໝ່
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/export')}
          >
            ເພິ່ມການນຳອອກໃໝ່
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <TextField
            placeholder="ຄົ້ນຫາ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ width: isMobile ? '100%' : 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          {!isMobile && (
            <Button
              variant="outlined" 
              color="primary"
              startIcon={<SortIcon />}
              onClick={handleOpenSortMenu}
            >
              ລຽງລຳດັບ
            </Button>
          )}
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Collapse in={filterExpanded}>
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="ວັນທີເລີ່ມຕົ້ນ"
                    type="date"
                    size="small"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="ວັນທີສິ້ນສຸດ"
                    type="date"
                    size="small"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    fullWidth
                    label="ສະຖານະການນຳອອກ"
                    size="small"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">- ທັງໝົດ -</MenuItem>
                    <MenuItem value="ລໍຖ້າອະນຸມັດ">ລໍຖ້າອະນຸມັດ</MenuItem>
                    <MenuItem value="ນຳອອກແລ້ວ">ນຳອອກແລ້ວ</MenuItem>
                    <MenuItem value="ຍົກເລີກ">ຍົກເລີກ</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button 
                  variant="outlined"
                  color="error" 
                  onClick={resetFilters}
                  size="small"
                  sx={{ mr: 1 }}
                >
                  ລ້າງຕົວກອງ
                </Button>
                <Button 
                  variant="contained"
                  color="primary" 
                  onClick={applyFilters}
                  size="small"
                >
                  ນຳໃຊ້ຕົວກອງ
                </Button>
              </Box>
            </Paper>
          </Collapse>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant={isMobile ? "fullWidth" : "standard"}
            >
              <Tab label="ທັງໝົດ" />
              <Tab label="ລໍຖ້າອະນຸມັດ" />
              <Tab label="ນຳອອກແລ້ວ" />
            </Tabs>
            
            <Button
              variant="text"
              onClick={toggleFilterExpansion}
              endIcon={filterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              size="small"
            >
              {filterExpanded ? "ຊ່ອນຕົວກອງ" : "ເພີ່ມຕົວກອງ"}
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="info" sx={{ my: 2 }}>{error}</Alert>
        ) : filteredExports.length > 0 ? (
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell align="center">#</TableCell>
                  <TableCell align="center">ວັນທີ</TableCell>
                  <TableCell align="center">ຈຳນວນລາຍການ</TableCell>
                  <TableCell align="center">ສະຖານະ</TableCell>
                  <TableCell align="center">ຄຳສັ່ງ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentItems.map((exportItem, index) => (
                  <TableRow
                    key={index}
                    sx={{ "&:nth-of-type(odd)": { bgcolor: 'action.hover' } }}
                  >
                    <TableCell align="center">{indexOfFirstItem + index + 1}</TableCell>
                    <TableCell align="center">{getExportDate(exportItem)}</TableCell>
                    <TableCell align="center">{getItemCount(exportItem)}</TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={getExportStatus(exportItem)}
                        sx={{ 
                          bgcolor: getStatusChipColor(getExportStatus(exportItem)), 
                          color: 'white',
                          borderRadius: 4
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Button
                          variant="contained"
                          color="info"
                          size="small"
                          sx={{ borderRadius: 4 }}
                          onClick={() => handleViewExport(exportItem)}
                          startIcon={<VisibilityIcon />}
                        >
                          ລາຍລະອຽດ
                        </Button>
                          
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          sx={{ borderRadius: 4 }}
                          onClick={() => handleApproveExport(getExportId(exportItem))}
                          startIcon={<CheckCircleIcon />}
                          disabled={getExportStatus(exportItem) === 'ນຳອອກແລ້ວ'} // Disable if already approved
                        >
                          ອະນຸມັດ
                        </Button>
                        
                  
                        
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          sx={{ borderRadius: 4 }}
                          onClick={() => handleDeleteExport(getExportId(exportItem))}
                          startIcon={<DeleteIcon />}
                        >
                          ລຶບ
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              ບໍ່ພົບຂໍ້ມູນການນຳອອກສິນຄ້າ
            </Typography>
          </Box>
        )}
        
        {/* Pagination */}
        {filteredExports.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <Pagination 
              count={Math.ceil(filteredExports.length / itemsPerPage)} 
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        )}
      </Paper>
    </Layout>
  );
}

export default ExportDetail;