import { useState, useEffect } from 'react';
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
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { SuccessDialog, ErrorDialog } from '../components/SuccessDialog';
import { addOrder, getAllSuppliers } from '../services/orderService';
import { getCurrentUser } from '../services/authService';
import { getAllProducts } from '../services/productService';

function Buy() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [supplier, setSupplier] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  // ຂໍ້ມູນສິນຄ້າແລະຜູ້ສະໜອງ
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  
  // ດຶງຂໍ້ມູນເມື່ອໜ້າຖືກໂຫຼດ
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // ດຶງຂໍ້ມູນສິນຄ້າ
        const productsData = await getAllProducts();
        setProducts(productsData || []);
        
        // ດຶງຂໍ້ມູນຜູ້ສະໜອງ
        const suppliersData = await getAllSuppliers();
        setSuppliers(suppliersData || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // ຈັດຮູບແບບວັນທີເປັນ DD/MM/YYYY
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  // ຄົ້ນຫາສິນຄ້າຕາມຄຳຄົ້ນຫາ
  const filteredProducts = products.filter(product =>
    product.ProductName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.code && product.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // ເພີ່ມສິນຄ້າເຂົ້າລາຍການສັ່ງຊື້
  const addToOrder = (product) => {
    const existingItemIndex = orderItems.findIndex(item => item.id === product.proid);
    
    if (existingItemIndex >= 0) {
      // ສິນຄ້າມີຢູ່ແລ້ວໃນລາຍການສັ່ງຊື້, ເພີ່ມຈຳນວນ
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += 1;
      setOrderItems(updatedItems);
    } else {
      // ເພີ່ມສິນຄ້າໃໝ່ເຂົ້າລາຍການສັ່ງຊື້
      setOrderItems([...orderItems, {
        id: product.proid,
        code: product.code || '',
        name: product.ProductName,
        quantity: 1
      }]);
    }
  };

  // ອັບເດດຈຳນວນສິນຄ້າໃນລາຍການສັ່ງຊື້
  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) return;
    
    const updatedItems = orderItems.map(item => 
      item.id === id ? { ...item, quantity: parseInt(quantity) } : item
    );
    
    setOrderItems(updatedItems);
  };

  // ລຶບສິນຄ້າອອກຈາກລາຍການສັ່ງຊື້
  const removeFromOrder = (id) => {
    setOrderItems(orderItems.filter(item => item.id !== id));
  };

  // ບັນທຶກລາຍການສັ່ງຊື້
  const handleSaveOrder = async () => {
    if (orderItems.length === 0) {
      alert('ກະລຸນາເລືອກສິນຄ້າກ່ອນບັນທຶກການສັ່ງຊື້');
      return;
    }

    if (!supplier) {
      alert('ກະລຸນາເລືອກຜູ້ສະໜອງກ່ອນບັນທຶກການສັ່ງຊື້');
      return;
    }
    
    setLoading(true);
    
    try {
      const currentUser = getCurrentUser();
      if (!currentUser || !currentUser.emp_id) {
        throw new Error("ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້. ກະລຸນາເຂົ້າສູ່ລະບົບໃໝ່.");
      }
      
      // ປັບໂຄງສ້າງຂໍ້ມູນສຳລັບ API
      const orderData = {
        sup_id: parseInt(supplier),
        emp_id: parseInt(currentUser.emp_id),
        order_date: orderDate,
        items: orderItems.map(item => ({
          proid: item.id,
          qty: item.quantity
        }))
      };
      
      // ສົ່ງຂໍ້ມູນໄປຫາ API
      const result = await addOrder(orderData);
      
      console.log('Order saved successfully:', result);
      
      // ສະແດງກ່ອງຂໍ້ຄວາມສຳເລັດ
      setShowSuccessDialog(true);
      
      // ລ້າງຟອມຫຼັງຈາກບັນທຶກສຳເລັດ
      setOrderItems([]);
      setSupplier('');
      
    } catch (err) {
      console.error("Error saving order:", err);
      setErrorMessage(err.message || 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກການສັ່ງຊື້');
      setShowErrorDialog(true);
    } finally {
      setLoading(false);
    }
  };

  // ຈັດການກ່ອງຂໍ້ຄວາມ dialog
  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
    // ຟອມຖືກລ້າງແລ້ວຫຼັງຈາກ dialog ປິດ
  };

  const handleNavigateToPurchaseOrders = () => {
    setShowSuccessDialog(false);
    // ລ້າງຟອມແລະນຳທາງໄປຍັງໜ້າລາຍການສັ່ງຊື້
    setOrderItems([]);
    setSupplier('');
    navigate('/purchase-orders');
  };

  const handleCloseErrorDialog = () => {
    setShowErrorDialog(false);
  };

  const handleTryAgain = () => {
    setShowErrorDialog(false);
    // ຜູ້ໃຊ້ສາມາດພະຍາຍາມບັນທຶກອີກຄັ້ງ
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
                  label="ເລືອກຜູ້ສະໜອງ"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                >
                  <MenuItem value="">ເລືອກຜູ້ສະໜອງ</MenuItem>
                  {suppliers.map((sup) => (
                    <MenuItem key={sup.sup_id} value={sup.sup_id}>
                      {sup.sup_name}
                    </MenuItem>
                  ))}
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

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
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
                      <TableRow key={product.proid} hover>
                        <TableCell align="center">{product.proid}</TableCell>
                        <TableCell align="center">{product.ProductName}</TableCell>
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
            )}
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
                startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <SaveIcon />}
                onClick={handleSaveOrder}
                disabled={orderItems.length === 0 || !supplier || loading}
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