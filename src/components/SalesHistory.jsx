import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Tooltip,
  CircularProgress,
  Chip,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Print as PrintIcon,
  FilterAlt as FilterIcon,
  DateRange as DateRangeIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useReactToPrint } from 'react-to-print';
import { getSalesHistory, getSaleDetails, cancelSale } from '../services/salesService';
import ReceiptModal from './ReceiptModal';

// Format number with commas for every 3 digits
const formatNumber = (num) => {
  if (!num) return "0";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return "-";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return date.toLocaleDateString('lo-LA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error("Date formatting error:", error);
    return dateString;
  }
};

const SalesHistory = () => {
  // State variables
  const [salesHistory, setSalesHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedSale, setSelectedSale] = useState(null);
  const [saleDetails, setSaleDetails] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Refs
  const receiptRef = useRef();
  
  // Alert/Snackbar state
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // Load sales history when component mounts
  useEffect(() => {
    fetchSalesHistory();
  }, []);
  
  // Fetch sales history
  const fetchSalesHistory = async () => {
    try {
      setLoading(true);
      const data = await getSalesHistory();
      setSalesHistory(data);
    } catch (error) {
      console.error('Error fetching sales history:', error);
      showAlert('ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນປະຫວັດການຂາຍ', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch sale details
  const fetchSaleDetails = async (saleId) => {
    if (!saleId) return;
    
    try {
      setDetailsLoading(true);
      const details = await getSaleDetails(saleId);
      setSaleDetails(details);
    } catch (error) {
      console.error(`Error fetching details for sale #${saleId}:`, error);
      showAlert('ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນລາຍລະອຽດການຂາຍ', 'error');
      setSaleDetails([]);
    } finally {
      setDetailsLoading(false);
    }
  };
  
  // Handle view sale details
  const handleViewDetails = (sale) => {
    setSelectedSale(sale);
    setDetailsDialogOpen(true);
    fetchSaleDetails(sale.sale_id);
  };
  
  // Handle delete sale
  const handleDeleteSale = async () => {
    if (!selectedSale) return;
    
    try {
      setDeleteLoading(true);
      await cancelSale(selectedSale.sale_id);
      
      // Update local state to reflect deletion
      setSalesHistory(prevHistory => 
        prevHistory.filter(sale => sale.sale_id !== selectedSale.sale_id)
      );
      
      setConfirmDeleteOpen(false);
      setDetailsDialogOpen(false);
      showAlert('ຍົກເລີກການຂາຍສຳເລັດແລ້ວ', 'success');
    } catch (error) {
      console.error(`Error canceling sale #${selectedSale.sale_id}:`, error);
      showAlert('ເກີດຂໍ້ຜິດພາດໃນການຍົກເລີກການຂາຍ', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };
  
  // Apply filters
  const applyFilters = () => {
    // Filter logic would go here - in a real implementation, this would call an API
    // with the filter parameters
    setFilterDialogOpen(false);
    
    // For demonstration, we'll just log the filter values
    console.log('Applying filters:', { startDate, endDate });
    showAlert('ການກັ່ນຕອງສຳເລັດແລ້ວ', 'success');
  };
  
  // Reset filters
  const resetFilters = () => {
    setStartDate(null);
    setEndDate(null);
    fetchSalesHistory();
    setFilterDialogOpen(false);
  };
  
  // Show alert message
  const showAlert = (message, severity = 'info') => {
    setAlert({
      open: true,
      message,
      severity
    });
  };
  
  // Handle close alert
  const handleCloseAlert = () => {
    setAlert({
      ...alert,
      open: false
    });
  };
  
  // Handle print receipt
  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
  });
  
  // Filter sales history based on search term
  const filteredSales = salesHistory.filter(sale => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      sale.sale_id.toString().includes(searchTerm) ||
      (sale.customer_name && sale.customer_name.toLowerCase().includes(searchLower)) ||
      (sale.emp_name && sale.emp_name.toLowerCase().includes(searchLower))
    );
  });

  return (
    <Box>
      <Snackbar
        open={alert.open}
        autoHideDuration={5000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alert.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">ປະຫວັດການຂາຍສິນຄ້າ</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setFilterDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            ຕົວກັ່ນຕອງ
          </Button>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={fetchSalesHistory}
            disabled={loading}
          >
            ໂຫຼດຄືນໃໝ່
          </Button>
        </Box>
      </Box>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="ຄົ້ນຫາດ້ວຍລະຫັດການຂາຍ, ຊື່ລູກຄ້າ ຫຼື ພະນັກງານ..."
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ລະຫັດໃບບິນ</TableCell>
              <TableCell>ວັນທີຂາຍ</TableCell>
              <TableCell>ລູກຄ້າ</TableCell>
              <TableCell>ພະນັກງານ</TableCell>
              <TableCell align="right">ລາຄາລວມ</TableCell>
              <TableCell align="right">ຈ່າຍແລ້ວ</TableCell>
              <TableCell align="right">ເງິນທອນ</TableCell>
              <TableCell align="center">ຈັດການ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : filteredSales.length > 0 ? (
              filteredSales.map((sale) => (
                <TableRow key={sale.sale_id} hover>
                  <TableCell>{sale.sale_id}</TableCell>
                  <TableCell>{formatDate(sale.date_sale)}</TableCell>
                  <TableCell>{sale.customer_name || 'ລູກຄ້າທົ່ວໄປ'}</TableCell>
                  <TableCell>{sale.emp_name}</TableCell>
                  <TableCell align="right">{formatNumber(sale.subtotal)} ກີບ</TableCell>
                  <TableCell align="right">{formatNumber(sale.pay)} ກີບ</TableCell>
                  <TableCell align="right">{formatNumber(sale.money_change)} ກີບ</TableCell>
                  <TableCell align="center">
                    <Tooltip title="ເບິ່ງລາຍລະອຽດ">
                      <IconButton
                        color="primary"
                        onClick={() => handleViewDetails(sale)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Typography>ບໍ່ພົບຂໍ້ມູນປະຫວັດການຂາຍ</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Sale Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      ><DialogTitle>
      ລາຍລະອຽດໃບບິນ #{selectedSale?.sale_id}
    </DialogTitle>
        
        <DialogContent dividers>
          {selectedSale ? (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>ລູກຄ້າ:</strong> {selectedSale.customer_name || 'ລູກຄ້າທົ່ວໄປ'}
                  </Typography>
                  <Typography variant="body1">
                    <strong>ພະນັກງານ:</strong> {selectedSale.emp_name  || '-'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>ວັນທີ:</strong> {formatDate(selectedSale.date_sale)}
                  </Typography>
                  <Typography variant="body1">
                    <strong>ເລກທີໃບບິນ:</strong> {selectedSale.sale_id}
                  </Typography>
                </Grid>
              </Grid>
              
              <Box sx={{ mb: 3 }}>
                {detailsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : saleDetails.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell align="center">#</TableCell>
                          <TableCell>ລາຍການສິນຄ້າ</TableCell>
                          <TableCell align="center">ຈຳນວນ</TableCell>
                          <TableCell align="right">ລາຄາ</TableCell>
                          <TableCell align="right">ລວມ</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {saleDetails.map((item, index) => (
                          <TableRow key={item.sale_d_id}>
                            <TableCell align="center">{index + 1}</TableCell>
                            <TableCell>{item.product_name}</TableCell>
                            <TableCell align="center">{item.qty}</TableCell>
                            <TableCell align="right">{formatNumber(item.price)} ກີບ</TableCell>
                            <TableCell align="right">{formatNumber(item.total)} ກີບ</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableBody>
                        <TableRow>
                          <TableCell colSpan={3}></TableCell>
                          <TableCell align="right"><strong>ລວມທັງໝົດ:</strong></TableCell>
                          <TableCell align="right"><strong>{formatNumber(selectedSale.subtotal)} ກີບ</strong></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={3}></TableCell>
                          <TableCell align="right">ຈຳນວນເງິນຈ່າຍ:</TableCell>
                          <TableCell align="right">{formatNumber(selectedSale.pay)} ກີບ</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={3}></TableCell>
                          <TableCell align="right">ເງິນທອນ:</TableCell>
                          <TableCell align="right">{formatNumber(selectedSale.money_change)} ກີບ</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Alert severity="info">ບໍ່ພົບຂໍ້ມູນລາຍລະອຽດສິນຄ້າ</Alert>
                )}
              </Box>

              <Box ref={receiptRef} sx={{ display: 'none' }}>
                {/* Receipt content for printing */}
                <Box sx={{ p: 4, maxWidth: '80mm', margin: '0 auto' }}>
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography variant="h6">GeePOS</Typography>
                    <Typography variant="body2">ໃບເກັບເງິນ</Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      ວັນທີ: {formatDate(selectedSale.date_sale)}
                    </Typography>
                    <Typography variant="body2">
                      ເລກທີ່ໃບບິນ: {selectedSale.sale_id}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box>
                    {saleDetails.map((item, index) => (
                      <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">{item.product_name} x{item.qty}</Typography>
                        <Typography variant="body2">{formatNumber(item.total)}</Typography>
                      </Box>
                    ))}
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography><strong>ລວມທັງໝົດ:</strong></Typography>
                    <Typography><strong>{formatNumber(selectedSale.subtotal)} ກີບ</strong></Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>ຈຳນວນເງິນຈ່າຍ:</Typography>
                    <Typography>{formatNumber(selectedSale.pay)} ກີບ</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>ເງິນທອນ:</Typography>
                    <Typography>{formatNumber(selectedSale.money_change)} ກີບ</Typography>
                  </Box>
                  
                  <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Typography variant="body2">ຂອບໃຈທີ່ໃຊ້ບໍລິການ</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button 
            variant="outlined" 
            color="error"
            onClick={() => setConfirmDeleteOpen(true)}
            startIcon={<DeleteIcon />}
          >
            ຍົກເລີກການຂາຍ
          </Button>
          <Button
            variant="contained"
            onClick={handlePrint}
            startIcon={<PrintIcon />}
          >
            ພິມໃບບິນ
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Filter Dialog */}
      <Dialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          ຕົວກັ່ນຕອງຂໍ້ມູນ
        </DialogTitle>
        
        <DialogContent dividers>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="ວັນທີເລີ່ມຕົ້ນ"
                  value={startDate}
                  onChange={setStartDate}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="ວັນທີສິ້ນສຸດ"
                  value={endDate}
                  onChange={setEndDate}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={resetFilters} color="error">
            ລ້າງຂໍ້ມູນ
          </Button>
          <Button
            variant="contained"
            onClick={applyFilters}
          >
            ນຳໃຊ້ຕົວກັ່ນຕອງ
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Confirm Delete Dialog */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
      >
        <DialogTitle>
          ຢືນຢັນການຍົກເລີກການຂາຍ
        </DialogTitle>
        
        <DialogContent>
          <Typography>
            ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການຍົກເລີກການຂາຍນີ້? 
            ການກະທຳນີ້ຈະບໍ່ສາມາດກັບຄືນໄດ້.
          </Typography>
          <Typography variant="subtitle2" color="error" sx={{ mt: 1 }}>
            * ສິນຄ້າທັງໝົດຈະຖືກສົ່ງກັບຄືນເຂົ້າສາງ
          </Typography>
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={() => setConfirmDeleteOpen(false)} 
            disabled={deleteLoading}
          >
            ຍົກເລີກ
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteSale}
            disabled={deleteLoading}
          >
            {deleteLoading ? <CircularProgress size={24} /> : 'ຢືນຢັນການຍົກເລີກ'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
