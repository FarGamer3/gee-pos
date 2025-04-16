import { useState, useEffect } from 'react';
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
  Grid
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { DeleteConfirmDialog, ApproveConfirmDialog, ActionSuccessDialog } from '../components/ConfirmationDialog';

function ExportDetail() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Export history state
  const [exportHistory, setExportHistory] = useState([
    { 
      id: 1, 
      date: '24/3/2025', 
      items: [
        { id: 1, name: 'ຕູ້ເຢັນ', exportQuantity: 5, exportLocation: 'A-02', exportReason: 'ສິນຄ້າເສຍຫາຍ' }
      ],
      status: 'ລໍຖ້າອະນຸມັດ'
    },
    { 
      id: 2, 
      date: '22/3/2025', 
      items: [
        { id: 2, name: 'ໂທລະທັດ', exportQuantity: 3, exportLocation: 'B-05', exportReason: 'ສິນຄ້າຊຳລຸດ' },
        { id: 3, name: 'ແອຄອນດິຊັນ', exportQuantity: 1, exportLocation: 'C-01', exportReason: 'ໂອນຍ້າຍສາງ' }
      ],
      status: 'ນຳອອກແລ້ວ'
    }
  ]);

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

  // Load export history from localStorage on mount (if available)
  useEffect(() => {
    const savedExports = localStorage.getItem('exportHistory');
    if (savedExports) {
      setExportHistory(JSON.parse(savedExports));
    }
  }, []);

  // Filter exports based on search term
  const filteredExports = exportHistory.filter(item =>
    item.id.toString().includes(searchTerm) ||
    item.date.includes(searchTerm) ||
    item.items.some(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.exportReason.toLowerCase().includes(searchTerm.toLowerCase())
    )
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
  const confirmDelete = (id) => {
    const updatedHistory = exportHistory.filter(item => item.id !== id);
    setExportHistory(updatedHistory);
    setDeleteDialogOpen(false);
    
    // Update localStorage
    localStorage.setItem('exportHistory', JSON.stringify(updatedHistory));
    
    // Show success dialog
    setActionType('delete');
    setSuccessDialogOpen(true);
  };

  // Confirm approve action
  const confirmApprove = (id) => {
    const updatedHistory = exportHistory.map(item => 
      item.id === id ? {...item, status: 'ນຳອອກແລ້ວ'} : item
    );
    
    setExportHistory(updatedHistory);
    setApproveDialogOpen(false);
    
    // Update localStorage
    localStorage.setItem('exportHistory', JSON.stringify(updatedHistory));
    
    // Show success dialog
    setActionType('approve');
    setSuccessDialogOpen(true);
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
    // Print functionality would be implemented here
    // For now, just close the dialog
    setPrintDialogOpen(false);
  };

  const handleCloseActionSuccessDialog = () => {
    setSuccessDialogOpen(false);
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

  return (
    <Layout title="ລາຍລະອຽດນຳອອກສິນຄ້າ">
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog 
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={confirmDelete}
        itemId={selectedExportId}
      />
      
      {/* Approve Confirmation Dialog */}
      <ApproveConfirmDialog 
        open={approveDialogOpen}
        onClose={handleCloseApproveDialog}
        onConfirm={confirmApprove}
        itemId={selectedApproveId}
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
                ວັນທີ: {selectedExport.date}
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
                    {selectedExport.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell align="center">{index + 1}</TableCell>
                        <TableCell align="center">{item.name}</TableCell>
                        <TableCell align="center">{item.exportQuantity}</TableCell>
                        <TableCell align="center">{item.exportLocation}</TableCell>
                        <TableCell align="center">{item.exportReason}</TableCell>
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
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" align="center" sx={{ mb: 1, fontWeight: 'bold' }}>
                ໃບນຳອອກສິນຄ້າ
              </Typography>
              <Typography variant="h6" align="center" sx={{ mb: 3 }}>
                ວັນທີ: {selectedExport.date}
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
                    {selectedExport.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell align="center">{index + 1}</TableCell>
                        <TableCell align="center">{item.name}</TableCell>
                        <TableCell align="center">{item.exportQuantity}</TableCell>
                        <TableCell align="center">{item.exportLocation}</TableCell>
                        <TableCell align="center">{item.exportReason}</TableCell>
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
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/export')}
        >
          ເພິ່ມການນຳອອກໃໝ່
        </Button>
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
                  key={exportItem.id}
                  sx={{ "&:nth-of-type(odd)": { bgcolor: 'action.hover' } }}
                >
                  <TableCell align="center">{index + 1}</TableCell>
                  <TableCell align="center">{exportItem.date}</TableCell>
                  <TableCell align="center">{exportItem.items.length}</TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={exportItem.status}
                      sx={{ 
                        bgcolor: getStatusChipColor(exportItem.status), 
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
                        onClick={() => handleApproveExport(exportItem.id)}
                        startIcon={<CheckCircleIcon />}
                        disabled={exportItem.status === 'ນຳອອກແລ້ວ'} // Disable if already approved
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
                        onClick={() => handleDeleteExport(exportItem.id)}
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
      </Paper>
    </Layout>
  );
}

export default ExportDetail;