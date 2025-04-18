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
  Snackbar
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { DeleteConfirmDialog, ApproveConfirmDialog, ActionSuccessDialog } from '../components/ConfirmationDialog';
import { getAllExports, updateExportStatus, deleteExport, getExportDetails } from '../services/exportService';

/**
 * ExportDetail - Component for displaying export history and details
 * This component shows a list of past product exports and allows viewing details,
 * approving pending exports, printing export forms, and deleting exports.
 */
function ExportDetail() {
  const navigate = useNavigate();
  
  // State for search and loading
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Alert/notification state
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // Export history state
  const [exportHistory, setExportHistory] = useState([]);

  // Selected export states
  const [selectedExport, setSelectedExport] = useState(null);
  const [exportDetails, setExportDetails] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  
  // Dialog states
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  
  // Selected IDs for actions
  const [selectedExportId, setSelectedExportId] = useState(null);
  const [selectedApproveId, setSelectedApproveId] = useState(null);
  const [actionType, setActionType] = useState('');
  
  // Print reference for printing functionality
  const printRef = useRef(null);

  // Load export history on component mount
  useEffect(() => {
    fetchExportHistory();
  }, []);

  /**
   * Fetch export history from API or localStorage fallback
   */
  const fetchExportHistory = async () => {
    try {
      setLoading(true);
      // Try to get data from API first
      const apiData = await getAllExports();
      if (apiData && apiData.length > 0) {
        setExportHistory(apiData);
        showAlert('ໂຫຼດຂໍ້ມູນສຳເລັດແລ້ວ', 'success');
      } else {
        // If API fails, try localStorage
        const savedExports = localStorage.getItem('exportHistory');
        if (savedExports) {
          setExportHistory(JSON.parse(savedExports));
          showAlert('ໂຫຼດຂໍ້ມູນຈາກ cache ສຳເລັດແລ້ວ', 'info');
        } else {
          showAlert('ບໍ່ພົບຂໍ້ມູນປະຫວັດການນຳອອກສິນຄ້າ', 'warning');
        }
      }
    } catch (error) {
      console.error('Error fetching export history:', error);
      
      // Try localStorage as fallback
      const savedExports = localStorage.getItem('exportHistory');
      if (savedExports) {
        setExportHistory(JSON.parse(savedExports));
        showAlert('ໂຫຼດຂໍ້ມູນຈາກ cache ສຳເລັດແລ້ວ', 'info');
      } else {
        showAlert('ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນປະຫວັດການນຳອອກສິນຄ້າ', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch export details by ID
   * @param {number} exportId - Export ID to fetch details for
   */
  const fetchExportDetails = async (exportId) => {
    if (!exportId) return;
    
    try {
      setDetailsLoading(true);
      const details = await getExportDetails(exportId);
      
      if (details && details.length > 0) {
        setExportDetails(details);
      } else {
        // If API fails, try to get details from the export history
        const exportItem = exportHistory.find(item => 
          (item.id === exportId) || (item.export_id === exportId)
        );
        
        if (exportItem && exportItem.items) {
          setExportDetails(exportItem.items);
        } else {
          setExportDetails([]);
          showAlert('ບໍ່ພົບຂໍ້ມູນລາຍລະອຽດການນຳອອກສິນຄ້າ', 'warning');
        }
      }
    } catch (error) {
      console.error('Error fetching export details:', error);
      showAlert('ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນລາຍລະອຽດການນຳອອກສິນຄ້າ', 'error');
      setExportDetails([]);
    } finally {
      setDetailsLoading(false);
    }
  };

  /**
   * Filter exports based on search term
   */
  const filteredExports = exportHistory.filter(item =>
    (item.id && item.id.toString().includes(searchTerm)) ||
    (item.export_id && item.export_id.toString().includes(searchTerm)) ||
    (item.date && item.date.includes(searchTerm)) ||
    (item.export_date && item.export_date.includes(searchTerm)) ||
    (item.status && item.status.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.items && item.items.some(product => 
      (product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.ProductName && product.ProductName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.exportReason && product.exportReason.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.reason && product.reason.toLowerCase().includes(searchTerm.toLowerCase()))
    ))
  );

  /**
   * View export details
   * @param {Object} exportData - Export data to view
   */
  const handleViewExport = (exportData) => {
    setSelectedExport(exportData);
    setDetailDialogOpen(true);
    
    // Get export ID based on available property
    const exportId = exportData.id || exportData.export_id;
    if (exportId) {
      fetchExportDetails(exportId);
    } else if (exportData.items) {
      // If the export data already has items, use them
      setExportDetails(exportData.items);
    }
  };

  /**
   * Prepare for printing export
   * @param {Object} exportData - Export data to print
   */
  const handlePrintExport = (exportData) => {
    setSelectedExport(exportData);
    setPrintDialogOpen(true);
    
    // Ensure we have the details for printing
    const exportId = exportData.id || exportData.export_id;
    if (exportId && (!exportData.items || exportData.items.length === 0)) {
      fetchExportDetails(exportId);
    }
  };

  /**
   * Open delete confirmation dialog
   * @param {number} id - Export ID to delete
   */
  const handleDeleteExport = (id) => {
    setSelectedExportId(id);
    setDeleteDialogOpen(true);
  };

  /**
   * Open approve confirmation dialog
   * @param {number} id - Export ID to approve
   */
  const handleApproveExport = (id) => {
    setSelectedApproveId(id);
    setApproveDialogOpen(true);
  };

  /**
   * Confirm and execute delete action
   * @param {number} id - Export ID to delete
   */
  const confirmDelete = async (id) => {
    try {
      setLoading(true);
      
      // Try to delete via API
      const exportIdToDelete = id || selectedExportId;
      await deleteExport(exportIdToDelete);
      
      // Update local state
      const updatedHistory = exportHistory.filter(item => 
        (item.id !== exportIdToDelete) && (item.export_id !== exportIdToDelete)
      );
      setExportHistory(updatedHistory);
      
      // Update localStorage
      localStorage.setItem('exportHistory', JSON.stringify(updatedHistory));
      
      // Show success message
      setDeleteDialogOpen(false);
      setActionType('delete');
      setSuccessDialogOpen(true);
    } catch (error) {
      console.error('Error deleting export:', error);
      
      // Update UI even if API fails
      const updatedHistory = exportHistory.filter(item => 
        (item.id !== id) && (item.export_id !== id)
      );
      setExportHistory(updatedHistory);
      localStorage.setItem('exportHistory', JSON.stringify(updatedHistory));
      
      showAlert('ມີຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່ API ແຕ່ໄດ້ດຳເນີນການລຶບໃນລະບົບແລ້ວ', 'warning');
      
      setDeleteDialogOpen(false);
      setActionType('delete');
      setSuccessDialogOpen(true);
    } finally {
      setLoading(false);
      setSelectedExportId(null);
    }
  };

  /**
   * Confirm and execute approve action
   * @param {number} id - Export ID to approve
   */
  const confirmApprove = async (id) => {
    try {
      setLoading(true);
      
      // Try to update via API
      const exportIdToApprove = id || selectedApproveId;
      await updateExportStatus(exportIdToApprove, 'ນຳອອກແລ້ວ');
      
      // Update local state
      const updatedHistory = exportHistory.map(item => {
        if ((item.id === exportIdToApprove) || (item.export_id === exportIdToApprove)) {
          return {...item, status: 'ນຳອອກແລ້ວ'};
        }
        return item;
      });
      
      setExportHistory(updatedHistory);
      
      // Update localStorage
      localStorage.setItem('exportHistory', JSON.stringify(updatedHistory));
      
      // Show success message
      setApproveDialogOpen(false);
      setActionType('approve');
      setSuccessDialogOpen(true);
    } catch (error) {
      console.error('Error approving export:', error);
      
      // Update UI even if API fails
      const updatedHistory = exportHistory.map(item => {
        if ((item.id === id) || (item.export_id === id)) {
          return {...item, status: 'ນຳອອກແລ້ວ'};
        }
        return item;
      });
      
      setExportHistory(updatedHistory);
      localStorage.setItem('exportHistory', JSON.stringify(updatedHistory));
      
      showAlert('ມີຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່ API ແຕ່ໄດ້ດຳເນີນການອະນຸມັດໃນລະບົບແລ້ວ', 'warning');
      
      setApproveDialogOpen(false);
      setActionType('approve');
      setSuccessDialogOpen(true);
    } finally {
      setLoading(false);
      setSelectedApproveId(null);
    }
  };

  /**
   * Handle print functionality
   */
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
        body { 
          font-family: 'Noto Sans Lao', 'Phetsarath OT', sans-serif; 
          padding: 20px; 
        }
        .export-header { 
          text-align: center; 
          margin-bottom: 20px; 
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-bottom: 30px; 
        }
        th, td { 
          padding: 8px; 
          border: 1px solid #ddd; 
          text-align: center; 
        }
        thead { 
          background-color: #f0f0f0; 
        }
        .signatures { 
          display: flex; 
          justify-content: space-around; 
          margin-top: 50px; 
        }
        .signature-box { 
          width: 200px; 
          text-align: center; 
        }
        .signature-line { 
          border-top: 1px solid #000; 
          margin-top: 70px; 
          padding-top: 10px; 
        }
      `);
      printWindow.document.write('</style></head><body>');
      printWindow.document.write(printContent.innerHTML);
      printWindow.document.write('</body></html>');
      
      printWindow.document.close();
      printWindow.focus();
      
      // Print after content has loaded
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        setPrintDialogOpen(false);
      }, 500);
    }
  };

  /**
   * Format date to readable format
   * @param {string} dateStr - Date string to format
   * @returns {string} Formatted date string
   */
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    
    try {
      // Check if date is in ISO format
      if (dateStr.includes('T')) {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
      }
      
      // Handle DD/MM/YYYY format
      if (dateStr.includes('/')) {
        return dateStr;
      }
      
      // Try to parse other formats
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    } catch (error) {
      console.error("Date formatting error:", error);
      return dateStr;
    }
  };

  /**
   * Get item count from export
   * @param {Object} exportItem - Export item to count
   * @returns {number} Number of items in export
   */
  const getItemCount = (exportItem) => {
    if (exportItem.items && Array.isArray(exportItem.items)) {
      return exportItem.items.length;
    }
    return 0;
  };

  /**
   * Get export date
   * @param {Object} exportItem - Export item to get date from
   * @returns {string} Formatted date
   */
  const getExportDate = (exportItem) => {
    const exportDate = exportItem.date || exportItem.export_date;
    return formatDate(exportDate);
  };

  /**
   * Get export status
   * @param {Object} exportItem - Export item to get status from
   * @returns {string} Status string
   */
  const getExportStatus = (exportItem) => {
    return exportItem.status || 'ລໍຖ້າອະນຸມັດ';
  };

  /**
   * Get export ID
   * @param {Object} exportItem - Export item to get ID from
   * @returns {number} Export ID
   */
  const getExportId = (exportItem) => {
    return exportItem.id || exportItem.export_id;
  };

  /**
   * Get status chip color based on status
   * @param {string} status - Status string
   * @returns {string} Color hex code
   */
  const getStatusChipColor = (status) => {
    switch(status) {
      case 'ລໍຖ້າອະນຸມັດ':
        return '#FFA726'; // Orange for waiting
      case 'ນຳອອກແລ້ວ':
        return '#4CAF50'; // Green for approved
      default:
        return '#9E9E9E'; // Gray for other statuses
    }
  };

  /**
   * Get product name from item
   * @param {Object} item - Product item
   * @returns {string} Product name
   */
  const getProductName = (item) => {
    return item.name || item.ProductName || '-';
  };

  /**
   * Get export quantity from item
   * @param {Object} item - Product item
   * @returns {number} Export quantity
   */
  const getExportQuantity = (item) => {
    return item.exportQuantity || item.qty || 0;
  };

  /**
   * Get export location from item
   * @param {Object} item - Product item
   * @returns {string} Export location
   */
  const getExportLocation = (item) => {
    return item.exportLocation || item.location || '-';
  };

  /**
   * Get export reason from item
   * @param {Object} item - Product item
   * @returns {string} Export reason
   */
  const getExportReason = (item) => {
    return item.exportReason || item.reason || '-';
  };

  /**
   * Show alert message
   * @param {string} message - Alert message
   * @param {string} severity - Alert severity
   */
  const showAlert = (message, severity = 'info') => {
    setAlert({
      open: true,
      message,
      severity
    });
  };

  /**
   * Close alert
   */
  const handleCloseAlert = () => {
    setAlert({
      ...alert,
      open: false
    });
  };

  // Dialog handlers
  const handleCloseDetailDialog = () => setDetailDialogOpen(false);
  const handleClosePrintDialog = () => setPrintDialogOpen(false);
  const handleCloseDeleteDialog = () => setDeleteDialogOpen(false);
  const handleCloseApproveDialog = () => setApproveDialogOpen(false);
  const handleCloseActionSuccessDialog = () => setSuccessDialogOpen(false);

  return (
    <Layout title="ປະຫວັດການນຳອອກສິນຄ້າ">
      {/* Alert Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={5000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity={alert.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
      
      {/* Confirmation Dialogs */}
      <DeleteConfirmDialog 
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={confirmDelete}
        itemId={selectedExportId}
        loading={loading}
      />
      
      <ApproveConfirmDialog 
        open={approveDialogOpen}
        onClose={handleCloseApproveDialog}
        onConfirm={confirmApprove}
        itemId={selectedApproveId}
        loading={loading}
      />
      
      <ActionSuccessDialog 
        open={successDialogOpen}
        onClose={handleCloseActionSuccessDialog}
        title={actionType === 'approve' ? "ອະນຸມັດສຳເລັດ" : "ລຶບສຳເລັດ"}
        message={actionType === 'approve' ? "ການນຳອອກໄດ້ຖືກອະນຸມັດແລ້ວ" : "ລາຍການນຳອອກຖືກລຶບສຳເລັດແລ້ວ"}
        actionType={actionType}
      />
      
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
          {selectedExport ? (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" align="center" sx={{ mb: 1, fontWeight: 'bold' }}>
                ລາຍລະອຽດນຳອອກສິນຄ້າ
              </Typography>
              <Typography variant="h6" align="center" sx={{ mb: 3 }}>
                ວັນທີ: {getExportDate(selectedExport)}
              </Typography>
              
              {detailsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
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
                        {exportDetails && exportDetails.length > 0 ? (
                          exportDetails.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell align="center">{index + 1}</TableCell>
                              <TableCell align="center">{getProductName(item)}</TableCell>
                              <TableCell align="center">{getExportQuantity(item)}</TableCell>
                              <TableCell align="center">{getExportLocation(item)}</TableCell>
                              <TableCell align="center">{getExportReason(item)}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} align="center">
                              ບໍ່ພົບຂໍ້ມູນລາຍການສິນຄ້າ
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
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
                </>
              )}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
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
          {selectedExport ? (
            <div ref={printRef}>
              <Box sx={{ mb: 4 }} className="export-header">
                <Typography variant="h5" align="center" sx={{ mb: 1, fontWeight: 'bold' }}>
                  ໃບນຳອອກສິນຄ້າ
                </Typography>
                <Typography variant="h6" align="center" sx={{ mb: 3 }}>
                  ເລກທີ: {getExportId(selectedExport)} | ວັນທີ: {getExportDate(selectedExport)}
                </Typography>
                
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
                      {(exportDetails && exportDetails.length > 0 ? exportDetails : 
                        (selectedExport.items ? selectedExport.items : [])).map((item, index) => (
                        <TableRow key={index}>
                          <TableCell align="center">{index + 1}</TableCell>
                          <TableCell align="center">{getProductName(item)}</TableCell>
                          <TableCell align="center">{getExportQuantity(item)}</TableCell>
                          <TableCell align="center">{getExportLocation(item)}</TableCell>
                          <TableCell align="center">{getExportReason(item)}</TableCell>
                        </TableRow>
                      ))}
                      {(!exportDetails || exportDetails.length === 0) && (!selectedExport.items || selectedExport.items.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            ບໍ່ພົບຂໍ້ມູນລາຍການສິນຄ້າ
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 5 }} className="signatures">
                  <Box sx={{ textAlign: 'center', width: '200px' }} className="signature-box">
                    <Typography variant="body2">ຜູ້ນຳອອກ</Typography>
                    <Box sx={{ borderTop: '1px solid #ccc', mt: 8, pt: 1 }} className="signature-line">
                      <Typography variant="body2">ລາຍເຊັນ</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'center', width: '200px' }} className="signature-box">
                    <Typography variant="body2">ຜູ້ອະນຸມັດ</Typography>
                    <Box sx={{ borderTop: '1px solid #ccc', mt: 8, pt: 1 }} className="signature-line">
                      <Typography variant="body2">ລາຍເຊັນ</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </div>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
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
      
      {/* Main Page Content */}
      <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" fontWeight="bold" color="primary">
          ປະຫວັດການນຳອອກສິນຄ້າ
        </Typography>
        <Box>
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
                    key={getExportId(exportItem) || index}
                    sx={{ "&:nth-of-type(odd)": { bgcolor: 'action.hover' } }}
                  >
                    <TableCell align="center">{getExportId(exportItem) || index + 1}</TableCell>
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