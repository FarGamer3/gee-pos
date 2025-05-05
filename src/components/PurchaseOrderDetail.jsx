import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Print as PrintIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { getOrderDetails } from '../services/orderService';
import axios from 'axios';
import API_BASE_URL from '../config/api';

// Add PrintModal component (similar to ReceiptModal structure)
const PrintOrderModal = ({ open, onClose, order, orderItems }) => {
  const printRef = React.useRef();

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    
    try {
      if (dateStr.includes('T')) {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
      }
      
      if (dateStr.includes('/')) {
        return dateStr;
      }
      
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    } catch (error) {
      console.error("Date formatting error:", error);
      return dateStr;
    }
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    const windowUrl = 'about:blank';
    const windowName = 'Print';
    const windowFeatures = 'width=800,height=600,left=50,top=50';

    const printWindow = window.open(windowUrl, windowName, windowFeatures);
    
    printWindow.document.write('<html><head><title>ໃບສັ່ງຊື້ເລກທີ ' + order.order_id + '</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      body { font-family: 'Noto Sans Lao', 'Phetsarath OT', sans-serif; padding: 20px; }
      .order-header { text-align: center; margin-bottom: 20px; }
      .order-info { margin-bottom: 20px; }
      table { width: 100%; border-collapse: collapse; }
      thead { background-color: #f0f0f0; }
      th, td { padding: 8px; border: 1px solid #ddd; text-align: center; }
      .signature-section { display: flex; justify-content: space-around; margin-top: 50px; }
      .signature-box { width: 200px; text-align: center; }
      .signature-line { border-top: 1px solid #000; margin-top: 70px; padding-top: 10px; }
    `);
    printWindow.document.write('</style></head><body>');
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.write('</body></html>');
    
    printWindow.document.close();
    printWindow.focus();
    
    // Print after the content has been rendered
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  if (!order) return null;

  const formattedDate = formatDate(order.order_date || order.orderDate);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6" align="center">ພິມໃບສັ່ງຊື້</Typography>
      </DialogTitle>
      <DialogContent>
        <Box ref={printRef}>
          <Box className="order-header">
            <Typography variant="h5" gutterBottom>ໃບສັ່ງຊື້ສິນຄ້າ</Typography>
            <Typography variant="h6">ເລກທີ່: {order.order_id}</Typography>
          </Box>
          
          <Box className="order-info" sx={{ mb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body1">
                  <strong>ຜູ້ສະໜອງ:</strong> {order.supplier || '-'}
                </Typography>
                <Typography variant="body1">
                  <strong>ພະນັກງານ:</strong> {order.employee || '-'}
                </Typography>
              </Grid>
              <Grid item xs={6} sx={{ textAlign: 'right' }}>
                <Typography variant="body1">
                  <strong>ວັນທີ:</strong> {formattedDate}
                </Typography>
              </Grid>
            </Grid>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="center">ລ/ດ</TableCell>
                  <TableCell align="center">ຊື່ສິນຄ້າ</TableCell>
                  <TableCell align="center">ຈຳນວນ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orderItems && orderItems.length > 0 ? (
                  orderItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell align="center">{index + 1}</TableCell>
                      <TableCell align="center">{item.ProductName || item.name || '-'}</TableCell>
                      <TableCell align="center">{item.qty || item.quantity || 0}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      ບໍ່ພົບຂໍ້ມູນລາຍການສິນຄ້າ
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Divider sx={{ my: 2 }} />
          
          <Box className="signature-section">
            <Box className="signature-box">
              <Typography variant="body2">ຜູ້ອະນຸມັດ</Typography>
              <Box className="signature-line">
                <Typography variant="body2">ລາຍເຊັນ</Typography>
              </Box>
            </Box>
            <Box className="signature-box">
              <Typography variant="body2">ຜູ້ຮັບສິນຄ້າ</Typography>
              <Box className="signature-line">
                <Typography variant="body2">ລາຍເຊັນ</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          ປິດ
        </Button>
        <Button 
          onClick={handlePrint} 
          color="primary" 
          variant="contained"
          startIcon={<PrintIcon />}
        >
          ພິມ
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const PurchaseOrderDetail = ({ open, onClose, order }) => {
  const [loading, setLoading] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  
  // Format date function
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    
    try {
      if (dateStr.includes('T')) {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
      }
      
      if (dateStr.includes('/')) {
        return dateStr;
      }
      
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    } catch (error) {
      console.error("Date formatting error:", error);
      return dateStr;
    }
  };
  
  // ດຶງຂໍ້ມູນລາຍລະອຽດເມື່ອເປີດ dialog
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (order && order.order_id && open) {
        try {
          setLoading(true);
          setError(null);
          
          console.log(`Fetching details for order ID: ${order.order_id}`);
          const details = await getOrderDetails(order.order_id);
          
          if (Array.isArray(details) && details.length > 0) {
            console.log("Successfully received order details:", details);
            setOrderItems(details);
            setError(null);
          } else {
            console.log("No order details found");
            
            // Try direct API call as backup
            try {
              const response = await axios.post(`${API_BASE_URL}/order/Order_Detail/With/OrderID`, {
                order_id: order.order_id
              });
              
              if (response.data && response.data.result_code === "200" && response.data.user_info) {
                setOrderItems(response.data.user_info);
              } else {
                // Set mock data for print
                setOrderItems([
                  { ProductName: "ສິນຄ້າຕົວຢ່າງ 1", qty: 10 },
                  { ProductName: "ສິນຄ້າຕົວຢ່າງ 2", qty: 15 }
                ]);
                setError("ໃຊ້ຂໍ້ມູນຕົວຢ່າງ");
              }
            } catch (apiErr) {
              console.error("Direct API call failed:", apiErr);
              
              // Set mock data for print
              setOrderItems([
                { ProductName: "ສິນຄ້າຕົວຢ່າງ 1", qty: 10 },
                { ProductName: "ສິນຄ້າຕົວຢ່າງ 2", qty: 15 }
              ]);
              setError("ໃຊ້ຂໍ້ມູນຕົວຢ່າງ");
            }
          }
        } catch (err) {
          console.error("Error fetching order details:", err);
          
          // Set mock data for print
          setOrderItems([
            { ProductName: "ສິນຄ້າຕົວຢ່າງ 1", qty: 10 },
            { ProductName: "ສິນຄ້າຕົວຢ່າງ 2", qty: 15 }
          ]);
          setError("ໃຊ້ຂໍ້ມູນຕົວຢ່າງ");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchOrderDetails();
  }, [order, open, retryCount]);
  
  // Handle retry functionality
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };
  
  // Handle print button click
  const handlePrintClick = () => {
    setPrintModalOpen(true);
  };
  
  // Handle close print modal
  const handleClosePrintModal = () => {
    setPrintModalOpen(false);
  };
  
  // If no order, don't render
  if (!order) return null;
  
  // Get formatted date for display
  const formattedDate = formatDate(order.order_date || order.orderDate);
  
  // Format number with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', py: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">ລາຍລະອຽດໃບສັ່ງຊື້</Typography>
            <Box>
              <Button 
                variant="contained" 
                color="success" 
                startIcon={<PrintIcon />}
                onClick={handlePrintClick}
                sx={{ mr: 1 }}
                disabled={loading}
              >
                ພິມໃບສັ່ງຊື້
              </Button>
              <Button 
                variant="contained" 
                color="error" 
                onClick={onClose}
              >
                ປິດ
              </Button>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ mt: 2 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ my: 4 }}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                {error}
              </Alert>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  startIcon={<RefreshIcon />}
                  onClick={handleRetry}
                >
                  ລອງໃໝ່ອີກຄັ້ງ
                </Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ mb: 4, fontFamily: 'Noto Sans Lao, Phetsarath OT, sans-serif' }}>
              <Typography variant="h5" align="center" sx={{ mb: 1, fontWeight: 'bold' }}>
                ໃບສັ່ງຊື້ສິນຄ້າ
              </Typography>
              <Typography variant="h6" align="center" sx={{ mb: 3 }}>
                ເລກທີ່: {order.order_id}
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>ຜູ້ສະໜອງ:</strong> {order.supplier || '-'}
                  </Typography>
                  <Typography variant="body1">
                    <strong>ພະນັກງານ:</strong> {order.employee || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>ວັນທີ:</strong> {formattedDate}
                  </Typography>
                </Grid>
              </Grid>
              
              <Divider sx={{ mb: 3 }} />
              
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                <Table>
                  <TableHead sx={{ bgcolor: 'background.default' }}>
                    <TableRow>
                      <TableCell align="center" width="10%" sx={{ fontWeight: 'bold' }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>ຊື່ສິນຄ້າ</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>ຈຳນວນ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orderItems && orderItems.length > 0 ? (
                      orderItems.map((item, index) => (
                        <TableRow key={`item-${index}`}>
                          <TableCell align="center">{index + 1}</TableCell>
                          <TableCell>{item.ProductName || item.name || '-'}</TableCell>
                          <TableCell align="center">{item.qty || item.quantity || 0}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                          ບໍ່ພົບຂໍ້ມູນລາຍການສິນຄ້າ
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Print Modal */}
      <PrintOrderModal
        open={printModalOpen}
        onClose={handleClosePrintModal}
        order={order}
        orderItems={orderItems}
      />
    </>
  );
};

export default PurchaseOrderDetail;