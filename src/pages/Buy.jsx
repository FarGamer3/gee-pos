import { useState, useEffect, useCallback } from 'react';
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
  CircularProgress,
  Alert,
  Chip,
  Tooltip,
  Autocomplete,
  Card,
  CardContent,
  Divider,
  Badge,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Search as SearchIcon,
  Warning as WarningIcon,
  InfoOutlined as InfoIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  FilterList as FilterListIcon,
  ShoppingCart as CartIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { SuccessDialog, ErrorDialog } from '../components/SuccessDialog';
import { addOrder, getAllSuppliers } from '../services/orderService';
import { getCurrentUser } from '../services/authService';
import { getAllProducts } from '../services/productService';

// Format number with commas
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

function Buy() {
  const navigate = useNavigate();
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  
  // Order states
  const [orderItems, setOrderItems] = useState([]);
  const [supplier, setSupplier] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  
  // UI states
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [supplierWarning, setSupplierWarning] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Data states
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  
  // Extract unique categories and brands from products for filters
  useEffect(() => {
    if (products.length > 0) {
      // Extract unique categories and brands
      const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
      const uniqueBrands = [...new Set(products.map(p => p.brand).filter(Boolean))];
      
      setCategories(uniqueCategories);
      setBrands(uniqueBrands);
    }
  }, [products]);

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  // Supplier warning effect
  useEffect(() => {
    setSupplierWarning(!supplier && orderItems.length > 0);
  }, [supplier, orderItems]);

  // Fetch all necessary data
  const fetchData = async () => {
    try {
      setDataLoading(true);
      
      // Fetch products and suppliers in parallel
      const [productsData, suppliersData] = await Promise.all([
        getAllProducts(),
        getAllSuppliers()
      ]);
      
      setProducts(productsData || []);
      setSuppliers(suppliersData || []);
      
      // Show success message
      setSnackbarMessage('ຂໍ້ມູນຖືກໂຫລດສຳເລັດແລ້ວ');
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Error fetching data:", err);
      setErrorMessage(err.message || 'ເກີດຂໍ້ຜິດພາດໃນການໂຫລດຂໍ້ມູນ');
      setSnackbarMessage('ເກີດຂໍ້ຜິດພາດໃນການໂຫລດຂໍ້ມູນ');
      setSnackbarOpen(true);
    } finally {
      setDataLoading(false);
    }
  };

  // Filter products based on search term and filters
  const filteredProducts = products.filter(product => {
    // Search term filter
    const matchesSearch = product.ProductName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.code && product.code.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Category filter
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    
    // Brand filter
    const matchesBrand = !brandFilter || product.brand === brandFilter;
    
    return matchesSearch && matchesCategory && matchesBrand;
  });

  // Handle adding product to order
  const addToOrder = useCallback((product) => {
    // Check if product already exists in order
    const existingItemIndex = orderItems.findIndex(item => item.id === product.proid);
    
    if (existingItemIndex >= 0) {
      // Update quantity if product already in order
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += 1;
      setOrderItems(updatedItems);
      
      // Show notification
      setSnackbarMessage(`ເພີ່ມຈຳນວນ ${product.ProductName} ເປັນ ${updatedItems[existingItemIndex].quantity}`);
      setSnackbarOpen(true);
    } else {
      // Add new product to order
      setOrderItems(prev => [...prev, {
        id: product.proid,
        code: product.code || '',
        name: product.ProductName,
        quantity: 1,
        stock: product.qty || 0,
        price: product.cost_price || 0
      }]);
      
      // Show notification
      setSnackbarMessage(`ເພີ່ມ ${product.ProductName} ເຂົ້າລາຍການສັ່ງຊື້ແລ້ວ`);
      setSnackbarOpen(true);
    }
    
    // Show supplier warning if no supplier selected
    if (!supplier) {
      setSupplierWarning(true);
    }
  }, [orderItems, supplier]);

  // Update quantity of item in order
  const updateQuantity = useCallback((id, quantity) => {
    // Validate quantity
    const parsedQuantity = parseInt(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) return;
    
    // Update quantity
    const updatedItems = orderItems.map(item => 
      item.id === id ? { ...item, quantity: parsedQuantity } : item
    );
    
    setOrderItems(updatedItems);
    
    // Show notification for quantity update
    const updatedItem = updatedItems.find(item => item.id === id);
    if (updatedItem) {
      setSnackbarMessage(`ອັບເດດຈຳນວນ ${updatedItem.name} ເປັນ ${parsedQuantity}`);
      setSnackbarOpen(true);
    }
  }, [orderItems]);

  // Remove item from order
  const removeFromOrder = useCallback((id) => {
    const itemToRemove = orderItems.find(item => item.id === id);
    setOrderItems(orderItems.filter(item => item.id !== id));
    
    if (itemToRemove) {
      setSnackbarMessage(`ລຶບ ${itemToRemove.name} ອອກຈາກລາຍການແລ້ວ`);
      setSnackbarOpen(true);
    }
  }, [orderItems]);

  // Clear all items in order
  const clearOrder = useCallback(() => {
    if (orderItems.length === 0) return;
    
    setOrderItems([]);
    setSnackbarMessage('ລ້າງລາຍການສັ່ງຊື້ແລ້ວ');
    setSnackbarOpen(true);
  }, [orderItems]);

  // Calculate total order amount
  const totalOrderAmount = orderItems.reduce((sum, item) => 
    sum + (parseInt(item.price) || 0) * item.quantity, 0
  );

  // Save order to database
  const handleSaveOrder = async () => {
    // Validate order
    if (orderItems.length === 0) {
      setSnackbarMessage('ກະລຸນາເລືອກສິນຄ້າກ່ອນບັນທຶກການສັ່ງຊື້');
      setSnackbarOpen(true);
      return;
    }
  
    if (!supplier) {
      setSnackbarMessage('ກະລຸນາເລືອກຜູ້ສະໜອງກ່ອນບັນທຶກການສັ່ງຊື້');
      setSnackbarOpen(true);
      setSupplierWarning(true);
      return;
    }
    
    // Prevent duplicate submissions
    if (isSubmitting) {
      console.log('ກຳລັງດຳເນີນການ, ກະລຸນາລໍຖ້າ...');
      return;
    }
    
    // Start submission
    setIsSubmitting(true);
    setLoading(true);
    
    try {
      // Get current user
      const currentUser = getCurrentUser();
      if (!currentUser || !currentUser.emp_id) {
        throw new Error("ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້. ກະລຸນາເຂົ້າສູ່ລະບົບໃໝ່.");
      }
      
      // Prepare order data
      const orderData = {
        sup_id: parseInt(supplier),
        emp_id: parseInt(currentUser.emp_id),
        order_date: orderDate,
        items: orderItems.map(item => ({
          proid: parseInt(item.id),
          qty: parseInt(item.quantity)
        }))
      };
      
      console.log('ກຳລັງສົ່ງຂໍ້ມູນການສັ່ງຊື້:', orderData);
      
      // Send order to API
      const result = await addOrder(orderData);
      console.log('ບັນທຶກການສັ່ງຊື້ສຳເລັດ:', result);
      
      // Show success dialog
      setShowSuccessDialog(true);
      
      // Clear form after successful save
      setOrderItems([]);
      setSupplier('');
      setSupplierWarning(false);
      
    } catch (err) {
      console.error("ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກການສັ່ງຊື້:", err);
      setErrorMessage(err.message || 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກການສັ່ງຊື້');
      setShowErrorDialog(true);
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  // Handle dialogs
  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
  };

  const handleNavigateToPurchaseOrders = () => {
    setShowSuccessDialog(false);
    navigate('/purchase-orders');
  };

  const handleCloseErrorDialog = () => {
    setShowErrorDialog(false);
  };

  const handleTryAgain = () => {
    setShowErrorDialog(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Layout title="ສັ່ງຊື້ສິນຄ້າ">
      {/* Success Dialog */}
      <SuccessDialog 
        open={showSuccessDialog} 
        onClose={handleCloseSuccessDialog} 
        onDashboard={handleNavigateToPurchaseOrders} 
      />
      
      {/* Error Dialog */}
      <ErrorDialog 
        open={showErrorDialog} 
        onClose={handleCloseErrorDialog} 
        onTryAgain={handleTryAgain} 
      />
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          severity="success" 
          variant="filled"
          onClose={handleCloseSnackbar}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      
      {/* Header with navigation and info */}
      <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" fontWeight="bold" color="primary">
          ຟອມສັ່ງຊື້ສິນຄ້າ
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={fetchData}
            sx={{ mr: 1 }}
            disabled={dataLoading}
          >
            {dataLoading ? 'ກຳລັງໂຫລດ...' : 'ໂຫລດຄືນໃໝ່'}
          </Button>
          
          <Button 
            variant="contained" 
            color="info" 
            startIcon={<HistoryIcon />}
            onClick={() => navigate('/purchase-orders')}
          >
            ລາຍການສັ່ງຊື້ທັງໝົດ
          </Button>
        </Box>
      </Box>

      <Grid container spacing={2}>
        {/* Order information card */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              ຂໍ້ມູນການສັ່ງຊື້
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="ວັນທີສັ່ງຊື້"
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  select
                  label="ເລືອກຜູ້ສະໜອງ"
                  value={supplier}
                  onChange={(e) => {
                    setSupplier(e.target.value);
                    setSupplierWarning(false);
                  }}
                  required
                  error={supplierWarning}
                  helperText={supplierWarning ? "ກະລຸນາເລືອກຜູ້ສະໜອງກ່ອນບັນທຶກ" : ""}
                  InputProps={{
                    startAdornment: supplierWarning ? (
                      <InputAdornment position="start">
                        <WarningIcon color="error" />
                      </InputAdornment>
                    ) : null
                  }}
                >
                  <MenuItem value="">ເລືອກຜູ້ສະໜອງ</MenuItem>
                  {suppliers.map((sup) => (
                    <MenuItem key={sup.sup_id} value={sup.sup_id}>
                      {sup.sup_name} - {sup.contract_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
            
            {/* Order summary */}
            {orderItems.length > 0 && (
              <Box sx={{ mt: 2, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                <Grid container spacing={1} alignItems="center">
                  <Grid item xs>
                    <Typography variant="body2">
                      ລາຍການທັງໝົດ: <strong>{orderItems.length}</strong> ລາຍການ
                    </Typography>
                  </Grid>
                  <Grid item xs>
                    <Typography variant="body2">
                      ຈຳນວນທັງໝົດ: <strong>{orderItems.reduce((sum, item) => sum + item.quantity, 0)}</strong> ອັນ
                    </Typography>
                  </Grid>
                  <Grid item xs>
                    <Typography variant="body2">
                      ມູນຄ່າລວມ: <strong>{formatNumber(totalOrderAmount)}</strong> ກີບ
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Product selection panel */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              ເລືອກສິນຄ້າ
            </Typography>
            
            {/* Search and filter */}
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                placeholder="ຄົ້ນຫາສິນຄ້າ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 1 }}
              />
              
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    select
                    size="small"
                    label="ກອງປະເພດ"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FilterListIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  >
                    <MenuItem value="">ທັງໝົດ</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    select
                    size="small"
                    label="ກອງຍີ່ຫໍ້"
                    value={brandFilter}
                    onChange={(e) => setBrandFilter(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FilterListIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  >
                    <MenuItem value="">ທັງໝົດ</MenuItem>
                    {brands.map((brand) => (
                      <MenuItem key={brand} value={brand}>
                        {brand}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Box>

            {/* Products table */}
            {dataLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 3, flexGrow: 1, alignItems: 'center' }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  ພົບ {filteredProducts.length} ລາຍການ
                </Typography>
                
                <TableContainer sx={{ flexGrow: 1, overflow: 'auto' }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell align="center">ລະຫັດ</TableCell>
                        <TableCell align="left">ຊື່ສິນຄ້າ</TableCell>
                        <TableCell align="center">ຈຳນວນໃນສາງ</TableCell>
                        <TableCell align="center">ລາຄາຕົ້ນທຶນ</TableCell>
                        <TableCell align="center"></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                          <TableRow key={product.proid} hover>
                            <TableCell align="center">
                              {product.proid}
                            </TableCell>
                            <TableCell align="left">
                              <Tooltip title={`${product.ProductName} - ${product.brand || ''}`}>
                                <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                                  {product.ProductName}
                                </Typography>
                              </Tooltip>
                            </TableCell>
                            <TableCell align="center">
                              <Typography 
                                variant="body2" 
                                fontWeight="bold"
                                color={product.qty <= product.qty_min ? "warning.main" : "primary.main"}
                                sx={{ 
                                  border: '1px solid',
                                  borderColor: product.qty <= product.qty_min ? "warning.main" : "primary.main",
                                  borderRadius: 1,
                                  px: 1,
                                  py: 0.5,
                                  display: 'inline-block',
                                  minWidth: '60px',
                                  textAlign: 'center'
                                }}
                              >
                                {formatNumber(product.qty)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              {formatNumber(product.cost_price)}
                            </TableCell>
                            <TableCell align="center">
                              <Button
                                variant="contained"
                                size="small"
                                color="primary"
                                onClick={() => addToOrder(product)}
                                sx={{ 
                                  minWidth: '36px', 
                                  height: '36px',
                                  borderRadius: '18px',
                                  boxShadow: 2
                                }}
                              >
                                <AddIcon fontSize="small" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            <Typography variant="body2" sx={{ py: 2, color: 'text.secondary' }}>
                              ບໍ່ພົບຂໍ້ມູນສິນຄ້າ
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Paper>
        </Grid>

        {/* Order items panel */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2" color="primary">
                <Badge badgeContent={orderItems.length} color="primary" sx={{ mr: 1 }}>
                  <CartIcon color="primary" />
                </Badge>
                ລາຍການສັ່ງຊື້
              </Typography>
              
              {orderItems.length > 0 && (
                <Button 
                  variant="outlined" 
                  color="error" 
                  size="small"
                  onClick={clearOrder}
                >
                  ລ້າງລາຍການ
                </Button>
              )}
            </Box>

            {/* Supplier warning */}
            {supplierWarning && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                ກະລຸນາເລືອກຜູ້ສະໜອງກ່ອນດຳເນີນການບັນທຶກການສັ່ງຊື້
              </Alert>
            )}

            {/* Order items table */}
            <TableContainer sx={{ flexGrow: 1, overflow: 'auto' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center" width="5%">#</TableCell>
                    <TableCell align="left">ສິນຄ້າ</TableCell>
                    <TableCell align="center" width="15%">ລາຄາ</TableCell>
                    <TableCell align="center" width="15%">ຈຳນວນ</TableCell>
                    <TableCell align="right" width="20%">ລວມ</TableCell>
                    <TableCell align="center" width="10%"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orderItems.length > 0 ? (
                    orderItems.map((item, index) => {
                      const itemTotal = (parseInt(item.price) || 0) * item.quantity;
                      
                      return (
                        <TableRow 
                          key={item.id} 
                          sx={{ 
                            "&:nth-of-type(odd)": { 
                              bgcolor: 'action.hover' 
                            } 
                          }}
                        >
                          <TableCell align="center">{index + 1}</TableCell>
                          <TableCell align="left">
                            <Typography variant="body2">{item.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              ລະຫັດ: {item.id}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            {formatNumber(item.price)}
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                sx={{ 
                                  border: '1px solid',
                                  borderColor: 'primary.main',
                                  borderRadius: '4px 0 0 4px',
                                  height: 30,
                                  p: 0,
                                  minWidth: 30
                                }}
                              >
                                <Typography variant="body2" fontWeight="bold">−</Typography>
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
                                    p: 0,
                                    height: 28,
                                    fontSize: '1rem',
                                    fontWeight: 'bold'
                                  },
                                  '& fieldset': {
                                    borderRadius: 0,
                                    borderLeft: 'none',
                                    borderRight: 'none'
                                  }
                                }}
                                inputProps={{ min: 1 }}
                              />
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                sx={{ 
                                  border: '1px solid',
                                  borderColor: 'primary.main',
                                  borderRadius: '0 4px 4px 0',
                                  height: 30,
                                  p: 0,
                                  minWidth: 30
                                }}
                              >
                                <Typography variant="body2" fontWeight="bold">+</Typography>
                              </IconButton>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="bold">
                              {formatNumber(itemTotal)} ກີບ
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => removeFromOrder(item.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="body2" sx={{ py: 2, color: 'text.secondary' }}>
                          ຍັງບໍ່ມີລາຍການສັ່ງຊື້. ກະລຸນາເລືອກສິນຄ້າຈາກລາຍການທາງຊ້າຍ
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  
                  {/* Total row */}
                  {orderItems.length > 0 && (
                    <TableRow sx={{ bgcolor: 'primary.main' }}>
                      <TableCell colSpan={4} align="right">
                        <Typography variant="subtitle2" color="white">
                          ລວມມູນຄ່າທັງໝົດ:
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle1" fontWeight="bold" color="white">
                          {formatNumber(totalOrderAmount)} ກີບ
                        </Typography>
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Action buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/dashboard')}
              >
                ກັບຄືນ
              </Button>

              <Tooltip title={!supplier ? "ກະລຸນາເລືອກຜູ້ສະໜອງກ່ອນ" : "ບັນທຶກການສັ່ງຊື້"}>
                <span>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <SaveIcon />}
                    onClick={handleSaveOrder}
                    disabled={orderItems.length === 0 || !supplier || loading}
                  >
                    ບັນທຶກການສັ່ງຊື້
                  </Button>
                </span>
              </Tooltip>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Layout>
  );
}

export default Buy;