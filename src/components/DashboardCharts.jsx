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
import axios from 'axios';
import API_BASE_URL from '../config/api';

const DashboardCharts = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dailySalesData, setDailySalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [yearlyStats, setYearlyStats] = useState({
    totalSales: 0,
    totalPurchases: 0,
    totalProfit: 0
  });

  // ດຶງຂໍ້ມູນເມື່ອ component ຖືກໂຫຼດ
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // ເລີ່ມດຶງຂໍ້ມູນຈາກ API ທັງໝົດພ້ອມກັນ
        const [
          salesResponse,
          categoriesResponse,
          productsResponse,
          productsWithSalesResponse
        ] = await Promise.all([
          fetchSalesData(),
          fetchCategoryData(),
          fetchAllProducts(),
          fetchProductSales()
        ]);
        
        // ຕັ້ງຄ່າຂໍ້ມູນທີ່ໄດ້ມາ
        setDailySalesData(salesResponse);
        setCategoryData(categoriesResponse);
        setTopProducts(productsWithSalesResponse);
        
        // ຄິດໄລ່ສະຖິຕິປະຈຳປີ
        calculateYearlyStats(salesResponse);
        
        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("ບໍ່ສາມາດດຶງຂໍ້ມູນສະຖິຕິໄດ້. ກະລຸນາລອງໃໝ່ອີກຄັ້ງ.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // ຟັງຊັນດຶງຂໍ້ມູນຍອດຂາຍປະຈຳວັນ
  const fetchSalesData = async () => {
    try {
      // ຊ່ວງເວລາ 7 ມື້ຍ້ອນຫຼັງ
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 6); // 7 days including today
      
      // ຮູບແບບວັນທີ YYYY-MM-DD ສຳລັບ API
      const formatDate = (date) => {
        return date.toISOString().split('T')[0];
      };
      
      // ສ້າງຊຸດຂໍ້ມູນວັນທີທີ່ຕ້ອງການ
      const dateRange = [];
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        dateRange.push({
          date: formatDate(currentDate),
          name: currentDate.toLocaleDateString('lo-LA', { weekday: 'short', day: 'numeric' }),
          sales: 0 // ຕັ້ງຄ່າເລີ່ມຕົ້ນເປັນ 0
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // ດຶງຂໍ້ມູນການຂາຍທັງໝົດ
      const response = await axios.get(`${API_BASE_URL}/sale/All/Sales`);
      
      if (response.data && response.data.result_code === "200" && response.data.sales_data) {
        const salesData = response.data.sales_data;
        
        // ຄິດໄລ່ຍອດຂາຍແຕ່ລະມື້
        salesData.forEach(sale => {
          const saleDate = formatDate(new Date(sale.date_sale));
          const dateIndex = dateRange.findIndex(item => item.date === saleDate);
          
          if (dateIndex >= 0) {
            dateRange[dateIndex].sales += parseFloat(sale.subtotal || 0);
          }
        });
      }
      
      return dateRange;
    } catch (error) {
      console.error("Error fetching sales data:", error);
      // ໃນກໍລະນີຂັດຂ້ອງ, ສົ່ງຄືນຂໍ້ມູນວ່າງເປົ່າ
      return [];
    }
  };

  // ຟັງຊັນດຶງຂໍ້ມູນສິນຄ້າທັງໝົດພ້ອມໝວດໝູ່
  const fetchAllProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/All/Product`);
      
      if (response.data && response.data.result_code === "200" && response.data.products) {
        return response.data.products;
      }
      
      return [];
    } catch (error) {
      console.error("Error fetching products data:", error);
      return [];
    }
  };

  // ຟັງຊັນດຶງຂໍ້ມູນໝວດໝູ່ສິນຄ້າ
  const fetchCategoryData = async () => {
    try {
      // ດຶງຂໍ້ມູນສິນຄ້າທີ່ມີຂໍ້ມູນໝວດໝູ່ຮຽບຮ້ອຍແລ້ວ
      const response = await axios.get(`${API_BASE_URL}/All/Product`);
      
      if (response.data && response.data.result_code === "200" && response.data.products) {
        const products = response.data.products;
        console.log("Products with categories:", products);
        
        // ສ້າງການນັບຈຳນວນສິນຄ້າຕາມແຕ່ລະປະເພດ
        const categoryCounts = {};
        
        // ນັບສິນຄ້າຕາມແຕ່ລະປະເພດ
        products.forEach(product => {
          const categoryName = product.category || 'ບໍ່ມີໝວດໝູ່';
          
          if (!categoryCounts[categoryName]) {
            categoryCounts[categoryName] = {
              name: categoryName,
              count: 0
            };
          }
          
          categoryCounts[categoryName].count += 1;
        });
        
        // ແປງຈາກ object ເປັນ array ເພື່ອໃຊ້ງານໃນແຜນພູມ
        let categoryData = Object.values(categoryCounts);
        
        // ຈັດລຽງຂໍ້ມູນຕາມຈຳນວນຈາກຫຼາຍໄປຫານ້ອຍ
        categoryData = categoryData.sort((a, b) => b.count - a.count);
        
        console.log("Processed category data for chart:", categoryData);
        return categoryData;
      }
      
      return [];
    } catch (error) {
      console.error("Error fetching category data:", error);
      return [];
    }
  };

  // ຟັງຊັນດຶງຂໍ້ມູນສິນຄ້າຂາຍດີ
  const fetchProductSales = async () => {
    try {
      // ດຶງຂໍ້ມູນການຂາຍທັງໝົດ
      const salesResponse = await axios.get(`${API_BASE_URL}/sale/All/Sales`);
      
      if (!salesResponse.data || salesResponse.data.result_code !== "200" || !salesResponse.data.sales_data) {
        return [];
      }
      
      const sales = salesResponse.data.sales_data;
      const productSalesMap = new Map();
      
      // ດຶງຂໍ້ມູນລາຍລະອຽດຂອງແຕ່ລະການຂາຍ
      for (const sale of sales) {
        try {
          const detailsResponse = await axios.post(`${API_BASE_URL}/sale/Sale/Details`, {
            sale_id: sale.sale_id
          });
          
          if (detailsResponse.data && detailsResponse.data.result_code === "200" && detailsResponse.data.sale_details) {
            const saleDetails = detailsResponse.data.sale_details;
            
            // ນັບຈຳນວນຂາຍຂອງແຕ່ລະສິນຄ້າ
            saleDetails.forEach(detail => {
              const { proid, product_name, qty } = detail;
              if (!productSalesMap.has(proid)) {
                productSalesMap.set(proid, { 
                  proid,
                  name: product_name,
                  value: 0
                });
              }
              
              const product = productSalesMap.get(proid);
              product.value += parseInt(qty || 0);
              productSalesMap.set(proid, product);
            });
          }
        } catch (error) {
          console.error(`Error fetching details for sale #${sale.sale_id}:`, error);
        }
      }
      
      // ປ່ຽນເປັນລາຍການແລະຈັດລຽງຕາມຈຳນວນການຂາຍຈາກຫຼາຍໄປຫານ້ອຍ
      const topProductsList = Array.from(productSalesMap.values())
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // ເອົາພຽງ 5 ອັນດັບສູງສຸດ
      
      return topProductsList;
    } catch (error) {
      console.error("Error fetching product sales data:", error);
      return [];
    }
  };

  // ຟັງຊັນຄິດໄລ່ສະຖິຕິປະຈຳປີ
  const calculateYearlyStats = async (salesData) => {
    try {
      // ຄິດໄລ່ຍອດຂາຍທັງໝົດ
      const totalSales = salesData.reduce((total, day) => total + day.sales, 0);
      
      // ສົມມຸດວ່າຕົ້ນທຶນປະມານ 70% ຂອງຍອດຂາຍ
      const totalPurchases = Math.round(totalSales * 0.7);
      
      // ກຳໄລ = ຍອດຂາຍ - ຕົ້ນທຶນ
      const totalProfit = totalSales - totalPurchases;
      
      setYearlyStats({
        totalSales,
        totalPurchases,
        totalProfit
      });
    } catch (error) {
      console.error("Error calculating yearly stats:", error);
      setYearlyStats({
        totalSales: 0,
        totalPurchases: 0,
        totalProfit: 0
      });
    }
  };

  // ສີສຳລັບ pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // ຈັດຮູບແບບຕົວເລກເປັນຄອມມາ
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Custom tooltip ສຳລັບແຜນພູມຍອດຂາຍ
  const SalesToolTip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 2, boxShadow: 3, borderRadius: 3 }}>
          <Typography variant="subtitle2">{label}</Typography>
          <Typography variant="body2" color="primary">
            ຍອດຂາຍ: {formatNumber(payload[0].value)} ກີບ
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  // Custom tooltip ສຳລັບແຜນພູມໝວດໝູ່
  const CategoryToolTip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 2, boxShadow: 3, borderRadius: 3 }}>
          <Typography variant="subtitle2">{payload[0].name}</Typography>
          <Typography variant="body2" color="primary">
            ຈຳນວນສິນຄ້າ: {payload[0].value} ລາຍການ
          </Typography>
          <Typography variant="body2" color="secondary">
            ເປີເຊັນ: {((payload[0].value / categoryData.reduce((sum, cat) => sum + cat.count, 0)) * 100).toFixed(1)}%
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

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
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
            {dailySalesData.length > 0 ? (
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
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography color="text.secondary">ບໍ່ມີຂໍ້ມູນການຂາຍໃນອາທິດນີ້</Typography>
              </Box>
            )}
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
            {categoryData.length > 0 ? (
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
                    nameKey="name"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CategoryToolTip />} />
                  <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    formatter={(value, entry) => {
                      // ສະແດງຊື່ໝວດໝູ່ແລະຈຳນວນສິນຄ້າໃນ legend
                      const item = categoryData.find(cat => cat.name === value);
                      return `${value} (${item ? item.count : 0})`;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography color="text.secondary">ບໍ່ມີຂໍ້ມູນໝວດໝູ່ສິນຄ້າ</Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Grid>
      
      {/* Additional Statistics */}
      <Grid item xs={12}>
        <Paper elevation={2} sx={{ p: 3, borderRadius: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            ສະຖິຕິປະຈຳອາທິດ
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ 
              p: 3, 
              border: 1, 
              borderColor: 'divider', 
              borderRadius: 4,
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
                ຍອດຂາຍທັງໝົດ
              </Typography>
              <Typography variant="h5" color="primary.main" fontWeight="bold">
                {formatNumber(yearlyStats.totalSales)} ກີບ
              </Typography>
            </Box>
            
            <Box sx={{ 
              p: 3, 
              border: 1, 
              borderColor: 'divider', 
              borderRadius: 4,
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
                ຕົ້ນທຶນໂດຍປະມານ
              </Typography>
              <Typography variant="h5" color="info.main" fontWeight="bold">
                {formatNumber(yearlyStats.totalPurchases)} ກີບ
              </Typography>
            </Box>
            
            <Box sx={{ 
              p: 3, 
              border: 1, 
              borderColor: 'divider', 
              borderRadius: 4,
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
                ກຳໄລໂດຍປະມານ
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
          <Box sx={{ height: 350 }}>
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  layout="vertical"
                  data={topProducts}
                  margin={{ top: 5, right: 30, left: 180, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={170}
                    tick={{ fontSize: 14 }}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    dataKey="value" 
                    name="ຈຳນວນຂາຍ" 
                    fill={theme.palette.secondary.main}
                    radius={[0, 8, 8, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography color="text.secondary">ບໍ່ມີຂໍ້ມູນການຂາຍສິນຄ້າ</Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default DashboardCharts;