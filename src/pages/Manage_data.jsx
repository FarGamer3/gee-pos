import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Avatar,
  Badge
} from '@mui/material';
import Layout from '../components/Layout';
import { getUserSubmenuPermissions } from '../services/roleService';
import { getLowStockProducts } from '../services/notificationService';

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
  const [lowStockCount, setLowStockCount] = useState(0);
  
  // Get the submenu permissions for the current user
  const userPermissions = getUserSubmenuPermissions();
  
  // ດຶງຂໍ້ມູນສິນຄ້າໃກ້ຈະໝົດເມື່ອ component ຖືກໂຫຼດ
  useEffect(() => {
    fetchLowStockCount();
    
    // ກຳນົດໃຫ້ດຶງຂໍ້ມູນທຸກໆ 60 ວິນາທີ
    const interval = setInterval(() => {
      fetchLowStockCount();
    }, 60000);
    
    // ຍົກເລີກ interval ເມື່ອ component ຖືກຖອດ
    return () => clearInterval(interval);
  }, []);
  
  // ຟັງຊັນດຶງຂໍ້ມູນຈຳນວນສິນຄ້າໃກ້ຈະໝົດ
  const fetchLowStockCount = async () => {
    try {
      const lowStockProducts = await getLowStockProducts();
      setLowStockCount(lowStockProducts.length);
    } catch (error) {
      console.error('Error fetching low stock count:', error);
    }
  };
  
  // Define all menu items with their permission keys
  const allMenuItems = [
    { 
      id: 'products', 
      title: 'ຂໍ້ມູນສິນຄ້າ', 
      icon: productIcon, 
      path: '/products', 
      permissionKey: 'products',
      badge: lowStockCount > 0 ? lowStockCount : null // ສະແດງການແຈ້ງເຕືອນ
    },
    { id: 'categories', title: 'ຂໍ້ມູນປະເພດ', icon: categoryIcon, path: '/categories', permissionKey: 'categories' },
    { id: 'units', title: 'ຂໍ້ມູນຍີ່ຫໍ້', icon: unitIcon, path: '/units', permissionKey: 'units' },
    { id: 'warehouse', title: 'ຂໍ້ມູນບ່ອນຈັດວາງ', icon: locationIcon, path: '/warehouse', permissionKey: 'warehouse' },
    { id: 'employee', title: 'ຂໍ້ມູນພະນັກງານ', icon: employeeIcon, path: '/employees', permissionKey: 'employees' },
    { id: 'suppliers', title: 'ຂໍ້ມູນຜູ້ສະໜອງ', icon: supplierIcon, path: '/suppliers', permissionKey: 'suppliers' },
    { id: 'customers', title: 'ຂໍ້ມູນລູກຄ້າ', icon: customerIcon, path: '/customers', permissionKey: 'customers' },
  ];
  
  // Filter menu items based on user permissions
  const menuItems = allMenuItems.filter(item => userPermissions.includes(item.permissionKey));

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
                position: 'relative', // ສຳລັບການວາງຕຳແໜ່ງ Badge
                '&:hover': {
                  bgcolor: 'primary.dark',
                  transform: 'translateY(-4px)',
                  transition: 'all 0.3s'
                }
              }}
            >
              {/* Badge ສະແດງການແຈ້ງເຕືອນ */}
              {item.badge && (
                <Badge 
                  badgeContent={item.badge} 
                  color="error"
                  sx={{
                    position: 'absolute',
                    top: 40,
                    right: 60,
                    zIndex: 1,
                    '& .MuiBadge-badge': {
                      fontSize: '0.7rem',
                      height: '36px',
                      minWidth: '36px',
                      padding: '0 6px',
                      fontWeight: 'bold'
                    }
                  }}
                >
                  <Box />
                </Badge>
              )}
              
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
                
                {/* ສະແດງຂໍ້ຄວາມແຈ້ງເຕືອນພິເສດສຳລັບສິນຄ້າໃກ້ຈະໝົດ */}
                {item.id === 'products' && lowStockCount > 0 && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      mt: 1, 
                      px: 1.5, 
                      py: 0.5, 
                      bgcolor: 'rgba(255, 255, 255, 0.2)', 
                      borderRadius: 1,
                      fontSize: '0.7rem'
                    }}
                  >
                    {lowStockCount} ລາຍການໃກ້ໝົດ
                  </Typography>
                )}
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Layout>
  );
}

export default ManageData;