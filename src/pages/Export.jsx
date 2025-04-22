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
  Chip
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Save as SaveIcon,
  Search as SearchIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { SuccessDialog, ErrorDialog } from '../components/SuccessDialog';
import { getCurrentUser } from '../services/authService';
import ExportFormDialog from '../components/ExportFormDialog';

function Export() {
  const navigate = useNavigate();
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
  
  // Get current user
  const currentUser = getCurrentUser();
  
  // Products state
  const [products, setProducts] = useState([]);
  const [zones, setZones] = useState([]);
  
  // Load products and zones when component mounts
  useEffect(() => {
    fetchProducts();
    fetchZones();
  }, []);
  
  // Function to fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
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
          location: product.zone || (product.zone_id && zoneMap[product.zone_id]) || 'ບໍ່ລະບຸ',
          brand: product.brand,
          category: product.category
        }));
        
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
        { id: 1, name: 'ຕູ້ເຢັນ Samsung', stock: 10, location: 'B-05', brand: 'Samsung', category: 'ຕູ້ເຢັນ' },
        { id: 2, name: 'ໂທລະທັດ LG', stock: 15, location: 'A-01', brand: 'LG', category: 'ໂທລະທັດ' },
        { id: 3, name: 'ແອ Samsung', stock: 20, location: 'A-02', brand: 'Samsung', category: 'ແອ' },
        { id: 4, name: 'ຈັກຊັກຜ້າ Panasonic', stock: 8, location: 'C-03', brand: 'Panasonic', category: 'ຈັກຊັກເຄື່ອງ' },
      ]);
    } finally {
      setLoading(false);
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

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Open dialog to add product to export
  const handleOpenFormDialog = (product) => {
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
  const handleAddToExport = () => {
    try {
      if (exportQuantity <= 0 || exportQuantity > currentProduct.stock) {
        setApiError('ກະລຸນາລະບຸຈຳນວນທີ່ຖືກຕ້ອງ');
        return;
      }

      if (!exportReason) {
        setApiError('ກະລຸນາລະບຸສາເຫດການນຳອອກ');
        return;
      }

      const exportItem = {
        ...currentProduct,
        exportQuantity,
        exportLocation,
        exportReason
      };

      // Check if product already exists in export list
      const existingIndex = exportItems.findIndex(item => item.id === currentProduct.id);
      
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
      
      // Create export data for API
      const exportData = {
        emp_id: currentUser?.emp_id || 1,
        export_date: exportDate,
        status: 'ລໍຖ້າອະນຸມັດ',
        items: exportItems.map(item => ({
          id: item.id,
          exportQuantity: item.exportQuantity,
          exportLocation: item.exportLocation || item.location || '',
          exportReason: item.exportReason
        }))
      };
      
      console.log("ຂໍ້ມູນການນຳອອກທີ່ຈະສົ່ງໄປຍັງ API:", exportData);
      
      // Send data to API
      const result = await createExport(exportData);
      
      console.log('ຜົນການບັນທຶກ:', result);
      
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
      
      <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" fontWeight="bold" color="primary">
          ຟອມນຳອອກສິນຄ້າ
        </Typography>
        <Button 
          variant="contained" 
          color="info" 
          onClick={() => navigate('/export-detail')}
        >
          ເບິ່ງປະຫວັດການນຳອອກ
        </Button>
      </Box>

      {/* Export form */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12}>
            <TextField
              fullWidth
              label="ວັນເວລາ"
              type="date"
              value={exportDate}
              onChange={(e) => setExportDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={2}>
        {/* Left column - Product selection */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight="bold">
                ເລືອກສິນຄ້າ
              </Typography>
              
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={fetchProducts}
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} /> : 'ໂຫຼດຄືນໃໝ່'}
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
              }}
            />

            <TableContainer sx={{ maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ຊື່ສິນຄ້າ</TableCell>
                    <TableCell align="center">ຈຳນວນຄົງຄັງ</TableCell>
                    <TableCell align="center">ບ່ອນຈັດວາງ</TableCell>
                    <TableCell align="center"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id} hover>
                        <TableCell>{product.name}</TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={product.stock} 
                            color={product.stock > 0 ? "success" : "error"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">{product.location}</TableCell>
                        <TableCell align="center">
                          <Button
                            variant="contained"
                            size="small"
                            color="primary"
                            onClick={() => handleOpenFormDialog(product)}
                            sx={{ fontSize: '0.7rem', py: 0.5 }}
                            disabled={product.stock <= 0}
                          >
                            ເລືອກ
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        ບໍ່ພົບສິນຄ້າ
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Right column - Export details */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                ລາຍລະອຽດນຳອອກສິນຄ້າ
              </Typography>
            </Box>

            <TableContainer sx={{ maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center">#</TableCell>
                    <TableCell align="left">ສິນຄ້າ</TableCell>
                    <TableCell align="center">ຈຳນວນ</TableCell>
                    <TableCell align="center">ບ່ອນຈັດວາງ</TableCell>
                    <TableCell align="center">ສາເຫດການນຳອອກ</TableCell>
                    <TableCell align="center"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {exportItems.length > 0 ? (
                    exportItems.map((item, index) => (
                      <TableRow 
                        key={item.id} 
                        sx={{ 
                          "&:nth-of-type(odd)": { 
                            bgcolor: 'action.hover' 
                          } 
                        }}
                      >
                        <TableCell align="center">{index + 1}</TableCell>
                        <TableCell align="left">{item.name}</TableCell>
                        <TableCell align="center">{item.exportQuantity}</TableCell>
                        <TableCell align="center">{item.exportLocation}</TableCell>
                        <TableCell align="center">
                          {item.exportReason.length > 20 
                            ? `${item.exportReason.substring(0, 20)}...` 
                            : item.exportReason}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveFromExport(item.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <Typography color="text.secondary">
                          ບໍ່ມີລາຍການສິນຄ້າທີ່ຈະນຳອອກ
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Action buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  setExportItems([]);
                }}
                disabled={exportItems.length === 0 || loading}
              >
                ຍົກເລີກ
              </Button>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<PrintIcon />}
                onClick={handleOpenPrintDialog}
                disabled={exportItems.length === 0 || loading}
                sx={{ mr: 1 }}
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
                ບັນທຶກ
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Layout>
  );
}

export default Export;