// Import axios at the top of the file
import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
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
  Tabs,
  Tab,
  Card,
  CardContent,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';
import ReceiptModal from '../components/ReceiptModal';
import { 
  getAllCustomers, 
  getAllProducts, 
  searchProducts, 
  createSale,
  getSalesHistory,
  getSaleDetails 
} from '../services/salesService';
import { getCurrentUser } from '../services/authService';
import API_BASE_URL from '../config/api';

// TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`sales-tabpanel-${index}`}
      aria-labelledby={`sales-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Format number with commas for every 3 digits
const formatNumber = (num) => {
  if (!num) return "0";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Format date to Lao format
const formatDate = (dateString) => {
  if (!dateString) return "-";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return date.toLocaleDateString('lo-LA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error("Date formatting error:", error);
    return dateString;
  }
};

function Sales() {
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
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
  
  // Sales History States
  const [salesHistory, setSalesHistory] = useState([]);
  const [salesHistoryLoading, setSalesHistoryLoading] = useState(false);
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState(null);
  const [saleDetailsOpen, setSaleDetailsOpen] = useState(false);
  
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

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    
    // Load sales history when switching to that tab
    if (newValue === 1 && salesHistory.length === 0) {
      fetchSalesHistory();
    }
  };

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
          // Set default customer even if API fails
          setSelectedCustomer({ cus_id: 1, cus_name: 'ລູກຄ້າທົ່ວໄປ', cus_lname: '' });
        }
        
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  // Modify the filter products useEffect to prevent unnecessary updates
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

  // Modify the filter customers useEffect similarly
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

  // Fetch sales history
  const fetchSalesHistory = async () => {
    try {
      setSalesHistoryLoading(true);
      const historyData = await getSalesHistory();
      
      if (Array.isArray(historyData)) {
        setSalesHistory(historyData);
      } else {
        showAlert('ບໍ່ສາມາດດຶງຂໍ້ມູນປະຫວັດການຂາຍໄດ້', 'error');
      }
    } catch (error) {
      console.error('Error fetching sales history:', error);
      showAlert('ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນປະຫວັດການຂາຍ', 'error');
    } finally {
      setSalesHistoryLoading(false);
    }
  };

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
    }
  };

  // Update item quantity in cart
  const updateQuantity = (id, quantity) => {
    // Find the product to check stock
    const cartItem = cartItems.find(item => item.id === id);
    if (!cartItem) return;
    
    // Validate quantity against stock
    const newQuantity = parseInt(quantity);
    if (isNaN(newQuantity) || newQuantity <= 0) return;
    
    if (newQuantity > cartItem.stock) {
      showAlert(`ສິນຄ້າໃນສາງມີພຽງ ${cartItem.stock} ອັນ`, 'warning');
      const updatedItems = cartItems.map(item => 
        item.id === id ? { ...item, quantity: cartItem.stock } : item
      );
      setCartItems(updatedItems);
      return;
    }
    
    const updatedItems = cartItems.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    
    setCartItems(updatedItems);
  };

  // Remove item from cart
  const removeFromCart = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };
  
  // Handle save sale
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
      setLoading(true);
      
      // Use a default customer ID for the generic customer
      const customerIdToUse = selectedCustomer?.cus_id === 0 ? 1 : selectedCustomer?.cus_id || 1;
      
      // Create the sale data to send to API
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
      
      // Call the API
      const result = await createSale(saleData);
      
      // Clear cart and payment info after successful save
      setCartItems([]);
      setAmountPaid('');
      setChangeAmount(0);
      showAlert('ບັນທຶກການຂາຍສຳເລັດແລ້ວ', 'success');
      
      // Refresh sales history if on that tab
      if (tabValue === 1) {
        fetchSalesHistory();
      }
    } catch (error) {
      console.error('Error saving sale:', error);
      showAlert('ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກການຂາຍ', 'error');
    } finally {
      setLoading(false);
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
  
  // View sale details - FIXED FUNCTION
  const handleViewSaleDetails = async (sale) => {
    try {
      setSelectedSale(sale);
      setSaleDetailsOpen(true);
      
      // Use the imported getSaleDetails function instead of direct axios call
      const detailsData = await getSaleDetails(sale.sale_id);
      
      if (detailsData && detailsData.length > 0) {
        // Update selected sale with the fetched products
        setSelectedSale(prev => ({
          ...prev,
          products: detailsData
        }));
      } else {
        showAlert('ບໍ່ສາມາດດຶງຂໍ້ມູນລາຍລະອຽດການຂາຍໄດ້', 'error');
      }
    } catch (error) {
      console.error('Error fetching sale details:', error);
      showAlert('ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນລາຍລະອຽດການຂາຍ', 'error');
    }
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
  };
  
  // Filter sales history based on search term
  const filteredSalesHistory = salesHistory.filter(sale => {
    if (historySearchTerm.trim() === '') return true;
    
    const searchTermLower = historySearchTerm.toLowerCase();
    return (
      (sale.sale_id && sale.sale_id.toString().includes(historySearchTerm)) ||
      (sale.customer_name && sale.customer_name.toLowerCase().includes(searchTermLower)) ||
      (sale.emp_name && sale.emp_name.toLowerCase().includes(searchTermLower))
    );
  });

  return (
    <Layout title="ຂາຍສິນຄ້າ">
      {/* Loading indicator */}
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
      
      <Snackbar 
        open={alertOpen} 
        autoHideDuration={6000} 
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
      
      {/* Tabs for switching between new sale and history */}
      <Paper sx={{ mb: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="ຂາຍສິນຄ້າໃໝ່" />
          <Tab label="ປະຫວັດການຂາຍ" />
        </Tabs>
      </Paper>
      
      {/* New Sale Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1, mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold" color="primary">
            ສິນຄ້າໃນສາງ
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {/* Left column - Product selection */}
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <TextField
                fullWidth
                placeholder="ຄົ້ນຫາ..."
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
                      <TableCell align="center">ລະຫັດ</TableCell>
                      <TableCell align="center">ຊື່</TableCell>
                      <TableCell align="center">ລາຄາ</TableCell>
                      <TableCell align="center">ຄົງເຫຼືອ</TableCell>
                      <TableCell align="center"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <TableRow key={product.proid} hover>
                          <TableCell align="center">{product.proid}</TableCell>
                          <TableCell align="center">{product.ProductName}</TableCell>
                          <TableCell align="center">{formatNumber(product.retail_price)}</TableCell>
                          <TableCell align="center">{product.qty}</TableCell>
                          <TableCell align="center">
                            <Button
                              variant="contained"
                              size="small"
                              color="error"
                              onClick={() => addToCart(product)}
                              sx={{ fontSize: '0.7rem', py: 0.5 }}
                              disabled={product.qty <= 0}
                            >
                              ເລືອກ
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          {searchTerm ? 'ບໍ່ພົບສິນຄ້າ' : 'ກຳລັງໂຫຼດຂໍ້ມູນ...'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Right column - Cart/Order */}
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold">
                  ລາຍການສັ່ງຊື້
                  <Box component="span" sx={{ ml: 2, color: 'text.secondary' }}>
                    {selectedCustomer ? `${selectedCustomer.cus_name} ${selectedCustomer.cus_lname}` : 'ລູກຄ້າທົ່ວໄປ'}
                  </Box>
                </Typography>
                <Button 
                  variant="contained" 
                  size="small"
                  color="primary"
                  startIcon={<PersonIcon />}
                  onClick={() => setCustomerDialogOpen(true)}
                >
                  ເລືອກລູກຄ້າ
                </Button>
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
                          <TableCell align="center">{item.name}</TableCell>
                          <TableCell align="center">
                            {formatNumber(item.price)}
                          </TableCell>
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
                              inputProps={{ min: 1, max: item.stock }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            {formatNumber(item.price * item.quantity)}
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              variant="contained"
                              size="small"
                              color="error"
                              onClick={() => removeFromCart(item.id)}
                              sx={{ fontSize: '0.7rem', py: 0.5 }}
                            >
                              ລຶບ
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          ບໍ່ມີສິນຄ້າໃນກະຕ່າ
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Payment Section */}
              <Box sx={{ mt: 2, p:.5, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={4}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      ລາຄາລວມ:
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="h6" fontWeight="bold" textAlign="right">
                      {formatNumber(cartTotal)} ກີບ
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="subtitle1">
                      ຈຳນວນເງິນທີ່ຈ່າຍ:
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
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
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="subtitle1">
                      ເງິນທອນ:
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
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
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveSale}
                  disabled={loading || cartItems.length === 0 || (parseFloat(amountPaid.replace(/,/g, '')) || 0) < cartTotal}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'ບັນທຶກ'}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PrintIcon />}
                  onClick={handlePrintReceipt}
                  disabled={loading || cartItems.length === 0 || (parseFloat(amountPaid.replace(/,/g, '')) || 0) < cartTotal}
                >
                  ພິມໃບບິນ
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>
      
      {/* Sales History Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <TextField
            placeholder="ຄົ້ນຫາປະຫວັດການຂາຍ..."
            variant="outlined"
            size="small"
            value={historySearchTerm}
            onChange={(e) => setHistorySearchTerm(e.target.value)}
            sx={{ width: { xs: '60%', sm: '50%', md: '40%' } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={fetchSalesHistory}
            disabled={salesHistoryLoading}
          >
            {salesHistoryLoading ? <CircularProgress size={24} color="inherit" /> : 'ໂຫຼດຄືນໃໝ່'}
          </Button>
        </Box>
        
        <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 240px)', overflow: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell align="center">ລະຫັດໃບບິນ</TableCell>
                <TableCell align="center">ວັນທີຂາຍ</TableCell>
                <TableCell align="center">ລູກຄ້າ</TableCell>
                <TableCell align="center">ພະນັກງານ</TableCell>
                <TableCell align="right">ມູນຄ່າລວມ</TableCell>
                <TableCell align="right">ຈ່າຍແລ້ວ</TableCell>
                <TableCell align="right">ເງິນທອນ</TableCell>
                <TableCell align="center">ລາຍລະອຽດ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {salesHistoryLoading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                      <CircularProgress />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : filteredSalesHistory.length > 0 ? (
                filteredSalesHistory.map((sale) => (
                  <TableRow key={sale.sale_id} hover>
                    <TableCell align="center">{sale.sale_id}</TableCell>
                    <TableCell align="center">{formatDate(sale.date_sale)}</TableCell>
                    <TableCell align="center">{sale.customer_name || 'ລູກຄ້າທົ່ວໄປ'}</TableCell>
                    <TableCell align="center">{sale.emp_name}</TableCell>
                    <TableCell align="right">{formatNumber(sale.subtotal)} ກີບ</TableCell>
                    <TableCell align="right">{formatNumber(sale.pay)} ກີບ</TableCell>
                    <TableCell align="right">{formatNumber(sale.money_change)} ກີບ</TableCell>
                    <TableCell align="center">
                      <Tooltip title="ເບິ່ງລາຍລະອຽດ">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleViewSaleDetails(sale)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body1" sx={{ py: 2 }}>
                      ບໍ່ພົບຂໍ້ມູນປະຫວັດການຂາຍ
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>
      
      {/* Receipt Modal */}
      <ReceiptModal
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        items={cartItems}
        customer={selectedCustomer ? `${selectedCustomer.cus_name} ${selectedCustomer.cus_lname}` : 'ລູກຄ້າທົ່ວໄປ'}
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
        <DialogTitle>ເລືອກລູກຄ້າ</DialogTitle>
        <DialogContent>
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
                  <TableCell>ລະຫັດ</TableCell>
                  <TableCell>ຊື່</TableCell>
                  <TableCell>ນາມສະກຸນ</TableCell>
                  <TableCell>ເບີໂທ</TableCell>
                  <TableCell></TableCell>
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
                      >
                        ເລືອກ
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                
                {filteredCustomers.length === 0 && customerSearch && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      ບໍ່ພົບຂໍ້ມູນລູກຄ້າ
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomerDialogOpen(false)}>ຍົກເລີກ</Button>
        </DialogActions>
      </Dialog>
      
      {/* Sale Details Modal */}
      <Dialog 
        open={saleDetailsOpen} 
        onClose={() => setSaleDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          ລາຍລະອຽດການຂາຍ {selectedSale?.sale_id ? `#${selectedSale.sale_id}` : ''}
        </DialogTitle>
        <DialogContent>
          {selectedSale ? (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>ລູກຄ້າ:</strong> {selectedSale.customer_name || 'ລູກຄ້າທົ່ວໄປ'}
                  </Typography>
                  <Typography variant="body1">
                    <strong>ພະນັກງານ:</strong> {selectedSale.emp_name || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>ວັນທີ:</strong> {formatDate(selectedSale.date_sale)}
                  </Typography>
                  <Typography variant="body1">
                    <strong>ເລກທີໃບບິນ:</strong> {selectedSale.sale_id}
                  </Typography>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              {/* ສະແດງລາຍລະອຽດສິນຄ້າທີ່ຖືກຂາຍ */}
              {selectedSale.products && selectedSale.products.length > 0 ? (
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell align="center">#</TableCell>
                        <TableCell>ລາຍການ</TableCell>
                        <TableCell align="right">ລາຄາ</TableCell>
                        <TableCell align="center">ຈຳນວນ</TableCell>
                        <TableCell align="right">ລວມ</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedSale.products.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell align="center">{index + 1}</TableCell>
                          <TableCell>{item.product_name || `ສິນຄ້າລະຫັດ ${item.proid}`}</TableCell>
                          <TableCell align="right">{formatNumber(item.price)}</TableCell>
                          <TableCell align="center">{item.qty}</TableCell>
                          <TableCell align="right">{formatNumber(item.total)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} />
                        <TableCell align="right">
                          <Typography variant="subtitle1" fontWeight="bold">
                            ລວມທັງໝົດ:
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="subtitle1" fontWeight="bold">
                            {formatNumber(selectedSale.subtotal)} ກີບ
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={3} />
                        <TableCell align="right">
                          ຈຳນວນເງິນທີ່ຮັບ:
                        </TableCell>
                        <TableCell align="right">
                          {formatNumber(selectedSale.pay)} ກີບ
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={3} />
                        <TableCell align="right">
                          ເງິນທອນ:
                        </TableCell>
                        <TableCell align="right">
                          {formatNumber(selectedSale.money_change)} ກີບ
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ textAlign: 'center', my: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    ກຳລັງໂຫຼດຂໍ້ມູນລາຍລະອຽດສິນຄ້າ...
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PrintIcon />}
            onClick={() => {
              // ພິມໃບບິນ
              setSaleDetailsOpen(false);
            }}
          >
            ພິມໃບບິນ
          </Button>
          <Button onClick={() => setSaleDetailsOpen(false)}>ປິດ</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}

export default Sales;