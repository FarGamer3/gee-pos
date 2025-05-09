// src/components/DashboardCharts.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Grid,
  useTheme,
  Alert
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

const DashboardCharts = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [dailySalesData, setDailySalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [yearlyStats, setYearlyStats] = useState({
    totalSales: 0,
    totalPurchases: 0,
    totalProfit: 0
  });

  // ໂຫຼດຂໍ້ມູນເມື່ອ component ຖືກໂຫຼດ
  useEffect(() => {
    // ຈຳລອງການໂຫຼດຂໍ້ມູນ (ສົມມຸດວ່າກຳລັງໂຫຼດຈາກເຊີເວີ)
    setTimeout(() => {
      // 1. ສ້າງຂໍ້ມູນຍອດຂາຍລາຍມື້ສຳລັບ 7 ມື້ຫຼ້າສຸດ
      setDailySalesData(generateMockDailySales());
      
      // 2. ສ້າງຂໍ້ມູນປະເພດສິນຄ້າ
      setCategoryData(generateMockCategories());
      
      // 3. ສ້າງຂໍ້ມູນສິນຄ້າຂາຍດີ 5 ອັນດັບ
      setTopProducts(generateMockTopProducts());
      
      // 4. ສ້າງຂໍ້ມູນສະຖິຕິປະຈຳປີ
      setYearlyStats({
        totalSales: 37500000,
        totalPurchases: 25800000,
        totalProfit: 11700000
      });
      
      // ສຳເລັດການໂຫຼດຂໍ້ມູນ
      setLoading(false);
    }, 1000);
  }, []);

  // ຟັງຊັນສ້າງຂໍ້ມູນຍອດຂາຍລາຍມື້ແບບສົມມຸດ
  const generateMockDailySales = () => {
    const today = new Date();
    const dailyMockData = [];
    
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(today.getDate() - i);
      
      const dayName = day.toLocaleDateString('lo-LA', { weekday: 'short' });
      const dayOfMonth = day.getDate();
      
      dailyMockData.push({
        name: `${dayName} ${dayOfMonth}`,
        sales: Math.floor(Math.random() * 4000000) + 1000000,
        date: day.toISOString().split('T')[0]
      });
    }
    
    return dailyMockData;
  };

  // ຟັງຊັນສ້າງຂໍ້ມູນໝວດໝູ່ແບບສົມມຸດ
  const generateMockCategories = () => {
    return [
      { cat_id: 1, category: 'ແອ', count: 15 },
      { cat_id: 2, category: 'ຕູ້ເຢັນ', count: 12 },
      { cat_id: 3, category: 'ໂທລະທັດ', count: 8 },
      { cat_id: 4, category: 'ຈັກຊັກເຄື່ອງ', count: 10 },
      { cat_id: 5, category: 'ເຄື່ອງໃຊ້ໄຟຟ້າອື່ນໆ', count: 5 }
    ];
  };

  // ຟັງຊັນສ້າງຂໍ້ມູນສິນຄ້າຂາຍດີແບບສົມມຸດ
  const generateMockTopProducts = () => {
    return [
      { name: 'ແອ Samsung Wind-Free', value: 12 },
      { name: 'ຕູ້ເຢັນ Samsung Twin', value: 10 },
      { name: 'LG DUALCOOL Inverter', value: 8 },
      { name: 'ໂທລະທັດ LG Smart TV', value: 7 },
      { name: 'ຈັກຊັກເຄື່ອງ Samsung', value: 5 }
    ];
  };

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Format number with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Custom tooltip for sales chart
  const SalesToolTip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 2, boxShadow: 3, borderRadius: 2 }}>
          <Typography variant="subtitle2">{label}</Typography>
          <Typography variant="body2" color="primary">
            ຍອດຂາຍ: {formatNumber(payload[0].value)} ກີບ
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  // Custom tooltip for category chart
  const CategoryToolTip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 2, boxShadow: 3, borderRadius: 2 }}>
          <Typography variant="subtitle2">{payload[0].name}</Typography>
          <Typography variant="body2" color="primary">
            ຈຳນວນ: {payload[0].value} ລາຍການ
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* Daily Sales Chart (Past Week) */}
      <Grid item xs={12} md={8}>
        <Paper elevation={2} sx={{ p: 3, borderRadius: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            ຍອດຂາຍປະຈຳວັນ (7 ມື້ຫຼ້າສຸດ)
          </Typography>
          <Box sx={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={dailySalesData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => value / 1000000 + "M"} />
                <Tooltip content={<SalesToolTip />} />
                <Legend />
                <Bar
                  dataKey="sales"
                  name="ຍອດຂາຍ (ກີບ)"
                  fill={theme.palette.primary.main}
                  radius={[4, 4, 0, 0]} // Add rounded corners to the top of bars
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>
      
      {/* Product Categories Chart */}
      <Grid item xs={12} md={4}>
        <Paper elevation={2} sx={{ p: 3, borderRadius: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            ຈຳນວນສິນຄ້າແຍກຕາມປະເພດ
          </Typography>
          <Box sx={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="category"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CategoryToolTip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>
      
      {/* Additional Statistics */}
      <Grid item xs={12}>
        <Paper elevation={2} sx={{ p: 3, borderRadius: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            ສະຖິຕິເພີ່ມເຕີມ
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ 
              p: 3, 
              border: 1, 
              borderColor: 'divider', 
              borderRadius: 3, 
              flex: 1,
              minWidth: { xs: '100%', sm: '180px' },
              boxShadow: 1,
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 3
              }
            }}>
              <Typography variant="body2" color="text.secondary">
                ຍອດຂາຍທັງໝົດປີນີ້
              </Typography>
              <Typography variant="h5" color="primary.main" fontWeight="bold">
                {formatNumber(yearlyStats.totalSales)} ກີບ
              </Typography>
            </Box>
            
            <Box sx={{ 
              p: 3, 
              border: 1, 
              borderColor: 'divider', 
              borderRadius: 3, 
              flex: 1,
              minWidth: { xs: '100%', sm: '180px' },
              boxShadow: 1,
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 3
              }
            }}>
              <Typography variant="body2" color="text.secondary">
                ການສັ່ງຊື້ທັງໝົດປີນີ້
              </Typography>
              <Typography variant="h5" color="info.main" fontWeight="bold">
                {formatNumber(yearlyStats.totalPurchases)} ກີບ
              </Typography>
            </Box>
            
            <Box sx={{ 
              p: 3, 
              border: 1, 
              borderColor: 'divider', 
              borderRadius: 3, 
              flex: 1,
              minWidth: { xs: '100%', sm: '180px' },
              boxShadow: 1,
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 3
              }
            }}>
              <Typography variant="body2" color="text.secondary">
                ກຳໄລລວມ
              </Typography>
              <Typography variant="h5" color="success.main" fontWeight="bold">
                {formatNumber(yearlyStats.totalProfit)} ກີບ
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Grid>
      
      {/* Top Selling Products Section */}
      <Grid item xs={12}>
        <Paper elevation={2} sx={{ p: 3, borderRadius: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            ສິນຄ້າຂາຍດີ 5 ອັນດັບ
          </Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                layout="vertical"
                data={topProducts}
                margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="value" 
                  name="ຈຳນວນຂາຍ" 
                  fill={theme.palette.secondary.main}
                  radius={[0, 4, 4, 0]} // Add rounded corners to the right side of bars
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default DashboardCharts;