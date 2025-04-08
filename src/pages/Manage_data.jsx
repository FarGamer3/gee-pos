import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Avatar
} from '@mui/material';
import Layout from '../components/Layout';

// Import icons
import productIcon from '../assets/icon/product.png';
import categoryIcon from '../assets/icon/category.png';
import unitIcon from '../assets/icon/unit.png';
import supplierIcon from '../assets/icon/supplier.png';
import employeeIcon from '../assets/icon/employee.png';
import customerIcon from '../assets/icon/customer.png';
import locationIcon from '../assets/icon/position.png';

function ManageData() {
  const navigate = useNavigate();
  
  // Menu item data - removed village, city, province items
  const menuItems = [
    { id: 'products', title: 'ຂໍ້ມູນສິນຄ້າ', icon: productIcon, path: '/products' },
    { id: 'categories', title: 'ຂໍ້ມູນປະເພດ', icon: categoryIcon, path: '/categories' },
    { id: 'units', title: 'ຂໍ້ມູນຍີ່ຫໍ້', icon: unitIcon, path: '/units' },
    { id: 'warehouse', title: 'ຂໍ້ມູນບ່ອນຈັດວາງ', icon: locationIcon, path: '/warehouse' },
    { id: 'employee', title: 'ຂໍ້ມູນພະນັກງານ', icon: employeeIcon, path: '/employees' },
    { id: 'suppliers', title: 'ຂໍ້ມູນຜູ້ສະໜອງ', icon: supplierIcon, path: '/suppliers' },
    { id: 'customers', title: 'ຂໍ້ມູນລູກຄ້າ', icon: customerIcon, path: '/customers' },
  ];

  return (
    <Layout title="ຈັດການຂໍ້ມູນຫຼັກ">
      <Box sx={{ mb: 3 }}>
        <Paper 
          sx={{ 
            p: 2, 
            bgcolor: 'primary.main', 
            color: 'white',
            borderRadius: 1
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            ຈັດການຂໍ້ມູນຕ່າງໆ
          </Typography>
        </Paper>
      </Box>

      <Grid container spacing={4}>
        {menuItems.map((item) => (
          <Grid item xs={6} sm={4} md={3} lg={2.4} key={item.id}>
            <Card 
              sx={{ 
                bgcolor: 'primary.main',
                color: 'white',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                '&:hover': {
                  bgcolor: 'primary.dark',
                  transform: 'translateY(-4px)',
                  transition: 'all 0.3s'
                }
              }}
            >
              <CardActionArea 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 3
                }}
                onClick={() => navigate(item.path)}
              >
                <Avatar
                  src={item.icon}
                  alt={item.title}
                  sx={{
                    width: 80,
                    height: 80,
                    p: 1.5,
                    mb: 2
                  }}
                />
                <Typography variant="h6" component="div" align="center" sx={{ mt: 1 }}>
                  {item.title}
                </Typography>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Layout>
  );
}

export default ManageData;