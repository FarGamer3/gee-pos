import { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Stack,
  Alert,
  InputAdornment,
  IconButton,
  LocalizationProvider
} from '@mui/material';

import {
  Print as PrintIcon,
  Refresh as RefreshIcon,
  LocalMall as ProductIcon,
  Inventory as InventoryIcon,
  Person as CustomerIcon,
  LocalShipping as SupplierIcon,
  BarChart as ChartIcon,
  DateRange as DateRangeIcon,
  AttachMoney as SalesIcon,
  Search as SearchIcon,
  Analytics as AnalyticsIcon,
  TrendingDown as LowStockIcon
} from '@mui/icons-material';
// ໃຊ້ TextField ປົກກະຕິແທນ DatePicker
import Layout from '../components/Layout';

// Helper function to format numbers with commas
const formatNumber = (num) => {
  if (!num) return "0";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Sample data for reports (replace with real data from API calls)
const sampleSalesData = [
  { id: 1, date: '16/04/2025', customer: 'ລຸ້ງຟ້າ ງາມ', amount: 8000000, items: 3 },
  { id: 2, date: '15/04/2025', customer: 'ພຸດທະເສນ ສິມມະຫາໂນ', amount: 4500000, items: 1 },
  { id: 3, date: '14/04/2025', customer: 'ລູກຄ້າທົ່ວໄປ', amount: 6000000, items: 2 },
  { id: 4, date: '14/04/2025', customer: 'ລູກຄ້າທົ່ວໄປ', amount: 8000000, items: 1 },
  { id: 5, date: '13/04/2025', customer: 'ພຸດທະເສນ ສິມມະຫາໂນ', amount: 4500000, items: 1 },
];

const sampleInventoryData = [
  { id: 1, name: 'ແອ ​Samsung Wind-Free Premium', quantity: 10, min_quantity: 2, status: 'ປົກກະຕິ' },
  { id: 2, name: 'LG DUALCOOL Inverter', quantity: 2, min_quantity: 2, status: 'ຕ່ຳ' },
  { id: 3, name: 'ຕູ້ເຢັນ Samsung Twin Cooling Plus', quantity: 10, min_quantity: 2, status: 'ປົກກະຕິ' },
  { id: 4, name: 'ເຄື່ອງຊັກຜ້າ LG', quantity: 0, min_quantity: 1, status: 'ໝົດ' },
  { id: 5, name: 'ໂທລະທັດ Sony 55"', quantity: 3, min_quantity: 2, status: 'ປົກກະຕິ' },
];

const sampleCustomerData = [
  { id: 1, name: 'ພຸດທະເສນ ສິມມະຫາໂນ', tel: '02088555666', totalPurchases: 2, totalAmount: 9000000 },
  { id: 2, name: 'ລຸ້ງຟ້າ ງາມ', tel: '02099551122', totalPurchases: 1, totalAmount: 8000000 },
  { id: 3, name: 'ລູກຄ້າທົ່ວໄປ', tel: '-', totalPurchases: 2, totalAmount: 14000000 },
];

// TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Main Report Component
function Reports() {
  // State for tab management
  const [tabValue, setTabValue] = useState(0);
  
  // States for date filtering
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  
  // State for dropdown selections
  const [reportType, setReportType] = useState('sales');
  const [periodType, setPeriodType] = useState('daily');
  
  // Loading state
  const [loading, setLoading] = useState(false);
  
  // Alert state
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'info' });
  
  // Print reference
  const printRef = useRef();
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle print function
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: 'GeePOS-ລາຍງານ',
    onBeforeGetContent: () => {
      return new Promise((resolve) => {
        setLoading(true);
        resolve();
      });
    },
    onAfterPrint: () => {
      setLoading(false);
      showAlert('ພິມລາຍງານສຳເລັດ', 'success');
    }
  });
  
  // Handle generating reports
  const handleGenerateReport = () => {
    setLoading(true);
    
    // In a real application, you would fetch data from APIs here
    // For now, we'll just simulate loading
    setTimeout(() => {
      setLoading(false);
      showAlert('ສ້າງລາຍງານສຳເລັດແລ້ວ', 'success');
    }, 1500);
  };
  
  // Show alert message
  const showAlert = (message, severity = 'info') => {
    setAlert({ show: true, message, severity });
    setTimeout(() => {
      setAlert({ ...alert, show: false });
    }, 5000);
  };
  
  // Get status color based on inventory status
  const getStatusColor = (status) => {
    switch(status) {
      case 'ຕ່ຳ':
        return '#FFA726'; // Orange for low stock
      case 'ໝົດ':
        return '#F44336'; // Red for out of stock
      case 'ປົກກະຕິ':
        return '#4CAF50'; // Green for normal
      default:
        return '#9E9E9E'; // Gray for other statuses
    }
  };
  
  // Calculate total sales
  const totalSales = sampleSalesData.reduce((sum, sale) => sum + sale.amount, 0);
  
  // Calculate low stock items
  const lowStockItems = sampleInventoryData.filter(item => item.quantity <= item.min_quantity).length;
  
  // Calculate total customers
  const totalCustomers = sampleCustomerData.length;

  return (
    <Layout title="ລາຍງານ">
      {/* Alert message */}
      {alert.show && (
        <Alert 
          severity={alert.severity}
          sx={{ 
            position: 'fixed', 
            top: 20, 
            right: 20, 
            zIndex: 9999,
            boxShadow: 3,
            maxWidth: 400
          }}
        >
          {alert.message}
        </Alert>
      )}
      
      {/* Loading overlay */}
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999
          }}
        >
          <CircularProgress color="primary" size={60} />
        </Box>
      )}
      
      <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1, mb: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold" color="primary">
          ລາຍງານຕ່າງໆ
        </Typography>
      </Box>
      
      {/* Dashboard summary cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              height: '100%', 
              borderLeft: 3, 
              borderColor: 'primary.main',
              boxShadow: 3
            }}
          >
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                ຍອດຂາຍທັງໝົດ
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" component="div" fontWeight="bold">
                  {formatNumber(totalSales)} ກີບ
                </Typography>
                <SalesIcon 
                  color="primary" 
                  sx={{ fontSize: 40, opacity: 0.7 }} 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              height: '100%', 
              borderLeft: 3, 
              borderColor: 'error.main',
              boxShadow: 3
            }}
          >
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                ສິນຄ້າໃກ້ໝົດ
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" component="div" fontWeight="bold">
                  {lowStockItems} ລາຍການ
                </Typography>
                <LowStockIcon 
                  color="error" 
                  sx={{ fontSize: 40, opacity: 0.7 }} 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              height: '100%', 
              borderLeft: 3, 
              borderColor: 'success.main',
              boxShadow: 3
            }}
          >
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                ສິນຄ້າທັງໝົດ
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" component="div" fontWeight="bold">
                  {sampleInventoryData.length} ລາຍການ
                </Typography>
                <ProductIcon 
                  color="success" 
                  sx={{ fontSize: 40, opacity: 0.7 }} 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              height: '100%', 
              borderLeft: 3, 
              borderColor: 'info.main',
              boxShadow: 3
            }}
          >
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                ລູກຄ້າທັງໝົດ
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" component="div" fontWeight="bold">
                  {totalCustomers} ຄົນ
                </Typography>
                <CustomerIcon 
                  color="info" 
                  sx={{ fontSize: 40, opacity: 0.7 }} 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Report tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="ລາຍງານການຂາຍ" icon={<SalesIcon />} iconPosition="start" />
          <Tab label="ລາຍງານສິນຄ້າ" icon={<InventoryIcon />} iconPosition="start" />
          <Tab label="ລາຍງານລູກຄ້າ" icon={<CustomerIcon />} iconPosition="start" />
          <Tab label="ລາຍງານການນຳເຂົ້າສິນຄ້າ" icon={<SupplierIcon />} iconPosition="start" />
          <Tab label="ລາຍງານວິເຄາະ" icon={<AnalyticsIcon />} iconPosition="start" />
        </Tabs>
      </Paper>
      
      {/* Report filter and settings */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="report-type-label">ປະເພດລາຍງານ</InputLabel>
              <Select
                labelId="report-type-label"
                id="report-type"
                value={reportType}
                label="ປະເພດລາຍງານ"
                onChange={(e) => setReportType(e.target.value)}
              >
                <MenuItem value="sales">ລາຍງານການຂາຍ</MenuItem>
                <MenuItem value="inventory">ລາຍງານສະຕັອກສິນຄ້າ</MenuItem>
                <MenuItem value="customers">ລາຍງານລູກຄ້າ</MenuItem>
                <MenuItem value="imports">ລາຍງານການນຳເຂົ້າສິນຄ້າ</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="period-type-label">ຊ່ວງເວລາ</InputLabel>
              <Select
                labelId="period-type-label"
                id="period-type"
                value={periodType}
                label="ຊ່ວງເວລາ"
                onChange={(e) => setPeriodType(e.target.value)}
              >
                <MenuItem value="daily">ລາຍວັນ</MenuItem>
                <MenuItem value="weekly">ລາຍອາທິດ</MenuItem>
                <MenuItem value="monthly">ລາຍເດືອນ</MenuItem>
                <MenuItem value="yearly">ລາຍປີ</MenuItem>
                <MenuItem value="custom">ກຳນົດເອງ</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid item xs={12} sm={6} md={2}>
              <DatePicker
                label="ວັນທີເລີ່ມຕົ້ນ"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                disabled={periodType !== 'custom'}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <DatePicker
                label="ວັນທີສິ້ນສຸດ"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                disabled={periodType !== 'custom'}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
          </LocalizationProvider>
          <Grid item xs={12} md={2}>
            <Stack direction="row" spacing={1}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                startIcon={<RefreshIcon />}
                onClick={handleGenerateReport}
                disabled={loading}
              >
                ສ້າງລາຍງານ
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={handlePrint}
                disabled={loading}
              >
                <PrintIcon />
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Report content */}
      <Paper>
        <Box ref={printRef} sx={{ p: 3 }}>
          {/* Report header for printing */}
          <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              GeePOS - ລະບົບຈັດການສິນຄ້າ
            </Typography>
            <Typography variant="h6">
              {tabValue === 0 && "ລາຍງານການຂາຍສິນຄ້າ"}
              {tabValue === 1 && "ລາຍງານສະຕັອກສິນຄ້າ"}
              {tabValue === 2 && "ລາຍງານລູກຄ້າ"}
              {tabValue === 3 && "ລາຍງານການນຳເຂົ້າສິນຄ້າ"}
              {tabValue === 4 && "ລາຍງານວິເຄາະ"}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              ວັນທີພິມ: {new Date().toLocaleDateString('lo-LA')}
            </Typography>
            <Divider sx={{ width: '100%', my: 2 }} />
          </Box>
          
          {/* Sales Report Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                ລາຍງານການຂາຍສິນຄ້າ
              </Typography>
              <Typography variant="body2" color="textSecondary">
                ສະຫຼຸບການຂາຍຕາມຊ່ວງເວລາ
              </Typography>
            </Box>
            
            <Box sx={{ mb: 4 }}>
              <TextField
                placeholder="ຄົ້ນຫາ..."
                size="small"
                sx={{ maxWidth: 300, mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead sx={{ bgcolor: 'background.default' }}>
                    <TableRow>
                      <TableCell align="center">ລະຫັດ</TableCell>
                      <TableCell align="center">ວັນທີຂາຍ</TableCell>
                      <TableCell>ລູກຄ້າ</TableCell>
                      <TableCell align="center">ຈຳນວນສິນຄ້າ</TableCell>
                      <TableCell align="right">ຍອດຂາຍ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sampleSalesData.map(sale => (
                      <TableRow key={sale.id} hover>
                        <TableCell align="center">{sale.id}</TableCell>
                        <TableCell align="center">{sale.date}</TableCell>
                        <TableCell>{sale.customer}</TableCell>
                        <TableCell align="center">{sale.items}</TableCell>
                        <TableCell align="right">{formatNumber(sale.amount)} ກີບ</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} />
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        ລວມທັງໝົດ:
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {formatNumber(totalSales)} ກີບ
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </TabPanel>
          
          {/* Inventory Report Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                ລາຍງານສະຕັອກສິນຄ້າ
              </Typography>
              <Typography variant="body2" color="textSecondary">
                ສະຫຼຸບຂໍ້ມູນສະຕັອກສິນຄ້າປັດຈຸບັນ
              </Typography>
            </Box>
            
            <Box sx={{ mb: 4 }}>
              <TextField
                placeholder="ຄົ້ນຫາ..."
                size="small"
                sx={{ maxWidth: 300, mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead sx={{ bgcolor: 'background.default' }}>
                    <TableRow>
                      <TableCell align="center">ລະຫັດ</TableCell>
                      <TableCell>ຊື່ສິນຄ້າ</TableCell>
                      <TableCell align="center">ຈຳນວນປັດຈຸບັນ</TableCell>
                      <TableCell align="center">ຈຳນວນຂັ້ນຕໍ່າ</TableCell>
                      <TableCell align="center">ສະຖານະ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sampleInventoryData.map(item => (
                      <TableRow key={item.id} hover>
                        <TableCell align="center">{item.id}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell align="center">{item.quantity}</TableCell>
                        <TableCell align="center">{item.min_quantity}</TableCell>
                        <TableCell align="center">
                          <Box
                            sx={{
                              display: 'inline-block',
                              bgcolor: getStatusColor(item.status),
                              color: 'white',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: '0.75rem'
                            }}
                          >
                            {item.status}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </TabPanel>
          
          {/* Customer Report Tab */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                ລາຍງານລູກຄ້າ
              </Typography>
              <Typography variant="body2" color="textSecondary">
                ສະຫຼຸບຂໍ້ມູນລູກຄ້າແລະການຊື້
              </Typography>
            </Box>
            
            <Box sx={{ mb: 4 }}>
              <TextField
                placeholder="ຄົ້ນຫາ..."
                size="small"
                sx={{ maxWidth: 300, mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead sx={{ bgcolor: 'background.default' }}>
                    <TableRow>
                      <TableCell align="center">ລະຫັດ</TableCell>
                      <TableCell>ຊື່ລູກຄ້າ</TableCell>
                      <TableCell align="center">ເບີໂທ</TableCell>
                      <TableCell align="center">ຈຳນວນຄັ້ງທີ່ຊື້</TableCell>
                      <TableCell align="right">ມູນຄ່າການຊື້ທັງໝົດ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sampleCustomerData.map(customer => (
                      <TableRow key={customer.id} hover>
                        <TableCell align="center">{customer.id}</TableCell>
                        <TableCell>{customer.name}</TableCell>
                        <TableCell align="center">{customer.tel}</TableCell>
                        <TableCell align="center">{customer.totalPurchases}</TableCell>
                        <TableCell align="right">{formatNumber(customer.totalAmount)} ກີບ</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </TabPanel>
          
          {/* Import Report Tab */}
          <TabPanel value={tabValue} index={3}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                ລາຍງານການນຳເຂົ້າສິນຄ້າ
              </Typography>
              <Typography variant="body2" color="textSecondary">
                ສະຫຼຸບການນຳເຂົ້າສິນຄ້າຕາມຊ່ວງເວລາ
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 8 }}>
              <Typography variant="h6" color="textSecondary">
                ກຳລັງພັດທະນາລາຍງານນີ້...
              </Typography>
            </Box>
          </TabPanel>
          
          {/* Analytics Report Tab */}
          <TabPanel value={tabValue} index={4}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                ລາຍງານວິເຄາະຂໍ້ມູນ
              </Typography>
              <Typography variant="body2" color="textSecondary">
                ການວິເຄາະຕົວຊີ້ວັດທາງທຸລະກິດຕ່າງໆ
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    ສິນຄ້າທີ່ຂາຍດີທີ່ສຸດ
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>ຊື່ສິນຄ້າ</TableCell>
                          <TableCell align="right">ຈຳນວນທີ່ຂາຍໄດ້</TableCell>
                          <TableCell align="right">ລາຍຮັບທັງໝົດ</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>ແອ Samsung Wind-Free</TableCell>
                          <TableCell align="right">5</TableCell>
                          <TableCell align="right">40,000,000 ກີບ</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>ຕູ້ເຢັນ Samsung Twin Cooling</TableCell>
                          <TableCell align="right">3</TableCell>
                          <TableCell align="right">18,000,000 ກີບ</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>LG DUALCOOL Inverter</TableCell>
                          <TableCell align="right">2</TableCell>
                          <TableCell align="right">9,000,000 ກີບ</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    ລູກຄ້າທີ່ຊື້ຫຼາຍທີ່ສຸດ
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>ຊື່ລູກຄ້າ</TableCell>
                          <TableCell align="right">ຈຳນວນຄັ້ງທີ່ຊື້</TableCell>
                          <TableCell align="right">ມູນຄ່າການຊື້ທັງໝົດ</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>ພຸດທະເສນ ສິມມະຫາໂນ</TableCell>
                          <TableCell align="right">2</TableCell>
                          <TableCell align="right">9,000,000 ກີບ</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>ລຸ້ງຟ້າ ງາມ</TableCell>
                          <TableCell align="right">1</TableCell>
                          <TableCell align="right">8,000,000 ກີບ</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    ແນວໂນ້ມຍອດຂາຍ
                  </Typography>
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant="body1" color="textSecondary">
                      ກຳລັງພັດທະນາ... ແຜນວາດວິເຄາະຍອດຂາຍຈະສະແດງຢູ່ບ່ອນນີ້
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>
          
          {/* Footer for printed report */}
          <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid #ddd', textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              © {new Date().getFullYear()} GeePOS - ລະບົບຈັດການສິນຄ້າ
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Layout>
  );
}

export default Reports;