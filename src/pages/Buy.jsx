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

function Buy() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [supplier, setSupplier] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Mock products data
  const products = [
    { id: 1, code: 'P001', name: 'ຕູ້ເຢັນ', price: 1000000, stock: 10 },
    { id: 2, code: 'P002', name: 'ໂທລະທັດ', price: 1500000, stock: 15 },
    { id: 3, code: 'P003', name: 'ແອຄອນດິຊັນ', price: 2000000, stock: 20 },
    { id: 4, code: 'P004', name: 'ຈັກຊັກຜ້າ', price: 800000, stock: 8 },
  ];

  // Format number with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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

  // Calculate total
  const orderTotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

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
    
    // Here you would typically save the order to your backend
    console.log('Saving purchase order:', {
      supplier,
      orderDate,
      items: orderItems,
      total: orderTotal,
      date: new Date()
    });
    
    alert('ບັນທຶກການສັ່ງຊື້ສຳເລັດ');
    // Clear form after successful save
    setOrderItems([]);
    setSupplier('');
  };

  return (
    <Layout title="ສັ່ງຊື້ສິນຄ້າ">
      <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1, mb: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold" color="primary">
          ຟອມສັ່ງຊື້ສິນຄ້າ
        </Typography>
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
                    <TableCell align="center">ລາຄາ</TableCell>
                    <TableCell align="center"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id} hover>
                      <TableCell align="center">{product.code}</TableCell>
                      <TableCell align="center">{product.name}</TableCell>
                      <TableCell align="center">{formatNumber(product.price)}</TableCell>
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
                    <TableCell align="center">ລາຄາ</TableCell>
                    <TableCell align="center">ຈຳນວນ</TableCell>
                    <TableCell align="center">ລວມລາຄາ</TableCell>
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
                          inputProps={{ min: 1 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {formatNumber(item.price * item.quantity)}
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

            {/* Total and Action Buttons */}
            <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={4}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    ລາຄາລວມ:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="h6" fontWeight="bold" textAlign="right">
                    {formatNumber(orderTotal)} ກີບ
                  </Typography>
                </Grid>
              </Grid>
            </Box>

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