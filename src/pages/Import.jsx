import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Add this line
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
  CircularProgress,
  Alert,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Snackbar,
  Link
} from '@mui/material';
import {
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  RemoveRedEye as ViewIcon,
  Sync as SyncIcon,
  Close as CloseIcon,
  ErrorOutline as ErrorIcon,
  ArrowForward as ArrowForwardIcon,
  ImportExport as ImportExportIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { getPendingOrders, createImport, getAllImports, getImportDetails, testServerConnection } from '../services/importService';
import { getOrderDetails } from '../services/orderService';
import { getCurrentUser } from '../services/authService';

function Import() {
  const navigate = useNavigate();
  
  // States for managing imports
  const [imports, setImports] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);
  
  // Dialog states
  const [openImportDialog, setOpenImportDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const [selectedImport, setSelectedImport] = useState(null);
  const [importDetails, setImportDetails] = useState([]);
  const [errorDetails, setErrorDetails] = useState({title: '', message: '', suggestion: ''});
  
  // Form states
  const [importData, setImportData] = useState({
    imp_date: new Date().toISOString().split('T')[0],
    status: 'Completed',
    items: []
  });
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Get current logged in user
  const currentUser = getCurrentUser();
  
  // Fetch all imports and pending orders on component mount
  useEffect(() => {
    testConnection();
    fetchImports();
    fetchPendingOrders();
  }, []);
  
  // ທົດສອບໂຫຼດຂໍ້ມູນປະຫວັດການນຳເຂົ້າ
const testImportHistory = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/import/All/Import`);
    console.log("ຜົນການທົດສອບຂໍ້ມູນປະຫວັດການນຳເຂົ້າ:", response.data);
    return true;
  } catch (err) {
    console.error("ບໍ່ສາມາດດຶງຂໍ້ມູນປະຫວັດການນຳເຂົ້າໄດ້:", err);
    return false;
  }
}
// ຟັງຊັນຈຳລອງການບັນທຶກການນຳເຂົ້າ
const simulateImportRecord = async (importData) => {
  try {
    // ສ້າງຂໍ້ມູລການນຳເຂົ້າຈຳລອງ
    const importRecord = {
      emp_id: importData.emp_id,
      order_id: importData.order_id,
      imp_date: importData.imp_date,
      status: 'Completed',
      total_price: calculateTotalPrice()
    };
    
    // ບັນທຶກຂໍ້ມູລການນຳເຂົ້າ
    const response = await axios.post(`${API_BASE_URL}/import/Create/Import`, importRecord);
    console.log("ຜົນການບັນທຶກການນຳເຂົ້າຈຳລອງ:", response.data);
    return true;
  } catch (err) {
    console.error("ບໍ່ສາມາດບັນທຶກການນຳເຂົ້າຈຳລອງໄດ້:", err);
    return false;
  }
}
  // Test server connection
  const testConnection = async () => {
    try {
      const result = await testServerConnection();
      setConnectionStatus(result);
      
      if (!result.success) {
        setErrorDetails({
          title: 'ການເຊື່ອມຕໍ່ກັບເຊີບເວີມີບັນຫາ',
          message: result.error || 'ບໍ່ສາມາດເຊື່ອມຕໍ່ກັບເຊີບເວີໄດ້. ກະລຸນາກວດສອບການຕັ້ງຄ່າເຊີບເວີ.',
          suggestion: 'ກວດສອບວ່າ backend server ກຳລັງເຮັດວຽກຢູ່ຫຼືບໍ່ ແລະ ລອງໂຫຼດຄືນໃໝ່.'
        });
        setOpenErrorDialog(true);
      }
    } catch (err) {
      console.error('Error testing connection:', err);
    }
  };
  
  // Fetch list of imports
  const fetchImports = async () => {
    try {
      setLoading(true);
      const data = await getAllImports();
      setImports(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching imports:', err);
      setError('ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນການນຳເຂົ້າສິນຄ້າ');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch pending orders (orders not yet imported)
  const fetchPendingOrders = async () => {
    try {
      setLoading(true);
      const data = await getPendingOrders();
      setPendingOrders(data || []);
    } catch (err) {
      console.error('Error fetching pending orders:', err);
      showSnackbar('ບໍ່ສາມາດດຶງຂໍ້ມູນລາຍການສັ່ງຊື້ທີ່ລໍຖ້າການນຳເຂົ້າໄດ້', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle selecting an order for import
  const handleSelectOrder = async (order) => {
    try {
      setLoading(true);
      setSelectedOrder(order);
      
      // Fetch order details
      const details = await getOrderDetails(order.order_id);
      
      if (details && details.length > 0) {
        // Transform order details into import items
        const importItems = details.map(item => ({
          proid: item.proid,
          name: item.ProductName,
          qty: item.qty,
          cost_price: item.cost_price || 0, // ອາດຈະມີລາຄາຕົ້ນທຶນຢູ່ແລ້ວ
          subtotal: (item.cost_price || 0) * item.qty
        }));
        
        setOrderDetails(details);
        setImportData({
          ...importData,
          items: importItems,
          order_id: order.order_id,
          emp_id: currentUser?.emp_id || 1
        });
        
        setOpenImportDialog(true);
      } else {
        showSnackbar('ບໍ່ພົບຂໍ້ມູນລາຍລະອຽດຂອງລາຍການສັ່ງຊື້', 'warning');
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
      showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນລາຍລະອຽດການສັ່ງຊື້', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle viewing import details
  const handleViewImportDetails = async (importItem) => {
    try {
      setLoading(true);
      setSelectedImport(importItem);
      
      // Navigate to detail page instead of opening dialog
      navigate(`/import-detail?id=${importItem.imp_id}`);
    } catch (err) {
      console.error('Error navigating to import details:', err);
      showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການເຂົ້າເບິ່ງລາຍລະອຽດການນຳເຂົ້າ', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle cost price change for an item
  const handleCostPriceChange = (index, value) => {
    const numValue = parseFloat(value) || 0;
    const updatedItems = [...importData.items];
    
    updatedItems[index] = {
      ...updatedItems[index],
      cost_price: numValue,
      subtotal: numValue * updatedItems[index].qty
    };
    
    setImportData({
      ...importData,
      items: updatedItems
    });
  };
  
  // Handle quantity change for an item
  const handleQuantityChange = (index, value) => {
    const numValue = parseInt(value) || 0;
    if (numValue < 0) return; // ບໍ່ຮັບຈຳນວນຕິດລົບ
    
    const updatedItems = [...importData.items];
    
    updatedItems[index] = {
      ...updatedItems[index],
      qty: numValue,
      subtotal: updatedItems[index].cost_price * numValue
    };
    
    setImportData({
      ...importData,
      items: updatedItems
    });
  };
  
  // Calculate total price of all items
  const calculateTotalPrice = () => {
    return importData.items.reduce((total, item) => total + (item.subtotal || 0), 0);
  };
  


// Handle submit import
// Handle submit import
const handleSubmitImport = async () => {
  // Validate if all items have cost prices
  const invalidItems = importData.items.filter(item => !item.cost_price);
  
  if (invalidItems.length > 0) {
    showSnackbar('ກະລຸນາລະບຸລາຄາຕົ້ນທຶນຂອງທຸກລາຍການ', 'error');
    return;
  }
  
  try {
    setLoading(true);
    
    const importPayload = {
      ...importData,
      total_price: calculateTotalPrice(),
      imp_date: importData.imp_date || new Date().toISOString().split('T')[0]
    };
    
    // ວິທີການອັບເດດສິນຄ້າໂດຍກົງ
    let successCount = 0;
    const totalItems = importPayload.items.length;
    
    // ວົນລູບຜ່ານແຕ່ລະລາຍການສິນຄ້າແລ້ວອັບເດດຈໍານວນເຂົ້າສາງ
    for (const item of importPayload.items) {
      try {
        // ດຶງຂໍ້ມູນສິນຄ້າປັດຈຸບັນ
        const productResponse = await axios.get(`${API_BASE_URL}/All/Product`);
        
        if (productResponse.data && productResponse.data.products) {
          // ຊອກຫາສິນຄ້າໃນລາຍການທັງໝົດ
          const product = productResponse.data.products.find(p => p.proid === item.proid);
          
          if (product) {
            // ຄຳນວນຈຳນວນສິນຄ້າໃໝ່ (ເພີ່ມຈາກຈຳນວນທີ່ມີຢູ່ແລ້ວ)
            const currentQty = parseInt(product.qty) || 0;
            const newQty = currentQty + parseInt(item.qty);
            
            // ອັບເດດສິນຄ້າ
            await axios.put(`${API_BASE_URL}/Update/Product`, {
              proid: item.proid,
              qty: newQty
            });
            
            successCount++;
          }
        }
      } catch (updateError) {
        console.error(`ບໍ່ສາມາດອັບເດດສິນຄ້າລະຫັດ ${item.proid} ໄດ້:`, updateError.message);
      }
    }
    
    // ຖ້າອັບເດດໄດ້ຢ່າງໜ້ອຍ 1 ລາຍການ, ຖືວ່າສຳເລັດບາງສ່ວນ
    if (successCount > 0) {
      // ລຶບລາຍການສັ່ງຊື້ອອກຈາກຖານຂໍ້ມູນ
      try {
        await axios.delete(`${API_BASE_URL}/order/Delete/Order`, {
          data: { order_id: selectedOrder.order_id }
        });
        console.log(`ລຶບລາຍການສັ່ງຊື້ເລກທີ ${selectedOrder.order_id} ສຳເລັດແລ້ວ`);
      } catch (deleteError) {
        console.error(`ບໍ່ສາມາດລຶບລາຍການສັ່ງຊື້ເລກທີ ${selectedOrder.order_id} ໄດ້:`, deleteError.message);
      }
      
      // ປິດກ່ອງໂຕ້ຕອບທັນທີຫຼັງຈາກສຳເລັດ
      setOpenImportDialog(false);
      
      if (successCount === totalItems) {
        showSnackbar('ບັນທຶກການນຳເຂົ້າສິນຄ້າສຳເລັດ', 'success');
      } else {
        showSnackbar(`ບັນທຶກການນຳເຂົ້າສິນຄ້າສຳເລັດບາງສ່ວນ (${successCount}/${totalItems} ລາຍການ)`, 'warning');
      }
      
      // ລຶບລາຍການໃນໜ້າຈໍເຊັ່ນກັນ
      const updatedPendingOrders = pendingOrders.filter(order => 
        order.order_id !== selectedOrder.order_id
      );
      setPendingOrders(updatedPendingOrders);
      
      // ຣີເຊັດສະຖານະ
      setSelectedOrder(null);
      setOrderDetails([]);
      setImportData({
        imp_date: new Date().toISOString().split('T')[0],
        status: 'Completed',
        items: []
      });
      
      // ໃຊ້ການໂຫຼດໜ້າຄືນໃໝ່ທັນທີເພື່ອໃຫ້ເຫັນຂໍ້ມູນທີ່ຖືກຕ້ອງ
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      // ຖ້າບໍ່ມີລາຍການໃດສຳເລັດເລີຍ
      throw new Error('ບໍ່ສາມາດອັບເດດສິນຄ້າໄດ້ເລີຍ');
    }
  } catch (err) {
    console.error('Error creating import:', err);
    
    // ສະແດງກ່ອງແຈ້ງເຕືອນຂໍ້ຜິດພາດ
    setErrorDetails({
      title: 'ບໍ່ສາມາດບັນທຶກການນຳເຂົ້າສິນຄ້າໄດ້',
      message: err.message || 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກການນຳເຂົ້າສິນຄ້າ',
      suggestion: 'ກະລຸນາກວດສອບການເຊື່ອມຕໍ່ເຊີບເວີ ຫຼື ລາຍລະອຽດຂອງສິນຄ້າ ແລ້ວລອງໃໝ່ອີກຄັ້ງ.'
    });
    setOpenErrorDialog(true);
  } finally {
    setLoading(false);
  }
};
  
  // Handle closing the import dialog
  const handleCloseImportDialog = () => {
    setOpenImportDialog(false);
    setSelectedOrder(null);
    setOrderDetails([]);
  };
  
  // Handle closing the details dialog
  const handleCloseDetailsDialog = () => {
    setOpenDetailsDialog(false);
    setSelectedImport(null);
    setImportDetails([]);
  };
  
  // Handle closing the error dialog
  const handleCloseErrorDialog = () => {
    setOpenErrorDialog(false);
  };
  
  // Show snackbar
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };
  
  // Handle closing snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('lo-LA');
    } catch (error) {
      return dateString;
    }
  };
  
  // Format number with commas for currency display
  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  return (
    <Layout title="ນຳເຂົ້າສິນຄ້າ">
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
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
      
      {/* Connection status warning if needed */}
      {connectionStatus && !connectionStatus.success && (
        <Alert 
          severity="warning" 
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={testConnection}>
              ລອງອີກຄັ້ງ
            </Button>
          }
        >
          ການເຊື່ອມຕໍ່ເຊີບເວີມີບັນຫາ. ບາງຄຸນລັກສະນະອາດບໍ່ສາມາດໃຊ້ງານໄດ້.
        </Alert>
      )}
      
      {/* Pending Orders Section */}
      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              ລາຍການສັ່ງຊື້ທີ່ລໍຖ້າການນຳເຂົ້າ
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<SyncIcon />}
              onClick={fetchPendingOrders}
            >
              ໂຫຼດຄືນໃໝ່
            </Button>
          </Box>
          
          {loading && pendingOrders.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress />
            </Box>
          ) : pendingOrders.length === 0 ? (
            <Alert severity="info">ບໍ່ມີລາຍການສັ່ງຊື້ທີ່ລໍຖ້າການນຳເຂົ້າ</Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell align="center">ລະຫັດ</TableCell>
                    <TableCell align="center">ວັນທີ່ສັ່ງຊື້</TableCell>
                    <TableCell>ຜູ້ສະໜອງ</TableCell>
                    <TableCell>ພະນັກງານ</TableCell>
                    <TableCell align="center">ຈັດການ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingOrders.map((order) => (
                    <TableRow key={order.order_id} hover>
                      <TableCell align="center">{order.order_id}</TableCell>
                      <TableCell align="center">{formatDate(order.order_date)}</TableCell>
                      <TableCell>{order.supplier}</TableCell>
                      <TableCell>{order.employee}</TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          startIcon={<ImportExportIcon />}
                          onClick={() => handleSelectOrder(order)}
                          disabled={loading}
                        >
                          ນຳເຂົ້າ
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>
      
      {/* Imports History Section */}
      <Box>
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              ປະຫວັດການນຳເຂົ້າສິນຄ້າ
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<SyncIcon />}
              onClick={fetchImports}
            >
              ໂຫຼດຄືນໃໝ່
            </Button>
          </Box>
          
          {loading && imports.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress />
            </Box>
          ) : imports.length === 0 ? (
            <Alert severity="info">ບໍ່ມີຂໍ້ມູນການນຳເຂົ້າສິນຄ້າ</Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center">ລະຫັດ</TableCell>
                    <TableCell align="center">ວັນທີ່ນຳເຂົ້າ</TableCell>
                    <TableCell align="center">ລະຫັດການສັ່ງຊື້</TableCell>
                    <TableCell>ພະນັກງານ</TableCell>
                    <TableCell align="right">ມູນຄ່າລວມ</TableCell>
                    <TableCell align="center">ສະຖານະ</TableCell>
                    <TableCell align="center">ຈັດການ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {imports.map((importItem) => (
                    <TableRow key={importItem.imp_id} hover>
                      <TableCell align="center">{importItem.imp_id}</TableCell>
                      <TableCell align="center">{formatDate(importItem.imp_date)}</TableCell>
                      <TableCell align="center">{importItem.order_id}</TableCell>
                      <TableCell>{importItem.emp_name}</TableCell>
                      <TableCell align="right">{formatNumber(importItem.total_price)} ກີບ</TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: 'inline-block',
                            bgcolor: importItem.status === 'Completed' ? 'success.main' : 'warning.main',
                            color: 'white',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.75rem'
                          }}
                        >
                          {importItem.status === 'Completed' ? 'ສຳເລັດ' : 'ລໍຖ້າ'}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          color="info"
                          size="small"
                          endIcon={<ArrowForwardIcon />}
                          onClick={() => handleViewImportDetails(importItem)}
                        >
                          ເບິ່ງ
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>
      
      {/* Import Dialog */}
      <Dialog
        open={openImportDialog}
        onClose={handleCloseImportDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          ນຳເຂົ້າສິນຄ້າ - ລະຫັດສັ່ງຊື້: {selectedOrder?.order_id}
          <IconButton
            aria-label="close"
            onClick={handleCloseImportDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ວັນທີ່ນຳເຂົ້າ"
                type="date"
                value={importData.imp_date}
                onChange={(e) => setImportData({ ...importData, imp_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>ສະຖານະ</InputLabel>
                <Select
                  value={importData.status}
                  onChange={(e) => setImportData({ ...importData, status: e.target.value })}
                  label="ສະຖານະ"
                >
                  <MenuItem value="Completed">ສຳເລັດ</MenuItem>
                  <MenuItem value="Pending">ລໍຖ້າ</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              ລາຍການສິນຄ້າທີ່ຈະນຳເຂົ້າ
            </Typography>
            
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ລຳດັບ</TableCell>
                    <TableCell>ຊື່ສິນຄ້າ</TableCell>
                    <TableCell align="center">ຈຳນວນ</TableCell>
                    <TableCell align="right">ລາຄາຕົ້ນທຶນ</TableCell>
                    <TableCell align="right">ເປັນເງິນ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {importData.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell align="center">
                        <TextField
                          type="number"
                          size="small"
                          value={item.qty}
                          onChange={(e) => handleQuantityChange(index, e.target.value)}
                          inputProps={{ min: 1, style: { textAlign: 'center' } }}
                          sx={{ width: 80 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          type="number"
                          size="small"
                          value={item.cost_price}
                          onChange={(e) => handleCostPriceChange(index, e.target.value)}
                          inputProps={{ min: 0, style: { textAlign: 'right' } }}
                          sx={{ width: 120 }}
                        />
                      </TableCell>
                      <TableCell align="right">{formatNumber(item.subtotal)} ກີບ</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={4} align="right" sx={{ fontWeight: 'bold' }}>
                      ລາຄາລວມ:
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {formatNumber(calculateTotalPrice())} ກີບ
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button variant="outlined" onClick={handleCloseImportDialog} disabled={loading}>
            ຍົກເລີກ
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSubmitImport}
            disabled={loading || importData.items.length === 0}
            startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
          >
            ບັນທຶກການນຳເຂົ້າ
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Error Dialog */}
      <Dialog
        open={openErrorDialog}
        onClose={handleCloseErrorDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ bgcolor: 'error.main', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ErrorIcon sx={{ mr: 1 }} />
            {errorDetails.title || 'ເກີດຂໍ້ຜິດພາດ'}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" paragraph>
              {errorDetails.message}
            </Typography>
            
            {errorDetails.suggestion && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  {errorDetails.suggestion}
                </Typography>
              </Alert>
            )}
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body2" color="text.secondary">
              ຖ້າຂໍ້ຜິດພາດນີ້ຍັງສືບຕໍ່, ກະລຸນາຕິດຕໍ່ແອັດມິນລະບົບ ຫຼື ກວດສອບການຕັ້ງຄ່າເຊື່ອມຕໍ່ API ຂອງທ່ານໃນໄຟລ໌ .env
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleCloseErrorDialog}
          >
            ຕົກລົງ
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}

export default Import;