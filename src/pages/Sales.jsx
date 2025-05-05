// src/pages/Sales.jsx - Improved version
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Paper,
  Grid,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Divider,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  Chip,
  Tooltip,
  Card,
  CardContent,
  Avatar,
  Badge,
  useTheme,
  useMediaQuery,
  Stack
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  History as HistoryIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as ShoppingCartIcon,
  Receipt as ReceiptIcon,
  Close as CloseIcon,
  InfoOutlined as InfoIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';
import ReceiptModal from '../components/ReceiptModal';
import { 
  getAllCustomers, 
  getAllProducts, 
  searchProducts, 
  createSale
} from '../services/salesService';
import { getCurrentUser } from '../services/authService';

// Format number with commas for every 3 digits
const formatNumber = (num) => {
  if (!num) return "0";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

function Sales() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // New Sale States
  const [searchTerm, setSearchTerm] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  
  // Alerts
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  
  // Payment variables
  const [amountPaid, setAmountPaid] = useState('');
  const [changeAmount, setChangeAmount] = useState(0);
  
  // Get the current user from auth service
  const currentUser = getCurrentUser();
  
  // Calculate total
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Additional states for better UX
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [confirmClearCart, setConfirmClearCart] = useState(false);
  const [lastCompletedSale, setLastCompletedSale] = useState(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  // Calculate change when amount paid changes
  useEffect(() => {
    const paid = parseFloat(amountPaid.replace(/,/g, '')) || 0;
    if (paid >= cartTotal && cartTotal > 0) {
      setChangeAmount(paid - cartTotal);
    } else {
      setChangeAmount(0);
    }
  }, [amountPaid, cartTotal]);

  // Load products and customers on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel but handle each promise individually
        // to prevent complete failure if one request fails
        
        try {
          const productsData = await getAllProducts();
          setProducts(productsData || []);
          setFilteredProducts(productsData || []);
        } catch (productError) {
          console.error('Error loading products:', productError);
          showAlert('ບໍ່ສາມາດໂຫຼດຂໍ້ມູນສິນຄ້າໄດ້', 'warning');
        }
        
        try {
          const customersData = await getAllCustomers();
          setCustomers(customersData || []);
          setFilteredCustomers(customersData || []);
          
          // Set a default customer (first one or a generic one)
          if (customersData && customersData.length > 0) {
            setSelectedCustomer(customersData[0]);
          } else {
            setSelectedCustomer({ cus_id: 1, cus_name: 'ລູກຄ້າທົ່ວໄປ', cus_lname: '' });
          }
        } catch (customerError) {
          console.error('Error loading customers:', customerError);
          showAlert('ບໍ່ສາມາດໂຫຼດຂໍ້ມູນລູກຄ້າໄດ້', 'warning');
          // Set default customer even if API fails
          setSelectedCustomer({ cus_id: 1, cus_name: 'ລູກຄ້າທົ່ວໄປ', cus_lname: '' });
        }
        
      } catch (error) {
        console.error('Error loading initial data:', error);
        showAlert('ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  // Filter products when search term changes
  useEffect(() => {
    if (!products || products.length === 0) return;
    
    if (searchTerm.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.ProductName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.proid?.toString().includes(searchTerm)
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  // Filter customers when search term changes
  useEffect(() => {
    if (!customers || customers.length === 0) return;
    
    if (customerSearch.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(customer =>
        customer.cus_name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
        customer.cus_lname?.toLowerCase().includes(customerSearch.toLowerCase()) ||
        customer.tel?.includes(customerSearch)
      );
      setFilteredCustomers(filtered);
    }
  }, [customerSearch, customers]);

  // Handle amount paid input
  const handleAmountPaidChange = (e) => {
    // Remove commas first
    let value = e.target.value.replace(/,/g, '');
    // Allow only numbers
    value = value.replace(/[^\d]/g, '');
    // Format with commas
    if (value) {
      value = formatNumber(value);
    }
    setAmountPaid(value);
  };

  // Set exact amount 
  const setExactAmount = () => {
    if (cartTotal > 0) {
      setAmountPaid(formatNumber(cartTotal));
    }
  };

  // Add item to cart
  const addToCart = (product) => {
    const existingItemIndex = cartItems.findIndex(item => item.id === product.proid);
    
    if (existingItemIndex >= 0) {
      // Item already in cart, increase quantity
      const updatedItems = [...cartItems];
      updatedItems[existingItemIndex].quantity += 1;
      setCartItems(updatedItems);
    } else {
      // Add new item to cart
      const newItem = {
        id: product.proid,
        name: product.ProductName,
        price: parseFloat(product.retail_price) || 0,
        quantity: 1,
        stock: product.qty || 0
      };
      setCartItems([...cartItems, newItem]);
      
      // Show quick feedback
      showAlert(`ເພີ່ມ "${product.ProductName}" ໃສ່ກະຕ່າແລ້ວ`, 'success');
    }
  };

  // Quick view product details
  const handleQuickView = (product) => {
    setSelectedProduct(product);
    setQuickViewOpen(true);
  };

  // Update item quantity in cart
  const updateQuantity = (id, amount) => {
    // Find the product to check stock
    const cartItem = cartItems.find(item => item.id === id);
    if (!cartItem) return;
    
    // Calculate the new quantity
    const currentQty = cartItem.quantity;
    let newQuantity;
    
    if (typeof amount === 'string' || typeof amount === 'number') {
      // Direct quantity assignment (from text field)
      newQuantity = parseInt(amount);
    } else {
      // Increment/decrement
      newQuantity = currentQty + amount;
    }
    
    // Validate quantity
    if (isNaN(newQuantity) || newQuantity <= 0) {
      // If quantity becomes zero or invalid, remove item
      removeFromCart(id);
      return;
    }
    
    if (newQuantity > cartItem.stock) {
      showAlert(`ສິນຄ້າໃນສາງມີພຽງ ${cartItem.stock} ອັນ`, 'warning');
      newQuantity = cartItem.stock;
    }
    
    // Update the quantity
    const updatedItems = cartItems.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    
    setCartItems(updatedItems);
  };

  // Remove item from cart
  const removeFromCart = (id) => {
    // Find item name for feedback
    const item = cartItems.find(item => item.id === id);
    const itemName = item ? item.name : '';
    
    // Remove item
    setCartItems(cartItems.filter(item => item.id !== id));
    
    // Show feedback
    if (itemName) {
      showAlert(`ລຶບ "${itemName}" ອອກຈາກກະຕ່າແລ້ວ`, 'info');
    }
  };
  
  // Clear cart confirmation
  const handleClearCart = () => {
    if (cartItems.length > 0) {
      setConfirmClearCart(true);
    }
  };
  
  // Confirm clearing cart
  const confirmClearCartAction = () => {
    setCartItems([]);
    setConfirmClearCart(false);
    setAmountPaid('');
    setChangeAmount(0);
    showAlert('ລ້າງກະຕ່າສິນຄ້າແລ້ວ', 'info');
  };
  
// ໃນ handleSaveSale function
const handleSaveSale = async () => {
  if (cartItems.length === 0) {
    showAlert('ກະລຸນາເລືອກສິນຄ້າກ່ອນບັນທຶກການຂາຍ', 'error');
    return;
  }

  const paid = parseFloat(amountPaid.replace(/,/g, '')) || 0;
  if (paid < cartTotal) {
    showAlert('ຈຳນວນເງິນທີ່ຈ່າຍບໍ່ພຽງພໍ', 'error');
    return;
  }
  
  try {
    setSavingOrder(true);
    
    const customerIdToUse = selectedCustomer?.cus_id === 0 ? 1 : selectedCustomer?.cus_id || 1;
    
    const saleData = {
      cus_id: customerIdToUse,
      emp_id: currentUser?.emp_id || 1,
      subtotal: cartTotal,
      pay: paid,
      money_change: changeAmount,
      products: cartItems.map(item => ({
        proid: item.id,
        qty: item.quantity,
        price: item.price,
        total: item.price * item.quantity
      }))
    };
    
    const result = await createSale(saleData);
    
    // Use actualChange from result for UI display
    const actualChange = result.actualChange !== undefined ? result.actualChange : changeAmount;
    
    const completedSale = {
      sale_id: result.sale_id || 'N/A',
      customer: selectedCustomer ? `${selectedCustomer.cus_name} ${selectedCustomer.cus_lname}`.trim() : 'ລູກຄ້າທົ່ວໄປ',
      totalAmount: cartTotal,
      amountPaid: paid,
      changeAmount: actualChange, // Use actual change for display
      items: cartItems,
      date: new Date().toISOString()
    };
    setLastCompletedSale(completedSale);
    
    setSuccessDialogOpen(true);
    
    setCartItems([]);
    setAmountPaid('');
    setChangeAmount(0);
    
  } catch (error) {
    console.error('Error saving sale:', error);
    showAlert('ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກການຂາຍ', 'error');
  } finally {
    setSavingOrder(false);
  }
};
  
  // Handle print receipt
  const handlePrintReceipt = () => {
    if (cartItems.length === 0) {
      showAlert('ກະລຸນາເລືອກສິນຄ້າກ່ອນພິມໃບບິນ', 'error');
      return;
    }

    const paid = parseFloat(amountPaid.replace(/,/g, '')) || 0;
    if (paid < cartTotal) {
      showAlert('ຈຳນວນເງິນທີ່ຈ່າຍບໍ່ພຽງພໍ', 'error');
      return;
    }
    
    setReceiptOpen(true);
  };
  
  // Show alert message
  const showAlert = (message, severity = 'success') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };
  
  // Close alert
  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  // When handling the selection of a generic customer, 
  // use a special ID that won't conflict with real customers
  const handleSelectCustomer = (customer) => {
    // Check if this is the generic customer
    if (customer.cus_name === 'ລູກຄ້າທົ່ວໄປ' && !customer.cus_lname) {
      // Use a special ID for the generic customer (like 0 or -1)
      setSelectedCustomer({ 
        cus_id: 0,  // Use 0 or -1 instead of 1
        cus_name: 'ລູກຄ້າທົ່ວໄປ', 
        cus_lname: '' 
      });
    } else {
      // Regular customer selection
      setSelectedCustomer(customer);
    }
    setCustomerDialogOpen(false);
    showAlert(`ເລືອກລູກຄ້າ: ${customer.cus_name} ${customer.cus_lname || ''}`, 'success');
  };

  return (
    <Layout title="ຂາຍສິນຄ້າ">
      {/* Global loading overlay */}
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999
          }}
        >
          <CircularProgress color="primary" size={60} />
        </Box>
      )}
      
      {/* Alert notifications */}
      <Snackbar 
        open={alertOpen} 
        autoHideDuration={3000} 
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleAlertClose} 
          severity={alertSeverity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
      
      {/* Header with sales history link */}
      <Paper 
        elevation={0} 
        sx={{ 
          bgcolor: 'background.paper', 
          p: 2, 
          borderRadius: 2, 
          mb: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ShoppingCartIcon sx={{ color: 'primary.main', mr: 1 }} />
          <Typography variant="h6" fontWeight="bold" color="primary">
            ການຂາຍສິນຄ້າ
          </Typography>
        </Box>
        
        <Box>
          <Button 
            variant="outlined" 
            color="primary" 
            component={Link}
            to="/SalesHistory"
            startIcon={<HistoryIcon />}
            sx={{ borderRadius: 2 }}
          >
            {isMobile ? '' : 'ປະຫວັດ'}ການຂາຍ
          </Button>
        </Box>
      </Paper>

      {/* Customer info card */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 2, 
          mb: 2, 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1, md: 0 } }}>
          <Avatar 
            sx={{ 
              bgcolor: 'primary.light', 
              color: 'primary.contrastText',
              mr: 2
            }}
          >
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography variant="body2" color="text.secondary">
              ລູກຄ້າ
            </Typography>
            <Typography variant="subtitle1" fontWeight="bold">
              {selectedCustomer ? `${selectedCustomer.cus_name} ${selectedCustomer.cus_lname || ''}`.trim() : 'ລູກຄ້າທົ່ວໄປ'}
            </Typography>
          </Box>
        </Box>
        
        <Button 
          variant="contained" 
          size="small"
          color="primary"
          startIcon={<PersonIcon />}
          onClick={() => setCustomerDialogOpen(true)}
          sx={{ borderRadius: 2 }}
        >
          ເລືອກລູກຄ້າ
        </Button>
      </Paper>

      <Grid container spacing={2}>
        {/* Left column - Product selection */}
        <Grid item xs={12} md={5}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              height: '100%', 
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider' 
            }}
          >
            <Box 
              sx={{ 
                bgcolor: 'primary.light', 
                color: 'primary.contrastText',
                p: 1.5, 
                borderRadius: 1, 
                mb: 2,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <ShoppingCartIcon sx={{ mr: 1 }} />
              <Typography variant="subtitle1" fontWeight="bold">
                ສິນຄ້າໃນສາງ
              </Typography>
            </Box>
            
            <TextField
              fullWidth
              placeholder="ຄົ້ນຫາສິນຄ້າ..."
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

            <TableContainer sx={{ maxHeight: isTablet ? 300 : 450, borderRadius: 1 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>ລະຫັດ</TableCell>
                    <TableCell align="left" sx={{ fontWeight: 'bold' }}>ຊື່ສິນຄ້າ</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>ລາຄາ</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>ຄົງເຫຼືອ</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <TableRow key={product.proid} hover>
                        <TableCell align="center">{product.proid}</TableCell>
                        <TableCell align="left">
                          <Tooltip title="ຄລິກເພື່ອເບິ່ງລາຍລະອຽດ">
                            <Typography 
                              variant="body2" 
                              onClick={() => handleQuickView(product)}
                              sx={{ 
                                cursor: 'pointer',
                                '&:hover': { 
                                  textDecoration: 'underline',
                                  color: 'primary.main'
                                }
                              }}
                            >
                              {product.ProductName}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="medium">
                            {formatNumber(product.retail_price)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={product.qty} 
                            size="small"
                            color={product.qty > 0 ? "success" : "error"}
                            variant={product.qty > 0 ? "filled" : "outlined"}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="contained"
                            size="small"
                            color="secondary"
                            onClick={() => addToCart(product)}
                            sx={{ 
                              borderRadius: 4,
                              minWidth: 'unset',
                              width: 32,
                              height: 32,
                              p: 0
                            }}
                            disabled={product.qty <= 0}
                          >
                            <AddIcon fontSize="small" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        {loading ? (
                          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                            <CircularProgress size={24} />
                          </Box>
                        ) : searchTerm ? (
                          'ບໍ່ພົບສິນຄ້າທີ່ຄົ້ນຫາ'
                        ) : (
                          'ບໍ່ມີຂໍ້ມູນສິນຄ້າ'
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            {!isTablet && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  ສິນຄ້າທັງໝົດ: {products.length} ລາຍການ
                </Typography>
                
                <Button 
                  size="small" 
                  onClick={() => setSearchTerm('')}
                  disabled={!searchTerm}
                >
                  ສະແດງທັງໝົດ
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right column - Cart/Order */}
        <Grid item xs={12} md={7}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box 
                sx={{ 
                  bgcolor: 'secondary.light', 
                  color: 'secondary.contrastText',
                  p: 1.5, 
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  flexGrow: 1,
                  mr: 2
                }}
              >
                <ReceiptIcon sx={{ mr: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  ກະຕ່າສິນຄ້າ
                </Typography>
                <Badge 
                  badgeContent={cartItems.length} 
                  color="error"
                  sx={{ ml: 1 }}
                >
                  <Box />
                </Badge>
              </Box>
              
              <Button 
                variant="outlined" 
                color="error"
                size="small"
                onClick={handleClearCart}
                disabled={cartItems.length === 0}
                sx={{ borderRadius: 2 }}
              >
                ລ້າງກະຕ່າ
              </Button>
            </Box>

            <TableContainer sx={{ maxHeight: isTablet ? 250 : 320, borderRadius: 1 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>#</TableCell>
                    <TableCell align="left" sx={{ fontWeight: 'bold' }}>ສິນຄ້າ</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>ລາຄາ</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>ຈຳນວນ</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>ລວມລາຄາ</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cartItems.length > 0 ? (
                    cartItems.map((item, index) => (
                      <TableRow 
                        key={item.id} 
                        sx={{ 
                          "&:nth-of-type(odd)": { 
                            bgcolor: 'action.hover' 
                          } 
                        }}
                      >
                        <TableCell align="center">{index + 1}</TableCell>
                        <TableCell align="left">{item.name}</TableCell>
                        <TableCell align="right">
                          {formatNumber(item.price)}
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <IconButton 
                              size="small" 
                              onClick={() => updateQuantity(item.id, -1)}
                              color="error"
                              sx={{ 
                                p: 0.5, 
                                border: '1px solid',
                                borderColor: 'divider',
                                mr: 0.5
                              }}
                            >
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                            
                            <TextField
                              type="number"
                              size="small"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, e.target.value)}
                              sx={{ 
                                width: 50,
                                '& input': { 
                                  textAlign: 'center',
                                  p: 0.5
                                }
                              }}
                              inputProps={{ min: 1, max: item.stock }}
                            />
                            
                            <IconButton 
                              size="small" 
                              onClick={() => updateQuantity(item.id, 1)}
                              color="success"
                              sx={{ 
                                p: 0.5, 
                                border: '1px solid',
                                borderColor: 'divider',
                                ml: 0.5
                              }}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="medium">
                            {formatNumber(item.price * item.quantity)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removeFromCart(item.id)}
                            sx={{ 
                              p: 0.5, 
                              border: '1px solid',
                              borderColor: 'divider'
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.7 }}>
                          <ShoppingCartIcon sx={{ fontSize: 40, mb: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            ຍັງບໍ່ມີສິນຄ້າໃນກະຕ່າ
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ກະລຸນາເລືອກສິນຄ້າຈາກລາຍການທາງຊ້າຍ
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Payment Section */}
            <Paper 
              elevation={0}
              sx={{ 
                mt: 2, 
                p: 2, 
                bgcolor: 'background.default', 
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" color="primary">
                  ຊຳລະເງິນ
                </Typography>
                
                <Chip 
                  label={cartItems.length > 0 ? `${cartItems.length} ລາຍການ` : 'ກະຕ່າເປົ່າ'} 
                  color={cartItems.length > 0 ? "primary" : "default"}
                  variant="outlined"
                  size="small"
                />
              </Box>
              
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={5} sm={4}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    ລາຄາລວມ:
                  </Typography>
                </Grid>
                <Grid item xs={7} sm={8}>
                  <Typography 
                    variant="h5" 
                    fontWeight="bold" 
                    textAlign="right"
                    color="primary.main"
                  >
                    {formatNumber(cartTotal)} ກີບ
                  </Typography>
                </Grid>
                
                <Grid item xs={5} sm={4}>
                  <Typography variant="subtitle1">
                    ຈຳນວນເງິນທີ່ຈ່າຍ:
                  </Typography>
                </Grid>
                <Grid item xs={7} sm={8}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      value={amountPaid}
                      onChange={handleAmountPaidChange}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">ກີບ</InputAdornment>,
                      }}
                    />
                    <Button 
                      size="small" 
                      variant="outlined"
                      sx={{ ml: 1, whiteSpace: 'nowrap' }}
                      onClick={setExactAmount}
                      disabled={cartTotal <= 0}
                    >
                      {isMobile ? 'ເຕັມ' : 'ຈ່າຍເຕັມ'}
                    </Button>
                  </Box>
                </Grid>
                
                <Grid item xs={5} sm={4}>
                  <Typography variant="subtitle1">
                    ເງິນທອນ:
                  </Typography>
                </Grid>
                <Grid item xs={7} sm={8}>
                  <Typography 
                    variant="h6" 
                    fontWeight="bold" 
                    textAlign="right"
                    color={changeAmount > 0 ? "success.main" : "text.primary"}
                  >
                    {formatNumber(changeAmount)} ກີບ
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
              <Button
                variant="contained"
                color="success"
                startIcon={<SaveIcon />}
                onClick={handleSaveSale}
                disabled={savingOrder || cartItems.length === 0 || (parseFloat(amountPaid.replace(/,/g, '')) || 0) < cartTotal}
                sx={{ 
                  py: 1.5,
                  px: 3,
                  borderRadius: 2
                }}
              >
                {savingOrder ? <CircularProgress size={24} color="inherit" /> : 'ບັນທຶກການຂາຍ'}
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<PrintIcon />}
                onClick={handlePrintReceipt}
                disabled={savingOrder || cartItems.length === 0 || (parseFloat(amountPaid.replace(/,/g, '')) || 0) < cartTotal}
                sx={{ 
                  py: 1.5,
                  px: 3,
                  borderRadius: 2
                }}
              >
                ພິມໃບບິນ
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Receipt Modal */}
      <ReceiptModal
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        items={cartItems}
        customer={selectedCustomer ? `${selectedCustomer.cus_name} ${selectedCustomer.cus_lname || ''}`.trim() : 'ລູກຄ້າທົ່ວໄປ'}
        totalAmount={cartTotal}
        amountPaid={parseFloat(amountPaid.replace(/,/g, '')) || 0}
        changeAmount={changeAmount}
      />
      
      {/* Customer Selection Dialog */}
      <Dialog 
        open={customerDialogOpen} 
        onClose={() => setCustomerDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <PersonIcon sx={{ mr: 1 }} />
          ເລືອກລູກຄ້າ
          <IconButton
            aria-label="close"
            onClick={() => setCustomerDialogOpen(false)}
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
          <TextField
            autoFocus
            margin="dense"
            label="ຄົ້ນຫາລູກຄ້າ"
            type="text"
            fullWidth
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>ລະຫັດ</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>ຊື່</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>ນາມສະກຸນ</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>ເບີໂທ</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Default customer option */}
                <TableRow hover>
                  <TableCell>0</TableCell>
                  <TableCell>ລູກຄ້າທົ່ວໄປ</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleSelectCustomer({ cus_id: 0, cus_name: 'ລູກຄ້າທົ່ວໄປ', cus_lname: '' })}
                      sx={{ borderRadius: 2 }}
                    >
                      ເລືອກ
                    </Button>
                  </TableCell>
                </TableRow>
                
                {/* Filtered customer list */}
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.cus_id} hover>
                    <TableCell>{customer.cus_id}</TableCell>
                    <TableCell>{customer.cus_name}</TableCell>
                    <TableCell>{customer.cus_lname}</TableCell>
                    <TableCell>{customer.tel}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleSelectCustomer(customer)}
                        sx={{ borderRadius: 2 }}
                      >
                        ເລືອກ
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                
                {filteredCustomers.length === 0 && customerSearch && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Box sx={{ py: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          ບໍ່ພົບຂໍ້ມູນລູກຄ້າ
                        </Typography>
                        
                        <Button 
                          variant="outlined" 
                          size="small"
                          component={Link}
                          to="/customers"
                          sx={{ mt: 1 }}
                        >
                          ໄປທີ່ໜ້າເພີ່ມລູກຄ້າໃໝ່
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setCustomerDialogOpen(false)}
            color="inherit"
          >
            ຍົກເລີກ
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Product Quick View Dialog */}
      <Dialog
        open={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedProduct && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
              <InfoIcon sx={{ mr: 1 }} />
              ຂໍ້ມູນສິນຄ້າ
              <IconButton
                aria-label="close"
                onClick={() => setQuickViewOpen(false)}
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
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      {selectedProduct.ProductName}
                    </Typography>
                    <Chip 
                      label={selectedProduct.status === 'Instock' ? 'ມີໃນສາງ' : 'ໝົດສາງ'} 
                      color={selectedProduct.status === 'Instock' ? "success" : "error"}
                      variant={selectedProduct.status === 'Instock' ? "filled" : "outlined"}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    ລະຫັດສິນຄ້າ
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedProduct.proid}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    ຍີ່ຫໍ້
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedProduct.brand || '-'}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    ປະເພດສິນຄ້າ
                  </Typography>
                  <Typography variant="body1">
                    {selectedProduct.category || '-'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    ລາຄາຂາຍ
                  </Typography>
                  <Typography variant="h6" color="primary" fontWeight="bold" sx={{ mb: 2 }}>
                    {formatNumber(selectedProduct.retail_price)} ກີບ
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    ຈຳນວນໃນສາງ
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedProduct.qty} ອັນ {selectedProduct.qty <= selectedProduct.qty_min && (
                      <Typography component="span" color="error" variant="body2">
                        (ໃກ້ຈະໝົດ)
                      </Typography>
                    )}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    ບ່ອນຈັດວາງ
                  </Typography>
                  <Typography variant="body1">
                    {selectedProduct.zone || '-'}
                  </Typography>
                </Grid>
                
                {selectedProduct.pro_detail && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      ລາຍລະອຽດ
                    </Typography>
                    <Typography variant="body1">
                      {selectedProduct.pro_detail}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => setQuickViewOpen(false)}
                color="inherit"
              >
                ປິດ
              </Button>
              <Button 
                variant="contained"
                color="secondary"
                startIcon={<AddIcon />}
                onClick={() => {
                  addToCart(selectedProduct);
                  setQuickViewOpen(false);
                }}
                disabled={selectedProduct.qty <= 0}
              >
                ເພີ່ມໃສ່ກະຕ່າ
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Clear Cart Confirmation Dialog */}
      <Dialog
        open={confirmClearCart}
        onClose={() => setConfirmClearCart(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center' }}>
          ຢືນຢັນການລ້າງກະຕ່າ
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
            <ShoppingCartIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
            <Typography variant="body1" align="center">
              ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລ້າງກະຕ່າສິນຄ້າທັງໝົດ?
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              ການດຳເນີນການນີ້ບໍ່ສາມາດກັບຄືນໄດ້
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center' }}>
          <Button 
            onClick={() => setConfirmClearCart(false)}
            variant="outlined"
            color="inherit"
            sx={{ minWidth: 100 }}
          >
            ຍົກເລີກ
          </Button>
          <Button 
            onClick={confirmClearCartAction}
            variant="contained"
            color="error"
            sx={{ minWidth: 100 }}
          >
            ລ້າງກະຕ່າ
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Transaction Success Dialog */}
      <Dialog
        open={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            bgcolor: 'success.main', 
            color: 'success.contrastText' 
          }}
        >
          <CheckIcon sx={{ mr: 1 }} />
          ຂາຍສິນຄ້າສຳເລັດແລ້ວ
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {lastCompletedSale && (
            <Box sx={{ py: 2 }}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h6">
                  ຂາຍສິນຄ້າສຳເລັດແລ້ວ
                </Typography>
              </Box>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    ເລກທີໃບບິນ:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {lastCompletedSale.sale_id}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    ລູກຄ້າ:
                  </Typography>
                  <Typography variant="body1">
                    {lastCompletedSale.customer}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    ຈຳນວນເງິນທັງໝົດ:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" color="primary.main">
                    {formatNumber(lastCompletedSale.totalAmount)} ກີບ
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    ເງິນທອນ:
                  </Typography>
                  <Typography variant="body1" color="success.main">
                    {formatNumber(lastCompletedSale.changeAmount)} ກີບ
                  </Typography>
                </Grid>
              </Grid>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
                {/* <Button 
                  variant="outlined"
                  color="primary"
                  startIcon={<PrintIcon />}
                  onClick={() => {
                    setSuccessDialogOpen(false);
                    setReceiptOpen(true);
                  }}
                >
                  ພິມໃບບິນ
                </Button> */}
                <Button 
                  variant="contained"
                  color="primary"
                  startIcon={<ShoppingCartIcon />}
                  onClick={() => setSuccessDialogOpen(false)}
                >
                  ຂາຍສິນຄ້າຕໍ່
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

export default Sales;