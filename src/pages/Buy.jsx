import { useState } from 'react';
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
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { SuccessDialog, ErrorDialog } from '../components/SuccessDialog';

function Buy() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [supplier, setSupplier] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  
  // Mock products data
  const products = [
    { id: 1, code: 'P001', name: 'ຕູ້ເຢັນ', stock: 10 },
    { id: 2, code: 'P002', name: 'ໂທລະທັດ', stock: 15 },
    { id: 3, code: 'P003', name: 'ແອຄອນດິຊັນ', stock: 20 },
    { id: 4, code: 'P004', name: 'ຈັກຊັກຜ້າ', stock: 8 },
  ];

  // Format date to DD/MM/YYYY
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add product to order
  const addToOrder = (product) => {
    const existingItemIndex = orderItems.findIndex(item => item.id === product.id);
    
    if (existingItemIndex >= 0) {
      // Item already in order, increase quantity
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += 1;
      setOrderItems(updatedItems);
    } else {
      // Add new item to order
      setOrderItems([...orderItems, { ...product, quantity: 1 }]);
    }
  };

  // Update item quantity in order
  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) return;
    
    const updatedItems = orderItems.map(item => 
      item.id === id ? { ...item, quantity: parseInt(quantity) } : item
    );
    
    setOrderItems(updatedItems);
  };

  // Remove item from order
  const removeFromOrder = (id) => {
    setOrderItems(orderItems.filter(item => item.id !== id));
  };

  // Handle save order
  const handleSaveOrder = () => {
    if (orderItems.length === 0) {
      alert('ກະລຸນາເລືອກສິນຄ້າກ່ອນບັນທຶກການສັ່ງຊື້');
      return;
    }

    if (!supplier) {
      alert('ກະລຸນາເລືອກຜູ້ສະໜອງກ່ອນບັນທຶກການສັ່ງຊື້');
      return;
    }
    
    // Get existing orders or initialize new array
    const existingOrders = JSON.parse(localStorage.getItem('purchaseOrders') || '[]');
    
    // Generate a new ID (in a real app this would come from the backend)
    const newId = existingOrders.length > 0 
      ? Math.max(...existingOrders.map(order => order.id)) + 1 
      : 1;
    
    // Create the new order object
    const newOrder = {
      id: newId,
      orderDate: formatDate(orderDate),
      supplier: `ບໍລິສັດ ${supplier}`,
      employee: 'ເປັນຕຸ້ຍ (ພະນັກງານ)', // Hardcoded for demo
      status: 'ລໍຖ້າອະນຸມັດ',
      items: orderItems
    };
    
    // Add to existing orders
    const updatedOrders = [...existingOrders, newOrder];
    
    // Save to localStorage
    localStorage.setItem('purchaseOrders', JSON.stringify(updatedOrders));
    
    console.log('Saving purchase order:', newOrder);
    
    // Show success dialog instead of alert
    setShowSuccessDialog(true);
    
    // Form is cleared when dialog is closed
  };

  // Handle dialog actions
  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
    // Clear form after dialog is closed
    setOrderItems([]);
    setSupplier('');
  };

  const handleNavigateToPurchaseOrders = () => {
    setShowSuccessDialog(false);
    // Clear form and navigate
    setOrderItems([]);
    setSupplier('');
    navigate('/purchase-orders');
  };

  const handleCloseErrorDialog = () => {
    setShowErrorDialog(false);
  };

  const handleTryAgain = () => {
    setShowErrorDialog(false);
    // User can try to save again
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
      
      <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" fontWeight="bold" color="primary">
          ຟອມສັ່ງຊື້ສິນຄ້າ
        </Typography>
        <Button 
          variant="contained" 
          color="info" 
          onClick={() => navigate('/purchase-orders')}
        >
          ລາຍການສັ່ງຊື້ທັງໝົດ
        </Button>
      </Box>

      <Grid container spacing={2}>
        {/* Header - Order information */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="ວັນເວລາ"
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
                  label="ເລືອກສະໜອງ"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                >
                  <MenuItem value="">ເລືອກຜູ້ສະໜອງ</MenuItem>
                  <MenuItem value="Gee">Gee</MenuItem>
                  <MenuItem value="ທ້າວກ້າ">ທ້າວກ້າ</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

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
                    <TableCell align="center"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id} hover>
                      <TableCell align="center">{product.code}</TableCell>
                      <TableCell align="center">{product.name}</TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          size="small"
                          color="primary"
                          onClick={() => addToOrder(product)}
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

        {/* Right column - Order items */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                ລາຍການສັ່ງຊື້
              </Typography>
            </Box>

            <TableContainer sx={{ maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center">#</TableCell>
                    <TableCell align="center">ສິນຄ້າ</TableCell>
                    <TableCell align="center">ຈຳນວນ</TableCell>
                    <TableCell align="center"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orderItems.map((item, index) => (
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
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeFromOrder(item.id)}
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
                  setOrderItems([]);
                  setSupplier('');
                }}
              >
                ຍົກເລີກ
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<SaveIcon />}
                onClick={handleSaveOrder}
                disabled={orderItems.length === 0 || !supplier}
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

export default Buy;