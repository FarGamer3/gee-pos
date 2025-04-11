import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  InputAdornment,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
  Chip  
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import {
  getAllProducts,
  getProductByName,
  addProduct,
  updateProduct,
  deleteProduct
} from '../../services/productService';
import {
  getAllCategories
} from '../../services/categoryService';
import {
  getAllBrands
} from '../../services/brandService';
import {
  getAllZones
} from '../../services/zoneService';
import Layout from '../../components/Layout';
import { DeleteConfirmDialog } from '../../components/ConfirmationDialog';

function Products() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  
  // Current product for editing
  const productFormRef = useRef(null);
  
  const [currentProduct, setCurrentProduct] = useState({
    ProductName: '',
    qty: 0,
    qty_min: 0,
    cost_price: 0,
    retail_price: 0,
    brand_id: '',
    cat_id: '',
    zone_id: '',
    pro_detail: '',
    status: 'Instock',
  });

  // ດຶງຂໍ້ມູນທັງໝົດເມື່ອໜ້າຖືກໂຫຼດ
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsData, categoriesData, brandsData, zonesData] = await Promise.all([
          getAllProducts(),
          getAllCategories(),
          getAllBrands(),
          getAllZones()
        ]);
        
        setProducts(productsData || []);
        setCategories(categoriesData || []);
        setBrands(brandsData || []);
        setZones(zonesData || []);
        setError(null);
      } catch (err) {
        setError('ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // ຟັງຊັນເປີດ dialog ເພີ່ມສິນຄ້າໃໝ່
  const handleOpenAddDialog = () => {
    const emptyProduct = {
      ProductName: '',
      qty: 0,
      qty_min: 0,
      cost_price: 0,
      retail_price: 0,
      brand_id: '',
      cat_id: '',
      zone_id: '',
      pro_detail: '',
      status: 'Instock',
    };
    
    setCurrentProduct(emptyProduct);
    productFormRef.current = emptyProduct; // ຕັ້ງຄ່າເລີ່ມຕົ້ນໃນ ref
    setOpenAddDialog(true);
  };

  // ຟັງຊັນປິດ dialog ເພີ່ມສິນຄ້າ
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    productFormRef.current = null; // ລ້າງຂໍ້ມູນໃນ ref ເມື່ອປິດ dialog
  };

  // ຟັງຊັນເປີດ dialog ແກ້ໄຂສິນຄ້າ
  const handleOpenEditDialog = (product) => {
    setCurrentProduct({ ...product });
    productFormRef.current = { ...product }; // ກຳນົດຄ່າເລີ່ມຕົ້ນໃນ ref ເປັນຂໍ້ມູນສິນຄ້າປັດຈຸບັນ
    setOpenEditDialog(true);
  };

  // ຟັງຊັນປິດ dialog ແກ້ໄຂສິນຄ້າ
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    productFormRef.current = null; // ລ້າງຂໍ້ມູນໃນ ref ເມື່ອປິດ dialog
  };

  // ຟັງຊັນການປ່ຽນແປງຂໍ້ມູນສິນຄ້າແບບປັບປຸງໃໝ່
  const handleChange = (e) => {
    const { name, value } = e.target;
    // ແທນທີ່ຈະໃຊ້ setCurrentProduct ທຸກຄັ້ງທີ່ພິມ (ເຊິ່ງຈະ re-render)
    // ເຮົາຈະເກັບຄ່າໄວ້ໃນ ref ກ່ອນ
    productFormRef.current = {
      ...(productFormRef.current || currentProduct),
      [name]: value
    };
  };

  // ສະແດງຂໍ້ຄວາມແຈ້ງເຕືອນ
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // ປິດຂໍ້ຄວາມແຈ້ງເຕືອນ
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // ຟັງຊັນບັນທຶກສິນຄ້າໃໝ່
  const handleAddProduct = async () => {
    try {
      setLoading(true);
      const formData = productFormRef.current || currentProduct;
      
      // ກວດສອບຂໍ້ມູນກ່ອນບັນທຶກ
      if (!formData.ProductName || !formData.brand_id || !formData.cat_id || !formData.zone_id) {
        showSnackbar('ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ', 'error');
        setLoading(false);
        return;
      }
      
      // ປັບປຸງຂໍ້ມູນໃຫ້ສົມບູນກ່ອນສົ່ງໄປຍັງ API
      const productToSave = {
        ProductName: formData.ProductName,
        brand_id: parseInt(formData.brand_id),
        cat_id: parseInt(formData.cat_id),
        zone_id: parseInt(formData.zone_id),
        pro_detail: formData.pro_detail || '', // ຕ້ອງມີຄ່າ, ບໍ່ສາມາດເປັນ null
        qty: parseInt(formData.qty) || 0, // ແປງເປັນຕົວເລກແລະມີຄ່າເລີ່ມຕົ້ນ
        qty_min: parseInt(formData.qty_min) || 0,
        cost_price: parseFloat(formData.cost_price) || 0,
        retail_price: parseFloat(formData.retail_price) || 0,
        status: formData.status || 'Instock'
      };
  
      console.log('Sending product data:', productToSave);
      
      const result = await addProduct(productToSave);
      
      if (result && (result.result_code === "200" || result.result_code === "201")) {
        // ດຶງຂໍ້ມູນອີກຄັ້ງຫຼັງຈາກບັນທຶກສຳເລັດ
        const updatedProducts = await getAllProducts();
        setProducts(updatedProducts);
        setOpenAddDialog(false);
        // ສະແດງຂໍ້ຄວາມສຳເລັດ
        showSnackbar('ເພີ່ມສິນຄ້າສຳເລັດແລ້ວ', 'success');
      } else {
        throw new Error(result?.result || 'Failed to add product');
      }
    } catch (err) {
      console.error('Error adding product:', err);
      showSnackbar(err.response?.data?.result || 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ', 'error');
    } finally {
      setLoading(false);
      productFormRef.current = null;
    }
  };

  // ຟັງຊັນບັນທຶກການແກ້ໄຂສິນຄ້າ
  const handleSaveEdit = async () => {
    try {
      setLoading(true);
      const formData = productFormRef.current || currentProduct;
      
      // ກວດສອບຂໍ້ມູນກ່ອນແກ້ໄຂ
      if (!formData.ProductName || !formData.brand_id || !formData.cat_id || !formData.zone_id) {
        showSnackbar('ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ', 'error');
        setLoading(false);
        return;
      }
      
      const result = await updateProduct(formData);
      
      if (result && result.result_code === "200") {
        // ດຶງຂໍ້ມູນອີກຄັ້ງຫຼັງຈາກບັນທຶກສຳເລັດ
        const updatedProducts = await getAllProducts();
        setProducts(updatedProducts);
        setOpenEditDialog(false);
        // ສະແດງຂໍ້ຄວາມສຳເລັດ
        showSnackbar('ແກ້ໄຂສິນຄ້າສຳເລັດແລ້ວ', 'success');
      } else {
        throw new Error(result?.result || 'Failed to update product');
      }
    } catch (err) {
      setError('ເກີດຂໍ້ຜິດພາດໃນການແກ້ໄຂຂໍ້ມູນ');
      showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການແກ້ໄຂຂໍ້ມູນ', 'error');
      console.error(err);
    } finally {
      setLoading(false);
      productFormRef.current = null;
    }
  };

  // ຟັງຊັນເປີດ dialog ລຶບສິນຄ້າ
  const handleOpenDeleteDialog = (id) => {
    setSelectedProductId(id);
    setOpenDeleteDialog(true);
  };

  // ຟັງຊັນປິດ dialog ລຶບສິນຄ້າ
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedProductId(null);
  };

  // ຟັງຊັນລຶບສິນຄ້າ
  const handleDeleteProduct = async (id) => {
    try {
      setLoading(true);
      
      const result = await deleteProduct(id);
      
      if (result && result.result_code === "200") {
        // ອັບເດດລາຍການສິນຄ້າໂດຍບໍ່ຕ້ອງດຶງຂໍ້ມູນໃໝ່
        setProducts(products.filter(product => product.proid !== id));
        setOpenDeleteDialog(false);
        // ສະແດງຂໍ້ຄວາມສຳເລັດ
        showSnackbar('ລຶບສິນຄ້າສຳເລັດແລ້ວ', 'success');
      } else {
        throw new Error(result?.result || 'Failed to delete product');
      }
    } catch (err) {
      setError('ເກີດຂໍ້ຜິດພາດໃນການລຶບຂໍ້ມູນ');
      showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການລຶບຂໍ້ມູນ', 'error');
      console.error(err);
    } finally {
      setLoading(false);
      setSelectedProductId(null);
    }
  };

  // ຟັງຊັນຄົ້ນຫາ
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // ກັ່ນຕອງສິນຄ້າຕາມການຄົ້ນຫາ
  const filteredProducts = products.filter(product => {
    return (
      product.ProductName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Form dialog component for add and edit operations
  const ProductFormDialog = ({ open, onClose, title, product, onChange, onSave }) => (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {title}
        <IconButton
          aria-label="close"
          onClick={onClose}
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
        <Box component="form">
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ຊື່ສິນຄ້າ"
                name="ProductName"
                defaultValue={product.ProductName}
                onChange={onChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ຈຳນວນ"
                name="qty"
                type="number"
                defaultValue={product.qty}
                onChange={onChange}
                required
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ຈຳນວນນ້ອຍສຸດ"
                name="qty_min"
                type="number"
                defaultValue={product.qty_min}
                onChange={onChange}
                required
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ລາຄາຕົ້ນທຶນ"
                name="cost_price"
                type="number"
                defaultValue={product.cost_price}
                onChange={onChange}
                required
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ລາຄາຂາຍ"
                name="retail_price"
                type="number"
                defaultValue={product.retail_price}
                onChange={onChange}
                required
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="ຍີ່ຫໍ້"
                name="brand_id"
                defaultValue={product.brand_id}
                onChange={onChange}
                required
              >
                <MenuItem value="">ເລືອກຍີ່ຫໍ້</MenuItem>
                {brands.map((brand) => (
                  <MenuItem key={brand.brand_id} value={brand.brand_id}>
                    {brand.brand}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="ປະເພດສິນຄ້າ"
                name="cat_id"
                defaultValue={product.cat_id}
                onChange={onChange}
                required
              >
                <MenuItem value="">ເລືອກປະເພດສິນຄ້າ</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.cat_id} value={category.cat_id}>
                    {category.category}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="ບ່ອນຈັດວາງ"
                name="zone_id"
                defaultValue={product.zone_id}
                onChange={onChange}
                required
              >
                <MenuItem value="">ເລືອກບ່ອນຈັດວາງ</MenuItem>
                {zones.map((zone) => (
                  <MenuItem key={zone.zone_id} value={zone.zone_id}>
                    {zone.zone} - {zone.zone_detail}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="ສະຖານະ"
                name="status"
                defaultValue={product.status}
                onChange={onChange}
                required
              >
                <MenuItem value="Instock">ມີໃນສາງ</MenuItem>
                <MenuItem value="OutOfStock">ໝົດສາງ</MenuItem>
                <MenuItem value="Discontinued">ຍົກເລີກການຂາຍ</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ລາຍລະອຽດ"
                name="pro_detail"
                defaultValue={product.pro_detail}
                onChange={onChange}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error" variant="outlined">
          ຍົກເລີກ
        </Button>
        <Button onClick={onSave} color="primary" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'ບັນທຶກ'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Layout title="ຈັດການຂໍ້ມູນສິນຄ້າ">
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
      
      {/* Error alert if needed */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <TextField
          placeholder="ຄົ້ນຫາ..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearch}
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
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
        >
          ເພີ່ມສິນຄ້າ
        </Button>
      </Box>

      {loading && !openAddDialog && !openEditDialog ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 240px)', overflow: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell align="center" width={50}>#</TableCell>
                <TableCell align="left">ຊື່ສິນຄ້າ</TableCell>
                <TableCell align="center">ຈຳນວນ</TableCell>
                <TableCell align="center">ຈຳນວນນ້ອຍສຸດ</TableCell>
                <TableCell align="right">ລາຄາຕົ້ນທຶນ</TableCell>
                <TableCell align="right">ລາຄາຂາຍ</TableCell>
                <TableCell align="center">ຍີ່ຫໍ້</TableCell>
                <TableCell align="center">ປະເພດສິນຄ້າ</TableCell>
                <TableCell align="center">ບ່ອນຈັດວາງ</TableCell>
                <TableCell align="center">ສະຖານະ</TableCell>
                <TableCell align="center" width={80}>ແກ້ໄຂ</TableCell>
                <TableCell align="center" width={80}>ລຶບ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product, index) => (
                  <TableRow key={product.proid} hover>
                    <TableCell align="center">{index + 1}</TableCell>
                    <TableCell align="left">{product.ProductName}</TableCell>
                    <TableCell align="center">{product.qty}</TableCell>
                    <TableCell align="center">{product.qty_min}</TableCell>
                    <TableCell align="right">{parseInt(product.cost_price).toLocaleString()}</TableCell>
                    <TableCell align="right">{parseInt(product.retail_price).toLocaleString()}</TableCell>
                    <TableCell align="center">{product.brand}</TableCell>
                    <TableCell align="center">{product.category}</TableCell>
                    <TableCell align="center">{product.zone}</TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={product.status === 'Instock' ? 'ມີໃນສາງ' : 
                               product.status === 'OutOfStock' ? 'ໝົດສາງ' : 'ຍົກເລີກການຂາຍ'}
                        color={product.status === 'Instock' ? 'success' : 
                               product.status === 'OutOfStock' ? 'warning' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="ແກ້ໄຂ">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleOpenEditDialog(product)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="ລຶບ">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleOpenDeleteDialog(product.proid)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={12} align="center">
                    {loading ? 'ກຳລັງໂຫຼດຂໍ້ມູນ...' : 'ບໍ່ພົບຂໍ້ມູນ'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog for adding new product */}
      <ProductFormDialog
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        title="ເພີ່ມສິນຄ້າໃໝ່"
        product={currentProduct}
        onChange={handleChange}
        onSave={handleAddProduct}
      />

      {/* Dialog for editing product */}
      <ProductFormDialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        title="ແກ້ໄຂຂໍ້ມູນສິນຄ້າ"
        product={currentProduct}
        onChange={handleChange}
        onSave={handleSaveEdit}
      />

      {/* Dialog for confirming deletion */}
      <DeleteConfirmDialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteProduct}
        itemId={selectedProductId}
      />
    </Layout>
  );
}

export default Products;