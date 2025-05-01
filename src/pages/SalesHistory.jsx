import React, { useState, useEffect } from 'react';
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
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Grid,
  Snackbar,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Search as SearchIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  CalendarToday as CalendarIcon,
  ShowChart as ShowChartIcon,
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { 
  getSalesHistory,
  getSaleDetails,
  cancelSale
} from '../services/salesService';

// Format number with commas for every 3 digits
const formatNumber = (num) => {
  if (!num) return "0";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Format date to Lao format
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

function SalesHistory() {
  // Sales History States
  const [salesHistory, setSalesHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState(null);
  const [saleDetailsOpen, setSaleDetailsOpen] = useState(false);
  const [saleDetailsLoading, setSaleDetailsLoading] = useState(false);
  
  // Filter states - ປ່ຽນເປັນ string ແທນທີ່ date objects
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterAmount, setFilterAmount] = useState('');
  const [filtersApplied, setFiltersApplied] = useState(false);
  
  // Alerts
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  
  // Statistics
  const [stats, setStats] = useState({
    totalSales: 0,
    totalAmount: 0,
    averageAmount: 0
  });

  // Load sales history on component mount
  useEffect(() => {
    fetchSalesHistory();
  }, []);

  // Calculate statistics whenever sales history changes
  useEffect(() => {
    if (salesHistory.length > 0) {
      const totalAmount = salesHistory.reduce((sum, sale) => sum + parseFloat(sale.subtotal || 0), 0);
      setStats({
        totalSales: salesHistory.length,
        totalAmount: totalAmount,
        averageAmount: totalAmount / salesHistory.length
      });
    } else {
      setStats({
        totalSales: 0,
        totalAmount: 0,
        averageAmount: 0
      });
    }
  }, [salesHistory]);
  
  // Fetch sales history data
  const fetchSalesHistory = async () => {
    try {
      setLoading(true);
      const historyData = await getSalesHistory();
      
      if (Array.isArray(historyData)) {
        setSalesHistory(historyData);
      } else {
        showAlert('ບໍ່ສາມາດດຶງຂໍ້ມູນປະຫວັດການຂາຍໄດ້', 'error');
      }
    } catch (error) {
      console.error('Error fetching sales history:', error);
      showAlert('ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນປະຫວັດການຂາຍ', 'error');
    } finally {
      setLoading(false);
      setFiltersApplied(false);
    }
  };
  
  // View sale details
  const handleViewSaleDetails = async (sale) => {
    try {
      setSelectedSale(sale);
      setSaleDetailsOpen(true);
      setSaleDetailsLoading(true);
      
      const detailsData = await getSaleDetails(sale.sale_id);
      
      if (detailsData && detailsData.length > 0) {
        // Update selected sale with the fetched products
        setSelectedSale(prev => ({
          ...prev,
          products: detailsData
        }));
      } else {
        showAlert('ບໍ່ສາມາດດຶງຂໍ້ມູນລາຍລະອຽດການຂາຍໄດ້', 'error');
      }
    } catch (error) {
      console.error('Error fetching sale details:', error);
      showAlert('ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນລາຍລະອຽດການຂາຍ', 'error');
    } finally {
      setSaleDetailsLoading(false);
    }
  };
  
  // Print receipt
  const handlePrintReceipt = (sale) => {
    // Implementation of receipt printing
    showAlert('ກຳລັງພິມໃບບິນ...', 'info');
  };
  
  // Apply filters
  const handleApplyFilters = () => {
    setFiltersApplied(true);
    setFilterDialogOpen(false);
    // In a real implementation, you would call an API with these filters
    // For now, we'll just use the existing data and filter it on the client
    showAlert('ນຳໃຊ້ຕົວກອງຂໍ້ມູນແລ້ວ', 'success');
  };
  
  // Reset filters
  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setFilterEmployee('');
    setFilterAmount('');
    setFiltersApplied(false);
    fetchSalesHistory(); // Reload original data
  };
  
  // Show alert message
  const showAlert = (message, severity = 'success') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };
  
  // Close alert
  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  // Filter sales history based on search term and applied filters
  const filteredSalesHistory = salesHistory.filter(sale => {
    // Start with search term filter
    const matchesSearch = 
      !searchTerm || 
      searchTerm.trim() === '' || 
      (sale.sale_id && sale.sale_id.toString().includes(searchTerm)) ||
      (sale.customer_name && sale.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sale.emp_name && sale.emp_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;
    
    // Then apply date range filters if set
    if (filtersApplied) {
      if (startDate && new Date(sale.date_sale) < new Date(startDate)) return false;
      if (endDate && new Date(sale.date_sale) > new Date(endDate)) return false;
      
      // Apply employee filter if set
      if (filterEmployee && sale.emp_name !== filterEmployee) return false;
      
      // Apply amount filter if set
      if (filterAmount) {
        const amount = parseFloat(filterAmount);
        const saleAmount = parseFloat(sale.subtotal);
        
        if (!isNaN(amount) && !isNaN(saleAmount)) {
          // Example: filter for sales >= amount
          if (saleAmount < amount) return false;
        }
      }
    }
    
    return true;
  });

  return (
    <Layout title="ປະຫວັດການຂາຍ">
      <Snackbar 
        open={alertOpen} 
        autoHideDuration={6000} 
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleAlertClose} 
          severity={alertSeverity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
      
      {/* Header with back button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          component={Link}
          to="/Sales"
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          color="primary"
        >
          ກັບໄປໜ້າຂາຍສິນຄ້າ
        </Button>
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'center' }}>
          ປະຫວັດການຂາຍສິນຄ້າທັງໝົດ
        </Typography>
        
        <Box>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<DownloadIcon />}
            sx={{ mr: 1 }}
          >
            ສົ່ງອອກ
          </Button>
          <Button 
            variant="contained" 
            color="secondary" 
            startIcon={<ShowChartIcon />}
          >
            ລາຍງານ
          </Button>
        </Box>
      </Box>
      
      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                ຈຳນວນການຂາຍທັງໝົດ
              </Typography>
              <Typography variant="h4" component="div" fontWeight="bold">
                {stats.totalSales} ຄັ້ງ
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                ຍອດຂາຍທັງໝົດ
              </Typography>
              <Typography variant="h4" component="div" fontWeight="bold" color="primary.main">
                {formatNumber(stats.totalAmount)} ກີບ
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                ຍອດຂາຍສະເລ່ຍຕໍ່ຄັ້ງ
              </Typography>
              <Typography variant="h4" component="div" fontWeight="bold" color="success.main">
                {formatNumber(stats.averageAmount)} ກີບ
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Search and Filter Bar */}
      <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <TextField
          placeholder="ຄົ້ນຫາປະຫວັດການຂາຍ..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1, minWidth: '200px' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <Button
          variant="outlined"
          color="primary"
          startIcon={<FilterListIcon />}
          onClick={() => setFilterDialogOpen(true)}
          sx={{ whiteSpace: 'nowrap' }}
        >
          ຕົວກອງຂໍ້ມູນ {filtersApplied ? '(ໃຊ້ງານຢູ່)' : ''}
        </Button>
        
        {filtersApplied && (
          <Button
            variant="outlined"
            color="error"
            onClick={handleResetFilters}
            size="small"
          >
            ລ້າງຕົວກອງ
          </Button>
        )}
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={fetchSalesHistory}
          disabled={loading}
          sx={{ ml: 'auto' }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'ໂຫຼດຄືນໃໝ່'}
        </Button>
      </Box>
      
      {/* Sales History Table */}
      <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 340px)', overflow: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell align="center">ລະຫັດໃບບິນ</TableCell>
              <TableCell align="center">ວັນທີຂາຍ</TableCell>
              <TableCell align="center">ລູກຄ້າ</TableCell>
              <TableCell align="center">ພະນັກງານ</TableCell>
              <TableCell align="right">ມູນຄ່າລວມ</TableCell>
              <TableCell align="right">ຈ່າຍແລ້ວ</TableCell>
              <TableCell align="right">ເງິນທອນ</TableCell>
              <TableCell align="center">ດຳເນີນການ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : filteredSalesHistory.length > 0 ? (
              filteredSalesHistory.map((sale) => (
                <TableRow key={sale.sale_id} hover>
                  <TableCell align="center">{sale.sale_id}</TableCell>
                  <TableCell align="center">{formatDate(sale.date_sale)}</TableCell>
                  <TableCell align="center">{sale.customer_name || 'ລູກຄ້າທົ່ວໄປ'}</TableCell>
                  <TableCell align="center">{sale.emp_name}</TableCell>
                  <TableCell align="right">{formatNumber(sale.subtotal)} ກີບ</TableCell>
                  <TableCell align="right">{formatNumber(sale.pay)} ກີບ</TableCell>
                  <TableCell align="right">{formatNumber(sale.money_change)} ກີບ</TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Tooltip title="ເບິ່ງລາຍລະອຽດ">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleViewSaleDetails(sale)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="ພິມໃບບິນ">
                        <IconButton
                          color="secondary"
                          size="small"
                          onClick={() => handlePrintReceipt(sale)}
                        >
                          <PrintIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body1" sx={{ py: 2 }}>
                    {searchTerm || filtersApplied ? 'ບໍ່ພົບຂໍ້ມູນທີ່ກົງກັບເງື່ອນໄຂການຄົ້ນຫາ' : 'ບໍ່ພົບຂໍ້ມູນປະຫວັດການຂາຍ'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Filter Dialog */}
      <Dialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>ຕົວກອງຂໍ້ມູນການຂາຍ</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ວັນທີເລີ່ມຕົ້ນ"
                type="date"
                value={startDate || ''}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ວັນທີສິ້ນສຸດ"
                type="date"
                value={endDate || ''}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="employee-filter-label">ພະນັກງານ</InputLabel>
                <Select
                  labelId="employee-filter-label"
                  value={filterEmployee}
                  onChange={(e) => setFilterEmployee(e.target.value)}
                  label="ພະນັກງານ"
                >
                  <MenuItem value="">ທັງໝົດ</MenuItem>
                  {/* Dynamic employee list would go here */}
                  <MenuItem value="ພະນັກງານ ທົດສອບ">ພະນັກງານ ທົດສອບ</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ຍອດເງິນຂັ້ນຕ່ຳ"
                value={filterAmount}
                onChange={(e) => setFilterAmount(e.target.value)}
                type="number"
                InputProps={{
                  endAdornment: <InputAdornment position="end">ກີບ</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setFilterDialogOpen(false)} 
            color="inherit"
          >
            ຍົກເລີກ
          </Button>
          <Button 
            onClick={handleResetFilters} 
            color="error"
          >
            ລ້າງຕົວກອງ
          </Button>
          <Button 
            onClick={handleApplyFilters} 
            color="primary" 
            variant="contained"
          >
            ນຳໃຊ້ຕົວກອງ
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Sale Details Modal */}
      <Dialog 
        open={saleDetailsOpen} 
        onClose={() => setSaleDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          ລາຍລະອຽດການຂາຍ {selectedSale?.sale_id ? `#${selectedSale.sale_id}` : ''}
        </DialogTitle>
        <DialogContent>
          {selectedSale ? (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>ລູກຄ້າ:</strong> {selectedSale.customer_name || 'ລູກຄ້າທົ່ວໄປ'}
                  </Typography>
                  <Typography variant="body1">
                    <strong>ພະນັກງານ:</strong> {selectedSale.emp_name || '-'}
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
              
              <Divider sx={{ my: 2 }} />
              
              {/* ສະແດງລາຍລະອຽດສິນຄ້າທີ່ຖືກຂາຍ */}
              {saleDetailsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                  <CircularProgress />
                </Box>
              ) : selectedSale.products && selectedSale.products.length > 0 ? (
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell align="center">#</TableCell>
                        <TableCell>ລາຍການ</TableCell>
                        <TableCell align="right">ລາຄາ</TableCell>
                        <TableCell align="center">ຈຳນວນ</TableCell>
                        <TableCell align="right">ລວມ</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedSale.products.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell align="center">{index + 1}</TableCell>
                          <TableCell>{item.product_name || `ສິນຄ້າລະຫັດ ${item.proid}`}</TableCell>
                          <TableCell align="right">{formatNumber(item.price)}</TableCell>
                          <TableCell align="center">{item.qty}</TableCell>
                          <TableCell align="right">{formatNumber(item.total)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} />
                        <TableCell align="right">
                          <Typography variant="subtitle1" fontWeight="bold">
                            ລວມທັງໝົດ:
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="subtitle1" fontWeight="bold">
                            {formatNumber(selectedSale.subtotal)} ກີບ
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={3} />
                        <TableCell align="right">
                          ຈຳນວນເງິນທີ່ຮັບ:
                        </TableCell>
                        <TableCell align="right">
                          {formatNumber(selectedSale.pay)} ກີບ
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={3} />
                        <TableCell align="right">
                          ເງິນທອນ:
                        </TableCell>
                        <TableCell align="right">
                          {formatNumber(selectedSale.money_change)} ກີບ
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ textAlign: 'center', my: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    ບໍ່ມີຂໍ້ມູນລາຍລະອຽດສິນຄ້າ
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PrintIcon />}
            onClick={() => {
              // ພິມໃບບິນ
              setSaleDetailsOpen(false);
            }}
          >
            ພິມໃບບິນ
          </Button>
          <Button onClick={() => setSaleDetailsOpen(false)}>ປິດ</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}

export default SalesHistory;