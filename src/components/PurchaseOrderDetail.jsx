import React, { useState, useRef } from 'react';
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
  Divider
} from '@mui/material';
import {
  Print as PrintIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useReactToPrint } from 'react-to-print';

const PurchaseOrderDetail = ({ open, onClose, order }) => {
  const printComponentRef = useRef();
  
  // Handle print functionality
  const handlePrint = useReactToPrint({
    content: () => printComponentRef.current,
    documentTitle: `ໃບສັ່ງຊື້ເລກທີ-${order?.id || ''}`,
  });
  
  // If no order, don't render
  if (!order) return null;
  
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
        <div ref={printComponentRef} style={{ padding: '20px' }}>
          {/* Printable Content */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" align="center" sx={{ mb: 1, fontWeight: 'bold' }}>
              ໃບສັ່ງຊື້ສິນຄ້າ
            </Typography>
            <Typography variant="h6" align="center" sx={{ mb: 3 }}>
              ເລກທີ່: {order.id}
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>ຜູ້ສະໜອງ:</strong> {order.supplier}
                </Typography>
                <Typography variant="body1">
                  <strong>ພະນັກງານ:</strong> {order.employee}
                </Typography>
              </Grid>
              <Grid item xs={6} sx={{ textAlign: 'right' }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>ວັນທີ:</strong> {order.orderDate}
                </Typography>
                <Typography variant="body1">
                  <strong>ສະຖານະ:</strong> {order.status}
                </Typography>
              </Grid>
            </Grid>
            
            <Divider sx={{ mb: 3 }} />
            
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
              <Table>
                <TableHead sx={{ bgcolor: 'background.default' }}>
                  <TableRow>
                    <TableCell align="center" width="5%">#</TableCell>
                    <TableCell>ຊື່ສິນຄ້າ</TableCell>
                    {/* Removed price column */}
                    <TableCell align="center">ຈຳນວນ</TableCell>
                    {/* Removed total price column */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell align="center">{index + 1}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      {/* Removed price cell */}
                      <TableCell align="center">{item.quantity}</TableCell>
                      {/* Removed total price cell */}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Removed total price box */}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 5, mb: 2 }}>
              <Box sx={{ textAlign: 'center', width: '200px' }}>
                <Typography variant="body2">ເຈົ້າຂອງຮ້ານ</Typography>
                <Box sx={{ borderTop: '1px solid #ccc', mt: 8, pt: 1 }}>
                  <Typography variant="body2">ລາຍເຊັນ</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseOrderDetail;