import { useState, useEffect } from 'react';
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
  Grid
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { DeleteConfirmDialog, ApproveConfirmDialog, ActionSuccessDialog } from '../components/ConfirmationDialog';

function ImportDetail() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Import history state
  const [importHistory, setImportHistory] = useState([
    { 
      id: 1, 
      date: '22/2/2025', 
      purchaseOrderId: 1,
      supplier: 'ບໍລິສັດ Gee', 
      employee: 'ເປັນຕຸ້ຍ (ພະນັກງານ)', 
      status: 'ລໍຖ້າອະນຸມັດ',
      items: [
        { name: 'ຕູ້ເຢັນ', quantity: 2, price: 5000000 },
        { name: 'ແອຄອນດິຊັນ', quantity: 1, price: 3000000 }
      ],
      total: 13000000
    },
    { 
      id: 2, 
      date: '23/2/2025', 
      purchaseOrderId: 2,
      supplier: 'ບໍລິສັດ Gee', 
      employee: 'ເປັນຕຸ້ຍ (ພະນັກງານ)', 
      status: 'ນຳເຂົ້າແລ້ວ',
      items: [
        { name: 'ໂທລະທັດ', quantity: 2, price: 5000000 },
        { name: 'ຈັກຊັກຜ້າ', quantity: 5, price: 5000000 }
      ],
      total: 35000000
    }
  ]);

  // Selected import for viewing details
  const [selectedImport, setSelectedImport] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  
  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedImportId, setSelectedImportId] = useState(null);
  
  // Approve confirmation dialog state
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [selectedApproveId, setSelectedApproveId] = useState(null);
  
  // Success action dialog state
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('');

  // Load import history from localStorage on mount (if available)
  useEffect(() => {
    const savedImports = localStorage.getItem('importHistory');
    if (savedImports) {
      setImportHistory(JSON.parse(savedImports));
    }
  }, []);

  // Format number with commas for every 3 digits
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Filter imports based on search term
  const filteredImports = importHistory.filter(item =>
    item.id.toString().includes(searchTerm) ||
    item.date.includes(searchTerm) ||
    (item.purchaseOrderId && item.purchaseOrderId.toString().includes(searchTerm)) ||
    item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle view import details
  const handleViewImport = (importData) => {
    setSelectedImport(importData);
    setDetailDialogOpen(true);
  };

  // Handle delete import
  const handleDeleteImport = (id) => {
    setSelectedImportId(id);
    setDeleteDialogOpen(true);
  };

  // Handle approve import
  const handleApproveImport = (id) => {
    setSelectedApproveId(id);
    setApproveDialogOpen(true);
  };

  // Confirm delete action
  const confirmDelete = (id) => {
    const updatedHistory = importHistory.filter(item => item.id !== id);
    setImportHistory(updatedHistory);
    setDeleteDialogOpen(false);
    
    // Update localStorage
    localStorage.setItem('importHistory', JSON.stringify(updatedHistory));
    
    // Show success dialog
    setActionType('delete');
    setSuccessDialogOpen(true);
  };

  // Confirm approve action
  const confirmApprove = (id) => {
    const updatedHistory = importHistory.map(item => 
      item.id === id ? {...item, status: 'ນຳເຂົ້າແລ້ວ'} : item
    );
    
    setImportHistory(updatedHistory);
    setApproveDialogOpen(false);
    
    // Update localStorage
    localStorage.setItem('importHistory', JSON.stringify(updatedHistory));
    
    // Show success dialog
    setActionType('approve');
    setSuccessDialogOpen(true);
  };

  // Dialog handlers
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedImportId(null);
  };

  const handleCloseApproveDialog = () => {
    setApproveDialogOpen(false);
    setSelectedApproveId(null);
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedImport(null);
  };

  const handleCloseActionSuccessDialog = () => {
    setSuccessDialogOpen(false);
  };

  // Get status chip color based on status
  const getStatusChipColor = (status) => {
    switch(status) {
      case 'ລໍຖ້າອະນຸມັດ':
        return '#FFA726'; // Orange for waiting
      case 'ນຳເຂົ້າແລ້ວ':
        return '#9ACD32'; // Green for approved
      default:
        return '#9E9E9E'; // Gray for other statuses
    }
  };

  return (
    <Layout title="ປະຫວັດການນຳເຂົ້າສິນຄ້າ">
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog 
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={confirmDelete}
        itemId={selectedImportId}
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
        message={actionType === 'approve' ? "ການນຳເຂົ້າໄດ້ຖືກອະນຸມັດແລ້ວ" : "ລາຍການນຳເຂົ້າຖືກລຶບສຳເລັດແລ້ວ"}
        actionType={actionType}
      />
      
      {/* Import Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={handleCloseDetailDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', py: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">ລາຍລະອຽດການນຳເຂົ້າ</Typography>
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
          <Box sx={{ mb: 4 }}>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>ເລກທີ່:</strong> {selectedImport?.id}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>ເລກທີ່ໃບສັ່ງຊື້:</strong> {selectedImport?.purchaseOrderId || "-"}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>ຜູ້ສະໜອງ:</strong> {selectedImport?.supplier}
                </Typography>
                <Typography variant="body1">
                  <strong>ພະນັກງານ:</strong> {selectedImport?.employee}
                </Typography>
              </Grid>
              <Grid item xs={6} sx={{ textAlign: 'right' }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>ວັນທີ:</strong> {selectedImport?.date}
                </Typography>
                <Typography variant="body1">
                  <strong>ສະຖານະ:</strong> {selectedImport?.status}
                </Typography>
              </Grid>
            </Grid>
            
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
              <Table>
                <TableHead sx={{ bgcolor: 'background.default' }}>
                  <TableRow>
                    <TableCell align="center" width="5%">#</TableCell>
                    <TableCell>ຊື່ສິນຄ້າ</TableCell>
                    <TableCell align="right">ລາຄາ</TableCell>
                    <TableCell align="center">ຈຳນວນ</TableCell>
                    <TableCell align="right">ລວມລາຄາ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedImport?.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell align="center">{index + 1}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell align="right">{formatNumber(item.price)} ກີບ</TableCell>
                      <TableCell align="center">{item.quantity}</TableCell>
                      <TableCell align="right">{formatNumber(item.price * item.quantity)} ກີບ</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
              <Box sx={{ textAlign: 'right', width: '300px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1"><strong>ລາຄາລວມ:</strong></Typography>
                  <Typography variant="body1">{selectedImport?.total ? formatNumber(selectedImport.total) : 0} ກີບ</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
      
      <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" fontWeight="bold" color="primary">
          ປະຫວັດການນຳເຂົ້າສິນຄ້າ
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/import')}
        >
          ເພິ່ມການນຳເຂົ້າໃໝ່
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
                <TableCell align="center">ເລກທີ</TableCell>
                <TableCell align="center">ວັນທີ</TableCell>
                <TableCell align="center">ເລກທີໃບສັ່ງຊື້</TableCell>
                <TableCell align="center">ຜູ້ສະໜອງ</TableCell>
                <TableCell align="center">ພະນັກງານ</TableCell>
                <TableCell align="center">ສະຖານະ</TableCell>
                <TableCell align="center">ຄຳສັ່ງ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredImports.map((item, index) => (
                <TableRow
                  key={item.id}
                  sx={{ "&:nth-of-type(odd)": { bgcolor: 'action.hover' } }}
                >
                  <TableCell align="center">{index + 1}</TableCell>
                  <TableCell align="center">{item.id}</TableCell>
                  <TableCell align="center">{item.date}</TableCell>
                  <TableCell align="center">{item.purchaseOrderId || "-"}</TableCell>
                  <TableCell align="center">{item.supplier}</TableCell>
                  <TableCell align="center">{item.employee}</TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={item.status}
                      sx={{ 
                        bgcolor: getStatusChipColor(item.status), 
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
                        onClick={() => handleViewImport(item)}
                        startIcon={<VisibilityIcon />}
                      >
                        ລາຍລະອຽດ
                      </Button>
                      
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        sx={{ borderRadius: 4 }}
                        onClick={() => handleApproveImport(item.id)}
                        startIcon={<CheckCircleIcon />}
                        disabled={item.status === 'ນຳເຂົ້າແລ້ວ'} // Disable if already approved
                      >
                        ອະນຸມັດ
                      </Button>
                      
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        sx={{ borderRadius: 4 }}
                        onClick={() => handleDeleteImport(item.id)}
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

export default ImportDetail;