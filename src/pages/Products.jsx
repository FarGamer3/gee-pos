import React, { useState, useRef } from 'react';
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
  MenuItem
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { DeleteConfirmDialog } from '../components/ConfirmationDialog';

function Products() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([
    {
      id: 1,
      code: '000001',
      name: 'ຕູ້ເຢັນ',
      quantity: 50,
      minQuantity: 10,
      purchasePrice: 1000000,
      sellingPrice: 1250000,
      brand: 'samsung',
      type: 'ເຄື່ອງໃຊ້ໃນເຮືອນ',
      model: 'E32-SA',
      location: 'A-3',
      status: 'ພໍລະສາຍ',
    }
  ]);

  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  
  // Current product for editing
  // ໃຊ້ useRef ເພື່ອເກັບຄ່າຊົ່ວຄາວແລະປ້ອງກັນການ re-render ແຕ່ລະຄັ້ງທີ່ພິມ
  const productFormRef = React.useRef(null);
  
  const [currentProduct, setCurrentProduct] = useState({
    code: '',
    name: '',
    quantity: 0,
    minQuantity: 0,
    purchasePrice: 0,
    sellingPrice: 0,
    brand: '',
    type: '',
    model: '',
    location: '',
    status: '',
  });

  // ຟັງຊັນເປີດ dialog ເພີ່ມສິນຄ້າໃໝ່
  const handleOpenAddDialog = () => {
    const emptyProduct = {
      code: '',
      name: '',
      quantity: 0,
      minQuantity: 0,
      purchasePrice: 0,
      sellingPrice: 0,
      brand: '',
      type: '',
      model: '',
      location: '',
      status: '',
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

  // ຟັງຊັນບັນທຶກສິນຄ້າໃໝ່
  const handleAddProduct = () => {
    // ໃຊ້ຂໍ້ມູນຈາກ ref ເພື່ອບັນທຶກ
    const formData = productFormRef.current || currentProduct;
    
    const newProduct = {
      ...formData,
      id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1
    };
    
    setProducts([...products, newProduct]);
    setOpenAddDialog(false);
    productFormRef.current = null; // ລ້າງຂໍ້ມູນໃນ ref
    
    // ໃນກໍລະນີຈິງ, ສົ່ງຂໍ້ມູນໄປຍັງ API ເພື່ອບັນທຶກ
    console.log('Adding new product:', newProduct);
  };

  // ຟັງຊັນບັນທຶກການແກ້ໄຂສິນຄ້າ
  const handleSaveEdit = () => {
    // ໃຊ້ຂໍ້ມູນຈາກ ref ເພື່ອບັນທຶກ
    const formData = productFormRef.current || currentProduct;
    
    setProducts(products.map(p => p.id === currentProduct.id ? {...formData, id: currentProduct.id} : p));
    setOpenEditDialog(false);
    productFormRef.current = null; // ລ້າງຂໍ້ມູນໃນ ref
    
    // ໃນກໍລະນີຈິງ, ສົ່ງຂໍ້ມູນໄປຍັງ API ເພື່ອອັບເດດ
    console.log('Updating product:', formData);
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
  const handleDeleteProduct = (id) => {
    setProducts(products.filter(product => product.id !== id));
    setOpenDeleteDialog(false);
    setSelectedProductId(null);
    // ໃນກໍລະນີຈິງ, ສົ່ງຄຳຂໍລຶບໄປຍັງ API
    console.log('Deleting product with ID:', id);
  };

  // ຟັງຊັນຄົ້ນຫາ
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // ກັ່ນຕອງສິນຄ້າຕາມການຄົ້ນຫາ
  const filteredProducts = products.filter(product => {
    return (
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase())
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
                label="ລະຫັດສິນຄ້າ"
                name="code"
                defaultValue={product.code}
                name="code"
                onChange={onChange}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ຊື່ສິນຄ້າ"
                name="name"
                defaultValue={product.name}
                name="name"
                onChange={onChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ຈຳນວນ"
                name="quantity"
                type="number"
                defaultValue={product.quantity}
                name="quantity"
                onChange={onChange}
                required
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ຈຳນວນນ້ອຍສຸດ"
                name="minQuantity"
                type="number"
                defaultValue={product.minQuantity}
                name="minQuantity"
                onChange={onChange}
                required
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ລາຄາຕົ້ນທຶນ"
                name="purchasePrice"
                type="number"
                defaultValue={product.purchasePrice}
                name="purchasePrice"
                onChange={onChange}
                required
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ລາຄາຂາຍ"
                name="sellingPrice"
                type="number"
                defaultValue={product.sellingPrice}
                name="sellingPrice"
                onChange={onChange}
                required
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ຍີ່ຫໍ້"
                name="brand"
                defaultValue={product.brand}
                name="brand"
                onChange={onChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ລຸ້ນ"
                name="model"
                defaultValue={product.model}
                name="model"
                onChange={onChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="ປະເພດ"
                name="type"
                defaultValue={product.type}
                name="type"
                onChange={onChange}
                required
              >
                <MenuItem value="">ເລືອກປະເພດ</MenuItem>
                <MenuItem value="ເຄື່ອງໃຊ້ໄຟຟ້າ">ເຄື່ອງໃຊ້ໄຟຟ້າ</MenuItem>
                <MenuItem value="ເຄື່ອງໃຊ້ໃນເຮືອນ">ເຄື່ອງໃຊ້ໃນເຮືອນ</MenuItem>
                <MenuItem value="ອຸປະກອນອິເລັກໂທຣນິກ">ອຸປະກອນອິເລັກໂທຣນິກ</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ບ່ອນຈັດວາງ"
                name="location"
                defaultValue={product.location}
                name="location"
                onChange={onChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="ສະຖານະ"
                name="status"
                defaultValue={product.status}
                name="status"
                onChange={onChange}
                required
              >
                <MenuItem value="">ເລືອກສະຖານະ</MenuItem>
                <MenuItem value="ພໍລະສາຍ">ພໍລະສາຍ</MenuItem>
                <MenuItem value="ໝົດສາງ">ໝົດສາງ</MenuItem>
                <MenuItem value="ຍົກເລີກການຂາຍ">ຍົກເລີກການຂາຍ</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error" variant="outlined">
          ຍົກເລີກ
        </Button>
        <Button onClick={onSave} color="secondary" variant="contained">
          ບັນທຶກ
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Layout title="ຈັດການຂໍ້ມູນສິນຄ້າ">
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
          color="secondary"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
        >
          ເພີ່ມ
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 240px)', overflow: 'auto' }}>
        <Table stickyHeader sx={{ minWidth: 1100 }}>
          <TableHead>
            <TableRow>
              <TableCell align="center" width={50}>#</TableCell>
              <TableCell align="center" width={100}>ລະຫັດສິນຄ້າ</TableCell>
              <TableCell align="center" width={150}>ຊື່ສິນຄ້າ</TableCell>
              <TableCell align="center" width={80}>ຈຳນວນ</TableCell>
              <TableCell align="center" width={80}>ຈຳນວນນ້ອຍສຸດ</TableCell>
              <TableCell align="center" width={120}>ລາຄາຕົ້ນທຶນ</TableCell>
              <TableCell align="center" width={120}>ລາຄາຂາຍ</TableCell>
              <TableCell align="center" width={100}>ຍີ່ຫໍ້</TableCell>
              <TableCell align="center" width={120}>ປະເພດ</TableCell>
              <TableCell align="center" width={80}>ລຸ້ນ</TableCell>
              <TableCell align="center" width={80}>ບ່ອນຈັດວາງ</TableCell>
              <TableCell align="center" width={100}>ສະຖານະ</TableCell>
              <TableCell align="center" width={80}>ແກ້ໄຂ</TableCell>
              <TableCell align="center" width={80}>ລຶບ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.map((product, index) => (
              <TableRow key={product.id} hover>
                <TableCell align="center">{index + 1}</TableCell>
                <TableCell align="center">{product.code}</TableCell>
                <TableCell align="center">{product.name}</TableCell>
                <TableCell align="center">{product.quantity}</TableCell>
                <TableCell align="center">{product.minQuantity}</TableCell>
                <TableCell align="center">{product.purchasePrice.toLocaleString()}</TableCell>
                <TableCell align="center">{product.sellingPrice.toLocaleString()}</TableCell>
                <TableCell align="center">{product.brand}</TableCell>
                <TableCell align="center">{product.type}</TableCell>
                <TableCell align="center">{product.model}</TableCell>
                <TableCell align="center">{product.location}</TableCell>
                <TableCell align="center">{product.status}</TableCell>
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
                      onClick={() => handleOpenDeleteDialog(product.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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