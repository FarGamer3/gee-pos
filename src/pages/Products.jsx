import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Avatar,
  IconButton,
  InputAdornment,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';

function Products() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([
    {
      id: 1,
      image: '/src/assets/products/refrigerator.png',
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

  // ຟັງຊັນເພີ່ມສິນຄ້າໃໝ່
  const handleAddProduct = () => {
    navigate('/add-product');
  };

  // ຟັງຊັນແກ້ໄຂສິນຄ້າ
  const handleEditProduct = (id) => {
    navigate(`/edit-product/${id}`);
  };

  // ຟັງຊັນລຶບສິນຄ້າ
  const handleDeleteProduct = (id) => {
    if (window.confirm('ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບສິນຄ້ານີ້?')) {
      setProducts(products.filter(product => product.id !== id));
    }
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
          onClick={handleAddProduct}
        >
          ເພີ່ມ
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 240px)', overflow: 'auto' }}>
        <Table stickyHeader sx={{ minWidth: 1200 }}>
          <TableHead>
            <TableRow>
              <TableCell align="center" width={50}>#</TableCell>
              <TableCell align="center" width={80}>ຮູບສິນຄ້າ</TableCell>
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
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Avatar
                      src={product.image}
                      alt={product.name}
                      variant="square"
                      sx={{ width: 40, height: 40 }}
                    />
                  </Box>
                </TableCell>
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
                      onClick={() => handleEditProduct(product.id)}
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
                      onClick={() => handleDeleteProduct(product.id)}
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
    </Layout>
  );
}

export default Products;