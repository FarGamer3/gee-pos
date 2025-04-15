import { useState, useEffect } from 'react';
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
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';
import ReceiptModal from '../components/ReceiptModal';
import { getAllCustomers, getAllProducts, searchProducts, createSale } from '../services/salesService';
import { getCurrentUser } from '../services/authService';

// Format number with commas for every 3 digits
const formatNumber = (num) => {
  if (!num) return "0";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

function Sales() {
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
        const [productsData, customersData] = await Promise.all([
          getAllProducts(),
          getAllCustomers()
        ]);
        
        setProducts(productsData || []);
        setFilteredProducts(productsData || []);
        setCustomers(customersData || []);
        setFilteredCustomers(customersData || []);
        
        // Set a default customer (first one or a generic one)
        if (customersData && customersData.length > 0) {
          setSelectedCustomer(customersData[0]);
        } else {
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

  // Filter products based on search term
  useEffect(() => {
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

  // Filter customers based on search term
  useEffect(() => {
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
      
      // Create the sale data to send to API
      const saleData = {
        cus_id: selectedCustomer?.cus_id || 1,
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
  
  // Handle customer selection
  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerDialogOpen(false);
  };

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
            <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
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
                      onClick={() => handleSelectCustomer({ cus_id: 1, cus_name: 'ລູກຄ້າທົ່ວໄປ', cus_lname: '' })}
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
    </Layout>
  );
}

export default Sales;