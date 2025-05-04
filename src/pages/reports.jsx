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
  Tabs
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  DateRange as DateRangeIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  PeopleAlt as PeopleIcon,
  LocalShipping as ShippingIcon,
  Category as CategoryIcon,
  Storefront as StoreIcon,
  LocationOn as LocationIcon,
  BrandingWatermark as BrandIcon,
  ImportExport as ImportExportIcon
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
  const [reportType, setReportType] = useState('products');
  const printRef = React.useRef();

  // ຂໍ້ມູນສຳລັບລາຍງານ
  const [reportData, setReportData] = useState({
    products: [],
    categories: [],
    brands: [],
    locations: [],
    employees: [],
    suppliers: [],
    customers: [],
    sales: [],
    purchases: [],
    imports: [],
    exports: []
  });

  // ປະເພດລາຍງານທັງໝົດ
  const reportTypes = [
    { value: 'products', label: 'ຂໍ້ມູນສິນຄ້າ', icon: <InventoryIcon /> },
    { value: 'categories', label: 'ຂໍ້ມູນປະເພດ', icon: <CategoryIcon /> },
    { value: 'brands', label: 'ຂໍ້ມູນຍີ່ຫໍ້', icon: <BrandIcon /> },
    { value: 'locations', label: 'ຂໍ້ມູນບ່ອນຈັດວາງ', icon: <LocationIcon /> },
    { value: 'employees', label: 'ຂໍ້ມູນພະນັກງານ', icon: <PeopleIcon /> },
    { value: 'suppliers', label: 'ຂໍ້ມູນຜູ້ສະໜອງ', icon: <ShippingIcon /> },
    { value: 'customers', label: 'ຂໍ້ມູນລູກຄ້າ', icon: <PeopleIcon /> },
    { value: 'purchases', label: 'ລາຍງານການສັ່ງຊື້', icon: <ShoppingCartIcon /> },
    { value: 'sales', label: 'ລາຍງານການຂາຍ', icon: <StoreIcon /> },
    { value: 'imports', label: 'ລາຍງານການນຳເຂົ້າ', icon: <ImportExportIcon /> },
    { value: 'exports', label: 'ລາຍງານການນຳອອກ', icon: <ImportExportIcon /> }
  ];

  useEffect(() => {
    fetchAllData();
  }, [reportType]);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let data = [];
      
      switch(reportType) {
        case 'products':
          const productsRes = await axios.get(`${API_BASE_URL}/All/Product`);
          data = productsRes.data.products || [];
          break;
          
        case 'categories':
          const categoriesRes = await axios.get(`${API_BASE_URL}/All/Category`);
          data = categoriesRes.data.categories || [];
          break;
          
        case 'brands':
          const brandsRes = await axios.get(`${API_BASE_URL}/All/Brand`);
          data = brandsRes.data.user_info || [];
          break;
          
        case 'locations':
          const locationsRes = await axios.get(`${API_BASE_URL}/All/Zone`);
          data = locationsRes.data.user_info || [];
          break;
          
        case 'employees':
          const employeesRes = await axios.get(`${API_BASE_URL}/users/All/Employee`);
          data = employeesRes.data.user_info || [];
          break;
          
        case 'suppliers':
          const suppliersRes = await axios.get(`${API_BASE_URL}/users/All/Supplier`);
          data = suppliersRes.data.user_info || [];
          break;
          
        case 'customers':
          const customersRes = await axios.get(`${API_BASE_URL}/users/All/Customer`);
          data = customersRes.data.user_info || [];
          break;
          
        case 'sales':
          const salesRes = await axios.get(`${API_BASE_URL}/sale/All/Sales`);
          data = salesRes.data.sales || [];
          break;
          
        case 'purchases':
          const purchasesRes = await axios.get(`${API_BASE_URL}/order/All/Order`);
          data = purchasesRes.data.user_info || [];
          break;
          
        case 'imports':
          const importsRes = await axios.get(`${API_BASE_URL}/import/All/Import`);
          data = importsRes.data.imports || [];
          break;
          
        case 'exports':
          const exportsRes = await axios.get(`${API_BASE_URL}/export/All/Export`);
          data = exportsRes.data.exports || [];
          break;
      }

      setReportData(prev => ({
        ...prev,
        [reportType]: data
      }));

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `ລາຍງານ ${reportTypes.find(r => r.value === reportType)?.label}`,
  });

  const handleExportExcel = () => {
    const data = reportData[reportType] || [];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `report_${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const formatNumber = (num) => {
    if (!num && num !== 0) return "0";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('lo-LA');
  };

  // ຟັງຊັນສຳລັບການສະແດງຜົນລາຍງານແຕ່ລະປະເພດ
  const renderReportContent = () => {
    switch (reportType) {
      case 'products':
        return renderProductsReport();
      case 'categories':
        return renderCategoriesReport();
      case 'brands':
        return renderBrandsReport();
      case 'locations':
        return renderLocationsReport();
      case 'employees':
        return renderEmployeesReport();
      case 'suppliers':
        return renderSuppliersReport();
      case 'customers':
        return renderCustomersReport();
      case 'sales':
        return renderSalesReport();
      case 'purchases':
        return renderPurchasesReport();
      case 'imports':
        return renderImportsReport();
      case 'exports':
        return renderExportsReport();
      default:
        return null;
    }
  };

  // 1. ລາຍງານສິນຄ້າ
  const renderProductsReport = () => (
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
  );

  // 2. ລາຍງານປະເພດສິນຄ້າ
  const renderCategoriesReport = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ລະຫັດ</TableCell>
            <TableCell>ຊື່ປະເພດ</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reportData.categories.map((category) => (
            <TableRow key={category.cat_id}>
              <TableCell>{category.cat_id}</TableCell>
              <TableCell>{category.category}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // 3. ລາຍງານຍີ່ຫໍ້
  const renderBrandsReport = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ລະຫັດ</TableCell>
            <TableCell>ຊື່ຍີ່ຫໍ້</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reportData.brands.map((brand) => (
            <TableRow key={brand.brand_id}>
              <TableCell>{brand.brand_id}</TableCell>
              <TableCell>{brand.brand}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // 4. ລາຍງານບ່ອນຈັດວາງ
  const renderLocationsReport = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ລະຫັດ</TableCell>
            <TableCell>ໂຊນ</TableCell>
            <TableCell>ລາຍລະອຽດ</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reportData.locations.map((location) => (
            <TableRow key={location.zone_id}>
              <TableCell>{location.zone_id}</TableCell>
              <TableCell>{location.zone}</TableCell>
              <TableCell>{location.zone_detail}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // 5. ລາຍງານພະນັກງານ
  const renderEmployeesReport = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ລະຫັດ</TableCell>
            <TableCell>ຊື່-ນາມສະກຸນ</TableCell>
            <TableCell>ເພດ</TableCell>
            <TableCell>ເບີໂທ</TableCell>
            <TableCell>ສະຖານະ</TableCell>
            <TableCell>ວັນທີ່ເລີ່ມເຮັດວຽກ</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reportData.employees.map((employee) => (
            <TableRow key={employee.emp_id}>
              <TableCell>{employee.emp_id}</TableCell>
              <TableCell>{employee.emp_name} {employee.emp_lname}</TableCell>
              <TableCell>{employee.gender}</TableCell>
              <TableCell>{employee.tel}</TableCell>
              <TableCell>{employee.status}</TableCell>
              <TableCell>{formatDate(employee.start_date)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // 6. ລາຍງານຜູ້ສະໜອງ
  const renderSuppliersReport = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ລະຫັດ</TableCell>
            <TableCell>ຊື່ບໍລິສັດ</TableCell>
            <TableCell>ຊື່ຜູ້ຕິດຕໍ່</TableCell>
            <TableCell>ອີເມວ</TableCell>
            <TableCell>ເບີໂທ</TableCell>
            <TableCell>ທີ່ຢູ່</TableCell>
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
              <TableCell>{supplier.address}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // 7. ລາຍງານລູກຄ້າ
  const renderCustomersReport = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ລະຫັດ</TableCell>
            <TableCell>ຊື່-ນາມສະກຸນ</TableCell>
            <TableCell>ເພດ</TableCell>
            <TableCell>ເບີໂທ</TableCell>
            <TableCell>ທີ່ຢູ່</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reportData.customers.map((customer) => (
            <TableRow key={customer.cus_id}>
              <TableCell>{customer.cus_id}</TableCell>
              <TableCell>{customer.cus_name} {customer.cus_lname}</TableCell>
              <TableCell>{customer.gender}</TableCell>
              <TableCell>{customer.tel}</TableCell>
              <TableCell>{customer.address}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // 8. ລາຍງານການສັ່ງຊື້
  const renderPurchasesReport = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ເລກທີ່</TableCell>
            <TableCell>ວັນທີ່</TableCell>
            <TableCell>ຜູ້ສະໜອງ</TableCell>
            <TableCell>ພະນັກງານ</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reportData.purchases.map((order) => (
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
  );

  // 9. ລາຍງານການຂາຍ
  const renderSalesReport = () => (
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
  );

  // 10. ລາຍງານການນຳເຂົ້າ
  const renderImportsReport = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ເລກທີ່</TableCell>
            <TableCell>ວັນທີ່</TableCell>
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
  );

  // 11. ລາຍງານການນຳອອກ
  const renderExportsReport = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ເລກທີ່</TableCell>
            <TableCell>ວັນທີ່</TableCell>
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
            <Grid item xs={12} md={4}>
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
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                startIcon={<AssessmentIcon />}
                onClick={fetchAllData}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'ສ້າງລາຍງານ'}
              </Button>
            </Grid>
          </Grid>
        </Paper>

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
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            renderReportContent()
          )}
        </Box>
      </Box>
    </Layout>
  );
}

export default Reports;