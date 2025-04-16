import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  CircularProgress,
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

/**
 * ກ່ອງໂຕ້ຕອບສຳລັບການນຳອອກສິນຄ້າ
 * @param {Object} props - Component properties
 * @param {boolean} props.open - Dialog open state
 * @param {Function} props.onClose - Dialog close handler
 * @param {Object} props.product - Product to export
 * @param {number} props.exportQuantity - Quantity to export
 * @param {Function} props.setExportQuantity - Function to set export quantity
 * @param {string} props.exportLocation - Export location
 * @param {Function} props.setExportLocation - Function to set export location
 * @param {string} props.exportReason - Reason for export
 * @param {Function} props.setExportReason - Function to set export reason
 * @param {Function} props.onSave - Function to save export
 * @param {boolean} props.loading - Loading state for API operations
 * @param {string} props.errorMessage - Error message from API
 */
const ExportFormDialog = ({ 
  open, 
  onClose, 
  product, 
  exportQuantity, 
  setExportQuantity, 
  exportLocation, 
  setExportLocation, 
  exportReason, 
  setExportReason, 
  onSave,
  loading = false,
  errorMessage = null
}) => {
  // ກວດກາຄ່າ state ຂອງຟອມ
  const [formErrors, setFormErrors] = useState({
    quantity: false,
    reason: false
  });
  
  // ຕັ້ງຄ່າເລີ່ມຕົ້ນເມື່ອເປີດກ່ອງໂຕ້ຕອບ
  useEffect(() => {
    if (open && product) {
      setExportLocation(product.location || '');
      setFormErrors({ quantity: false, reason: false });
    }
  }, [open, product, setExportLocation]);
  
  // ກວດສອບຄວາມຖືກຕ້ອງເມື່ອມີການປ່ຽນແປງຄ່າ
  useEffect(() => {
    if (exportQuantity > 0 && exportQuantity <= (product?.stock || 0)) {
      setFormErrors(prev => ({ ...prev, quantity: false }));
    }
    
    if (exportReason) {
      setFormErrors(prev => ({ ...prev, reason: false }));
    }
  }, [exportQuantity, exportReason, product]);
  
  // ຟັງຊັນກວດສອບຄວາມຖືກຕ້ອງຂອງຟອມ
  const validateForm = () => {
    const errors = {
      quantity: !exportQuantity || exportQuantity <= 0 || exportQuantity > (product?.stock || 0),
      reason: !exportReason
    };
    
    setFormErrors(errors);
    return !Object.values(errors).some(Boolean);
  };
  
  // ຈັດການການບັນທຶກຂໍ້ມູນ
  const handleSave = () => {
    if (validateForm()) {
      onSave();
    }
  };
  
  // ຖ້າບໍ່ມີຂໍ້ມູນສິນຄ້າ, ບໍ່ຕ້ອງສະແດງ
  if (!product) return null;
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        ນຳອອກສິນຄ້າ
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
          disabled={loading}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        {errorMessage && (
          <Alert severity="error" sx={{ mt: 1, mb: 2 }}>
            {errorMessage}
          </Alert>
        )}
        
        <Box sx={{ pt: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            <strong>ສິນຄ້າ:</strong> {product.name}
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ຊື່ສິນຄ້າ"
                value={product.name}
                disabled
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ຈຳນວນ"
                type="number"
                value={exportQuantity}
                onChange={(e) => setExportQuantity(parseInt(e.target.value) || 0)}
                InputProps={{ 
                  inputProps: { min: 1, max: product.stock } 
                }}
                error={formErrors.quantity}
                helperText={formErrors.quantity ? `ຈຳນວນຕ້ອງຢູ່ລະຫວ່າງ 1 ແລະ ${product.stock}` : ''}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ບ່ອນຈັດວາງ"
                value={exportLocation}
                onChange={(e) => setExportLocation(e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth error={formErrors.reason}>
                <InputLabel id="export-reason-label">ສາເຫດການນຳອອກ</InputLabel>
                <Select
                  labelId="export-reason-label"
                  id="export-reason"
                  value={exportReason}
                  onChange={(e) => setExportReason(e.target.value)}
                  label="ສາເຫດການນຳອອກ"
                >
                  <MenuItem value="">ເລືອກສາເຫດ</MenuItem>
                  <MenuItem value="ສິນຄ້າເສຍຫາຍ">ສິນຄ້າເສຍຫາຍ</MenuItem>
                  <MenuItem value="ສິນຄ້າໝົດອາຍຸ">ສິນຄ້າໝົດອາຍຸ</MenuItem>
                  <MenuItem value="ສິນຄ້າຊຳລຸດ">ສິນຄ້າຊຳລຸດ</MenuItem>
                  <MenuItem value="ໂອນຍ້າຍສາງ">ໂອນຍ້າຍສາງ</MenuItem>
                </Select>
                {formErrors.reason && <FormHelperText>ກະລຸນາເລືອກສາເຫດການນຳອອກ</FormHelperText>}
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button 
          onClick={onClose} 
          color="error"
          disabled={loading}
        >
          ຍົກເລີກ
        </Button>
        <Button 
          onClick={handleSave} 
          color="primary" 
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'ນຳອອກ'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportFormDialog;