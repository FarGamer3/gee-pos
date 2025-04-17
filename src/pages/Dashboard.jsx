import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import Layout from '../components/Layout';
import {
  Inventory as InventoryIcon,
  MoveToInbox as ImportIcon,
  LocalShipping as ExportIcon,
  ShoppingCart as PurchaseIcon,
  Storefront as SalesIcon,
  People as StaffIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import axios from 'axios';
import API_BASE_URL from '../config/api';


function Dashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    importedItems: 0,
    exportedItems: 0,
    purchases: 0,
    sales: 0,
    staffCount: { admin: 0, users: 0 },
    lowStockItems: [] // For products below minimum stock level
  });

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // This would be replaced with actual API calls in a real application
        const [productsResponse, lowStockResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/All/Product`),
          axios.get(`${API_BASE_URL}/All/Min/Product`)
        ]);

        // Get all products
        let products = [];
        if (productsResponse.data && productsResponse.data.result_code === "200") {
          products = productsResponse.data.products || [];
        }

        // Get low stock products
        let lowStockItems = [];
        if (lowStockResponse.data && lowStockResponse.data.result_code === "200") {
          lowStockItems = lowStockResponse.data.products || [];
        }

        // For this example, we'll simulate some data
        // In a real app, you would make additional API calls to get this information
        setDashboardData({
          totalProducts: products.length,
          importedItems: 43,
          exportedItems: 18,
          purchases: 65,
          sales: 87,
          staffCount: { admin: 1, users: 4 },
          lowStockItems
        });

        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("ບໍ່ສາມາດດຶງຂໍ້ມູນໄດ້. ກະລຸນາລອງໃໝ່ອີກຄັ້ງ.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // InfoCard Component with enhanced styling
  const InfoCard = ({ title, value, icon: Icon, color = "primary.main", onClick }) => {
    return (
      <Card 
        elevation={2} 
        sx={{ 
          height: '100%',
          transition: 'transform 0.3s, box-shadow 0.3s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 6,
            cursor: onClick ? 'pointer' : 'default'
          }
        }}
        onClick={onClick}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {title}
              </Typography>
              <Typography variant="h4" component="div" fontWeight="bold">
                {value}
              </Typography>
            </Box>
            <Box
              sx={{
                width: 56,
                height: 56,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: `${color}15`, // Light background based on the icon color
                borderRadius: '50%',
                color: color
              }}
            >
              <Icon sx={{ fontSize: 32 }} />
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Low Stock Alert Card
  const LowStockAlert = ({ lowStockItems }) => {
    if (!lowStockItems || lowStockItems.length === 0) {
      return (
        <Alert severity="success" sx={{ mt: 2 }}>
          ທຸກສິນຄ້າມີຈຳນວນພຽງພໍໃນສາງ
        </Alert>
      );
    }

    return (
      <Card elevation={2} sx={{ mt: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <WarningIcon color="warning" sx={{ mr: 1 }} />
            <Typography variant="h6">ສິນຄ້າໃກ້ໝົດສາງ</Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ 
            maxHeight: 200, 
            overflowY: 'auto', 
            pr: 1,
            '&::-webkit-scrollbar': {
              width: '6px',
              backgroundColor: '#F5F5F5'
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#BDBDBD',
              borderRadius: '10px'
            }
          }}>
            {lowStockItems.map((item, index) => (
              <Box 
                key={item.proid} 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  py: 1,
                  borderBottom: index !== lowStockItems.length - 1 ? '1px solid #eee' : 'none'
                }}
              >
                <Typography variant="body2">{item.ProductName}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    {item.qty} / {item.qty_min}
                  </Typography>
                  <Chip 
                    size="small" 
                    label={item.qty <= 0 ? "ໝົດ" : "ໃກ້ໝົດ"} 
                    color={item.qty <= 0 ? "error" : "warning"} 
                    sx={{ height: 24 }} 
                  />
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Layout title="ໜ້າຫຼັກ">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="ໜ້າຫຼັກ">
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Layout>
    );
  }

  return (
    <Layout title="ໜ້າຫຼັກ">
      <Box sx={{ mb: 3 }}>
        <Paper 
          sx={{ 
            p: 2, 
            bgcolor: 'primary.main', 
            color: 'white',
            borderRadius: 1,
            boxShadow: 2
          }}
        >
          <Typography variant="h6">
            ຂໍ້ມູນສິນຄ້າ ແລະ ສະຖະຕິຂອງຮ້ານ
          </Typography>
        </Paper>
      </Box>

      <Grid container spacing={3}>
        {/* First row */}
        <Grid item xs={12} sm={6} md={4}>
          <InfoCard 
            title="ຈຳນວນສິນຄ້າທັງໜົດ" 
            value={dashboardData.totalProducts.toString()} 
            icon={InventoryIcon} 
            color={theme.palette.primary.main}
            onClick={() => window.location.href = "/products"}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <InfoCard 
            title="ສິນຄ້ານຳເຂົ້າ" 
            value={dashboardData.importedItems.toString()} 
            icon={ImportIcon} 
            color={theme.palette.success.main}
            onClick={() => window.location.href = "/import"}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <InfoCard 
            title="ສິນຄ້ານຳອອກ" 
            value={dashboardData.exportedItems.toString()} 
            icon={ExportIcon} 
            color={theme.palette.warning.main}
            onClick={() => window.location.href = "/export"}
          />
        </Grid>

        {/* Second row */}
        <Grid item xs={12} sm={6} md={4}>
          <InfoCard 
            title="ສັັ່ງຊື້ສິນຄ້າ" 
            value={dashboardData.purchases.toString()} 
            icon={PurchaseIcon} 
            color={theme.palette.info.main}
            onClick={() => window.location.href = "/Buy"}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <InfoCard 
            title="ຂາຍສິນຄ້າ" 
            value={dashboardData.sales.toString()} 
            icon={SalesIcon} 
            color="#FF5722" // Deep orange
            onClick={() => window.location.href = "/sales"}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <InfoCard 
            title="ພະນັກງານ" 
            value={`Admin ${dashboardData.staffCount.admin} : user ${dashboardData.staffCount.users}`} 
            icon={StaffIcon} 
            color="#9C27B0" // Purple
            onClick={() => window.location.href = "/employees"}
          />
        </Grid>

        {/* Low stock alerts section */}
        <Grid item xs={12}>
          <LowStockAlert lowStockItems={dashboardData.lowStockItems} />
        </Grid>
        
      </Grid>
    </Layout>
  );
}

export default Dashboard;