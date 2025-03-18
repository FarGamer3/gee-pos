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
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  Save as SaveIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout';
import ReceiptModal from '../components/ReceiptModal';

const sampleProducts = [
  { id: 1, code: 'P001', name: 'ສິນຄ້າ', price: 1500000, stock: 10 },
  { id: 2, code: 'P002', name: 'ສິນຄ້າ', price: 1500000, stock: 15 },
  { id: 3, code: 'P003', name: 'ສິນຄ້າ', price: 1500000, stock: 20 },
  { id: 4, code: 'P004', name: 'ສິນຄ້າ', price: 1500000, stock: 8 },
];

function Sales() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('@customer');
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  
  // Calculate total
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Filter products based on search term
  const filteredProducts = sampleProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add item to cart
  const addToCart = (product) => {
    const existingItemIndex = cartItems.findIndex(item => item.id === product.id);
    
    if (existingItemIndex >= 0) {
      // Item already in cart, increase quantity
      const updatedItems = [...cartItems];
      updatedItems[existingItemIndex].quantity += 1;
      setCartItems(updatedItems);
    } else {
      // Add new item to cart
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
  };

  // Update item quantity in cart
  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) return;
    
    const updatedItems = cartItems.map(item => 
      item.id === id ? { ...item, quantity: parseInt(quantity) } : item
    );
    
    setCartItems(updatedItems);
  };

  // Remove item from cart
  const removeFromCart = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };
  
  // Handle save sale
  const handleSaveSale = () => {
    if (cartItems.length === 0) {
      showAlert('ກະລຸນາເລືອກສິນຄ້າກ່ອນບັນທຶກການຂາຍ', 'error');
      return;
    }
    
    // Here you would typically save the sale to your backend
    console.log('Saving sale:', {
      customer: selectedCustomer,
      items: cartItems,
      total: cartTotal,
      date: new Date()
    });
    
    showAlert('ບັນທຶກການຂາຍສຳເລັດ', 'success');
    // Clear cart after successful save
    setCartItems([]);
  };
  
  // Handle print receipt
  const handlePrintReceipt = () => {
    if (cartItems.length === 0) {
      showAlert('ກະລຸນາເລືອກສິນຄ້າກ່ອນພິມໃບບິນ', 'error');
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
      <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1, mb: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold" color="primary">
          ສິນຄ້າ IN STOCK
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
                    <TableCell align="center">ລຸ້ນ</TableCell>
                    <TableCell align="center">ໄລເບີ</TableCell>
                    <TableCell align="center"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id} hover>
                      <TableCell align="center">{product.code}</TableCell>
                      <TableCell align="center">{product.name}</TableCell>
                      <TableCell align="center">-</TableCell>
                      <TableCell align="center">-</TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          size="small"
                          color="error"
                          onClick={() => addToCart(product)}
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

        {/* Right column - Cart/Order */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight="bold">
                ລາຍການສັ່ງຊື້
                <Box component="span" sx={{ ml: 2, color: 'text.secondary' }}>
                  {selectedCustomer}
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
                  {cartItems.map((item, index) => (
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
                        {item.price.toLocaleString()}
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
                          inputProps={{ min: 1 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {(item.price * item.quantity).toLocaleString()}
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
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Cart Total */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, p: 1, bgcolor: 'action.hover' }}>
              <Typography variant="subtitle1" fontWeight="bold">
                ລາຄາລວມ: {cartTotal.toLocaleString()} ກີບ
              </Typography>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
              <Button
                variant="contained"
                color="success"
                startIcon={<SaveIcon />}
                onClick={handleSaveSale}
              >
                ບັນທຶກ
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<PrintIcon />}
                onClick={handlePrintReceipt}
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
        customer={selectedCustomer}
        totalAmount={cartTotal}
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
                  <TableCell>ເບີໂທ</TableCell>
                  <TableCell>ທີ່ຢູ່</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Sample customer data - in a real app, this would be filtered based on customerSearch */}
                <TableRow hover>
                  <TableCell>C001</TableCell>
                  <TableCell>ລູກຄ້າທົ່ວໄປ</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleSelectCustomer('ລູກຄ້າທົ່ວໄປ')}
                    >
                      ເລືອກ
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell>C002</TableCell>
                  <TableCell>@customer</TableCell>
                  <TableCell>02012345678</TableCell>
                  <TableCell>ນະຄອນຫຼວງວຽງຈັນ</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleSelectCustomer('@customer')}
                    >
                      ເລືອກ
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomerDialogOpen(false)}>ຍົກເລີກ</Button>
        </DialogActions>
      </Dialog>
      
      {/* Alert Snackbar */}
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
    </Layout>
  );
}

export default Sales;