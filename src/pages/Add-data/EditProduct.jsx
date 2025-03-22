import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Typography,
  MenuItem,
  Stack,
  IconButton
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import Layout from '../../components/Layout';

function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [product, setProduct] = useState({
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
    image: null
  });
  
  const [imagePreview, setImagePreview] = useState(null);
  
  // ຈຳລອງການດຶງຂໍ້ມູນຈາກ API (ໃນກໍລະນີຈິງຄວນໃຊ້ API)
  useEffect(() => {
    // ກໍລະນີຈິງ: ຄວນໃຊ້ fetch ຫຼື axios ເພື່ອດຶງຂໍ້ມູນຈາກ API
    // ຕົວຢ່າງ: fetch(`/api/products/${id}`).then(res => res.json()).then(data => setProduct(data))
    
    // ຂໍ້ມູນຕົວຢ່າງສຳລັບການທົດສອບ
    const mockProduct = {
      id: parseInt(id),
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
      image: '/src/assets/products/refrigerator.png'
    };
    
    setProduct(mockProduct);
    
    // ກໍລະນີທີ່ມີຮູບພາບແລ້ວ, ສະແດງຮູບພາບເດີມ
    if (mockProduct.image) {
      setImagePreview(mockProduct.image);
    }
  }, [id]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({
      ...product,
      [name]: value
    });
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProduct({
        ...product,
        image: file
      });
      
      // ສ້າງ URL ສຳລັບສະແດງຮູບພາບ preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // ໃນກໍລະນີຈິງ, ສົ່ງຂໍ້ມູນໄປຍັງ API ເພື່ອອັບເດດ
    console.log('Updating product:', product);
    
    // ກັບໄປຍັງໜ້າຈັດການສິນຄ້າ
    navigate('/products');
  };
  
  return (
    <Layout title="ແກ້ໄຂຂໍ້ມູນສິນຄ້າ">
      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* ຕັດອອກ Image upload section */}

            {/* Form fields */}
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="ລະຫັດສິນຄ້າ"
                    name="code"
                    value={product.code}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="ຊື່ສິນຄ້າ"
                    name="name"
                    value={product.name}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="ຈຳນວນ"
                    name="quantity"
                    type="number"
                    value={product.quantity}
                    onChange={handleChange}
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
                    value={product.minQuantity}
                    onChange={handleChange}
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
                    value={product.purchasePrice}
                    onChange={handleChange}
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
                    value={product.sellingPrice}
                    onChange={handleChange}
                    required
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="ຍີ່ຫໍ້"
                    name="brand"
                    value={product.brand}
                    onChange={handleChange}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="ລຸ້ນ"
                    name="model"
                    value={product.model}
                    onChange={handleChange}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="ປະເພດ"
                    name="type"
                    value={product.type}
                    onChange={handleChange}
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
                    value={product.location}
                    onChange={handleChange}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="ສະຖານະ"
                    name="status"
                    value={product.status}
                    onChange={handleChange}
                    required
                  >
                    <MenuItem value="">ເລືອກສະຖານະ</MenuItem>
                    <MenuItem value="ພໍລະສາຍ">ພໍລະສາຍ</MenuItem>
                    <MenuItem value="ໝົດສາງ">ໝົດສາງ</MenuItem>
                    <MenuItem value="ຍົກເລີກການຂາຍ">ຍົກເລີກການຂາຍ</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button 
              variant="outlined" 
              color="error" 
              onClick={() => navigate('/products')}
            >
              ຍົກເລີກ
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="secondary"
            >
              ບັນທຶກການປ່ຽນແປງ
            </Button>
          </Box>
        </Box>
      </Paper>
    </Layout>
  );
}

export default EditProduct;