
import React, { useState, useEffect, useRef } from 'react';
import { getUserRole, ROLES } from '../services/roleService';
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
  Chip,
  Divider,
  Alert,
  IconButton,
  Tooltip,
  Tab,
  Tabs,
  Snackbar
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
  const userRole = getUserRole();

  const [reportType, setReportType] = useState('products');
  const printRef = useRef(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });


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
    originalSales: [], // Store original sales data to enable filtering
    purchases: [],
    imports: [],
    exports: []
  });


  
  const allReportTypes = [
    { value: 'products', label: 'ຂໍ້ມູນສິນຄ້າ', icon: <InventoryIcon />, 
      roles: [ROLES.ADMIN, ROLES.USER1, ROLES.USER2] },
    
    { value: 'categories', label: 'ຂໍ້ມູນປະເພດ', icon: <CategoryIcon />, 
      roles: [ROLES.ADMIN, ROLES.USER2] },
    
    { value: 'brands', label: 'ຂໍ້ມູນຍີ່ຫໍ້', icon: <BrandIcon />, 
      roles: [ROLES.ADMIN, ROLES.USER2] },
    
    { value: 'locations', label: 'ຂໍ້ມູນບ່ອນຈັດວາງ', icon: <LocationIcon />, 
      roles: [ROLES.ADMIN, ROLES.USER2] },
    
    { value: 'employees', label: 'ຂໍ້ມູນພະນັກງານ', icon: <PeopleIcon />, 
      roles: [ROLES.ADMIN] },
    
    { value: 'suppliers', label: 'ຂໍ້ມູນຜູ້ສະໜອງ', icon: <ShippingIcon />, 
      roles: [ROLES.ADMIN, ] },
    
    { value: 'customers', label: 'ຂໍ້ມູນລູກຄ້າ', icon: <PeopleIcon />, 
      roles: [ROLES.ADMIN, ROLES.USER1] },
    
    { value: 'purchases', label: 'ລາຍງານການສັ່ງຊື້', icon: <ShoppingCartIcon />, 
      roles: [ROLES.ADMIN, ROLES.USER2] },
    
    { value: 'sales', label: 'ລາຍງານການຂາຍ', icon: <StoreIcon />, 
      roles: [ROLES.ADMIN, ROLES.USER1] },
    
    { value: 'imports', label: 'ລາຍງານການນຳເຂົ້າ', icon: <ImportExportIcon />, 
      roles: [ROLES.ADMIN, ROLES.USER2] },
    
    { value: 'exports', label: 'ລາຍງານການນຳອອກ', icon: <ImportExportIcon />, 
      roles: [ROLES.ADMIN, ROLES.USER2] }
  ];

    // ປະເພດລາຍງານທັງໝົດ
    const reportTypes = allReportTypes.filter(type => type.roles.includes(userRole));

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    

  useEffect(() => {
    fetchAllData();
    if (reportTypes.length > 0 && !reportTypes.some(type => type.value === reportType)) {
      setReportType(reportTypes[0].value);
    }
  }, [reportType]);

  // ສະແດງຂໍ້ຄວາມແຈ້ງເຕືອນ
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // ປິດຂໍ້ຄວາມແຈ້ງເຕືອນ
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

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
        data = brandsRes.data.brands || [];
        break;
        
      case 'locations':
        const locationsRes = await axios.get(`${API_BASE_URL}/All/Location`);
        data = locationsRes.data.locations || [];
        break;
        
      case 'employees':
        const employeesRes = await axios.get(`${API_BASE_URL}/All/Employee`);
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
        
      case 'purchases':
        // ໃຊ້ຟັງຊັນພິເສດທີ່ມີລາຍລະອຽດ
        showSnackbar('ກຳລັງດຶງຂໍ້ມູນການສັ່ງຊື້ ແລະ ລາຍລະອຽດ...', 'info');
        data = await fetchPurchasesWithDetails();
        showSnackbar(`ດຶງຂໍ້ມູນສຳເລັດ: ${data.length} ລາຍການ`, 'success');
        break;
        
      case 'sales':
        const salesRes = await axios.get(`${API_BASE_URL}/sale/All/Sales`);
        data = salesRes.data.sales_data || [];
        break;
        
      case 'imports':
        const importsRes = await axios.get(`${API_BASE_URL}/import/All/Import`);
        data = importsRes.data.imports || [];
        break;
        
      case 'exports':
        try {
          const exportsRes = await axios.get(`${API_BASE_URL}/export/All/Export`);
          if (exportsRes.data && exportsRes.data.result_code === "200") {
            data = exportsRes.data.exports || [];
            data = data.map((item, index) => ({
              ...item,
              export_id: item.export_id || item.exp_id || `exp-${index}`,
              export_date: item.export_date || item.exp_date || new Date().toISOString().split('T')[0]
            }));
          } else {
            console.warn('Exports API returned unexpected format:', exportsRes.data);
            data = [];
          }
        } catch (err) {
          console.error('Error fetching exports data:', err);
          data = [];
        }
        break;
        
      default:
        console.warn(`ບໍ່ຮູ້ຈັກປະເພດລາຍງານ: ${reportType}`);
        break;
    }

    setReportData(prev => ({
      ...prev,
      [reportType]: data
    }));

  } catch (err) {
    console.error('Error fetching data:', err);
    const errorMessage = err.response?.data?.result || err.message || 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ';
    setError(errorMessage);
    showSnackbar(errorMessage, 'error');
  } finally {
    setLoading(false);
  }
};
  
  

// ຟັງຊັນສຳລັບດຶງຂໍ້ມູນລາຍການສັ່ງຊື້ພ້ອມຈຳນວນ ແລະ ລາຄາຕົ້ນທຶນ
const fetchPurchasesWithDetails = async () => {
  try {
    // ດຶງຂໍ້ມູນການສັ່ງຊື້ຫລັກ
    const ordersRes = await axios.get(`${API_BASE_URL}/order/All/Order`);
    let orders = ordersRes.data.user_info || [];
    
    // ດຶງຂໍ້ມູນການນຳເຂົ້າເພື່ອເອົາສະຖານະ
    const importsRes = await axios.get(`${API_BASE_URL}/import/All/Import`);
    const imports = importsRes.data.imports || [];
    
    // ສ້າງແມັບການນຳເຂົ້າຕາມ order_id
    const importMap = {};
    imports.forEach(imp => {
      importMap[imp.order_id] = imp;
    });
    
    // ດຶງລາຍລະອຽດຂອງແຕ່ລະການສັ່ງຊື້
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        // ຫາສະຖານະຈາກຕາຕະລາງ import
        const importRecord = importMap[order.order_id];
        let status = 'ລໍຖ້າ'; // ຄ່າເລີ່ມຕົ້ນ
        
        if (importRecord) {
          // ແປງສະຖານະເປັນພາສາລາວ
          switch (importRecord.status) {
            case 'Pending':
              status = 'ກຳລັງດຳເນີນການ';
              break;
            case 'Completed':
              status = 'ສຳເລັດ';
              break;
            case 'Cancelled':
              status = 'ຍົກເລີກ';
              break;
            default:
              status = importRecord.status || 'ລໍຖ້າ';
          }
        }
        
        try {
          // ໃຊ້ endpoint ທີ່ຖືກຕ້ອງສຳລັບດຶງລາຍລະອຽດ
          const detailsRes = await axios.post(`${API_BASE_URL}/import/Order/Products`, {
            order_id: order.order_id
          });
          
          let orderDetails = [];
          
          if (detailsRes.data && detailsRes.data.result_code === "200") {
            orderDetails = detailsRes.data.order_products || [];
          } else {
            // ຖ້າ API ຫລັກໃຊ້ບໍ່ໄດ້, ລອງວິທີສຳຮອງ
            try {
              const fallbackRes = await axios.post(`${API_BASE_URL}/order/Order_Detail/With/OrderID`, {
                order_id: order.order_id
              });
              
              if (fallbackRes.data && fallbackRes.data.result_code === "200") {
                orderDetails = fallbackRes.data.user_info || [];
                // ປັບແຕ່ງຂໍ້ມູນເພື່ອໃຫ້ເປັນໄປຕາມຮູບແບບ
                orderDetails = orderDetails.map(item => ({
                  ...item,
                  cost_price: item.cost_price || 0,
                  qty: item.qty || 0
                }));
              }
            } catch (fallbackErr) {
              console.warn(`API ສຳຮອງບໍ່ສາມາດໃຊ້ໄດ້ສຳລັບການສັ່ງຊື້ ${order.order_id}`);
            }
          }
          
          // ຄິດໄລ່ຈຳນວນລາຍການ ແລະ ລາຄາຕົ້ນທຶນລວມ
          const totalItems = orderDetails.length;
          const totalCost = orderDetails.reduce((sum, item) => {
            return sum + ((item.qty || 0) * (item.cost_price || 0));
          }, 0);
          
          return {
            ...order,
            total_items: totalItems,
            total_cost: totalCost,
            status: status, // ເພີ່ມສະຖານະ
            import_record: importRecord, // ເພີ່ມຂໍ້ມູນການນຳເຂົ້າ
            order_details: orderDetails
          };
        } catch (error) {
          console.warn(`ບໍ່ສາມາດດຶງລາຍລະອຽດສຳລັບການສັ່ງຊື້ ${order.order_id}:`, error.message);
          return {
            ...order,
            total_items: 0,
            total_cost: 0,
            status: status, // ເພີ່ມສະຖານະ
            import_record: importRecord,
            order_details: []
          };
        }
      })
    );
    
    return ordersWithDetails;
  } catch (error) {
    console.error('ຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນການສັ່ງຊື້:', error);
    throw error;
  }
};

const renderOrderDetails = (order) => {
  if (!order.order_details || order.order_details.length === 0) {
    return null;
  }
  
  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ p: 2 }}>
        ລາຍລະອຽດການສັ່ງຊື້ #{order.order_id}
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ສິນຄ້າ</TableCell>
            <TableCell align="center">ຈຳນວນ</TableCell>
            <TableCell align="right">ລາຄາຕົ້ນທຶນ/ໜ່ວຍ</TableCell>
            <TableCell align="right">ລາຄາລວມ</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {order.order_details.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.ProductName || '-'}</TableCell>
              <TableCell align="center">{item.qty || 0}</TableCell>
              <TableCell align="right">
                {formatNumber(item.cost_price || 0)} ກີບ
              </TableCell>
              <TableCell align="right">
                {formatNumber((item.qty || 0) * (item.cost_price || 0))} ກີບ
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell colSpan={3} align="right">
              <Typography variant="subtitle2" fontWeight="bold">
                ລວມທັງໝົດ:
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="subtitle2" fontWeight="bold">
                {formatNumber(order.total_cost || 0)} ກີບ
              </Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};


  // ຟັງຊັນກອງຂໍ້ມູນຕາມວັນທີ

const filterByDateRange = () => {
  if (!startDate && !endDate) {
    showSnackbar('ກະລຸນາລະບຸຊ່ວງວັນທີທີ່ຕ້ອງການກອງ', 'warning');
    return;
  }
  
  setLoading(true);
  
  try {
    // ເລືອກຂໍ້ມູນທີ່ຕ້ອງການກອງຕາມປະເພດລາຍງານ
    let originalData;
    let dateField;
    
    switch(reportType) {
      case 'sales':
        originalData = reportData.originalSales || [];
        dateField = 'date_sale';
        break;
      case 'imports':
        originalData = reportData.imports || [];
        dateField = 'imp_date';
        break;
      case 'exports':
        originalData = reportData.exports || [];
        dateField = 'export_date';
        break;
      case 'purchases':
        originalData = reportData.purchases || [];
        dateField = 'order_date';
        break;
      default:
        showSnackbar('ປະເພດລາຍງານນີ້ບໍ່ສາມາດກອງດ້ວຍວັນທີໄດ້', 'error');
        setLoading(false);
        return;
    }
    
    if (!originalData || originalData.length === 0) {
      showSnackbar('ບໍ່ມີຂໍ້ມູນເພື່ອກອງ', 'warning');
      setLoading(false);
      return;
    }
    
    let filtered = [...originalData];
    
    if (startDate) {
      const startDateTime = new Date(startDate);
      startDateTime.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(item => {
        if (!item[dateField]) return false;
        const itemDate = new Date(item[dateField]);
        return !isNaN(itemDate.getTime()) && itemDate >= startDateTime;
      });
    }
    
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(item => {
        if (!item[dateField]) return false;
        const itemDate = new Date(item[dateField]);
        return !isNaN(itemDate.getTime()) && itemDate <= endDateTime;
      });
    }
    
    // ອັບເດດຂໍ້ມູນຕາມປະເພດລາຍງານ
    setReportData(prev => ({
      ...prev,
      [reportType]: filtered
    }));
    
    showSnackbar(`ກອງຂໍ້ມູນສຳເລັດ: ພົບ ${filtered.length} ລາຍການ`, 'success');
  } catch (error) {
    console.error("Error filtering by date range:", error);
    showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການກອງຂໍ້ມູນ', 'error');
  } finally {
    setLoading(false);
  }
};

  // ລ້າງຕົວກອງວັນທີ
  const clearDateFilters = () => {
    setStartDate('');
    setEndDate('');
    
    // Restore original data
    if (reportData.originalSales) {
      setReportData(prev => ({
        ...prev,
        sales: prev.originalSales
      }));
      
      showSnackbar('ລ້າງຕົວກອງວັນທີແລ້ວ', 'info');
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      showSnackbar('ບໍ່ສາມາດເປີດໜ້າຕ່າງພິມໄດ້. ກະລຸນາອະນຸຍາດ popup ໃນ browser ຂອງທ່ານ.', 'error');
      return;
    }
    
    // ກຽມຂໍ້ມູນທີ່ຈະພິມ
    const contentToPrint = document.createElement('div');
    contentToPrint.innerHTML = `
      <html>
        <head>
          <title>ລາຍງານ ${reportTypes.find(r => r.value === reportType)?.label || ''}</title>
          <style>
            body { font-family: 'Noto Sans Lao', 'Phetsarath OT', sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f3f3f3; text-align: left; }
            th, td { border: 1px solid #ddd; padding: 8px; }
            h2 { text-align: center; margin-bottom: 20px; }
            .report-header { text-align: center; margin-bottom: 30px; }
            .date-range { text-align: right; font-size: 12px; margin-bottom: 10px; }
            @media print {
              button { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="report-header">
            <h2>ລາຍງານ ${reportTypes.find(r => r.value === reportType)?.label || ''}</h2>
            <p>${new Date().toLocaleDateString('lo-LA')}</p>
          </div>
          ${startDate || endDate ? `
            <div class="date-range">
              ຂໍ້ມູນຈາກ: ${startDate || '---'} ຫາ ${endDate || '---'}
            </div>
          ` : ''}
          ${document.querySelector('.MuiTableContainer-root')?.outerHTML || '<p>ບໍ່ມີຂໍ້ມູນສຳລັບພິມ</p>'}
          <div style="text-align: center; margin-top: 30px;">
            <button onclick="window.print();window.close()">ພິມເອກະສານ</button>
          </div>
        </body>
      </html>
    `;
    
    // ຍ້າຍຂໍ້ມູນໄປຍັງໜ້າຕ່າງພິມ
    printWindow.document.open();
    printWindow.document.write(contentToPrint.innerHTML);
    printWindow.document.close();
    
    // ໃຫ້ browser ໂຫຼດຂໍ້ມູນກ່ອນພິມ
    setTimeout(() => {
      try {
        printWindow.focus();
        printWindow.print();
      } catch (error) {
        console.error('ບໍ່ສາມາດພິມໄດ້:', error);
        showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການພິມ', 'error');
      }
    }, 500);
  };

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

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === '-') return "-";
    
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    } catch (error) {
      console.error("Date formatting error:", error);
      return dateStr;
    }
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
          {reportData.products.length > 0 ? (
            reportData.products.map((product) => (
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
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} align="center">
                {loading ? 'ກຳລັງໂຫຼດຂໍ້ມູນ...' : 'ບໍ່ມີຂໍ້ມູນສິນຄ້າ'}
              </TableCell>
            </TableRow>
          )}
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
          {reportData.categories.length > 0 ? (
            reportData.categories.map((category) => (
              <TableRow key={category.cat_id}>
                <TableCell>{category.cat_id}</TableCell>
                <TableCell>{category.category}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={2} align="center">
                {loading ? 'ກຳລັງໂຫຼດຂໍ້ມູນ...' : 'ບໍ່ພົບຂໍ້ມູນປະເພດສິນຄ້າ'}
              </TableCell>
            </TableRow>
          )}
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
          {reportData.brands.length > 0 ? (
            reportData.brands.map((brand) => (
              <TableRow key={brand.brand_id}>
                <TableCell>{brand.brand_id}</TableCell>
                <TableCell>{brand.brand}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={2} align="center">
                {loading ? 'ກຳລັງໂຫຼດຂໍ້ມູນ...' : 'ບໍ່ພົບຂໍ້ມູນຍີ່ຫໍ້'}
              </TableCell>
            </TableRow>
          )}
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
          {reportData.locations.length > 0 ? (
            reportData.locations.map((location) => (
              <TableRow key={location.zone_id}>
                <TableCell>{location.zone_id}</TableCell>
                <TableCell>{location.zone}</TableCell>
                <TableCell>{location.zone_detail}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} align="center">
                {loading ? 'ກຳລັງໂຫຼດຂໍ້ມູນ...' : 'ບໍ່ພົບຂໍ້ມູນບ່ອນຈັດວາງ'}
              </TableCell>
            </TableRow>
          )}
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
          {reportData.employees.length > 0 ? (
            reportData.employees.map((employee) => (
              <TableRow key={employee.emp_id}>
                <TableCell>{employee.emp_id}</TableCell>
                <TableCell>{employee.emp_name} {employee.emp_lname}</TableCell>
                <TableCell>{employee.gender}</TableCell>
                <TableCell>{employee.tel}</TableCell>
                <TableCell>{employee.status}</TableCell>
                <TableCell>{formatDate(employee.start_date)}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} align="center">
                {loading ? 'ກຳລັງໂຫຼດຂໍ້ມູນ...' : 'ບໍ່ພົບຂໍ້ມູນພະນັກງານ'}
              </TableCell>
            </TableRow>
          )}
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
          {reportData.suppliers.length > 0 ? (
            reportData.suppliers.map((supplier) => (
              <TableRow key={supplier.sup_id}>
                <TableCell>{supplier.sup_id}</TableCell>
                <TableCell>{supplier.sup_name}</TableCell>
                <TableCell>{supplier.contract_name}</TableCell>
                <TableCell>{supplier.email}</TableCell>
                <TableCell>{supplier.tel}</TableCell>
                <TableCell>{supplier.address}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} align="center">
                {loading ? 'ກຳລັງໂຫຼດຂໍ້ມູນ...' : 'ບໍ່ພົບຂໍ້ມູນຜູ້ສະໜອງ'}
              </TableCell>
            </TableRow>
          )}
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
          {reportData.customers.length > 0 ? (
            reportData.customers.map((customer) => (
              <TableRow key={customer.cus_id}>
                <TableCell>{customer.cus_id}</TableCell>
                <TableCell>{customer.cus_name} {customer.cus_lname}</TableCell>
                <TableCell>{customer.gender}</TableCell>
                <TableCell>{customer.tel}</TableCell>
                <TableCell>{customer.address}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} align="center">
                {loading ? 'ກຳລັງໂຫຼດຂໍ້ມູນ...' : 'ບໍ່ພົບຂໍ້ມູນລູກຄ້າ'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

// 8. ລາຍງານການສັ່ງຊື້ - ປັບປຸງໃໝ່ເພື່ອເພີ່ມຈຳນວນ ແລະ ລາຄາຕົ້ນທຶນ
const renderPurchasesReport = () => (
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>ເລກທີ່</TableCell>
          <TableCell>ວັນທີ່</TableCell>
          <TableCell>ຂື້ສະໜອງ</TableCell>
          <TableCell>ພະນັກງານ</TableCell>
          <TableCell align="center">ຈຳນວນລາຍການ</TableCell>
          <TableCell align="right">ລາຄາຕົ້ນທຶນລວມ</TableCell>
          <TableCell align="center">ສະຖານະ</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {reportData.purchases.length > 0 ? (
          reportData.purchases.map((order) => (
            <TableRow key={order.order_id}>
              <TableCell>{order.order_id}</TableCell>
              <TableCell>{formatDate(order.order_date)}</TableCell>
              <TableCell>{order.supplier || order.supplier_name || order.sup_name || '-'}</TableCell>
              <TableCell>{order.employee || order.emp_name || '-'}</TableCell>
              <TableCell align="center">
                <Typography variant="body2" color={order.total_items > 0 ? 'primary' : 'text.secondary'}>
                  {order.total_items || 0} ລາຍການ
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" color={order.total_cost > 0 ? 'success.main' : 'text.secondary'}>
                  {formatNumber(order.total_cost || 0)} ກີບ
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Tooltip 
                  title={
                    order.import_record ? 
                    `ວັນທີນຳເຂົ້າ: ${formatDate(order.import_record.imp_date)} | ມູນຄ່າ: ${formatNumber(order.import_record.total_price)} ກີບ` :
                    'ຍັງບໍ່ໄດ້ນຳເຂົ້າ'
                  }
                  arrow
                >
                  <Chip 
                    label={order.status} 
                    color={
                      order.status === 'ສຳເລັດ' ? 'success' :
                      order.status === 'ກຳລັງດຳເນີນການ' ? 'warning' :
                      order.status === 'ຍົກເລີກ' ? 'error' :
                      'default'
                    }
                    size="small"
                    variant="outlined"
                    sx={{
                      fontWeight: 'bold',
                      minWidth: '90px',
                      cursor: 'help'
                    }}
                  />
                </Tooltip>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={7} align="center">
              {loading ? 'ກຳລັງໂຫຼດຂໍ້ມູນ...' : 'ບໍ່ພົບຂໍ້ມູນການສັ່ງຊື້'}
            </TableCell>
          </TableRow>
        )}
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
          {reportData.sales.length > 0 ? (
            reportData.sales.map((sale) => (
              <TableRow key={sale.sale_id}>
                <TableCell>{sale.sale_id}</TableCell>
                <TableCell>{formatDate(sale.date_sale)}</TableCell>
                <TableCell>
                  {sale.customer_name || "ລູກຄ້າທົ່ວໄປ"}
                </TableCell>
                <TableCell>
                  {sale.emp_name || "-"}
                </TableCell>
                <TableCell align="right">{formatNumber(sale.subtotal)} ກີບ</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} align="center">
                {loading ? 'ກຳລັງໂຫຼດຂໍ້ມູນ...' : 'ບໍ່ພົບຂໍ້ມູນການຂາຍ'}
              </TableCell>
            </TableRow>
          )}
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
          {reportData.imports.length > 0 ? (
            reportData.imports.map((imp) => (
              <TableRow key={imp.imp_id}>
                <TableCell>{imp.imp_id}</TableCell>
                <TableCell>{formatDate(imp.imp_date)}</TableCell>
                <TableCell>{imp.order_id}</TableCell>
                <TableCell>{imp.emp_name}</TableCell>
                <TableCell align="right">{formatNumber(imp.total_price)} ກີບ</TableCell>
                <TableCell align="center">{imp.status}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} align="center">
                {loading ? 'ກຳລັງໂຫຼດຂໍ້ມູນ...' : 'ບໍ່ພົບຂໍ້ມູນການນຳເຂົ້າ'}
              </TableCell>
            </TableRow>
          )}
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
            <TableCell align="center" width="10%">ລຳດັບ</TableCell>
            <TableCell>ເລກທີ່</TableCell>
            <TableCell>ວັນທີ່</TableCell>
            <TableCell>ພະນັກງານ</TableCell>
            <TableCell align="center">ສະຖານະ</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reportData.exports.length > 0 ? (
            reportData.exports.map((exp, index) => (
              <TableRow key={exp.export_id || exp.exp_id || index}>
                <TableCell align="center">{index + 1}</TableCell>
                <TableCell>{exp.export_id || exp.exp_id || '-'}</TableCell>
                <TableCell>
                  {formatDate(exp.export_date || exp.exp_date || '-')}
                </TableCell>
                <TableCell>{exp.emp_name || '-'}</TableCell>
                <TableCell align="center">{exp.status || '-'}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} align="center">
                {loading ? 'ກຳລັງໂຫຼດຂໍ້ມູນ...' : 'ບໍ່ພົບຂໍ້ມູນການນຳອອກສິນຄ້າ'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Layout title="ລາຍງານ">
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

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
                InputLabelProps={{ 
                  shrink: true 
                }}
                disabled={reportType !== 'sales' && reportType !== 'imports' && reportType !== 'exports' && reportType !== 'purchases'}
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
                InputLabelProps={{ 
                  shrink: true 
                }}
                disabled={reportType !== 'sales' && reportType !== 'imports' && reportType !== 'exports' && reportType !== 'purchases'}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              {reportType === 'sales' || reportType === 'imports' || reportType === 'exports' || reportType === 'purchases' ? (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    color="primary"
                    variant="outlined"
                    onClick={clearDateFilters}
                    disabled={loading || (!startDate && !endDate)}
                    sx={{ flex: 1 }}
                  >
                    ລ້າງ
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<FilterListIcon />}
                    onClick={filterByDateRange}
                    disabled={loading || (!startDate && !endDate)}
                    sx={{ flex: 2 }}
                  >
                    ກອງ
                  </Button>
                </Box>
              ) : (
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
              )}
            </Grid>
          </Grid>
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            {(reportType === 'sales' || reportType === 'imports' || reportType === 'exports' || reportType === 'purchases') && (
              <Typography variant="body2" color="text.secondary">
                {reportData[reportType]?.length || 0} ລາຍການ
                {(startDate || endDate) && ' (ຫຼັງຈາກກອງຂໍ້ມູນ)'}
              </Typography>
            )}
          </Box>
          <Box>
          <Tooltip title="ພິມລາຍງານ">
  <IconButton 
    onClick={handlePrint}
    disabled={loading || !reportData[reportType] || reportData[reportType].length === 0}
  >
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