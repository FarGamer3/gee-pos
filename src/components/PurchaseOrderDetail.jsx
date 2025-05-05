import React, { useState, useEffect, useRef } from 'react';
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
import { useReactToPrint } from 'react-to-print';
import { getOrderDetails } from '../services/orderService';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const PurchaseOrderDetail = ({ open, onClose, order }) => {
  const componentRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Format date function
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    
    try {
      // Check if it's ISO format
      if (dateStr.includes('T')) {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr; // Return original if invalid date
        
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
      }
      
      // If it's already in DD/MM/YYYY format, return as is
      if (dateStr.includes('/')) {
        return dateStr;
      }
      
      // Try to convert other string formats
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr; // Return original if invalid date
      
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    } catch (error) {
      console.error("Date formatting error:", error);
      return dateStr; // Return original on error
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
  
// Handle print functionality
const handlePrint = useReactToPrint({
  content: () => printComponentRef.current,
  documentTitle: `ໃບສັ່ງຊື້ເລກທີ-${order?.order_id || ''}`,
  onBeforeGetContent: () => {
    return new Promise((resolve) => {
      // Wait for content to be ready
      setTimeout(() => {
        resolve();
      }, 500);
    });
  },
  onAfterPrint: () => {
    console.log("ພິມສຳເລັດແລ້ວ");
  },
  onPrintError: (error) => {
    console.error("ຂໍ້ຜິດພາດໃນການພິມ:", error);
    setError("ບໍ່ສາມາດພິມໃບສັ່ງຊື້ໄດ້");
  },
  pageStyle: `
    @page {
      size: A4;
      margin: 20mm;
    }
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  `,
  removeAfterPrint: true
});
  
  // If no order, don't render
  if (!order) return null;
  
  // Get formatted date for display
  const formattedDate = formatDate(order.order_date || order.orderDate);
  
  // Format number with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
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
              onClick={handlePrint}
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
          <div ref={componentRef} style={{ padding: '20px' }}>
            {/* Printable Content */}
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
              
              <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 8, mb: 2 }}>
                <Box sx={{ textAlign: 'center', width: '200px' }}>
                  <Typography variant="body2" sx={{ mb: 8 }}>ຜູ້ອະນຸມັດ</Typography>
                  <Box sx={{ borderTop: '1px solid #333', pt: 1 }}>
                    <Typography variant="body2">ລາຍເຊັນ</Typography>
                  </Box>
                </Box>
                <Box sx={{ textAlign: 'center', width: '200px' }}>
                  <Typography variant="body2" sx={{ mb: 8 }}>ຜູ້ຮັບສິນຄ້າ</Typography>
                  <Box sx={{ borderTop: '1px solid #333', pt: 1 }}>
                    <Typography variant="body2">ລາຍເຊັນ</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseOrderDetail;