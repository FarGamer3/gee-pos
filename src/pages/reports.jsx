// src/pages/reports.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Alert,
  IconButton,
  Tooltip,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  DateRange as DateRangeIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  ShowChart as ShowChartIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  PeopleAlt as PeopleIcon,
  LocalShipping as SupplierIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import Layout from '../components/Layout';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';
import axios from 'axios';
import API_BASE_URL from '../config/api';

function Reports() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportType, setReportType] = useState('sales');
  const printRef = React.useRef();

  // ຂໍ້ມູນສຳລັບລາຍງານ
  const [reportData, setReportData] = useState({
    sales: [],
    inventory: [],
    imports: [],
    exports: [],
    orders: [],
    products: [],
    suppliers: [],
    customers: [],
    employees: []
  });

  // ສະຖິຕິລວມ
  const [statistics, setStatistics] = useState({
    totalSales: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalSuppliers: 0,
    totalEmployees: 0,
    totalImports: 0,
    totalExports: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0
  });

  // ຂໍ້ມູນສຳລັບກຣາຟ
  const [chartData, setChartData] = useState({
    monthlySales: [],
    categoryDistribution: [],
    productPerformance: [],
    stockStatus: []
  });

  // ປະເພດລາຍງານ
  const reportTypes = [
    { value: 'sales', label: 'ລາຍງານການຂາຍ', icon: <ShoppingCartIcon /> },
    { value: 'inventory', label: 'ລາຍງານສິນຄ້າຄົງເຫຼືອ', icon: <InventoryIcon /> },
    { value: 'products', label: 'ລາຍງານສິນຄ້າທັງໝົດ', icon: <InventoryIcon /> },
    { value: 'imports', label: 'ລາຍງານການນຳເຂົ້າ', icon: <SupplierIcon /> },
    { value: 'exports', label: 'ລາຍງານການນຳອອກ', icon: <SupplierIcon /> },
    { value: 'orders', label: 'ລາຍງານການສັ່ງຊື້', icon: <ShoppingCartIcon /> },
    { value: 'suppliers', label: 'ລາຍງານຜູ້ສະໜອງ', icon: <SupplierIcon /> },
    { value: 'customers', label: 'ລາຍງານລູກຄ້າ', icon: <PeopleIcon /> },
    { value: 'employees', label: 'ລາຍງານພະນັກງານ', icon: <PeopleIcon /> },
    { value: 'financial', label: 'ລາຍງານການເງິນ', icon: <MoneyIcon /> },
    { value: 'performance', label: 'ລາຍງານຜົນການດຳເນີນງານ', icon: <TrendingUpIcon /> }
  ];

  useEffect(() => {
    fetchAllData();
  }, []);

  // ດຶງຂໍ້ມູນທັງໝົດ
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [
        salesRes,
        productsRes,
        categoriesRes,
        brandsRes,
        zonesRes,
        suppliersRes,
        customersRes,
        employeesRes,
        ordersRes,
        importsRes,
        exportsRes
      ] = await Promise.all([
        axios.get(`${API_BASE_URL}/sale/All/Sales`),
        axios.get(`${API_BASE_URL}/All/Product`),
        axios.get(`${API_BASE_URL}/All/Category`),
        axios.get(`${API_BASE_URL}/All/Brand`),
        axios.get(`${API_BASE_URL}/All/Zone`),
        axios.get(`${API_BASE_URL}/users/All/Supplier`),
        axios.get(`${API_BASE_URL}/users/All/Customer`),
        axios.get(`${API_BASE_URL}/users/All/Employee`),
        axios.get(`${API_BASE_URL}/order/All/Order`),
        axios.get(`${API_BASE_URL}/import/All/Import`),
        axios.get(`${API_BASE_URL}/export/All/Export`)
      ]);

      // ປະມວນຜົນຂໍ້ມູນ
      const salesData = salesRes.data.sales || [];
      const productsData = productsRes.data.products || [];
      const categoriesData = categoriesRes.data.categories || [];
      const brandsData = brandsRes.data.user_info || [];
      const zonesData = zonesRes.data.user_info || [];
      const suppliersData = suppliersRes.data.user_info || [];
      const customersData = customersRes.data.user_info || [];
      const employeesData = employeesRes.data.user_info || [];
      const ordersData = ordersRes.data.user_info || [];
      const importsData = importsRes.data.imports || [];
      const exportsData = exportsRes.data.exports || [];

      // ຕັ້ງຄ່າຂໍ້ມູນລາຍງານ
      setReportData({
        sales: salesData,
        inventory: productsData.filter(p => p.status === 'Instock'),
        imports: importsData,
        exports: exportsData,
        orders: ordersData,
        products: productsData,
        suppliers: suppliersData,
        customers: customersData,
        employees: employeesData
      });

      // ຄຳນວນສະຖິຕິ
      calculateStatistics(salesData, productsData, customersData, suppliersData, employeesData, importsData, exportsData);
      
      // ສ້າງຂໍ້ມູນສຳລັບກຣາຟ
      generateChartData(salesData, productsData, categoriesData);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ');
    } finally {
      setLoading(false);
    }
  };

  // ຄຳນວນສະຖິຕິ
  const calculateStatistics = (sales, products, customers, suppliers, employees, imports, exports) => {
    const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.subtotal || 0), 0);
    const lowStock = products.filter(p => p.qty <= p.qty_min).length;
    const outOfStock = products.filter(p => p.qty === 0).length;

    setStatistics({
      totalSales: sales.length,
      totalRevenue,
      totalProducts: products.length,
      totalCustomers: customers.length,
      totalSuppliers: suppliers.length,
      totalEmployees: employees.length,
      totalImports: imports.length,
      totalExports: exports.length,
      lowStockProducts: lowStock,
      outOfStockProducts: outOfStock
    });
  };

  // ສ້າງຂໍ້ມູນສຳລັບກຣາຟ
  const generateChartData = (sales, products, categories) => {
    // ຂໍ້ມູນການຂາຍລາຍເດືອນ
    const monthlyData = {};
    sales.forEach(sale => {
      const date = new Date(sale.date_sale);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = 0;
      }
      monthlyData[monthYear] += parseFloat(sale.subtotal || 0);
    });

    const monthlySales = Object.entries(monthlyData).map(([month, total]) => ({
      month,
      sales: total
    }));

    // ການແຈກຢາຍຕາມປະເພດສິນຄ້າ
    const categoryDist = categories.map(cat => {
      const count = products.filter(p => p.cat_id === cat.cat_id).length;
      return {
        name: cat.category,
        value: count
      };
    });

    // ສະຖານະສິນຄ້າ
    const instockCount = products.filter(p => p.status === 'Instock').length;
    const outOfStockCount = products.filter(p => p.status === 'OutOfStock').length;
    const discontinuedCount = products.filter(p => p.status === 'Discontinued').length;

    const stockStatus = [
      { name: 'ມີໃນສາງ', value: instockCount },
      { name: 'ໝົດສາງ', value: outOfStockCount },
      { name: 'ຍົກເລີກ', value: discontinuedCount }
    ];

    setChartData({
      monthlySales,
      categoryDistribution: categoryDist,
      productPerformance: [],
      stockStatus
    });
  };

  // ຈັດການການປ່ຽນແປງແທັບ
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // ສ້າງລາຍງານ
  const handleGenerateReport = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  // ຟັງຊັນພິມລາຍງານ
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `ລາຍງານ ${reportTypes.find(r => r.value === reportType)?.label}`,
  });

  // ຟັງຊັນສົ່ງອອກ Excel
  const handleExportExcel = () => {
    const data = reportData[reportType] || [];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `report_${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // ຟັງຊັນຟໍແມັດເງິນ
  const formatNumber = (num) => {
    if (!num && num !== 0) return "0";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // ຟັງຊັນຟໍແມັດວັນທີ
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('lo-LA');
  };

  // ສີສຳລັບ Pie Chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // ສ່ວນປະກອບສຳລັບການສະແດງຂໍ້ມູນລາຍງານແຕ່ລະປະເພດ
  const renderReportContent = () => {
    switch (reportType) {
      case 'sales':
        return renderSalesReport();
      case 'inventory':
        return renderInventoryReport();
      case 'products':
        return renderProductsReport();
      case 'imports':
        return renderImportsReport();
      case 'exports':
        return renderExportsReport();
      case 'orders':
        return renderOrdersReport();
      case 'suppliers':
        return renderSuppliersReport();
      case 'customers':
        return renderCustomersReport();
      case 'employees':
        return renderEmployeesReport();
      case 'financial':
        return renderFinancialReport();
      case 'performance':
        return renderPerformanceReport();
      default:
        return renderSalesReport();
    }
  };

  // ລາຍງານການຂາຍ
  const renderSalesReport = () => (
    <Box>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>ຍອດຂາຍລາຍເດືອນ</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData.monthlySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#8884d8" name="ຍອດຂາຍ" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>ສະຖິຕິການຂາຍ</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">ຈຳນວນໃບບິນທັງໝົດ</Typography>
                  <Typography variant="h4">{statistics.totalSales}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">ຍອດຂາຍລວມ</Typography>
                  <Typography variant="h4">{formatNumber(statistics.totalRevenue)}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ເລກທີໃບບິນ</TableCell>
              <TableCell>ວັນທີ</TableCell>
              <TableCell>ລູກຄ້າ</TableCell>
              <TableCell>ພະນັກງານ</TableCell>
              <TableCell align="right">ມູນຄ່າ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reportData.sales.map((sale) => (
              <TableRow key={sale.sale_id}>
                <TableCell>{sale.sale_id}</TableCell>
                <TableCell>{formatDate(sale.date_sale)}</TableCell>
                <TableCell>{sale.customer_name || 'ລູກຄ້າທົ່ວໄປ'}</TableCell>
                <TableCell>{sale.emp_name}</TableCell>
                <TableCell align="right">{formatNumber(sale.subtotal)} ກີບ</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  // ລາຍງານສິນຄ້າຄົງເຫຼືອ
  const renderInventoryReport = () => (
    <Box>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>ສະຖານະສິນຄ້າ</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.stockStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.stockStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>ສະພາບສິນຄ້າ</Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="body2" color="textSecondary">ທັງໝົດ</Typography>
                  <Typography variant="h4">{statistics.totalProducts}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="error">ໃກ້ໝົດ</Typography>
                  <Typography variant="h4" color="error">{statistics.lowStockProducts}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="error">ໝົດສາງ</Typography>
                  <Typography variant="h4" color="error">{statistics.outOfStockProducts}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ລະຫັດ</TableCell>
              <TableCell>ຊື່ສິນຄ້າ</TableCell>
              <TableCell align="center">ຈຳນວນ</TableCell>
              <TableCell align="center">ຈຳນວນຕໍ່າສຸດ</TableCell>
              <TableCell align="center">ສະຖານະ</TableCell>
              <TableCell align="right">ມູນຄ່າ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reportData.inventory.map((product) => (
              <TableRow key={product.proid}>
                <TableCell>{product.proid}</TableCell>
                <TableCell>{product.ProductName}</TableCell>
                <TableCell align="center">{product.qty}</TableCell>
                <TableCell align="center">{product.qty_min}</TableCell>
                <TableCell align="center">
                  {product.qty <= 0 ? (
                    <Typography color="error">ໝົດສາງ</Typography>
                  ) : product.qty <= product.qty_min ? (
                    <Typography color="warning.main">ໃກ້ໝົດ</Typography>
                  ) : (
                    <Typography color="success.main">ມີໃນສາງ</Typography>
                  )}
                </TableCell>
                <TableCell align="right">{formatNumber(product.qty * product.cost_price)} ກີບ</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  // ລາຍງານສິນຄ້າທັງໝົດ
  const renderProductsReport = () => (
    <Box>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>ການແຈກຢາຍຕາມປະເພດສິນຄ້າ</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.categoryDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" name="ຈຳນວນສິນຄ້າ" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ລະຫັດ</TableCell>
              <TableCell>ຊື່ສິນຄ້າ</TableCell>
              <TableCell>ປະເພດ</TableCell>
              <TableCell>ຍີ່ຫໍ້</TableCell>
              <TableCell align="center">ຈຳນວນ</TableCell>
              <TableCell align="right">ລາຄາທຶນ</TableCell>
              <TableCell align="right">ລາຄາຂາຍ</TableCell>
              <TableCell align="center">ສະຖານະ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reportData.products.map((product) => (
              <TableRow key={product.proid}>
                <TableCell>{product.proid}</TableCell>
                <TableCell>{product.ProductName}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.brand}</TableCell>
                <TableCell align="center">{product.qty}</TableCell>
                <TableCell align="right">{formatNumber(product.cost_price)} ກີບ</TableCell>
                <TableCell align="right">{formatNumber(product.retail_price)} ກີບ</TableCell>
                <TableCell align="center">{product.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  // ລາຍງານການນຳເຂົ້າ
  const renderImportsReport = () => (
    <Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ເລກທີ</TableCell>
              <TableCell>ວັນທີ</TableCell>
              <TableCell>ໃບສັ່ງຊື້</TableCell>
              <TableCell>ພະນັກງານ</TableCell>
              <TableCell align="right">ມູນຄ່າລວມ</TableCell>
              <TableCell align="center">ສະຖານະ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reportData.imports.map((imp) => (
              <TableRow key={imp.imp_id}>
                <TableCell>{imp.imp_id}</TableCell>
                <TableCell>{formatDate(imp.imp_date)}</TableCell>
                <TableCell>{imp.order_id}</TableCell>
                <TableCell>{imp.emp_name}</TableCell>
                <TableCell align="right">{formatNumber(imp.total_price)} ກີບ</TableCell>
                <TableCell align="center">{imp.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  // ລາຍງານການນຳອອກ
  const renderExportsReport = () => (
    <Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ເລກທີ</TableCell>
              <TableCell>ວັນທີ</TableCell>
              <TableCell>ພະນັກງານ</TableCell>
              <TableCell align="center">ສະຖານະ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reportData.exports.map((exp) => (
              <TableRow key={exp.exp_id}>
                <TableCell>{exp.exp_id}</TableCell>
                <TableCell>{formatDate(exp.exp_date)}</TableCell>
                <TableCell>{exp.emp_name}</TableCell>
                <TableCell align="center">{exp.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  // ລາຍງານການສັ່ງຊື້
  const renderOrdersReport = () => (
    <Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ເລກທີ</TableCell>
              <TableCell>ວັນທີ</TableCell>
              <TableCell>ຜູ້ສະໜອງ</TableCell>
              <TableCell>ພະນັກງານ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reportData.orders.map((order) => (
              <TableRow key={order.order_id}>
                <TableCell>{order.order_id}</TableCell>
                <TableCell>{formatDate(order.order_date)}</TableCell>
                <TableCell>{order.supplier}</TableCell>
                <TableCell>{order.employee}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  // ລາຍງານຜູ້ສະໜອງ
  const renderSuppliersReport = () => (
    <Box>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">ຈຳນວນຜູ້ສະໜອງທັງໝົດ</Typography>
              <Typography variant="h3">{statistics.totalSuppliers}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ລະຫັດ</TableCell>
              <TableCell>ຊື່ບໍລິສັດ</TableCell>
              <TableCell>ຊື່ຜູ້ຕິດຕໍ່</TableCell>
              <TableCell>ອີເມວ</TableCell>
              <TableCell>ເບີໂທ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reportData.suppliers.map((supplier) => (
              <TableRow key={supplier.sup_id}>
                <TableCell>{supplier.sup_id}</TableCell>
                <TableCell>{supplier.sup_name}</TableCell>
                <TableCell>{supplier.contract_name}</TableCell>
                <TableCell>{supplier.email}</TableCell>
                <TableCell>{supplier.tel}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  // ລາຍງານລູກຄ້າ
  const renderCustomersReport = () => (
    <Box>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">ຈຳນວນລູກຄ້າທັງໝົດ</Typography>
              <Typography variant="h3">{statistics.totalCustomers}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ລະຫັດ</TableCell>
              <TableCell>ຊື່-ນາມສະກຸນ</TableCell>
              <TableCell>ອີເມວ</TableCell>
              <TableCell>ເບີໂທ</TableCell>
              <TableCell>ທີ່ຢູ່</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reportData.customers.map((customer) => (
              <TableRow key={customer.cus_id}>
                <TableCell>{customer.cus_id}</TableCell>
                <TableCell>{customer.cus_name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.tel}</TableCell>
                <TableCell>{customer.address}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  // ລາຍງານພະນັກງານ
  const renderEmployeesReport = () => (
    <Box>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">ຈຳນວນພະນັກງານທັງໝົດ</Typography>
              <Typography variant="h3">{statistics.totalEmployees}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ລະຫັດ</TableCell>
              <TableCell>ຊື່-ນາມສະກຸນ</TableCell>
              <TableCell>ຕຳແໜ່ງ</TableCell>
              <TableCell>ອີເມວ</TableCell>
              <TableCell>ເບີໂທ</TableCell>
              <TableCell>ທີ່ຢູ່</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reportData.employees.map((employee) => (
              <TableRow key={employee.emp_id}>
                <TableCell>{employee.emp_id}</TableCell>
                <TableCell>{employee.emp_name}</TableCell>
                <TableCell>{employee.position}</TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>{employee.tel}</TableCell>
                <TableCell>{employee.address}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  // ລາຍງານການເງິນ
  const renderFinancialReport = () => (
    <Box>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>ລາຍຮັບ-ລາຍຈ່າຍ</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { name: 'ລາຍຮັບ', value: statistics.totalRevenue },
                    { name: 'ລາຍຈ່າຍ', value: reportData.imports.reduce((sum, imp) => sum + parseFloat(imp.total_price || 0), 0) }
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" name="ມູນຄ່າ (ກີບ)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>ສະຫຼຸບລາຍຮັບ-ລາຍຈ່າຍ</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">ລາຍຮັບທັງໝົດ</Typography>
                  <Typography variant="h4" color="success.main">{formatNumber(statistics.totalRevenue)} ກີບ</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">ລາຍຈ່າຍທັງໝົດ</Typography>
                  <Typography variant="h4" color="error">
                    {formatNumber(reportData.imports.reduce((sum, imp) => sum + parseFloat(imp.total_price || 0), 0))} ກີບ
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="textSecondary">ກຳໄລສຸດທິ</Typography>
                  <Typography variant="h4">
                    {formatNumber(
                      statistics.totalRevenue - 
                      reportData.imports.reduce((sum, imp) => sum + parseFloat(imp.total_price || 0), 0)
                    )} ກີບ
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ປະເພດ</TableCell>
              <TableCell>ວັນທີ</TableCell>
              <TableCell>ລາຍລະອຽດ</TableCell>
              <TableCell align="right">ມູນຄ່າ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* ສະແດງຂໍ້ມູນການເງິນ - ລາຍຮັບຈາກການຂາຍ */}
            {reportData.sales.map((sale) => (
              <TableRow key={`sale-${sale.sale_id}`}>
                <TableCell>
                  <Typography color="success.main">ລາຍຮັບ</Typography>
                </TableCell>
                <TableCell>{formatDate(sale.date_sale)}</TableCell>
                <TableCell>ຂາຍສິນຄ້າ (ໃບບິນ #{sale.sale_id})</TableCell>
                <TableCell align="right">
                  <Typography color="success.main">+{formatNumber(sale.subtotal)} ກີບ</Typography>
                </TableCell>
              </TableRow>
            ))}
            
            {/* ສະແດງຂໍ້ມູນການເງິນ - ລາຍຈ່າຍຈາກການນຳເຂົ້າ */}
            {reportData.imports.map((imp) => (
              <TableRow key={`imp-${imp.imp_id}`}>
                <TableCell>
                  <Typography color="error">ລາຍຈ່າຍ</Typography>
                </TableCell>
                <TableCell>{formatDate(imp.imp_date)}</TableCell>
                <TableCell>ນຳເຂົ້າສິນຄ້າ (ເລກທີ #{imp.imp_id})</TableCell>
                <TableCell align="right">
                  <Typography color="error">-{formatNumber(imp.total_price)} ກີບ</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  // ລາຍງານຜົນການດຳເນີນງານ
  const renderPerformanceReport = () => (
    <Box>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="textSecondary">ຍອດຂາຍທັງໝົດ</Typography>
              <Typography variant="h4">{formatNumber(statistics.totalRevenue)} ກີບ</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="textSecondary">ສິນຄ້າທັງໝົດ</Typography>
              <Typography variant="h4">{statistics.totalProducts}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="textSecondary">ລູກຄ້າທັງໝົດ</Typography>
              <Typography variant="h4">{statistics.totalCustomers}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="textSecondary">ຜູ້ສະໜອງທັງໝົດ</Typography>
              <Typography variant="h4">{statistics.totalSuppliers}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>ການເຕີບໂຕຂອງການຂາຍ</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData.monthlySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#8884d8" name="ຍອດຂາຍ" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>ສະຖານະສິນຄ້າ</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.stockStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.stockStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>ສະຫຼຸບຜົນການດຳເນີນງານ</Typography>
          <Typography variant="body1">
            ໃນໄລຍະການລາຍງານນີ້, ທາງຮ້ານໄດ້ມີຍອດຂາຍທັງໝົດ {formatNumber(statistics.totalRevenue)} ກີບ, 
            ຈາກຈຳນວນໃບບິນ {statistics.totalSales} ໃບ. ມີສິນຄ້າໃນສາງທັງໝົດ {statistics.totalProducts} ລາຍການ,
            ໃນນັ້ນມີສິນຄ້າໃກ້ໝົດ {statistics.lowStockProducts} ລາຍການ ແລະ ສິນຄ້າໝົດສາງ {statistics.outOfStockProducts} ລາຍການ.
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="body1">
            ກຳໄລສຸດທິປະຈຳໄລຍະລາຍງານ: {formatNumber(
              statistics.totalRevenue - reportData.imports.reduce((sum, imp) => sum + parseFloat(imp.total_price || 0), 0)
            )} ກີບ
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );

  return (
    <Layout title="ລາຍງານ">
      <Box ref={printRef} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <AssessmentIcon sx={{ mr: 1 }} /> ລາຍງານ
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3} alignItems="flex-end">
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="ປະເພດລາຍງານ"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                InputProps={{
                  startAdornment: <FilterListIcon sx={{ mr: 1 }} />
                }}
              >
                {reportTypes.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {option.icon}
                      <Box sx={{ ml: 1 }}>{option.label}</Box>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="date"
                label="ວັນທີເລີ່ມຕົ້ນ"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputProps={{
                  startAdornment: <DateRangeIcon sx={{ mr: 1 }} />
                }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="date"
                label="ວັນທີສິ້ນສຸດ"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputProps={{
                  startAdornment: <DateRangeIcon sx={{ mr: 1 }} />
                }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                startIcon={<AssessmentIcon />}
                onClick={handleGenerateReport}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'ສ້າງລາຍງານ'}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Box sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="report tabs">
            <Tab label="ລາຍງານ" icon={<AssessmentIcon />} />
            <Tab label="ກຣາຟ" icon={<ShowChartIcon />} />
          </Tabs>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Tooltip title="ພິມລາຍງານ">
            <IconButton onClick={handlePrint}>
              <PrintIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="ສົ່ງອອກ Excel">
            <IconButton onClick={handleExportExcel}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="ໂຫຼດຂໍ້ມູນໃໝ່">
            <IconButton onClick={fetchAllData}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ mt: 2 }}>
          {renderReportContent()}
        </Box>
      </Box>
    </Layout>
  );
}

export default Reports;