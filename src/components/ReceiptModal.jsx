import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Box,
  Paper,
} from '@mui/material';
import { Print as PrintIcon } from '@mui/icons-material';
import { useRef } from 'react';

// Format number with commas for every 3 digits
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

function ReceiptModal({ open, onClose, items, customer, totalAmount, amountPaid = 0, changeAmount = 0 }) {
  const printRef = useRef();

  const handlePrint = () => {
    const printContent = printRef.current;
    const windowUrl = 'about:blank';
    const windowName = 'Print';
    const windowFeatures = 'width=800,height=600,left=50,top=50';

    const printWindow = window.open(windowUrl, windowName, windowFeatures);
    
    printWindow.document.write('<html><head><title>Receipt</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      body { font-family: 'Noto Sans Lao', 'Phetsarath OT', sans-serif; padding: 20px; }
      .receipt-header { text-align: center; margin-bottom: 20px; }
      .receipt-info { margin-bottom: 20px; }
      table { width: 100%; border-collapse: collapse; }
      thead { background-color: #f0f0f0; }
      th, td { padding: 8px; border: 1px solid #ddd; text-align: center; }
      .receipt-total { text-align: right; margin-top: 20px; font-weight: bold; }
      .receipt-payment { text-align: right; margin-top: 10px; }
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

  // Format current date
  const currentDate = new Date().toLocaleDateString('lo-LA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6" align="center">ໃບເກັບເງິນ</Typography>
      </DialogTitle>
      <DialogContent>
        <Box ref={printRef}>
          <Box className="receipt-header">
            <Typography variant="h5" gutterBottom>GeePOS</Typography>
            <Typography variant="body2">ໃບເກັບເງິນ</Typography>
          </Box>
          
          <Box className="receipt-info" sx={{ mb: 2 }}>
            <Typography variant="body2">ວັນທີ: {currentDate}</Typography>
            <Typography variant="body2">ລູກຄ້າ: {customer || 'ລູກຄ້າທົ່ວໄປ'}</Typography>
            <Typography variant="body2">ເລກທີໃບບິນ: INV-{Math.floor(Math.random() * 10000)}</Typography>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="center">ລ/ດ</TableCell>
                  <TableCell align="center">ລາຍການ</TableCell>
                  <TableCell align="center">ລາຄາ</TableCell>
                  <TableCell align="center">ຈຳນວນ</TableCell>
                  <TableCell align="center">ລວມ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell align="center">{index + 1}</TableCell>
                    <TableCell align="center">{item.name}</TableCell>
                    <TableCell align="center">{formatNumber(item.price)}</TableCell>
                    <TableCell align="center">{item.quantity}</TableCell>
                    <TableCell align="center">{formatNumber(item.price * item.quantity)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box className="receipt-total" sx={{ mt: 2, textAlign: 'right' }}>
            <Typography variant="h6">
              ລວມທັງໝົດ: {formatNumber(totalAmount)} ກີບ
            </Typography>
          </Box>

          {/* Payment details */}
          <Box className="receipt-payment" sx={{ mt: 1, textAlign: 'right' }}>
            <Typography variant="body1">
              ຈຳນວນເງິນທີ່ຈ່າຍ: {formatNumber(amountPaid)} ກີບ
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              ເງິນທອນ: {formatNumber(changeAmount)} ກີບ
            </Typography>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2">ຂອບໃຈທີ່ໃຊ້ບໍລິການ</Typography>
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
}

export default ReceiptModal;