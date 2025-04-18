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
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { DeleteConfirmDialog, ApproveConfirmDialog, ActionSuccessDialog } from '../components/ConfirmationDialog';
import { getAllExports, updateExportStatus, deleteExport } from '../services/exportService';

function ExportDetail() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Export history state
  const [exportHistory, setExportHistory] = useState([]);

  // Selected export for viewing details
  const [selectedExport, setSelectedExport] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  
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

  // ດຶງຂໍ້ມູນປະຫວັດການນຳອອກສິນຄ້າ
  const fetchExportHistory = async () => {
    try {
      setLoading(true);
      // ພະຍາຍາມດຶງຂໍ້ມູນຈາກ API ກ່ອນ
      const apiData = await getAllExports();
      if (apiData && apiData.length > 0) {
        setExportHistory(apiData);
      } else {
        // ຖ້າບໍ່ສາມາດດຶງຈາກ API ໄດ້, ໃຫ້ດຶງຈາກ localStorage
        const savedExports = localStorage.getItem('exportHistory');
        if (savedExports) {
          setExportHistory(JSON.parse(savedExports));
        }
      }
    } catch (error) {
      console.error('ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນປະຫວັດການນຳອອກສິນຄ້າ:', error);
      
      // ກໍລະນີເກີດຂໍ້ຜິດພາດ, ລອງດຶງຈາກ localStorage
      const savedExports = localStorage.getItem('exportHistory');
      if (savedExports) {
        setExportHistory(JSON.parse(savedExports));
      }
    } finally {
      setLoading(false);
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

  // Handle view export details
  const handleViewExport = (exportData) => {
    setSelectedExport(exportData);
    setDetailDialogOpen(true);
  };

  // Handle print export
  const handlePrintExport = (exportData) => {
    setSelectedExport(exportData);
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
      
      // ທຳການລຶບຜ່ານ API
      const exportIdToDelete = id || selectedExportId;
      await deleteExport(exportIdToDelete);
      
      // ອັບເດດຂໍ້ມູນໃນໜ້າ
      const updatedHistory = exportHistory.filter(item => 
        (item.id !== exportIdToDelete) && (item.export_id !== exportIdToDelete)
      );
      setExportHistory(updatedHistory);
      
      // ອັບເດດ localStorage
      localStorage.setItem('exportHistory', JSON.stringify(updatedHistory));
      
      // ປິດກ່ອງໂຕ້ຕອບແລະສະແດງຜົນສຳເລັດ
      setDeleteDialogOpen(false);
      setActionType('delete');
      setSuccessDialogOpen(true);
    } catch (error) {
      console.error('ເກີດຂໍ້ຜິດພາດໃນການລຶບການນຳອອກສິນຄ້າ:', error);
      
      // ຍັງຄົງຄວນດຳເນີນການປັບປຸງ UI ເຖິງແມ່ນວ່າ API ຈະລົ້ມເຫຼວ
      const updatedHistory = exportHistory.filter(item => 
        (item.id !== id) && (item.export_id !== id)
      );
      setExportHistory(updatedHistory);
      localStorage.setItem('exportHistory', JSON.stringify(updatedHistory));
      
      setDeleteDialogOpen(false);
      setActionType('delete');
      setSuccessDialogOpen(true);
    } finally {
      setLoading(false);
      setSelectedExportId(null);
    }
  };

  // Confirm approve action
  const confirmApprove = async (id) => {
    try {
      setLoading(true);
      
      // ພະຍາຍາມອັບເດດຜ່ານ API
      const exportIdToApprove = id || selectedApproveId;
      await updateExportStatus(exportIdToApprove, 'ນຳອອກແລ້ວ');
      
      // ອັບເດດຂໍ້ມູນໃນໜ້າ
      const updatedHistory = exportHistory.map(item => {
        if ((item.id === exportIdToApprove) || (item.export_id === exportIdToApprove)) {
          return {...item, status: 'ນຳອອກແລ້ວ'};
        }
        return item;
      });
      
      setExportHistory(updatedHistory);
      
      // ອັບເດດ localStorage
      localStorage.setItem('exportHistory', JSON.stringify(updatedHistory));
      
      // ປິດກ່ອງໂຕ້ຕອບແລະສະແດງຜົນສຳເລັດ
      setApproveDialogOpen(false);
      setActionType('approve');
      setSuccessDialogOpen(true);
    } catch (error) {
      console.error('ເກີດຂໍ້ຜິດພາດໃນການອະນຸມັດການນຳອອກສິນຄ້າ:', error);
      
      // ຍັງຄົງຄວນດຳເນີນການປັບປຸງ UI ເຖິງແມ່ນວ່າ API ຈະລົ້ມເຫຼວ
      const updatedHistory = exportHistory.map(item => {
        if ((item.id === id) || (item.export_id === id)) {
          return {...item, status: 'ນຳອອກແລ້ວ'};
        }
        return item;
      });
      
      setExportHistory(updatedHistory);
      localStorage.setItem('exportHistory', JSON.stringify(updatedHistory));
      
      setApproveDialogOpen(false);
      setActionType('approve');
      setSuccessDialogOpen(true);
    } finally {
      setLoading(false);
      setSelectedApproveId(null);
    }
  };

  // Dialog handlers
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedExportId(null);
  };

  const handleCloseApproveDialog = () => {
    setApproveDialogOpen(false);
    setSelectedApproveId(null);
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedExport(null);
  };

  const handleClosePrintDialog = () => {
    setPrintDialogOpen(false);
    setSelectedExport(null);
  };

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
      
      // ພິມຫຼັງຈາກການສ້າງເນື້ອຫາສຳເລັດ
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        setPrintDialogOpen(false);
      }, 500);
    }
  };

  const handleCloseActionSuccessDialog = () => {
    setSuccessDialogOpen(false);
  };

  // ຈັດຮູບແບບວັນທີເປັນຮູບແບບທີ່ອ່ານໄດ້ງ່າຍ
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    
    try {
      // ກວດກາວ່າວັນທີຢູ່ໃນຮູບແບບ ISO ຫຼືບໍ່
      if (dateStr.includes('T')) {
        const date = new Date(dateStr);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
      }
      
      // ຖ້າເປັນຮູບແບບ DD/MM/YYYY ຢູ່ແລ້ວ, ສົ່ງຄືນຕາມເດີມ
      if (dateStr.includes('/')) {
        return dateStr;
      }
      
      // ພະຍາຍາມປ່ຽນຮູບແບບອື່ນໆ
      const date = new Date(dateStr);
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    } catch (error) {
      console.error("ຂໍ້ຜິດພາດໃນການຈັດຮູບແບບວັນທີ:", error);
      return dateStr; // ສົ່ງຄືນຕາມເດີມໃນກໍລະນີທີ່ມີຂໍ້ຜິດພາດ
    }
  };

  // ດຶງຈຳນວນລາຍການສິນຄ້າຈາກການນຳອອກ
  const getItemCount = (exportItem) => {
    if (exportItem.items && Array.isArray(exportItem.items)) {
      return exportItem.items.length;
    }
    return 0;
  };

  // ດຶງວັນທີຈາກເອກະສານນຳອອກ
  const getExportDate = (exportItem) => {
    // ເລືອກວັນທີຕາມຂໍ້ມູນທີ່ມີ
    const exportDate = exportItem.date || exportItem.export_date;
    return formatDate(exportDate);
  };

  // ດຶງສະຖານະຂອງການນຳອອກ
  const getExportStatus = (exportItem) => {
    return exportItem.status || 'ລໍຖ້າອະນຸມັດ'; // ຄ່າເລີ່ມຕົ້ນຖ້າບໍ່ມີສະຖານະ
  };

  // ດຶງລະຫັດຂອງການນຳອອກ
  const getExportId = (exportItem) => {
    return exportItem.id || exportItem.export_id; // ລອງທັງສອງຮູບແບບ
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

  // ດຶງຊື່ສິນຄ້າຈາກລາຍການສິນຄ້າ
  const getProductName = (item) => {
    // ກວດສອບທຸກຮູບແບບທີ່ເປັນໄປໄດ້ສຳລັບຊື່ສິນຄ້າ
    return item.name || item.ProductName || '-';
  };

  // ດຶງຈຳນວນສິນຄ້າທີ່ນຳອອກ
  const getExportQuantity = (item) => {
    return item.exportQuantity || item.qty || 0;
  };

  // ດຶງບ່ອນຈັດວາງຂອງສິນຄ້າ
  const getExportLocation = (item) => {
    return item.exportLocation || item.location || '-';
  };

  // ດຶງສາເຫດການນຳອອກ
  const getExportReason = (item) => {
    return item.exportReason || item.reason || '-';
  };

  return (
    <Layout title="ປະຫວັດການນຳອອກສິນຄ້າ">
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
      
      {/* Action Success Dialog */}
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
          {selectedExport && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" align="center" sx={{ mb: 1, fontWeight: 'bold' }}>
                ລາຍລະອຽດນຳອອກສິນຄ້າ
              </Typography>
              <Typography variant="h6" align="center" sx={{ mb: 3 }}>
                ວັນທີ: {getExportDate(selectedExport)}
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
                    {selectedExport.items && selectedExport.items.map((item, index) => (
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
                      {selectedExport.items && selectedExport.items.map((item, index) => (
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