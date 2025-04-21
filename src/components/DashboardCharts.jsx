// src/components/DashboardCharts.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Grid,
  useTheme
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
  Cell
} from 'recharts';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const DashboardCharts = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        
        // Mock monthly sales data - this would be replaced with actual API call
        const mockSalesData = [
          { name: 'ມັງກອນ', sales: 4000000 },
          { name: 'ກຸມພາ', sales: 3000000 },
          { name: 'ມີນາ', sales: 2000000 },
          { name: 'ເມສາ', sales: 2780000 },
          { name: 'ພຶດສະພາ', sales: 1890000 },
          { name: 'ມິຖຸນາ', sales: 2390000 },
          { name: 'ກໍລະກົດ', sales: 3490000 },
          { name: 'ສິງຫາ', sales: 2900000 },
          { name: 'ກັນຍາ', sales: 3200000 },
          { name: 'ຕຸລາ', sales: 2500000 },
          { name: 'ພະຈິກ', sales: 2800000 },
          { name: 'ທັນວາ', sales: 3800000 },
        ];
        
        // Try to fetch real categories data
        let categories = [];
        try {
          const response = await axios.get(`${API_BASE_URL}/All/Category`);
          if (response.data && response.data.result_code === "200") {
            categories = response.data.categories || [];
          }
        } catch (error) {
          console.error("Error fetching categories:", error);
        }
        
        // If API fails or returns no data, use mock data
        if (categories.length === 0) {
          categories = [
            { cat_id: 1, category: 'ແອ', count: 15 },
            { cat_id: 2, category: 'ຕູ້ເຢັນ', count: 12 },
            { cat_id: 3, category: 'ໂທລະທັດ', count: 8 },
            { cat_id: 4, category: 'ຈັກຊັກເຄື່ອງ', count: 10 },
            { cat_id: 5, category: 'ເຄື່ອງໃຊ້ໄຟຟ້າອື່ນໆ', count: 5 }
          ];
        } else {
          // Add a count property to each category - this would normally come from API
          categories = categories.map(cat => ({
            ...cat,
            count: Math.floor(Math.random() * 20) + 5 // Random count between 5-25
          }));
        }
        
        setSalesData(mockSalesData);
        setCategoryData(categories);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

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
        <Paper sx={{ p: 2, boxShadow: 3 }}>
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
        <Paper sx={{ p: 2, boxShadow: 3 }}>
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
      {/* Monthly Sales Chart */}
      <Grid item xs={12} md={8}>
        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            ຍອດຂາຍປະຈຳເດືອນ
          </Typography>
          <Box sx={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={salesData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => value / 1000000 + "M"} />
                <Tooltip content={<SalesToolTip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sales"
                  name="ຍອດຂາຍ (ກີບ)"
                  stroke={theme.palette.primary.main}
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>
      
      {/* Product Categories Chart */}
      <Grid item xs={12} md={4}>
        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
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
        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            ສະຖິຕິເພີ່ມເຕີມ
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ 
              p: 2, 
              border: 1, 
              borderColor: 'divider', 
              borderRadius: 1, 
              flex: 1,
              minWidth: { xs: '100%', sm: '180px' }
            }}>
              <Typography variant="body2" color="text.secondary">
                ຍອດຂາຍທັງໝົດປີນີ້
              </Typography>
              <Typography variant="h5" color="primary.main" fontWeight="bold">
                {formatNumber(37500000)} ກີບ
              </Typography>
            </Box>
            
            <Box sx={{ 
              p: 2, 
              border: 1, 
              borderColor: 'divider', 
              borderRadius: 1, 
              flex: 1,
              minWidth: { xs: '100%', sm: '180px' }
            }}>
              <Typography variant="body2" color="text.secondary">
                ການສັ່ງຊື້ທັງໝົດປີນີ້
              </Typography>
              <Typography variant="h5" color="info.main" fontWeight="bold">
                {formatNumber(25800000)} ກີບ
              </Typography>
            </Box>
            
            <Box sx={{ 
              p: 2, 
              border: 1, 
              borderColor: 'divider', 
              borderRadius: 1, 
              flex: 1,
              minWidth: { xs: '100%', sm: '180px' }
            }}>
              <Typography variant="body2" color="text.secondary">
                ກຳໄລລວມ
              </Typography>
              <Typography variant="h5" color="success.main" fontWeight="bold">
                {formatNumber(11700000)} ກີບ
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default DashboardCharts;