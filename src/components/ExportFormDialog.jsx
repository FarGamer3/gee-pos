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
import axios from 'axios';
import API_BASE_URL from '../config/api';

function ExportFormDialog({ 
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
}) {
  // ເພີ່ມ state ສໍາລັບເກັບຂໍ້ມູນບ່ອນຈັດວາງ
  const [warehouseLocations, setWarehouseLocations] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);

  // ກວດກາຄ່າ state ຂອງຟອມ
  const [formErrors, setFormErrors] = useState({
    quantity: false,
    reason: false
  });
  
  // ດຶງຂໍ້ມູນບ່ອນຈັດວາງເມື່ອເປີດກ່ອງໂຕ້ຕອບ
  useEffect(() => {
    if (open) {
      fetchWarehouseLocations();
      setFormErrors({ quantity: false, reason: false });
    }
  }, [open]);

  // ຟັງຊັນດຶງຂໍ້ມູນບ່ອນຈັດວາງສິນຄ້າ
  const fetchWarehouseLocations = async () => {
    try {
      setLocationLoading(true);
      const response = await axios.get(`${API_BASE_URL}/All/Zone`);
      
      if (response.data && response.data.result_code === "200") {
        setWarehouseLocations(response.data.zones || []);
        
        // ຖ້າມີຂໍ້ມູນແລະຍັງບໍ່ໄດ້ເລືອກບ່ອນຈັດວາງ, ໃຫ້ເລືອກບ່ອນຈັດວາງຂອງສິນຄ້າເປັນຄ່າເລີ່ມຕົ້ນ
        if (response.data.zones && response.data.zones.length > 0 && !exportLocation) {
          // ຊອກຫາບ່ອນຈັດວາງຂອງສິນຄ້າ (ຖ້າມີ)
          if (product && product.location) {
            const productZone = response.data.zones.find(
              zone => zone.zone === product.location || 
                     zone.zone_detail.includes(product.location)
            );
            
            if (productZone) {
              setExportLocation(productZone.zone);
            } else {
              // ຖ້າບໍ່ພົບບ່ອນຈັດວາງຂອງສິນຄ້າ, ໃຊ້ບ່ອນຈັດວາງທໍາອິດ
              setExportLocation(response.data.zones[0].zone);
            }
          } else {
            // ຖ້າບໍ່ມີຂໍ້ມູນບ່ອນຈັດວາງຂອງສິນຄ້າ, ໃຊ້ບ່ອນຈັດວາງທໍາອິດ
            setExportLocation(response.data.zones[0].zone);
          }
        }
      }
    } catch (error) {
      console.error("ຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນບ່ອນຈັດວາງ:", error);
    } finally {
      setLocationLoading(false);
    }
  };
  
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
              <FormControl fullWidth disabled={locationLoading}>
                <InputLabel id="location-label">ບ່ອນຈັດວາງ</InputLabel>
                <Select
                  labelId="location-label"
                  id="location"
                  value={exportLocation}
                  onChange={(e) => setExportLocation(e.target.value)}
                  label="ບ່ອນຈັດວາງ"
                >
                  {locationLoading ? (
                    <MenuItem value="">
                      <CircularProgress size={20} /> ກຳລັງໂຫຼດຂໍ້ມູນ...
                    </MenuItem>
                  ) : warehouseLocations.length > 0 ? (
                    warehouseLocations.map((location) => (
                      <MenuItem key={location.zone_id} value={location.zone}>
                        {location.zone} - {location.zone_detail}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="">ບໍ່ພົບຂໍ້ມູນບ່ອນຈັດວາງ</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ສາເຫດການນຳອອກ"
                value={exportReason}
                onChange={(e) => setExportReason(e.target.value)}
                error={formErrors.reason}
                helperText={formErrors.reason ? "ກະລຸນາລະບຸສາເຫດການນຳອອກ" : ""}
                multiline
                rows={2}
              />
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
}

export default ExportFormDialog;