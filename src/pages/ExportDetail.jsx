// This is a modified version of the ExportDetail.jsx file
// Changes focus on the getItemCount function and how exports are processed

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
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
  IconButton
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  FilterAlt as FilterIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { DeleteConfirmDialog, ApproveConfirmDialog, ActionSuccessDialog } from '../components/ConfirmationDialog';
import { getAllExports, getExportDetails, updateExportStatus, deleteExport } from '../services/exportService';

function ExportDetail() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Export history state
  const [exportHistory, setExportHistory] = useState([]);

  // Selected export for viewing details
  const [selectedExport, setSelectedExport] = useState(null);
  const [selectedExportItems, setSelectedExportItems] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  
  // Filter state
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  
  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedExportId, setSelectedExportId] = useState(null);
  
  // Approve confirmation dialog state
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [selectedApproveId, setSelectedApproveId] = useState(null);
  
  // Success action dialog state
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  
  // Print dialog state
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const printRef = useRef(null);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

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
            console.log(`Fetching details for export ${exportId}`);
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
            console.log(`Could not load details for export ${exportId}:`, detailError);
          }
          
          return exportItem;
        }));
        
        setExportHistory(processedExports);
      } else {
        setExportHistory([]);
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

  // Load export history on mount
  useEffect(() => {
    fetchExportHistory();
  }, []);

  // Filter exports based on search term
  const filteredExports = exportHistory.filter(item =>
    (item.id && item.id.toString().includes(searchTerm)) ||
    (item.export_id && item.export_id.toString().includes(searchTerm)) ||
    (item.date && item.date.includes(searchTerm)) ||
    (item.export_date && item.export_date.includes(searchTerm)) ||
    (item.items && item.items.some(product => 
      (product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.ProductName && product.ProductName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.exportReason && product.exportReason.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.reason && product.reason.toLowerCase().includes(searchTerm.toLowerCase()))
    ))
  );

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    
    try {
      // Check if it's ISO format
      if (dateStr.includes('T')) {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr; // Return original if invalid date
        
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
      }
      
      // If it's already in DD/MM/YYYY format, return as is
      if (dateStr.includes('/')) {
        return dateStr;
      }
      
      // Try to convert other string formats
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr; // Return original if invalid date
      
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    } catch (error) {
      console.error("Date formatting error:", error);
      return dateStr; // Return original on error
    }
  };

  // IMPROVED: Get item count from export item - handles multiple data structures
  const getItemCount = (exportItem) => {
    // Check for items array (most common case)
    if (exportItem.items && Array.isArray(exportItem.items)) {
      return exportItem.items.length;
    }
    
    // Check for export_details array
    if (exportItem.export_details && Array.isArray(exportItem.export_details)) {
      return exportItem.export_details.length;
    }
    
    // Check for item_count field
    if (typeof exportItem.item_count === 'number') {
      return exportItem.item_count;
    }
    
    // Check for count field
    if (typeof exportItem.count === 'number') {
      return exportItem.count;
    }
    
    // If no count info is available, show a placeholder
    return "—";
  };

  // Handle view export details
  const handleViewExport = (exportData) => {
    setSelectedExport(exportData);
    setDetailDialogOpen(true);
    
    // Get export id from either export_id or id field
    const exportId = exportData.export_id || exportData.id;
    
    // Fetch details if export has no items or items.length is 0
    if (!exportData.items || exportData.items.length === 0) {
      fetchExportDetails(exportId);
    } else {
      setSelectedExportItems(exportData.items);
    }
  };

  // Handle print export
  const handlePrintExport = (exportData) => {
    setSelectedExport(exportData);
    
    // Get details if needed
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
    setSelectedExportId(id);
    setDeleteDialogOpen(true);
  };

  // Handle approve export
  const handleApproveExport = (id) => {
    setSelectedApproveId(id);
    setApproveDialogOpen(true);
  };

  // Confirm delete action
  const confirmDelete = async (id) => {
    try {
      setLoading(true);
      const exportIdToDelete = id || selectedExportId;
      
      // Delete export through API
      await deleteExport(exportIdToDelete);
      
      // Update local state after successful API call
      setExportHistory(prevHistory => 
        prevHistory.filter(item => 
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
      
      // Update export status through API
      await updateExportStatus(exportIdToApprove, 'ນຳອອກແລ້ວ');
      
      // Update local state after successful API call
      setExportHistory(prevHistory => 
        prevHistory.map(item => {
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
  
  // Apply filters
  const applyFilters = () => {
    // Implement date filtering logic here
    // This would typically filter the history based on startDate and endDate
    
    setFilterDialogOpen(false);
    showSnackbar("ການກັ່ນຕອງສຳເລັດແລ້ວ", "success");
  };
  
  // Reset filters
  const resetFilters = () => {
    setStartDate(null);
    setEndDate(null);
    fetchExportHistory();
    setFilterDialogOpen(false);
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
  
  const handleOpenFilterDialog = () => {
    setFilterDialogOpen(true);
  };
  
  const handleCloseFilterDialog = () => {
    setFilterDialogOpen(false);
  };

  // Handle print functionality
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
  
  // Get status chip color based on status
  const getStatusChipColor = (status) => {
    switch(status) {
      case 'ລໍຖ້າອະນຸມັດ':
        return '#FFA726'; // Orange for waiting
      case 'ນຳອອກແລ້ວ':
        return '#9ACD32'; // Green for approved
      default:
        return '#9E9E9E'; // Gray for other statuses
    }
  };

  // IMPROVED: Get export date from different possible properties
  const getExportDate = (exportItem) => {
    return formatDate(exportItem.date || exportItem.export_date || exportItem.exp_date);
  };

  // IMPROVED: Get export id from different possible properties
  const getExportId = (exportItem) => {
    return exportItem.id || exportItem.export_id || exportItem.exp_id;
  };

  // IMPROVED: Get status from export item
  const getExportStatus = (exportItem) => {
    return exportItem.status || 'ລໍຖ້າອະນຸມັດ';
  };

  // Get product name from item
  const getProductName = (item) => {
    // Try all possible field names where product name might be stored
    const nameFields = ['name', 'ProductName', 'product_name'];
    
    // Find the first non-empty value
    for (const field of nameFields) {
      if (item[field] && typeof item[field] === 'string' && item[field].trim() !== '') {
        return item[field];
      }
    }
    
    // Default value if no name found
    return 'ບໍ່ລະບຸຊື່ສິນຄ້າ';
  };

  // Get export quantity from item
  const getExportQuantity = (item) => {
    return item.exportQuantity || item.qty || 0;
  };

  // Get export location from item - handle multiple possible field names
  const getExportLocation = (item) => {
    // Try to get location from various possible fields
    const locationFields = ['exportLocation', 'location', 'zone'];
    
    // Find the first non-empty value
    for (const field of locationFields) {
      if (item[field] && typeof item[field] === 'string' && item[field].trim() !== '') {
        return item[field];
      }
    }
    
    // If no location found but we have zone_id, generate location from it
    if (item.zone_id) {
      return `Zone ${item.zone_id}`;
    }
    
    // Default value if no location info found
    return 'ບໍ່ລະບຸສະຖານທີ່';
  };

  // Get export reason from item
  const getExportReason = (item) => {
    return item.exportReason || item.reason || '-';
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
        <DialogTitle>
          ຕົວກັ່ນຕອງຂໍ້ມູນ
          <IconButton
            aria-label="close"
            onClick={handleCloseFilterDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ວັນທີເລີ່ມຕົ້ນ"
                type="date"
                value={startDate || ''}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ວັນທີສິ້ນສຸດ"
                type="date"
                value={endDate || ''}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={resetFilters} 
            color="error"
          >
            ລ້າງຂໍ້ມູນ
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={applyFilters}
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
            >
              ປິດ
            </Button>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ mt: 2 }}>
          {selectedExport && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" align="center" sx={{ mb: 1, fontWeight: 'bold' }}>
                ລາຍລະອຽດນຳອອກສິນຄ້າ
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
            >
              ປິດ
            </Button>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ mt: 2 }}>
          {selectedExport && (
            <div ref={printRef}>
              <Box sx={{ mb: 4 }} className="export-header">
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
                
                <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 5 }} className="signatures">
                  <Box sx={{ textAlign: 'center', width: '200px' }} className="signature-box">
                    <Typography variant="body2">ຜູ້ອະນຸມັດ</Typography>
                    <Box sx={{ borderTop: '1px solid #ccc', mt: 8, pt: 1 }} className="signature-line">
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
            sx={{ width: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
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
                {filteredExports.map((exportItem, index) => (
                  <TableRow
                    key={index}
                    sx={{ "&:nth-of-type(odd)": { bgcolor: 'action.hover' } }}
                  >
                    <TableCell align="center">{index + 1}</TableCell>
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
                          color="success"
                          size="small"
                          sx={{ borderRadius: 4 }}
                          onClick={() => handlePrintExport(exportItem)}
                          startIcon={<PrintIcon />}
                        >
                          ພິມ
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
      </Paper>
    </Layout>
  );
}

export default ExportDetail;