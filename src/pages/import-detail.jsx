import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Divider,
  Grid,
  Snackbar,
  IconButton
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
  Sync as SyncIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useReactToPrint } from 'react-to-print';
import Layout from '../components/Layout';
import { getImportDetails } from '../services/importService';

function ImportDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [importData, setImportData] = useState(null);
  const [importDetails, setImportDetails] = useState([]);
  
  // Print reference
  const printRef = useRef();
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Get import ID from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const importId = queryParams.get('id');
  
  useEffect(() => {
    if (importId) {
      fetchImportDetails(importId);
    } else {
      setError('ບໍ່ພົບລະຫັດການນຳເຂົ້າສິນຄ້າ');
    }
  }, [importId]);
  
  const fetchImportDetails = async (id) => {
    setLoading(true);
    try {
      const details = await getImportDetails(id);
      
      if (details && details.length > 0) {
        // Get import header information from the first detail record
        const headerInfo = {
          imp_id: details[0].imp_id,
          imp_date: details[0].imp_date,
          order_id: details[0].order_id,
          emp_name: details[0].emp_name,
          status: details[0].status,
          total_price: details.reduce((sum, item) => sum + (item.subtotal || 0), 0)
        };
        
        setImportData(headerInfo);
        setImportDetails(details);
        setError(null);
      } else {
        setError('ບໍ່ພົບຂໍ້ມູນລາຍລະອຽດການນຳເຂົ້າສິນຄ້ານີ້');
        setImportData(null);
        setImportDetails([]);
      }
    } catch (err) {
      console.error('Error fetching import details:', err);
      setError('ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນລາຍລະອຽດການນຳເຂົ້າສິນຄ້າ');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle the print functionality
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `ໃບນຳເຂົ້າສິນຄ້າ-${importId}`,
  });
  
  // Handle back button click
  const handleBack = () => {
    navigate('/import');
  };
  
  // Show snackbar
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };
  
  // Handle closing snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy');
    } catch (error) {
      return dateString;
    }
  };
  
  // Format number with commas for currency display
  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // Get the status text in Lao language
  const getStatusText = (status) => {
    if (!status) return '-';
    return status === 'Completed' ? 'ສຳເລັດ' : 'ລໍຖ້າ';
  };
  
  return (
    <Layout title="ລາຍລະອຽດການນຳເຂົ້າສິນຄ້າ">
      {/* Snackbar for notifications */}
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
      
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          ກັບຄືນ
        </Button>
        
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<SyncIcon />}
            onClick={() => fetchImportDetails(importId)}
            sx={{ mr: 2 }}
            disabled={loading}
          >
            ໂຫຼດຄືນໃໝ່
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            disabled={loading || !importData}
          >
            ພິມໃບນຳເຂົ້າສິນຄ້າ
          </Button>
        </Box>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      ) : (
        <div ref={printRef} style={{ padding: '15px' }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                ໃບນຳເຂົ້າສິນຄ້າ
              </Typography>
            </Box>
            
            {importData && (
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1" gutterBottom>
                    <strong>ລະຫັດນຳເຂົ້າ:</strong> {importData.imp_id}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>ວັນທີ່ນຳເຂົ້າ:</strong> {formatDate(importData.imp_date)}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>ລະຫັດສັ່ງຊື້:</strong> {importData.order_id}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1" gutterBottom>
                    <strong>ພະນັກງານ:</strong> {importData.emp_name}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>ສະຖານະ:</strong> {getStatusText(importData.status)}
                  </Typography>
                </Grid>
              </Grid>
            )}
            
            <Divider sx={{ mb: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              ລາຍການສິນຄ້າທີ່ນຳເຂົ້າ
            </Typography>
            
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="center" width={50}>ລຳດັບ</TableCell>
                    <TableCell>ຊື່ສິນຄ້າ</TableCell>
                    <TableCell align="center">ຈຳນວນ</TableCell>
                    <TableCell align="right">ລາຄາຕົ້ນທຶນ</TableCell>
                    <TableCell align="right">ລວມເປັນເງິນ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {importDetails.length > 0 ? (
                    importDetails.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell align="center">{index + 1}</TableCell>
                        <TableCell>{item.ProductName}</TableCell>
                        <TableCell align="center">{item.qty}</TableCell>
                        <TableCell align="right">{formatNumber(item.cost_price)} ກີບ</TableCell>
                        <TableCell align="right">{formatNumber(item.subtotal)} ກີບ</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">ບໍ່ພົບຂໍ້ມູນ</TableCell>
                    </TableRow>
                  )}
                  
                  {importData && (
                    <TableRow>
                      <TableCell colSpan={4} align="right" sx={{ fontWeight: 'bold' }}>
                        ລວມທັງໝົດ:
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {formatNumber(importData.total_price)} ກີບ
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Box sx={{ width: '30%', textAlign: 'center' }}>
                <Typography variant="body2" gutterBottom>ຜູ້ອະນຸມັດ</Typography>
                <Box sx={{ height: 60 }}></Box>
                <Divider />
                <Typography variant="body2">ລາຍເຊັນ</Typography>
              </Box>
              
              <Box sx={{ width: '30%', textAlign: 'center' }}>
                <Typography variant="body2" gutterBottom>ຜູ້ກວດກາ</Typography>
                <Box sx={{ height: 60 }}></Box>
                <Divider />
                <Typography variant="body2">ລາຍເຊັນ</Typography>
              </Box>
              
              <Box sx={{ width: '30%', textAlign: 'center' }}>
                <Typography variant="body2" gutterBottom>ພະນັກງານບັນທຶກ</Typography>
                <Box sx={{ height: 60 }}></Box>
                <Divider />
                <Typography variant="body2">ລາຍເຊັນ</Typography>
              </Box>
            </Box>
          </Paper>
        </div>
      )}
    </Layout>
  );
}

export default ImportDetail;