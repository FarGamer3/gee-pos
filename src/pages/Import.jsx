// Save import to localStorage for history tracking
const saveImportToHistory = (newImport) => {
    // Get existing import history
    const existingHistory = JSON.parse(localStorage.getItem('importHistory') || '[]');
    
    // Add new import to history
    const updatedHistory = [...existingHistory, newImport];
    
    // Save back to localStorage
    localStorage.setItem('importHistory', JSON.stringify(updatedHistory));
  };import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Grid,
  MenuItem,
  InputAdornment,
  Chip
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Save as SaveIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { SuccessDialog, ErrorDialog } from '../components/SuccessDialog';
import { DeleteConfirmDialog, ApproveConfirmDialog, ActionSuccessDialog } from '../components/ConfirmationDialog';

function Import() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [importItems, setImportItems] = useState([]);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState(null);
  const [importDate, setImportDate] = useState(new Date().toISOString().split('T')[0]);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  
  // Import history state
  const [importHistory, setImportHistory] = useState([
    { 
      id: 1, 
      date: '22/2/2025', 
      supplier: 'ບໍລິສັດ Gee', 
      warehouse: 'ສາງໃຫຍ່', 
      employee: 'ເປັນຕຸ້ຍ (ພະນັກງານ)', 
      status: 'ນຳເຂົ້າແລ້ວ',
      items: [
        { name: 'ຕູ້ເຢັນ', quantity: 2, price: 5000000 },
        { name: 'ແອຄອນດິຊັນ', quantity: 1, price: 3000000 }
      ]
    },
    { 
      id: 2, 
      date: '23/2/2025', 
      supplier: 'ບໍລິສັດ Gee', 
      warehouse: 'ສາງໃຫຍ່',
      employee: 'ເປັນຕຸ້ຍ (ພະນັກງານ)', 
      status: 'ນຳເຂົ້າແລ້ວ',
      items: [
        { name: 'ໂທລະທັດ', quantity: 2, price: 5000000 },
        { name: 'ຈັກຊັກຜ້າ', quantity: 5, price: 5000000 }
      ]
    }
  ]);

  // Selected import for viewing details
  const [selectedImport, setSelectedImport] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  
  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedImportId, setSelectedImportId] = useState(null);
  
  // Success action dialog state
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  
  // Mock purchase orders data
  const purchaseOrders = [
    { 
      id: 1, 
      orderDate: '22/2/2025', 
      supplier: 'ບໍລິສັດ Gee', 
      employee: 'ເປັນຕຸ້ຍ (ພະນັກງານ)', 
      status: 'ອະນຸມັດແລ້ວ',
      items: [
        { id: 1, code: 'P001', name: 'ຕູ້ເຢັນ', price: 5000000, quantity: 2 },
        { id: 3, code: 'P003', name: 'ແອຄອນດິຊັນ', price: 3000000, quantity: 1 }
      ]
    },
    { 
      id: 2, 
      orderDate: '23/2/2025', 
      supplier: 'ບໍລິສັດ ທ້າວກ້າ', 
      employee: 'ເປັນຕຸ້ຍ (ພະນັກງານ)', 
      status: 'ອະນຸມັດແລ້ວ',
      items: [
        { id: 2, code: 'P002', name: 'ໂທລະທັດ', price: 5000000, quantity: 1 },
        { id: 4, code: 'P004', name: 'ຈັກຊັກຜ້າ', price: 5000000, quantity: 2 }
      ]
    }
  ];

  // Format date to DD/MM/YYYY
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  // Format number with commas for every 3 digits
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Filter purchase orders based on search term
  const filteredPurchaseOrders = purchaseOrders.filter(order =>
    order.id.toString().includes(searchTerm) ||
    order.orderDate.includes(searchTerm) ||
    order.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Select purchase order and populate import items
  const selectPurchaseOrder = (order) => {
    setSelectedPurchaseOrder(order);
    setImportItems(order.items.map(item => ({...item})));
  };

  // Update item quantity in import
  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) return;
    
    const updatedItems = importItems.map(item => 
      item.id === id ? { ...item, quantity: parseInt(quantity) } : item
    );
    
    setImportItems(updatedItems);
  };

  // Remove item from import
  const removeFromImport = (id) => {
    setImportItems(importItems.filter(item => item.id !== id));
  };

  // Handle save import
  const handleSaveImport = () => {
    if (!selectedPurchaseOrder) {
      alert('ກະລຸນາເລືອກໃບສັ່ງຊື້ກ່ອນບັນທຶກການນຳເຂົ້າ');
      return;
    }

    if (importItems.length === 0) {
      alert('ກະລຸນາເລືອກສິນຄ້າກ່ອນບັນທຶກການນຳເຂົ້າ');
      return;
    }
    
    // Calculate total
    const total = importItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Create the new import object
    const newImport = {
      id: importHistory.length > 0 ? Math.max(...importHistory.map(imp => imp.id)) + 1 : 1,
      date: formatDate(importDate),
      purchaseOrderId: selectedPurchaseOrder.id,
      supplier: selectedPurchaseOrder.supplier,
      warehouse: 'ສາງໃຫຍ່', // Default warehouse
      employee: 'ເປັນຕຸ້ຍ (ພະນັກງານ)', // Hardcoded for demo
      status: 'ນຳເຂົ້າແລ້ວ',
      items: importItems,
      total: total
    };
    
    // Add to history
    setImportHistory([...importHistory, newImport]);
    
    // Save to localStorage for history tracking
    saveImportToHistory(newImport);
    
    console.log('Saving import:', newImport);
    
    // Show success dialog
    setShowSuccessDialog(true);
  };

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

  // Confirm delete action
  const confirmDelete = (id) => {
    setImportHistory(importHistory.filter(item => item.id !== id));
    setDeleteDialogOpen(false);
    
    // Show success dialog
    setActionType('delete');
    setSuccessDialogOpen(true);
  };

  // Dialog handlers
  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
    // Clear form after dialog is closed
    setImportItems([]);
    setSelectedPurchaseOrder(null);
  };

  const handleNavigateToImportHistory = () => {
    setShowSuccessDialog(false);
    // Clear form and focus on history tab
    setImportItems([]);
    setSelectedPurchaseOrder(null);
    // Navigate to the import history page
    navigate('/import-detail');
  };

  const handleCloseErrorDialog = () => {
    setShowErrorDialog(false);
  };

  const handleTryAgain = () => {
    setShowErrorDialog(false);
    // User can try to save again
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedImportId(null);
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedImport(null);
  };

  const handleCloseActionSuccessDialog = () => {
    setSuccessDialogOpen(false);
  };

  return (
    <Layout title="ນຳເຂົ້າສິນຄ້າ">
      {/* Success Dialog */}
      <SuccessDialog 
        open={showSuccessDialog} 
        onClose={handleCloseSuccessDialog} 
        onDashboard={handleNavigateToImportHistory} 
      />
      
      {/* Error Dialog */}
      <ErrorDialog 
        open={showErrorDialog} 
        onClose={handleCloseErrorDialog} 
        onTryAgain={handleTryAgain} 
      />
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog 
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={confirmDelete}
        itemId={selectedImportId}
      />
      
      {/* Action Success Dialog */}
      <ActionSuccessDialog 
        open={successDialogOpen}
        onClose={handleCloseActionSuccessDialog}
        title="ລຶບສຳເລັດ"
        message="ລາຍການນຳເຂົ້າຖືກລຶບສຳເລັດແລ້ວ"
        actionType="delete"
      />
      
      {/* Import Detail Dialog */}
      {selectedImport && (
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
                    <strong>ເລກທີ່:</strong> {selectedImport.id}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>ຜູ້ສະໜອງ:</strong> {selectedImport.supplier}
                  </Typography>
                  <Typography variant="body1">
                    <strong>ພະນັກງານ:</strong> {selectedImport.employee}
                  </Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>ວັນທີ:</strong> {selectedImport.date}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>ສາງສິນຄ້າ:</strong> {selectedImport.warehouse}
                  </Typography>
                  <Typography variant="body1">
                    <strong>ສະຖານະ:</strong> {selectedImport.status}
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
                    {selectedImport.items.map((item, index) => (
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
            </Box>
          </DialogContent>
        </Dialog>
      )}
      
      <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" fontWeight="bold" color="primary">
          ຟອມນຳເຂົ້າສິນຄ້າ
        </Typography>
        <Button 
          variant="contained" 
          color="info" 
          onClick={() => navigate('/import-detail')}
        >
          ເບິ່ງປະຫວັດການນຳເຂົ້າ
        </Button>
      </Box>

      {/* Import Form */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="ວັນເວລາ"
              type="date"
              value={importDate}
              onChange={(e) => setImportDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={2}>
        {/* Left column - Purchase Order selection */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                ເລືອກໃບສັ່ງຊື້
              </Typography>
            </Box>
            
            <TextField
              fullWidth
              placeholder="ຄົ້ນຫາໃບສັ່ງຊື້..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            <TableContainer sx={{ maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center">ເລກທີ</TableCell>
                    <TableCell align="center">ວັນທີ</TableCell>
                    <TableCell align="center">ຜູ້ສະໜອງ</TableCell>
                    <TableCell align="center">ສະຖານະ</TableCell>
                    <TableCell align="center"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPurchaseOrders.map((order) => (
                    <TableRow 
                      key={order.id} 
                      hover
                      selected={selectedPurchaseOrder && selectedPurchaseOrder.id === order.id}
                    >
                      <TableCell align="center">{order.id}</TableCell>
                      <TableCell align="center">{order.orderDate}</TableCell>
                      <TableCell align="center">{order.supplier}</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={order.status}
                          color="success"
                          size="small"
                          sx={{ 
                            bgcolor: '#4CAF50', 
                            color: 'white',
                            fontSize: '0.75rem'
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          size="small"
                          color="primary"
                          onClick={() => selectPurchaseOrder(order)}
                          sx={{ fontSize: '0.7rem', py: 0.5 }}
                        >
                          ເລືອກ
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Right column - Import items */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight="bold">
                ລາຍການນຳເຂົ້າ
              </Typography>
              {selectedPurchaseOrder && (
                <Typography variant="subtitle2" color="primary.main">
                  ໃບສັ່ງຊື້ເລກທີ: {selectedPurchaseOrder.id} - {selectedPurchaseOrder.supplier}
                </Typography>
              )}
            </Box>

            <TableContainer sx={{ maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center">#</TableCell>
                    <TableCell align="center">ສິນຄ້າ</TableCell>
                    <TableCell align="center">ລາຄາ</TableCell>
                    <TableCell align="center">ຈຳນວນ</TableCell>
                    <TableCell align="center">ລວມລາຄາ</TableCell>
                    <TableCell align="center"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {importItems.map((item, index) => (
                    <TableRow 
                      key={item.id} 
                      sx={{ 
                        "&:nth-of-type(odd)": { 
                          bgcolor: 'action.hover' 
                        } 
                      }}
                    >
                      <TableCell align="center">{index + 1}</TableCell>
                      <TableCell align="center">{item.name}</TableCell>
                      <TableCell align="center">{formatNumber(item.price)}</TableCell>
                      <TableCell align="center" width={80}>
                        <TextField
                          type="number"
                          size="small"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, e.target.value)}
                          sx={{ 
                            width: 60,
                            '& input': { 
                              textAlign: 'center',
                              p: 1
                            }
                          }}
                          inputProps={{ min: 1 }}
                        />
                      </TableCell>
                      <TableCell align="center">{formatNumber(item.price * item.quantity)}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeFromImport(item.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  setImportItems([]);
                  setSelectedPurchaseOrder(null);
                }}
              >
                ຍົກເລີກ
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<SaveIcon />}
                onClick={handleSaveImport}
                disabled={importItems.length === 0 || !selectedPurchaseOrder}
              >
                ບັນທຶກ
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>


    </Layout>
  );
}

export default Import;