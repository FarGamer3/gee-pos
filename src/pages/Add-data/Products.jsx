import React, { useState, useEffect, useMemo } from 'react';
import { getUserRole, ROLES } from '../../services/roleService';
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
  Close as CloseIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import {
  getAllProducts,
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
import axios from 'axios';

// Dialog ສຳລັບການເພີ່ມສິນຄ້າ - ແຍກອອກມາເປັນ component ພາຍນອກ
const AddProductDialog = ({ open, onClose, onSave, brands, categories, zones, loading }) => {
  // ເກັບ state ຂອງຟອມໄວ້ໃນ component ນີ້ເທົ່ານັ້ນ
  const [localForm, setLocalForm] = useState({
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

  // Reset ຟອມທຸກຄັ້ງທີ່ Dialog ເປີດໃໝ່
  useEffect(() => {
    if (open) {
      setLocalForm({
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
    }
  }, [open]);

  // ຈັດການກັບການປ່ຽນແປງພາຍໃນຟອມ
  const handleLocalChange = (e) => {
    const { name, value } = e.target;
    setLocalForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ກວດສອບຟອມກ່ອນສົ່ງ
  const handleSubmit = () => {
    // ແປງຂໍ້ມູນເປັນຮູບແບບທີ່ເໝາະສົມກ່ອນສົ່ງ
    const productToSave = {
      ProductName: localForm.ProductName,
      brand_id: parseInt(localForm.brand_id),
      cat_id: parseInt(localForm.cat_id),
      zone_id: parseInt(localForm.zone_id),
      pro_detail: localForm.pro_detail || '',
      qty: parseInt(localForm.qty) || 0,
      qty_min: parseInt(localForm.qty_min) || 0,
      cost_price: parseFloat(localForm.cost_price) || 0,
      retail_price: parseFloat(localForm.retail_price) || 0,
      status: localForm.status || 'Instock'
    };
    
    // ສົ່ງຂໍ້ມູນຄືນໄປໃຫ້ component ຫຼັກ
    onSave(productToSave);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        ເພີ່ມສິນຄ້າໃໝ່
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
                value={localForm.ProductName}
                onChange={handleLocalChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ຈຳນວນ"
                name="qty"
                type="number"
                value={localForm.qty}
                onChange={handleLocalChange}
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
                value={localForm.qty_min}
                onChange={handleLocalChange}
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
                value={localForm.cost_price}
                onChange={handleLocalChange}
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
                value={localForm.retail_price}
                onChange={handleLocalChange}
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
                value={localForm.brand_id}
                onChange={handleLocalChange}
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
                value={localForm.cat_id}
                onChange={handleLocalChange}
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
                value={localForm.zone_id}
                onChange={handleLocalChange}
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
                value={localForm.status}
                onChange={handleLocalChange}
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
                value={localForm.pro_detail}
                onChange={handleLocalChange}
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
        <Button onClick={handleSubmit} color="primary" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'ບັນທຶກ'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default Products;;

// Dialog ສຳລັບການແກ້ໄຂສິນຄ້າ - ແຍກອອກມາເປັນ component ພາຍນອກ
const EditProductDialog = ({ open, onClose, onSave, product, brands, categories, zones, loading }) => {
  // ເກັບ state ຂອງຟອມໄວ້ໃນ component ນີ້ເທົ່ານັ້ນ
  const [localForm, setLocalForm] = useState({
    proid: '',
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

  // ເມື່ອມີການເປີດ dialog ຫຼື product ປ່ຽນ, ໃຫ້ອັບເດດ form
  useEffect(() => {
    if (product && open) {
      console.log("Setting form data from:", product);
      setLocalForm({
        proid: product.proid,
        ProductName: product.ProductName || '',
        qty: parseInt(product.qty) || 0,
        qty_min: parseInt(product.qty_min) || 0,
        cost_price: parseInt(product.cost_price) || 0,
        retail_price: parseInt(product.retail_price) || 0,
        brand_id: product.brand_id ? product.brand_id.toString() : '',
        cat_id: product.cat_id ? product.cat_id.toString() : '',
        zone_id: product.zone_id ? product.zone_id.toString() : '',
        pro_detail: product.pro_detail || '',
        status: product.status || 'Instock'
      });
    }
  }, [open, product]);

  // ຈັດການກັບການປ່ຽນແປງພາຍໃນຟອມ
  const handleLocalChange = (e) => {
    const { name, value } = e.target;
    setLocalForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ກວດສອບຟອມກ່ອນສົ່ງ
  const handleSubmit = () => {
    // ແປງຂໍ້ມູນເປັນຮູບແບບທີ່ເໝາະສົມກ່ອນສົ່ງ
    const productToUpdate = {
      proid: localForm.proid,
      ProductName: localForm.ProductName,
      brand_id: parseInt(localForm.brand_id),
      cat_id: parseInt(localForm.cat_id),
      zone_id: parseInt(localForm.zone_id),
      pro_detail: localForm.pro_detail || '',
      qty: parseInt(localForm.qty),
      qty_min: parseInt(localForm.qty_min),
      cost_price: parseInt(localForm.cost_price),
      retail_price: parseInt(localForm.retail_price),
      status: localForm.status
    };
    
    // ສົ່ງຂໍ້ມູນຄືນໄປໃຫ້ component ຫຼັກ
    onSave(productToUpdate);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        ແກ້ໄຂຂໍ້ມູນສິນຄ້າ
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
                value={localForm.ProductName}
                onChange={handleLocalChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ຈຳນວນ"
                name="qty"
                type="number"
                value={localForm.qty}
                onChange={handleLocalChange}
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
                value={localForm.qty_min}
                onChange={handleLocalChange}
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
                value={localForm.cost_price}
                onChange={handleLocalChange}
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
                value={localForm.retail_price}
                onChange={handleLocalChange}
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
                value={localForm.brand_id}
                onChange={handleLocalChange}
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
                value={localForm.cat_id}
                onChange={handleLocalChange}
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
                value={localForm.zone_id}
                onChange={handleLocalChange}
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
                value={localForm.status}
                onChange={handleLocalChange}
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
                value={localForm.pro_detail}
                onChange={handleLocalChange}
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
        <Button onClick={handleSubmit} color="primary" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'ບັນທຶກ'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ປັບປຸງຟັງຊັນໃນ Products component
function Products() {
  // ຕົວແປຄົ້ນຫາແລະສະຖານະການໂຫຼດ
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // ຂໍ້ມູນທັງໝົດ
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [zones, setZones] = useState([]);
  
  // ສະຖານະ Dialog
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

    // Get the current user's role
    const userRole = getUserRole();

    const canEditProducts = () => {
      // Only ADMIN and USER2 can edit products, USER1 cannot
      return userRole === ROLES.ADMIN || userRole === ROLES.USER2;
    };
  
  // ສະຖານະແຈ້ງເຕືອນ
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // ເຮັດການໂຫຼດຂໍ້ມູນທັງໝົດເມື່ອເລີ່ມຕົ້ນ
  useEffect(() => {
    fetchAllData();
  }, []);

  // ຟັງຊັນໂຫຼດຂໍ້ມູນທັງໝົດ
  const fetchAllData = async () => {
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
  
  // ຟັງຊັນໂຫຼດຂໍ້ມູນສິນຄ້າເທົ່ານັ້ນ
  const fetchProductsOnly = async () => {
    try {
      setLoading(true);
      const productsData = await getAllProducts();
      setProducts(productsData || []);
      showSnackbar('ໂຫຼດຂໍ້ມູນສຳເລັດແລ້ວ', 'success');
    } catch (err) {
      showSnackbar('ບໍ່ສາມາດດຶງຂໍ້ມູນສິນຄ້າໃໝ່ໄດ້', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ຟັງຊັນຄົ້ນຫາສິນຄ້າ
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // ເປີດ dialog ເພີ່ມສິນຄ້າ
  const handleOpenAddDialog = () => {
    if (!canEditProducts()) {
      showSnackbar('ທ່ານບໍ່ມີສິດໃນການເພີ່ມຂໍ້ມູນສິນຄ້າ', 'error');
      return;
    }
    setOpenAddDialog(true);
  };

  // ປິດ dialog ເພີ່ມສິນຄ້າ
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  // ເປີດ dialog ແກ້ໄຂສິນຄ້າ
  const handleOpenEditDialog = (product) => {

    if (!canEditProducts()) {
      showSnackbar('ທ່ານບໍ່ມີສິດໃນການແກ້ໄຂຂໍ້ມູນສິນຄ້າ', 'error');
      return;
    }
    // ຕ້ອງແນ່ໃຈວ່າມີຂໍ້ມູນທຸກຟິລດ໌ທີ່ຕ້ອງການ
    console.log("Opening dialog with product:", product);
    
    
    // ກວດສອບແລະຮັບປະກັນວ່າມີທຸກຄ່າ
    const preparedProduct = {
      ...product,
      // ແນ່ໃຈວ່າມີ product.brand_id, product.cat_id, product.zone_id
      brand_id: product.brand_id || (brands.length > 0 ? brands[0].brand_id : ''),
      cat_id: product.cat_id || (categories.length > 0 ? categories[0].cat_id : ''),
      zone_id: product.zone_id || (zones.length > 0 ? zones[0].zone_id : '')
    };
    
    setSelectedProduct(preparedProduct);
    setOpenEditDialog(true);
  };

  // ປິດ dialog ແກ້ໄຂສິນຄ້າ
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedProduct(null);
  };

  // ເປີດ dialog ຍືນຢັນການລຶບສິນຄ້າ
  const handleOpenDeleteDialog = (id) => {
    if (!canEditProducts()) {
      showSnackbar('ທ່ານບໍ່ມີສິດໃນການລຶບຂໍ້ມູນສິນຄ້າ', 'error');
      return;
    }
    setSelectedProductId(id);
    setOpenDeleteDialog(true);
  };

  // ປິດ dialog ຍືນຢັນການລຶບສິນຄ້າ
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedProductId(null);
  };

  // ຟັງຊັນບັນທຶກສິນຄ້າໃໝ່ (ຮັບຂໍ້ມູນຈາກ AddProductDialog)
  const handleAddProduct = async (productData) => {
    try {
      setLoading(true);
      
      // ກວດສອບຂໍ້ມູນກ່ອນບັນທຶກ
      if (!productData.ProductName || !productData.brand_id || !productData.cat_id || !productData.zone_id) {
        showSnackbar('ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ', 'error');
        setLoading(false);
        return;
      }
  
      const result = await addProduct(productData);
      
      if (result && (result.result_code === "200" || result.result_code === "201")) {
        await fetchProductsOnly();
        setOpenAddDialog(false);
        showSnackbar('ເພີ່ມສິນຄ້າສຳເລັດແລ້ວ', 'success');
      } else {
        throw new Error(result?.result || 'Failed to add product');
      }
    } catch (err) {
      console.error('Error adding product:', err);
      showSnackbar(err.response?.data?.result || 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ຟັງຊັນບັນທຶກການແກ້ໄຂສິນຄ້າ (ຮັບຂໍ້ມູນຈາກ EditProductDialog)
  const handleSaveEdit = async (productData) => {
    try {
      setLoading(true);
      
      // ກວດສອບຂໍ້ມູນກ່ອນບັນທຶກ
      if (!productData.proid || !productData.ProductName) {
        showSnackbar('ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ', 'error');
        setLoading(false);
        return;
      }
      
      const response = await axios.put('http://localhost:4422/Update/Product', productData);
      
      if (response.data && response.data.result_code === "200") {
        await fetchProductsOnly();
        setOpenEditDialog(false);
        showSnackbar('ແກ້ໄຂສິນຄ້າສຳເລັດແລ້ວ', 'success');
      } else {
        throw new Error(response.data?.result || 'ການອັບເດດລົ້ມເຫຼວ');
      }
    } catch (err) {
      console.error('Error saving edit:', err);
      showSnackbar(err.response?.data?.result || err.message || 'ເກີດຂໍ້ຜິດພາດໃນການແກ້ໄຂຂໍ້ມູນ', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ຟັງຊັນລຶບສິນຄ້າ
  const handleDeleteProduct = async (id) => {
    try {
      setLoading(true);
      
      const result = await deleteProduct(id);
      
      if (result && result.result_code === "200") {
        // ອັບເດດລາຍການສິນຄ້າໂດຍລຶບສິນຄ້າທີ່ໄດ້ລຶບແລ້ວອອກຈາກ state
        setProducts(prevProducts => prevProducts.filter(product => product.proid !== id));
        setOpenDeleteDialog(false);
        showSnackbar('ລຶບສິນຄ້າສຳເລັດແລ້ວ', 'success');
      } else {
        // ໃນກໍລະນີທີ່ລຶບບໍ່ສຳເລັດໃຫ້ດຶງຂໍ້ມູນຄືນໃໝ່ເພື່ອຮັກສາຄວາມຖືກຕ້ອງຂອງຂໍ້ມູນ
        await fetchProductsOnly();
        throw new Error(result?.result || 'Failed to delete product');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      
      // ກໍລະນີເກີດ error ແຕ່ອາດຈະລຶບສຳເລັດໃນຝັ່ງ server ໃຫ້ດຶງຂໍ້ມູນຄືນໃໝ່
      if (err.message && err.message.includes('Delete Success')) {
        await fetchProductsOnly();
        showSnackbar('ລຶບສິນຄ້າສຳເລັດແລ້ວ ແຕ່ມີຂໍ້ຜິດພາດໃນການສະແດງຜົນ', 'warning');
      } else {
        showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການລຶບຂໍ້ມູນ', 'error');
        // ດຶງຂໍ້ມູນຄືນໃໝ່ເພື່ອໃຫ້ແນ່ໃຈວ່າຂໍ້ມູນທີ່ສະແດງເປັນປັດຈຸບັນທີ່ສຸດ
        await fetchProductsOnly();
      }
    } finally {
      setLoading(false);
      setSelectedProductId(null);
      setOpenDeleteDialog(false);
    }
  };

  // ຟັງຊັນສະແດງແຈ້ງເຕືອນ
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // ຟັງຊັນປິດແຈ້ງເຕືອນ
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // ກຳນົດຂໍ້ມູນສິນຄ້າໃນການຄົ້ນຫາ
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      return (
        product.ProductName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });
  }, [products, searchTerm]);



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
        
        <Box>
          <Button
            variant="outlined"
            color="info"
            startIcon={<RefreshIcon />}
            onClick={fetchProductsOnly}
            sx={{ mr: 1 }}
          >
            ໂຫຼດຄືນໃໝ່
          </Button>
          {canEditProducts() && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenAddDialog}
            >
              ເພີ່ມສິນຄ້າ
            </Button>
          )}
        </Box>
      </Box>

      {loading && !openAddDialog && !openEditDialog && !openDeleteDialog ? (
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

      {/* Dialog ເພີ່ມສິນຄ້າໃໝ່ */}
      <AddProductDialog
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        onSave={handleAddProduct}
        brands={brands}
        categories={categories}
        zones={zones}
        loading={loading}
      />

      {/* Dialog ແກ້ໄຂສິນຄ້າ */}
      <EditProductDialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        onSave={handleSaveEdit}
        product={selectedProduct}
        brands={brands}
        categories={categories}
        zones={zones}
        loading={loading}
      />

      {/* Dialog ຢືນຢັນການລຶບ */}
      <DeleteConfirmDialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteProduct}
        itemId={selectedProductId}
      />
    </Layout>
  );
}