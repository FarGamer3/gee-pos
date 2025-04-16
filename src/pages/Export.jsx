import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
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
  DialogActions
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
import { createExport } from '../services/exportService';
import ExportFormDialog from '../components/ExportFormDialog';

function Export() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [exportItems, setExportItems] = useState([]);
  const [exportDate, setExportDate] = useState(new Date().toISOString().split('T')[0]);
  const [warehouse, setWarehouse] = useState('');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // ສະຖານະສຳລັບໂຕ່ຕອບເພີ່ມສິນຄ້າ
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [exportQuantity, setExportQuantity] = useState(1);
  const [exportLocation, setExportLocation] = useState('');
  const [exportReason, setExportReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  
  // ສະຖານະສຳລັບກ່ອງໂຕ້ຕອບພິມ
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  
  // ສະຖານະການສະແດງແຈ້ງເຕືອນ
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // ດຶງຂໍ້ມູນຜູ້ໃຊ້ປັດຈຸບັນ
  const currentUser = getCurrentUser();
  
  // ຂໍ້ມູນສິນຄ້າຕົວຢ່າງ (ໃນກໍລະນີຈິງຄວນດຶງຈາກ API)
  const [products, setProducts] = useState([
    { id: 1, name: 'ຕູ້ເຢັນ', stock: 10, location: 'A-02' },
    { id: 2, name: 'ໂທລະທັດ', stock: 15, location: 'B-05' },
    { id: 3, name: 'ແອຄອນດິຊັນ', stock: 20, location: 'C-01' },
    { id: 4, name: 'ຈັກຊັກຜ້າ', stock: 8, location: 'A-08' },
  ]);
  
  // ດຶງຂໍ້ມູນສິນຄ້າຈາກເຊີບເວີເມື່ອໜ້າຖືກໂຫຼດຄັ້ງທຳອິດ
  useEffect(() => {
    fetchProducts();
  }, []);
  
 // ຟັງຊັນດຶງຂໍ້ມູນສິນຄ້າ
const fetchProducts = async () => {
  try {
    setLoading(true);
    // ເຊື່ອມຕໍ່ກັບ API ເພື່ອດຶງຂໍ້ມູນສິນຄ້າ
    const response = await axios.get('http://localhost:4422/All/Product');
    
    if (response.data && response.data.result_code === "200" && response.data.products) {
      // ແປງຂໍ້ມູນຈາກ API ໃຫ້ເຂົ້າກັບໂຄງສ້າງທີ່ຕ້ອງການ
      const formattedProducts = response.data.products.map(product => ({
        id: product.proid,
        name: product.ProductName,
        stock: product.qty,
        location: product.zone || 'ບໍ່ລະບຸ', // ຖ້າມີຂໍ້ມູນ zone, ໃຊ້ zone ຖ້າບໍ່ມີໃຊ້ "ບໍ່ລະບຸ"
      }));
      
      setProducts(formattedProducts);
      showSnackbar('ໂຫຼດຂໍ້ມູນສິນຄ້າສຳເລັດ', 'success');
    } else {
      throw new Error('ຂໍ້ມູນບໍ່ຖືກຕ້ອງ');
    }
  } catch (error) {
    console.error('ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນສິນຄ້າ:', error);
    setLoading(false);
    showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນສິນຄ້າ', 'error');
    
    // ໃຊ້ຂໍ້ມູນຕົວຢ່າງໃນກໍລະນີທີ່ບໍ່ສາມາດເຊື່ອມຕໍ່ກັບ API ໄດ້
    setProducts([
      { id: 1, name: 'ຕູ້ເຢັນ', stock: 10, location: 'A-02' },
      { id: 2, name: 'ໂທລະທັດ', stock: 15, location: 'B-05' },
      { id: 3, name: 'ແອຄອນດິຊັນ', stock: 20, location: 'C-01' },
      { id: 4, name: 'ຈັກຊັກຜ້າ', stock: 8, location: 'A-08' },
    ]);
  } finally {
    setLoading(false);
  }
};

  // ຈັດຮູບແບບວັນທີເປັນ DD/MM/YYYY
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  // ກັ່ນຕອງສິນຄ້າຕາມຄຳຄົ້ນຫາ
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ເປີດກ່ອງໂຕ້ຕອບເພື່ອເພີ່ມສິນຄ້າໃນການນຳອອກ
  const handleOpenFormDialog = (product) => {
    setCurrentProduct(product);
    setExportQuantity(1);
    setExportLocation(product.location);
    setExportReason('');
    setApiError(null);
    setFormDialogOpen(true);
  };

  // ປິດກ່ອງໂຕ້ຕອບເພີ່ມສິນຄ້າ
  const handleCloseFormDialog = () => {
    setFormDialogOpen(false);
    setCurrentProduct(null);
    setApiError(null);
  };

  // ເພີ່ມສິນຄ້າເຂົ້າໃນລາຍການນຳອອກ
  const handleAddToExport = async () => {
    try {
      setLoading(true);
      
      if (exportQuantity <= 0 || exportQuantity > currentProduct.stock) {
        setApiError('ກະລຸນາລະບຸຈຳນວນທີ່ຖືກຕ້ອງ');
        setLoading(false);
        return;
      }

      if (!exportReason) {
        setApiError('ກະລຸນາລະບຸສາເຫດການນຳອອກ');
        setLoading(false);
        return;
      }

      const exportItem = {
        ...currentProduct,
        exportQuantity,
        exportLocation,
        exportReason
      };

      // ກວດເບິ່ງວ່າສິນຄ້ານີ້ມີໃນລາຍການນຳອອກແລ້ວຫຼືຍັງ
      const existingIndex = exportItems.findIndex(item => item.id === currentProduct.id);
      if (existingIndex >= 0) {
        // ອັບເດດລາຍການທີ່ມີຢູ່ແລ້ວ
        const updatedItems = [...exportItems];
        updatedItems[existingIndex] = exportItem;
        setExportItems(updatedItems);
      } else {
        // ເພີ່ມລາຍການໃໝ່
        setExportItems([...exportItems, exportItem]);
      }

      // ປິດກ່ອງໂຕ້ຕອບ
      setFormDialogOpen(false);
      showSnackbar('ເພີ່ມສິນຄ້າສຳເລັດແລ້ວ', 'success');
    } catch (error) {
      console.error('ເກີດຂໍ້ຜິດພາດໃນການເພີ່ມສິນຄ້າ:', error);
      setApiError('ເກີດຂໍ້ຜິດພາດໃນການເພີ່ມສິນຄ້າ');
    } finally {
      setLoading(false);
    }
  };

  // ລຶບສິນຄ້າອອກຈາກລາຍການນຳອອກ
  const handleRemoveFromExport = (id) => {
    setExportItems(exportItems.filter(item => item.id !== id));
    showSnackbar('ລຶບສິນຄ້າອອກຈາກລາຍການແລ້ວ', 'info');
  };

  // ບັນທຶກການນຳອອກສິນຄ້າ
  const handleSaveExport = async () => {
    if (exportItems.length === 0) {
      showSnackbar('ກະລຸນາເລືອກສິນຄ້າກ່ອນບັນທຶກການນຳອອກ', 'warning');
      return;
    }

    try {
      setLoading(true);
      
      // ສ້າງຂໍ້ມູນສຳລັບສົ່ງໄປຍັງ API
      const exportData = {
        emp_id: currentUser?.emp_id || 1,
        export_date: exportDate,
        status: 'ລໍຖ້າອະນຸມັດ',
        items: exportItems.map(item => ({
          id: item.id,
          exportQuantity: item.exportQuantity,
          exportLocation: item.exportLocation,
          exportReason: item.exportReason
        }))
      };
      
      // ສົ່ງຂໍ້ມູນໄປຍັງ API
      console.log("ຂໍ້ມູນທີ່ຈະສົ່ງໄປ API:", JSON.stringify(exportData));
      const result = await createExport(exportData);
      
      console.log('ຜົນການບັນທຶກ:', result);
      
      // ສະແດງກ່ອງໂຕ້ຕອບສຳເລັດ
      setShowSuccessDialog(true);
      // ລ້າງລາຍການສິນຄ້າ
      setExportItems([]);
      
    } catch (error) {
      console.error('ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກການນຳອອກ:', error);
      setErrorMessage(error.message || 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກການນຳອອກ');
      setShowErrorDialog(true);
    } finally {
      setLoading(false);
    }
  };

  // ຈັດການກັບການປິດກ່ອງໂຕ້ຕອບ
  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
    // ລ້າງແບບຟອມຫຼັງຈາກປິດກ່ອງໂຕ້ຕອບ
    setExportItems([]);
  };

  const handleNavigateToExportHistory = () => {
    setShowSuccessDialog(false);
    // ລ້າງແບບຟອມແລະນຳທາງໄປຍັງໜ້າປະຫວັດ
    setExportItems([]);
    navigate('/export-detail');
  };

  const handleCloseErrorDialog = () => {
    setShowErrorDialog(false);
  };

  const handleTryAgain = () => {
    setShowErrorDialog(false);
    handleSaveExport();
  };

  // ຈັດການເປີດກ່ອງໂຕ້ຕອບການພິມ
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
    // ຟັງຊັນການພິມຈະຖືກໃສ່ຕົວຈິງທີ່ນີ້
    // ປັດຈຸບັນພຽງແຕ່ປິດກ່ອງໂຕ້ຕອບ
    setPrintDialogOpen(false);
    showSnackbar('ກຳລັງສົ່ງຄຳສັ່ງພິມ...', 'info');
  };
  
  // ສະແດງແຈ້ງເຕືອນ snackbar
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };
  
  // ປິດ snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <Layout title="ນຳອອກສິນຄ້າ">
      {/* Snackbar ສຳລັບແຈ້ງເຕືອນ */}
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
      
      {/* ກ່ອງໂຕ້ຕອບສຳເລັດ */}
      <SuccessDialog 
        open={showSuccessDialog} 
        onClose={handleCloseSuccessDialog} 
        onDashboard={handleNavigateToExportHistory} 
      />
      
      {/* ກ່ອງໂຕ້ຕອບຂໍ້ຜິດພາດ */}
      <ErrorDialog 
        open={showErrorDialog} 
        onClose={handleCloseErrorDialog} 
        onTryAgain={handleTryAgain} 
      />
      
      {/* ກ່ອງໂຕ້ຕອບສຳລັບເພີ່ມສິນຄ້າໃນການນຳອອກ */}
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
      
      {/* ກ່ອງໂຕ້ຕອບການພິມ */}
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
          <Box sx={{ mb: 4 }}>
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

      {/* ຟອມນຳອອກ */}
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
        {/* ຖັນຊ້າຍ - ການເລືອກສິນຄ້າ */}
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
                    <TableCell align="center">ຊື່</TableCell>
                    <TableCell align="center">ຈຳນວນຄົງຄັງ</TableCell>
                    <TableCell align="center"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id} hover>
                        <TableCell align="center">{product.name}</TableCell>
                        <TableCell align="center">{product.stock}</TableCell>
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
                      <TableCell colSpan={3} align="center">
                        ບໍ່ພົບສິນຄ້າ
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* ຖັນຂວາ - ລາຍການນຳອອກ */}
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
                    <TableCell align="center">ສິນຄ້າ</TableCell>
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
                        <TableCell align="center">{item.name}</TableCell>
                        <TableCell align="center">{item.exportQuantity}</TableCell>
                        <TableCell align="center">{item.exportLocation}</TableCell>
                        <TableCell align="center">{item.exportReason}</TableCell>
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

            {/* ປຸ່ມປະຕິບັດການ */}
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