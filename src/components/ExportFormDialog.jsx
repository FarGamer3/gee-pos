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
  Alert,
  Chip
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
  // State for warehouse locations
  const [warehouseLocations, setWarehouseLocations] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState(null);

  // Form validation state
  const [formErrors, setFormErrors] = useState({
    quantity: false,
    reason: false
  });
  
  // Fetch warehouse locations when dialog opens
  useEffect(() => {
    if (open) {
      fetchWarehouseLocations();
      setFormErrors({ quantity: false, reason: false });
    }
  }, [open]);

  // Function to fetch warehouse locations
  const fetchWarehouseLocations = async () => {
    try {
      setLocationLoading(true);
      const response = await axios.get(`${API_BASE_URL}/All/Zone`);
      
      if (response.data && response.data.result_code === "200") {
        const zones = response.data.user_info || [];
        setWarehouseLocations(zones);
        
        // Set default zone based on product's current location
        if (zones.length > 0) {
          if (product && product.location) {
            const productZone = zones.find(
              zone => zone.zone === product.location || 
                     zone.zone_detail.includes(product.location)
            );
            
            if (productZone) {
              setExportLocation(productZone.zone);
              setSelectedZoneId(productZone.zone_id);
            } else if (!exportLocation) {
              // Default to first location if product's location not found
              setExportLocation(zones[0].zone);
              setSelectedZoneId(zones[0].zone_id);
            }
          } else if (!exportLocation) {
            // Default to first location if no product location
            setExportLocation(zones[0].zone);
            setSelectedZoneId(zones[0].zone_id);
          }
        }
      }
    } catch (error) {
      console.error("ຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນບ່ອນຈັດວາງ:", error);
      
      // Use default locations if API fails
      const defaultLocations = [
        { zone_id: 1, zone: 'A', zone_detail: 'ບ່ອນຈັດວາງ A' },
        { zone_id: 2, zone: 'B', zone_detail: 'ບ່ອນຈັດວາງ B' },
        { zone_id: 3, zone: 'C', zone_detail: 'ບ່ອນຈັດວາງ C' }
      ];
      
      setWarehouseLocations(defaultLocations);
      
      if (!exportLocation && defaultLocations.length > 0) {
        setExportLocation(defaultLocations[0].zone);
        setSelectedZoneId(defaultLocations[0].zone_id);
      }
    } finally {
      setLocationLoading(false);
    }
  };
  
  // Validate form as values change
  useEffect(() => {
    if (exportQuantity > 0 && exportQuantity <= (product?.stock || 0)) {
      setFormErrors(prev => ({ ...prev, quantity: false }));
    } else {
      setFormErrors(prev => ({ ...prev, quantity: true }));
    }
    
    if (exportReason) {
      setFormErrors(prev => ({ ...prev, reason: false }));
    } else {
      setFormErrors(prev => ({ ...prev, reason: true }));
    }
  }, [exportQuantity, exportReason, product]);
  
  // Validate form before submission
  const validateForm = () => {
    const errors = {
      quantity: !exportQuantity || exportQuantity <= 0 || exportQuantity > (product?.stock || 0),
      reason: !exportReason
    };
    
    setFormErrors(errors);
    return !Object.values(errors).some(Boolean);
  };
  
  // Handle location change
  const handleLocationChange = (e) => {
    const selectedZone = e.target.value;
    setExportLocation(selectedZone);
    
    // Find zone_id for the selected zone
    const matchingZone = warehouseLocations.find(zone => zone.zone === selectedZone);
    if (matchingZone) {
      setSelectedZoneId(matchingZone.zone_id);
      console.log(`Location changed to: ${selectedZone}, zone_id: ${matchingZone.zone_id}`);
    } else {
      console.log(`No matching zone found for: ${selectedZone}`);
    }
  };
  
  // Handle save button click
  const handleSave = () => {
    if (validateForm()) {
      // Make sure we have zone_id
      let zoneIdToUse = selectedZoneId;
      
      // If selectedZoneId is not set, try to find it from the location
      if (!zoneIdToUse && exportLocation) {
        const matchingZone = warehouseLocations.find(zone => zone.zone === exportLocation);
        if (matchingZone) {
          zoneIdToUse = matchingZone.zone_id;
        }
      }
      
      // Fallback to product's original zone_id
      if (!zoneIdToUse) {
        zoneIdToUse = product.zone_id;
      }
      
      // Pass zone_id along with other data
      const updatedProduct = {
        ...product,
        exportQuantity,
        exportLocation,
        exportReason,
        zone_id: zoneIdToUse || 1 // ຖ້າຍັງບໍ່ມີ zone_id ໃຫ້ໃຊ້ 1 ເປັນຄ່າ default
      };
      
      // Log the data being saved
      console.log("Saving export item with data:", updatedProduct);
      console.log("Final zone ID:", zoneIdToUse);
      
      onSave(updatedProduct);
    }
  };
  
  // If no product, don't render dialog
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
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={locationLoading} required>
                <InputLabel id="location-label">ບ່ອນຈັດວາງ</InputLabel>
                <Select
                  labelId="location-label"
                  id="location"
                  value={exportLocation}
                  onChange={handleLocationChange}
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
                {selectedZoneId && (
                  <FormHelperText>Zone ID: {selectedZoneId}</FormHelperText>
                )}
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
                rows={3}
                placeholder="ລະບຸສາເຫດໃນການນຳອອກສິນຄ້າ ເຊັ່ນ: ສິນຄ້າເສຍຫາຍ, ໝົດອາຍຸ, ໂອນໄປສາຂາອື່ນ ຫຼື ອື່ນໆ..."
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                  ຈຳນວນຄົງເຫຼືອໃນສາງ:
                </Typography>
                <Chip 
                  label={`${product.stock} ອັນ`} 
                  color="primary" 
                  variant="outlined" 
                  size="small"
                />
                
                <Typography variant="body2" color="text.secondary" sx={{ mx: 1 }}>
                  ຫຼັງນຳອອກ:
                </Typography>
                <Chip 
                  label={`${Math.max(0, product.stock - exportQuantity)} ອັນ`} 
                  color={product.stock - exportQuantity < 0 ? "error" : "success"} 
                  variant="outlined" 
                  size="small"
                />
              </Box>
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
          disabled={loading || formErrors.quantity || formErrors.reason}
        >
          {loading ? <CircularProgress size={24} /> : 'ນຳອອກ'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ExportFormDialog;