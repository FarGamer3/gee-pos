import React, { useState, useEffect } from 'react';
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
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  RemoveRedEye as ViewIcon,
  Sync as SyncIcon,
  Close as CloseIcon,
  ErrorOutline as ErrorIcon,
  ArrowForward as ArrowForwardIcon,
  Delete as DeleteIcon,
  ImportExport as ImportExportIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { getPendingOrders, createImport, getAllImports, testServerConnection } from '../services/importService';
import { getOrderDetails } from '../services/orderService';
import { getCurrentUser } from '../services/authService';

import { DeleteConfirmDialog, ApproveConfirmDialog } from '../components/ConfirmationDialog';

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
  const [openErrorDialog, setOpenErrorDialog] = useState(false);
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

  // Delete dialog states
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedImportId, setSelectedImportId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [openApproveDialog, setOpenApproveDialog] = useState(false);
const [selectedImportForApprove, setSelectedImportForApprove] = useState(null);
const [approveLoading, setApproveLoading] = useState(false);

  // ເປີດ dialog ຢືນຢັນການລຶບ
  const handleOpenDeleteDialog = (importId) => {
    setSelectedImportId(importId);
    setOpenDeleteDialog(true);
  };

  // ປິດ dialog ລຶບ
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedImportId(null);
  };

  // ເປີດ dialog ຢືນຢັນການອະນຸມັດ
const handleOpenApproveDialog = (importItem) => {
  setSelectedImportForApprove(importItem);
  setOpenApproveDialog(true);
};

// ປິດ dialog ຢືນຢັນການອະນຸມັດ
const handleCloseApproveDialog = () => {
  setOpenApproveDialog(false);
  setSelectedImportForApprove(null);
};
  
  // Fetch all imports and pending orders on component mount
  useEffect(() => {
    testConnection();
    fetchImports();
    fetchPendingOrders();
  }, []);
  
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

  const getFilteredPendingOrders = () => {
    // ດຶງລະຫັດການສັ່ງຊື້ທີ່ມີການນຳເຂົ້າສະຖານະ 'Pending' ຢູ່ແລ້ວ
    const pendingImportOrderIds = imports
      .filter(imp => imp.status === 'Pending')
      .map(imp => imp.order_id);
    
    // ກັ່ນຕອງເອົາລາຍການສັ່ງຊື້ທີ່ຍັງບໍ່ໄດ້ໃຊ້ໃນການນຳເຂົ້າ
    return pendingOrders.filter(order => 
      !pendingImportOrderIds.includes(order.order_id)
    );
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
          name: item.ProductName || item.name,
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

  // ຟັງຊັນລຶບການນຳເຂົ້າ
  const handleDeleteImport = async (importId) => {
    try {
      setDeleteLoading(true);
      
      const response = await axios.delete(`${API_BASE_URL}/import/Delete/Import`, {
        data: { imp_id: importId }
        
      });
      
      if (response.data && response.data.result_code === "200") {
        // ອັບເດດລາຍການຫຼັງຈາກລຶບສຳເລັດ
        await fetchImports();
        setOpenDeleteDialog(false);
        showSnackbar('ລຶບການນຳເຂົ້າສຳເລັດແລ້ວ', 'success');
        await fetchImports();
        await fetchPendingOrders();
      } else {
        throw new Error(response.data?.result || 'Failed to delete import');
      }
    } catch (err) {
      console.error('ຂໍ້ຜິດພາດໃນການລຶບການນຳເຂົ້າ:', err);
      showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການລຶບການນຳເຂົ້າ', 'error');
    } finally {
      setDeleteLoading(false);
      setSelectedImportId(null);
    }
  };
  
  // Handle viewing import details
  const handleViewImportDetails = async (importItem) => {
    try {
      setLoading(true);
      
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
  
  
// ຟັງຊັນ handleSubmitImport ທີ່ປັບປຸງແລ້ວ
// ຟັງຊັນບັນທຶກປະຫວັດການນຳເຂົ້າລົງໃນ localStorage
const saveImportHistory = (importData) => {
  try {
    // ດຶງປະຫວັດທີ່ມີຢູ່ແລ້ວ
    const existingHistory = JSON.parse(localStorage.getItem('importHistory') || '[]');
    
    // ສ້າງຂໍ້ມູນປະຫວັດໃໝ່
    const newImport = {
      imp_id: Date.now(), // ໃຊ້ timestamp ເປັນ ID
      imp_date: importData.imp_date,
      order_id: importData.order_id,
      emp_id: importData.emp_id,
      emp_name: currentUser?.emp_name || 'Admin',
      status: importData.status,
      total_price: calculateTotalPrice(),
      items: [...importData.items]
    };
    
    // ເພີ່ມປະຫວັດໃໝ່
    existingHistory.unshift(newImport);
    
    // ບັນທຶກກັບຄືນໄປຍັງ localStorage
    localStorage.setItem('importHistory', JSON.stringify(existingHistory));
    
    return newImport;
  } catch (error) {
    console.error('ຂໍ້ຜິດພາດໃນການບັນທຶກປະຫວັດ:', error);
    return null;
  }
};

// ຟັງຊັນ handleSubmitImport ທີ່ປັບປຸງແລ້ວ
const handleSubmitImport = async () => {
  // ກວດສອບຂໍ້ມູນກ່ອນບັນທຶກ
  const invalidItems = importData.items.filter(item => !item.cost_price);
  
  if (invalidItems.length > 0) {
    showSnackbar('ກະລຸນາລະບຸລາຄາຕົ້ນທຶນຂອງທຸກລາຍການ', 'error');
    return;
  }
  
  try {
    setLoading(true);
    
    // ສ້າງຂໍ້ມູນສຳລັບການບັນທຶກ
    const importPayload = {
      emp_id: importData.emp_id || currentUser?.emp_id || 1,
      order_id: importData.order_id,
      imp_date: importData.imp_date || new Date().toISOString().split('T')[0],
      status: 'Pending', // ບັງຄັບໃຫ້ເປັນ Pending ສະເໝີ
      total_price: calculateTotalPrice(),
      items: importData.items.map(item => ({
        proid: item.proid,
        qty: parseInt(item.qty),
        cost_price: parseFloat(item.cost_price)
      }))
    };
    
    console.log('ກຳລັງສົ່ງຂໍ້ມູນການນຳເຂົ້າ:', JSON.stringify(importPayload));
    
    // ວິທີທີ 1: ລອງບັນທຶກຜ່ານ API
    let apiSuccess = false;
    try {
      const response = await axios.post(
        `${API_BASE_URL}/import/Create/Import`, 
        importPayload, 
        { 
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000 // 10 ວິນາທີ
        }
      );
      
      if (response.data && response.data.result_code === "200") {
        console.log('ບັນທຶກການນຳເຂົ້າສຳເລັດ:', response.data);
        apiSuccess = true;
        await fetchImports();
        await fetchPendingOrders();
      }
    } catch (apiError) {
      console.error('ຂໍ້ຜິດພາດຈາກ API:', apiError);
      if (apiError.response) {
        console.error('ຄຳຕອບຈາກເຊີບເວີ:', apiError.response.data);
      }
      // ບໍ່ throw ຂໍ້ຜິດພາດຕໍ່ ເພື່ອໃຫ້ດຳເນີນການຕາມວິທີທີ 2 ຕໍ່ໄປ
    }
    
    // ຖ້າວິທີທີ 1 ບໍ່ສຳເລັດ, ໃຊ້ວິທີທີ 2: ອັບເດດສິນຄ້າໂດຍກົງ
    if (!apiSuccess) {
      console.log('ໃຊ້ວິທີອັບເດດສິນຄ້າໂດຍກົງ...');
      
      let successCount = 0;
      const totalItems = importData.items.length;
      
      // ອັບເດດສິນຄ້າແຕ່ລະລາຍການ
      for (const item of importData.items) {
        try {
          // ດຶງຂໍ້ມູນສິນຄ້າປັດຈຸບັນ
          const productResponse = await axios.get(`${API_BASE_URL}/All/Product`);
          
          if (productResponse.data && productResponse.data.products) {
            // ຊອກຫາສິນຄ້າດ້ວຍລະຫັດ
            const product = productResponse.data.products.find(p => p.proid === item.proid);
            
            if (product) {
              // ຄຳນວນຈຳນວນສິນຄ້າໃໝ່
              const currentQty = parseInt(product.qty) || 0;
              const newQty = currentQty + parseInt(item.qty);
              
              // ອັບເດດຈຳນວນສິນຄ້າໃນຖານຂໍ້ມູນ
              await axios.put(`${API_BASE_URL}/Update/Product`, {
                proid: item.proid,
                qty: newQty
              });
              
              successCount++;
            }
          }
        } catch (updateError) {
          console.error(`ບໍ່ສາມາດອັບເດດສິນຄ້າລະຫັດ ${item.proid} ໄດ້:`, updateError);
        }
      }
      
      // ຖ້າບໍ່ສາມາດອັບເດດສິນຄ້າໄດ້ເລີຍ, ສະແດງຂໍ້ຜິດພາດ
      if (successCount === 0) {
        throw new Error('ບໍ່ສາມາດອັບເດດສິນຄ້າໄດ້ເລີຍ');
      }
      
      // ບັນທຶກປະຫວັດການນຳເຂົ້າລົງໃນ localStorage
      const savedImport = saveImportHistory(importPayload);
      
      // ພະຍາຍາມລຶບລາຍການສັ່ງຊື້ (ຖ້າມີ API)
      try {
        await axios.delete(`${API_BASE_URL}/order/Delete/Order`, {
          data: { order_id: selectedOrder.order_id }
        });
        console.log(`ລຶບລາຍການສັ່ງຊື້ລະຫັດ ${selectedOrder.order_id} ສຳເລັດ`);
      } catch (deleteError) {
        console.warn(`ບໍ່ສາມາດລຶບລາຍການສັ່ງຊື້ລະຫັດ ${selectedOrder.order_id} ໄດ້:`, deleteError);
      }
      
      // ປິດກ່ອງໂຕ້ຕອບ
      setOpenImportDialog(false);
      
      // ສະແດງຂໍ້ຄວາມແຈ້ງເຕືອນ
      if (successCount === totalItems) {
        showSnackbar('ບັນທຶກການນຳເຂົ້າສິນຄ້າສຳເລັດແລ້ວ', 'success');
      } else {
        showSnackbar(`ບັນທຶກການນຳເຂົ້າສິນຄ້າສຳເລັດບາງສ່ວນ (${successCount}/${totalItems} ລາຍການ)`, 'warning');
      }
    } else {
      // ຖ້າ API ສຳເລັດ, ພຽງແຕ່ປິດກ່ອງໂຕ້ຕອບແລະສະແດງຂໍ້ຄວາມແຈ້ງເຕືອນ
      setOpenImportDialog(false);
      showSnackbar('ບັນທຶກການນຳເຂົ້າສິນຄ້າສຳເລັດແລ້ວ', 'success');
    }
    
    // ອັບເດດລາຍການລໍຖ້າ
    const updatedPendingOrders = pendingOrders.filter(order => 
      order.order_id !== selectedOrder.order_id
    );
    setPendingOrders(updatedPendingOrders);
    
    // ລີເຊັດຟອມ
    setSelectedOrder(null);
    setOrderDetails([]);
    setImportData({
      imp_date: new Date().toISOString().split('T')[0],
      status: 'Completed',
      items: []
    });
    
    // ໂຫຼດຂໍ້ມູນໃໝ່
    fetchImports();
    
  } catch (error) {
    console.error('ຂໍ້ຜິດພາດໃນການບັນທຶກການນຳເຂົ້າ:', error);
    
    // ສະແດງກ່ອງຂໍ້ຄວາມແຈ້ງເຕືອນຂໍ້ຜິດພາດ
    setErrorDetails({
      title: 'ບໍ່ສາມາດບັນທຶກການນຳເຂົ້າສິນຄ້າໄດ້',
      message: error.message || 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກການນຳເຂົ້າສິນຄ້າ',
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
      
      // Format as DD/MM/YYYY
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      return dateString;
    }
  };
// ຟັງຊັນອະນຸມັດການນຳເຂົ້າສິນຄ້າ (ປັບປຸງໃຫ້ໃຊ້ກັບກ່ອງ Dialog)
const handleApproveImport = async (importId) => {
  try {
    setApproveLoading(true);
    
    // ຖ້າຮຽກຟັງຊັນຈາກປຸ່ມໃນຕາຕະລາງໂດຍກົງ, ມັນຈະສົ່ງ object
    const imp_id = typeof importId === 'object' ? importId.imp_id : importId;
    
    // ເອີ້ນໃຊ້ API ເພື່ອອັບເດດສະຖານະ
    const response = await axios.put(`${API_BASE_URL}/import/Update/Status`, {
      imp_id: imp_id,
      status: 'Completed'
    });
    
    if (response.data && response.data.result_code === "200") {
      // ອັບເດດຂໍ້ມູນ local
      const updatedImports = imports.map(item => 
        item.imp_id === imp_id 
          ? { ...item, status: 'Completed' } 
          : item
      );
      
      setImports(updatedImports);
      setOpenApproveDialog(false);
      showSnackbar('ອະນຸມັດການນຳເຂົ້າສຳເລັດແລ້ວ', 'success');
      
      // ໂຫລດຂໍ້ມູນໃໝ່
      await fetchImports();
      await fetchPendingOrders();
    } else {
      showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການອະນຸມັດການນຳເຂົ້າ', 'error');
    }
  } catch (err) {
    console.error('ຂໍ້ຜິດພາດໃນການອະນຸມັດການນຳເຂົ້າ:', err);
    showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການອະນຸມັດການນຳເຂົ້າ', 'error');
  } finally {
    setApproveLoading(false);
    setSelectedImportForApprove(null);
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
        ) : getFilteredPendingOrders().length === 0 ? (
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
                {getFilteredPendingOrders().map((order) => (
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
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Button
                      variant="outlined"
                      color="info"
                      size="small"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => handleViewImportDetails(importItem)}
                    >
                      ເບິ່ງ
                    </Button>
                    
            {/* Show approve button only for pending status */}
{importItem.status !== 'Completed' && (
  <Button
    variant="contained"
    color="success"
    size="small"
    startIcon={<CheckCircleIcon />}
    onClick={() => handleOpenApproveDialog(importItem)}
    disabled={loading}
  >
    ອະນຸມັດ
  </Button>
)}
                    
                    {/* ເພີ່ມປຸ່ມລຶບສຳລັບລາຍການທີ່ມີສະຖານະ ລໍຖ້າ */}
                    {importItem.status !== 'Completed' && (
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleOpenDeleteDialog(importItem.imp_id)}
                        disabled={loading}
                      >
                        ລຶບ
                      </Button>
                    )}
                  </Box>
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
        {/* ລຶບ dropdown ສຳລັບເລືອກສະຖານະອອກ ແລະ ສະແດງແຕ່ສະຖານະລໍຖ້າ */}
        <TextField
          fullWidth
          label="ສະຖານະ"
          value="ລໍຖ້າ"
          disabled
          InputProps={{
            readOnly: true,
          }}
        />
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
            {/* Delete Confirmation Dialog */}
            <DeleteConfirmDialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteImport}
        itemId={selectedImportId}
        loading={deleteLoading}
      />
      {/* Approve Confirmation Dialog */}
<ApproveConfirmDialog
  open={openApproveDialog}
  onClose={handleCloseApproveDialog}
  onConfirm={handleApproveImport}
  itemId={selectedImportForApprove?.imp_id}
  loading={approveLoading}
/>
    </Layout>
  );
}

export default Import;