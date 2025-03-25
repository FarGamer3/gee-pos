import React from 'react';
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
  MenuItem
} from '@mui/material';

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
  onSave 
}) => {
  
  if (!product) return null;
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>ນຳອອກສິນຄ້າ</DialogTitle>
      <DialogContent>
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
              <TextField
                fullWidth
                select
                label="ສາເຫດການນຳອອກ"
                value={exportReason}
                onChange={(e) => setExportReason(e.target.value)}
              >
                <MenuItem value="">ເລືອກສາເຫດ</MenuItem>
                <MenuItem value="ສິນຄ້າເສຍຫາຍ">ສິນຄ້າເສຍຫາຍ</MenuItem>
                <MenuItem value="ສິນຄ້າໝົດອາຍຸ">ສິນຄ້າໝົດອາຍຸ</MenuItem>
                <MenuItem value="ສິນຄ້າຊຳລຸດ">ສິນຄ້າຊຳລຸດ</MenuItem>
                <MenuItem value="ໂອນຍ້າຍສາງ">ໂອນຍ້າຍສາງ</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error">
          ຍົກເລີກ
        </Button>
        <Button onClick={onSave} color="primary" variant="contained">
          ນຳອອກ
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportFormDialog;