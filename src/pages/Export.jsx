import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { createExport } from '../services/exportService';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Grid,
  InputAdornment,
  Snackbar,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Card,
  CardContent,
  Skeleton,
  Stack,
  Divider,
  Tooltip,
  useMediaQuery,
  useTheme,
  Badge,
  Avatar,
  LinearProgress,
  Collapse,
  Fade,
  MenuItem
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Save as SaveIcon,
  Search as SearchIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  History as HistoryIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  FilterList as FilterListIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { SuccessDialog, ErrorDialog } from '../components/SuccessDialog';
import { getCurrentUser } from '../services/authService';
import ExportFormDialog from '../components/ExportFormDialog';

function Export() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // State for product selection
  const [searchTerm, setSearchTerm] = useState('');
  const [exportItems, setExportItems] = useState([]);
  const [exportDate, setExportDate] = useState(new Date().toISOString().split('T')[0]);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Product selection dialog state
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [exportQuantity, setExportQuantity] = useState(1);
  const [exportLocation, setExportLocation] = useState('');
  const [exportReason, setExportReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  
  // Print dialog state
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const printRef = useRef(null);
  
  // Notification state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Filter state
  const [filterExpanded, setFilterExpanded] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  
  // Get current user
  const currentUser = getCurrentUser();
  
  // Products state
  const [products, setProducts] = useState([]);
  const [zones, setZones] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Load products and zones when component mounts
  useEffect(() => {
    fetchProducts();
    fetchZones();
    fetchCategories();
  }, []);
  
  // Function to fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/All/Category`);
      
      if (response.data && response.data.result_code === "200") {
        setCategories(response.data.categories || []);
      } else {
        // Use sample data if API returns unexpected format
        setCategories([
          { cat_id: 1, category: 'ແອ' },
          { cat_id: 2, category: 'ຕູ້ເຢັນ' },
          { cat_id: 5, category: 'ໂທລະທັດ' },
          { cat_id: 4, category: 'ຈັກຊັກເຄື່ອງ' }
        ]);
      }
    } catch (error) {
      console.error('ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນໝວດໝູ່:', error);
      // Set sample categories if API fails
      setCategories([
        { cat_id: 1, category: 'ແອ' },
        { cat_id: 2, category: 'ຕູ້ເຢັນ' },
        { cat_id: 5, category: 'ໂທລະທັດ' },
        { cat_id: 4, category: 'ຈັກຊັກເຄື່ອງ' }
      ]);
    }
  };
  
  // Function to fetch products
  const fetchProducts = async () => {
    try {
      setProductLoading(true);
      const response = await axios.get(`${API_BASE_URL}/All/Product`);
      
      if (response.data && response.data.result_code === "200") {
        // Create zone mapping for location display
        const zoneMap = zones.reduce((acc, zone) => {
          acc[zone.zone_id] = zone.zone;
          return acc;
        }, {});
        
        // Format products data
        const formattedProducts = response.data.products.map(product => ({
          id: product.proid,
          name: product.ProductName,
          stock: parseInt(product.qty) || 0,
          minStock: parseInt(product.qty_min) || 0,
          location: product.zone || (product.zone_id && zoneMap[product.zone_id]) || 'ບໍ່ລະບຸ',
          zone_id: product.zone_id ? parseInt(product.zone_id) : null, // ຮັບປະກັນວ່າເປັນຕົວເລກ
          brand: product.brand,
          category: product.category,
          cat_id: product.cat_id
        }));
        
        console.log('Formatted products with zone_id:', formattedProducts);
        setProducts(formattedProducts);
        showSnackbar('ໂຫຼດຂໍ້ມູນສິນຄ້າສຳເລັດ', 'success');
      } else {
        throw new Error('ຂໍ້ມູນບໍ່ຖືກຕ້ອງ');
      }
    } catch (error) {
      console.error('ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນສິນຄ້າ:', error);
      showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນສິນຄ້າ', 'error');
      
      // Use sample data in case of API failure
      setProducts([
        { id: 1, name: 'ຕູ້ເຢັນ Samsung', stock: 10, minStock: 5, location: 'B-05', zone_id: 2, brand: 'Samsung', category: 'ຕູ້ເຢັນ', cat_id: 2 },
        { id: 2, name: 'ໂທລະທັດ LG', stock: 15, minStock: 3, location: 'A-01', zone_id: 1, brand: 'LG', category: 'ໂທລະທັດ', cat_id: 5 },
        // ... other sample data
      ]);
    } finally {
      setProductLoading(false);
    }
  };
  
  
  // Function to fetch zones
  const fetchZones = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/All/Zone`);
      
      if (response.data && response.data.result_code === "200") {
        setZones(response.data.user_info || []);
      }
    } catch (error) {
      console.error('ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນບ່ອນຈັດວາງ:', error);
      // Set sample zones if API fails
      setZones([
        { zone_id: 1, zone: 'A', zone_detail: 'ບ່ອນຈັດວາງ A' },
        { zone_id: 2, zone: 'B', zone_detail: 'ບ່ອນຈັດວາງ B' },
        { zone_id: 3, zone: 'C', zone_detail: 'ບ່ອນຈັດວາງ C' }
      ]);
    }
  };

  // Format date to DD/MM/YYYY
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  // Filter products based on search term and filters
  const filteredProducts = products.filter(product => {
    // Text search filtering
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Category filtering
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    
    // Location filtering
    const matchesLocation = locationFilter === 'all' || product.location === locationFilter;
    
    // Stock filtering
    const matchesStock = 
      stockFilter === 'all' || 
      (stockFilter === 'low' && product.stock <= product.minStock) ||
      (stockFilter === 'out' && product.stock === 0) ||
      (stockFilter === 'available' && product.stock > 0);
    
    return matchesSearch && matchesCategory && matchesLocation && matchesStock;
  });

  // Get unique categories from products
  const uniqueCategories = [...new Set(products.map(product => product.category))].filter(Boolean);
  
  // Get unique locations from products
  const uniqueLocations = [...new Set(products.map(product => product.location))].filter(Boolean);

  // Open dialog to add product to export
  const handleOpenFormDialog = (product) => {
    console.log('Opening form dialog with product:', product);
    setCurrentProduct(product);
    setExportQuantity(1);
    setExportLocation(product.location || 'ບໍ່ລະບຸ');
    setExportReason('');
    setApiError(null);
    setFormDialogOpen(true);
  };

  // Close product selection dialog
  const handleCloseFormDialog = () => {
    setFormDialogOpen(false);
    setCurrentProduct(null);
    setApiError(null);
  };

  // Add product to export list
  const handleAddToExport = (productFromDialog) => {
    try {
      console.log('Product received from dialog:', productFromDialog);
      
      // ໃຊ້ຂໍ້ມູນທີ່ສົ່ງມາຈາກ dialog
      const exportItem = {
        ...productFromDialog,
        id: productFromDialog.id,
        zone_id: productFromDialog.zone_id,
        exportQuantity: productFromDialog.exportQuantity,
        exportLocation: productFromDialog.exportLocation,
        exportReason: productFromDialog.exportReason
      };
  
      console.log('Final export item to add:', exportItem);
  
      // Check if product already exists in export list
      const existingIndex = exportItems.findIndex(item => item.id === productFromDialog.id);
      
      if (existingIndex >= 0) {
        // Update existing item
        const updatedItems = [...exportItems];
        updatedItems[existingIndex] = exportItem;
        setExportItems(updatedItems);
      } else {
        // Add new item
        setExportItems([...exportItems, exportItem]);
      }
  
      // Close dialog
      setFormDialogOpen(false);
      showSnackbar('ເພີ່ມສິນຄ້າສຳເລັດແລ້ວ', 'success');
    } catch (error) {
      console.error('ເກີດຂໍ້ຜິດພາດໃນການເພີ່ມສິນຄ້າ:', error);
      setApiError('ເກີດຂໍ້ຜິດພາດໃນການເພີ່ມສິນຄ້າ');
    }
  };

  // Remove product from export list
  const handleRemoveFromExport = (id) => {
    setExportItems(exportItems.filter(item => item.id !== id));
    showSnackbar('ລຶບສິນຄ້າອອກຈາກລາຍການແລ້ວ', 'info');
  };


// Save export to database
const handleSaveExport = async () => {
  if (exportItems.length === 0) {
    showSnackbar('ກະລຸນາເລືອກສິນຄ້າກ່ອນບັນທຶກການນຳອອກ', 'warning');
    return;
  }

  try {
    setLoading(true);
    
    // Debug log to check zone_id in export items
    console.log("Export items before creating export data:", exportItems);
    
    // Create export data for API
    const exportData = {
      emp_id: currentUser?.emp_id || 1,
      export_date: exportDate,
      status: 'ລໍຖ້າອະນຸມັດ',
      items: exportItems.map(item => {
        console.log(`Processing item: ${item.name}, zone_id: ${item.zone_id}`);
        
        // ກວດສອບໃຫ້ແນ່ໃຈວ່າມີ zone_id
        const zoneId = item.zone_id || 1; // ຖ້າບໍ່ມີໃຫ້ໃຊ້ຄ່າ default
        
        return {
          id: item.id,
          proid: item.id || item.proid,
          name: item.name,
          qty: item.exportQuantity,
          exportQuantity: item.exportQuantity,
          exportLocation: item.exportLocation || item.location || '',
          zone_id: zoneId, // ໃສ່ zone_id ໃຫ້ຊັດເຈນ
          reason: item.exportReason,
          exportReason: item.exportReason
        };
      })
    };
    
    console.log("Final export data being sent to API:", JSON.stringify(exportData, null, 2));
    
    // Send data to API
    const result = await createExport(exportData);
    
    console.log('API Response:', result);
    
    // Show success dialog
    setShowSuccessDialog(true);
    
    // Clear export items
    setExportItems([]);
  } catch (error) {
    console.error('ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກການນຳອອກ:', error);
    setErrorMessage(error.message || 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກການນຳອອກ');
    setShowErrorDialog(true);
  } finally {
    setLoading(false);
  }
};

  // Dialog event handlers
  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
  };

  const handleNavigateToExportHistory = () => {
    setShowSuccessDialog(false);
    navigate('/export-detail');
  };

  const handleCloseErrorDialog = () => {
    setShowErrorDialog(false);
  };

  const handleTryAgain = () => {
    setShowErrorDialog(false);
    handleSaveExport();
  };

  // Print dialog handlers
  const handleOpenPrintDialog = () => {
    if (exportItems.length === 0) {
      showSnackbar('ກະລຸນາເລືອກສິນຄ້າກ່ອນພິມໃບນຳອອກ', 'warning');
      return;
    }
    setPrintDialogOpen(true);
  };

  const handleClosePrintDialog = () => {
    setPrintDialogOpen(false);
  };

  const handlePrintExport = () => {
    if (printRef.current) {
      const printContent = printRef.current;
      const windowUrl = 'about:blank';
      const windowName = 'Print';
      const windowFeatures = 'width=800,height=600,left=50,top=50';
      
      const printWindow = window.open(windowUrl, windowName, windowFeatures);
      
      printWindow.document.write('<html><head><title>ໃບນຳອອກສິນຄ້າ</title>');
      printWindow.document.write('<style>');
      printWindow.document.write(`
        body { font-family: 'Noto Sans Lao', 'Phetsarath OT', sans-serif; padding: 20px; }
        .export-header { text-align: center; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th, td { padding: 8px; border: 1px solid #ddd; text-align: center; }
        thead { background-color: #f0f0f0; }
        .signatures { display: flex; justify-content: space-around; margin-top: 50px; }
        .signature-box { width: 200px; text-align: center; }
        .signature-line { border-top: 1px solid #000; margin-top: 70px; padding-top: 10px; }
        @media print {
          body { margin: 0; padding: 0.5cm; }
          table { page-break-inside: avoid; }
        }
      `);
      printWindow.document.write('</style></head><body>');
      printWindow.document.write(printContent.innerHTML);
      printWindow.document.write('</body></html>');
      
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        setPrintDialogOpen(false);
        showSnackbar('ສົ່ງຄຳສັ່ງພິມສຳເລັດແລ້ວ', 'success');
      }, 500);
    } else {
      showSnackbar('ບໍ່ສາມາດພິມໄດ້ໃນຂະນະນີ້', 'error');
    }
  };
  
  // Show snackbar notification
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };
  
  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };
  
  // Get total export quantity
  const getTotalExportQuantity = () => {
    return exportItems.reduce((total, item) => total + item.exportQuantity, 0);
  };
  
  // Handle filter expansion toggle
  const toggleFilterExpansion = () => {
    setFilterExpanded(!filterExpanded);
  };
  
  // Reset all filters
  const resetFilters = () => {
    setCategoryFilter('all');
    setLocationFilter('all');
    setStockFilter('all');
    setSearchTerm('');
  };

  return (
    <Layout title="ນຳອອກສິນຄ້າ">
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
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
      
      {/* Success dialog */}
      <SuccessDialog 
        open={showSuccessDialog} 
        onClose={handleCloseSuccessDialog} 
        onDashboard={handleNavigateToExportHistory} 
      />
      
      {/* Error dialog */}
      <ErrorDialog 
        open={showErrorDialog} 
        onClose={handleCloseErrorDialog} 
        onTryAgain={handleTryAgain} 
        errorMessage={errorMessage}
      />
      
      {/* Product selection dialog */}
      <ExportFormDialog 
        open={formDialogOpen} 
        onClose={handleCloseFormDialog}
        product={currentProduct}
        exportQuantity={exportQuantity}
        setExportQuantity={setExportQuantity}
        exportLocation={exportLocation}
        setExportLocation={setExportLocation}
        exportReason={exportReason}
        setExportReason={setExportReason}
        onSave={handleAddToExport}
        loading={loading}
        errorMessage={apiError}
      />
      
      {/* Print dialog */}
      <Dialog
        open={printDialogOpen}
        onClose={handleClosePrintDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', py: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">ລາຍລະອຽດນຳອອກສິນຄ້າ</Typography>
            <Button 
              variant="contained" 
              color="error" 
              onClick={handleClosePrintDialog}
              size="small"
            >
              ປິດ
            </Button>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ mb: 4 }} ref={printRef}>
            <Typography variant="h5" align="center" sx={{ mb: 1, fontWeight: 'bold' }}>
              ລາຍລະອຽດນຳອອກສິນຄ້າ
            </Typography>
            <Typography variant="h6" align="center" sx={{ mb: 3 }}>
              ວັນທີ: {formatDate(exportDate)}
            </Typography>
            
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
              <Table>
                <TableHead sx={{ bgcolor: 'background.default' }}>
                  <TableRow>
                    <TableCell align="center" width="5%">#</TableCell>
                    <TableCell align="center">ຊື່ສິນຄ້າ</TableCell>
                    <TableCell align="center">ຈຳນວນ</TableCell>
                    <TableCell align="center">ບ່ອນຈັດວາງ</TableCell>
                    <TableCell align="center">ສາເຫດການນຳອອກ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {exportItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell align="center">{index + 1}</TableCell>
                      <TableCell align="center">{item.name}</TableCell>
                      <TableCell align="center">{item.exportQuantity}</TableCell>
                      <TableCell align="center">{item.exportLocation}</TableCell>
                      <TableCell align="center">{item.exportReason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 5 }}>
              <Box sx={{ textAlign: 'center', width: '200px' }}>
                <Typography variant="body2">ຜູ້ນຳອອກ</Typography>
                <Box sx={{ borderTop: '1px solid #ccc', mt: 8, pt: 1 }}>
                  <Typography variant="body2">ລາຍເຊັນ</Typography>
                </Box>
              </Box>
              <Box sx={{ textAlign: 'center', width: '200px' }}>
                <Typography variant="body2">ຜູ້ອະນຸມັດ</Typography>
                <Box sx={{ borderTop: '1px solid #ccc', mt: 8, pt: 1 }}>
                  <Typography variant="body2">ລາຍເຊັນ</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<PrintIcon />}
            onClick={handlePrintExport}
          >
            ພິມ
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Header section */}
      <Card sx={{ mb: 2, borderRadius: 2, boxShadow: 2 }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 0 } }}>
              <InventoryIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight="bold" color="primary">
                ຟອມນຳອອກສິນຄ້າ
              </Typography>
            </Box>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <Button 
                variant="outlined" 
                color="info" 
                startIcon={<HistoryIcon />}
                onClick={() => navigate('/export-detail')}
                size={isMobile ? "small" : "medium"}
              >
                ປະຫວັດການນຳອອກ
              </Button>
              
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<RefreshIcon />}
                onClick={() => {
                  fetchProducts();
                  fetchZones();
                  fetchCategories();
                }}
                size={isMobile ? "small" : "medium"}
              >
                ໂຫຼດຂໍ້ມູນໃໝ່
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* Export form */}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
        <CardContent sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            ຂໍ້ມູນການນຳອອກ
          </Typography>
          <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
  <TextField
    fullWidth
    label="ວັນເວລາ"
    type="date"
    value={exportDate}
    InputProps={{ readOnly: true }}
    disabled
    helperText="ວັນທີປັດຈຸບັນ (ບໍ່ສາມາດແກ້ໄຂໄດ້)"
    InputLabelProps={{ shrink: true }}
  />
</Grid>
            
            <Grid item xs={12} sm={6} md={8}>
              <Box sx={{ bgcolor: 'info.50', p: 1, borderRadius: 1, display: 'flex', alignItems: 'center' }}>
                <InfoIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="body2" color="info.main">
                  ການນຳອອກຈະໄດ້ຮັບການອະນຸມັດກ່ອນຈຶ່ງສາມາດຢືນຢັນການນຳອອກສິນຄ້າຈາກສາງໄດ້
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          {/* Summary of selected products */}
          {exportItems.length > 0 && (
            <Box sx={{ mt: 2, p: 1, bgcolor: 'success.50', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="success.dark">
                  <CheckCircleIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                  ເລືອກສິນຄ້າແລ້ວ {exportItems.length} ລາຍການ ຈຳນວນລວມ {getTotalExportQuantity()} ອັນ
                </Typography>
      
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        {/* Left column - Product selection */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  ເລືອກສິນຄ້າ
                </Typography>
                
                <Button
                  variant="text"
                  size="small"
                  color="primary"
                  onClick={toggleFilterExpansion}
                  endIcon={filterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                >
                  ຕົວກອງ
                </Button>
              </Box>
              
              <TextField
                fullWidth
                placeholder="ຄົ້ນຫາສິນຄ້າ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchTerm('')}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              
              {/* Filter options */}
              <Collapse in={filterExpanded}>
                <Box sx={{ mb: 2, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="body2" fontWeight="medium" gutterBottom>
                    ກອງຂໍ້ມູນສິນຄ້າ
                  </Typography>
                  
                  <Grid container spacing={1}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label="ໝວດໝູ່"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                      >
                        <MenuItem value="all">- ທັງໝົດ -</MenuItem>
                        {uniqueCategories.map((category) => (
                          <MenuItem key={category} value={category}>{category}</MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label="ບ່ອນຈັດວາງ"
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                      >
                        <MenuItem value="all">- ທັງໝົດ -</MenuItem>
                        {uniqueLocations.map((location) => (
                          <MenuItem key={location} value={location}>{location}</MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label="ສະຖານະສິນຄ້າ"
                        value={stockFilter}
                        onChange={(e) => setStockFilter(e.target.value)}
                      >
                        <MenuItem value="all">- ທັງໝົດ -</MenuItem>
                        <MenuItem value="available">ມີໃນສາງ</MenuItem>
                        <MenuItem value="low">ໃກ້ໝົດສາງ</MenuItem>
                        <MenuItem value="out">ໝົດສາງ</MenuItem>
                      </TextField>
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      size="small" 
                      onClick={resetFilters}
                      startIcon={<RefreshIcon />}
                    >
                      ລ້າງຕົວກອງ
                    </Button>
                  </Box>
                </Box>
              </Collapse>

              {productLoading ? (
                <Stack spacing={1}>
                  {[1, 2, 3, 4].map((item) => (
                    <Box key={item} sx={{ display: 'flex', p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                      <Skeleton variant="rectangular" width="60%" height={40} />
                      <Skeleton variant="rectangular" width="20%" height={40} sx={{ ml: 1 }} />
                      <Skeleton variant="rectangular" width="20%" height={40} sx={{ ml: 1 }} />
                    </Box>
                  ))}
                </Stack>
              ) : (
                <>
                  {filteredProducts.length > 0 ? (
                    <Box sx={{ maxHeight: 'calc(100vh - 450px)', overflow: 'auto' }}>
                      <Stack spacing={1}>
                        {filteredProducts.map((product) => (
                          <Card 
                            key={product.id} 
                            variant="outlined"
                            sx={{ 
                              p: 1, 
                              bgcolor: product.stock <= product.minStock ? 'error.50' : 'background.default',
                              borderColor: product.stock <= 0 ? 'error.main' : 'divider',
                              '&:hover': {
                                boxShadow: 1
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box sx={{ overflow: 'hidden', mr: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5 }} noWrap>
                                  {product.stock <= product.minStock && (
                                    <WarningIcon fontSize="small" color="error" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                                  )}
                                  {product.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" noWrap>
                                  {product.category} • {product.location}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                                <Chip 
                                  label={product.stock} 
                                  color={product.stock > 0 ? 
                                        (product.stock <= product.minStock ? "warning" : "success") 
                                        : "error"}
                                  size="small"
                                  sx={{ minWidth: 40, mr: 1 }}
                                />
                                
                                <Button
                                  variant="contained"
                                  size="small"
                                  color="primary"
                                  onClick={() => handleOpenFormDialog(product)}
                                  sx={{ minWidth: 0, px: 1 }}
                                  disabled={product.stock <= 0}
                                >
                                  <AddIcon fontSize="small" />
                                </Button>
                              </Box>
                            </Box>
                          </Card>
                        ))}
                      </Stack>
                    </Box>
                  ) : (
                    <Box sx={{ py: 4, textAlign: 'center', bgcolor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        ບໍ່ພົບສິນຄ້າທີ່ຄົ້ນຫາ
                      </Typography>
                      <Button 
                        sx={{ mt: 1 }} 
                        size="small" 
                        startIcon={<RefreshIcon />} 
                        onClick={resetFilters}
                      >
                        ລ້າງຕົວກອງ
                      </Button>
                    </Box>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right column - Export details */}
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  <Badge 
                    badgeContent={exportItems.length} 
                    color="primary"
                    sx={{ '& .MuiBadge-badge': { fontSize: 12, height: 20, minWidth: 20 } }}
                  >
                    ລາຍການນຳອອກ
                  </Badge>
                </Typography>
                
                <Box>
                  {exportItems.length > 0 && (
                    <Button
                      variant="text"
                      color="error"
                      size="small"
                      onClick={() => setExportItems([])}
                      sx={{ mr: 1 }}
                    >
                      ລ້າງລາຍການ
                    </Button>
                  )}
                </Box>
              </Box>

              {exportItems.length > 0 ? (
                <TableContainer sx={{ maxHeight: 'calc(100vh - 400px)', overflow: 'auto' }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell align="center" width="5%">#</TableCell>
                        <TableCell align="left">ສິນຄ້າ</TableCell>
                        <TableCell align="center">ຈຳນວນ</TableCell>
                        <TableCell align="center">ບ່ອນຈັດວາງ</TableCell>
                        <TableCell align="center">ສາເຫດ</TableCell>
                        <TableCell align="center" width="60px"></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {exportItems.map((item, index) => (
                        <TableRow 
                          key={item.id} 
                          sx={{ 
                            "&:nth-of-type(odd)": { 
                              bgcolor: 'action.hover' 
                            } 
                          }}
                        >
                          <TableCell align="center">{index + 1}</TableCell>
                          <TableCell align="left">
                            <Typography variant="body2" noWrap>
                              {item.name}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={item.exportQuantity}
                              color="primary"
                              size="small"
                              sx={{ minWidth: 30 }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2">{item.exportLocation}</Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title={item.exportReason}>
                              <Typography variant="body2" noWrap>
                                {item.exportReason.length > 20 
                                  ? `${item.exportReason.substring(0, 20)}...` 
                                  : item.exportReason}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveFromExport(item.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box 
                  sx={{ 
                    py: 10, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    bgcolor: 'background.default',
                    borderRadius: 1
                  }}
                >
                  <InventoryIcon color="disabled" sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
                  <Typography color="text.secondary" align="center" gutterBottom>
                    ຍັງບໍ່ມີລາຍການສິນຄ້າທີ່ຈະນຳອອກ
                  </Typography>
                  <Typography variant="caption" color="text.secondary" align="center">
                    ກະລຸນາເລືອກສິນຄ້າຈາກລາຍການຢູ່ດ້ານຊ້າຍ
                  </Typography>
                </Box>
              )}

              {/* Action buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<PrintIcon />}
                  onClick={handleOpenPrintDialog}
                  disabled={exportItems.length === 0 || loading}
                >
                  ພິມ
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <SaveIcon />}
                  onClick={handleSaveExport}
                  disabled={exportItems.length === 0 || loading}
                >
                  ບັນທຶກການນຳອອກ
                </Button>
              </Box>
            </CardContent>
          </Card>
          
          {/* Informational card */}
          {exportItems.length > 0 && (
            <Card sx={{ mt: 2, borderRadius: 2, boxShadow: 1, border: '1px dashed', borderColor: 'warning.main' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <WarningIcon color="warning" sx={{ mr: 1, mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" fontWeight="medium" color="warning.dark">
                      ໝາຍເຫດສຳຄັນ
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ການນຳອອກສິນຄ້າຕ້ອງໄດ້ຮັບການອະນຸມັດຈາກຜູ້ມີສິດກ່ອນ. 
                      ກະລຸນາເຂົ້າໄປກວດສອບການອະນຸມັດໃນໜ້າປະຫວັດການນຳອອກຫຼັງຈາກສົ່ງຟອມແລ້ວ
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Layout>
  );
}

export default Export;