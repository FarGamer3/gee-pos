import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Grid,
  MenuItem,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Save as SaveIcon,
  Search as SearchIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { SuccessDialog, ErrorDialog } from '../components/SuccessDialog';

// Save export to localStorage for history tracking
const saveExportToHistory = (newExport) => {
  // Get existing export history
  const existingHistory = JSON.parse(localStorage.getItem('exportHistory') || '[]');
  
  // Add new export to history
  const updatedHistory = [...existingHistory, newExport];
  
  // Save back to localStorage
  localStorage.setItem('exportHistory', JSON.stringify(updatedHistory));
};

function Export() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [exportItems, setExportItems] = useState([]);
  const [exportDate, setExportDate] = useState(new Date().toISOString().split('T')[0]);
  const [warehouse, setWarehouse] = useState('');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [exportQuantity, setExportQuantity] = useState(1);
  const [exportLocation, setExportLocation] = useState('');
  const [exportReason, setExportReason] = useState('');
  
  // Print dialog state
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  
  // Mock products data
  const products = [
    { id: 1, code: 'P001', name: 'ຕູ້ເຢັນ', stock: 10, location: 'A-02' },
    { id: 2, code: 'P002', name: 'ໂທລະທັດ', stock: 15, location: 'B-05' },
    { id: 3, code: 'P003', name: 'ແອຄອນດິຊັນ', stock: 20, location: 'C-01' },
    { id: 4, code: 'P004', name: 'ຈັກຊັກຜ້າ', stock: 8, location: 'A-08' },
  ];

  // Format date to DD/MM/YYYY
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Open form dialog to add product to export
  const handleOpenFormDialog = (product) => {
    setCurrentProduct(product);
    setExportQuantity(1);
    setExportLocation(product.location);
    setExportReason('');
    setFormDialogOpen(true);
  };

  // Close form dialog
  const handleCloseFormDialog = () => {
    setFormDialogOpen(false);
    setCurrentProduct(null);
  };

  // Add product to export
  const handleAddToExport = () => {
    if (exportQuantity <= 0 || exportQuantity > currentProduct.stock) {
      alert('ກະລຸນາລະບຸຈຳນວນທີ່ຖືກຕ້ອງ');
      return;
    }

    if (!exportReason) {
      alert('ກະລຸນາລະບຸສາເຫດການນຳອອກ');
      return;
    }

    const exportItem = {
      ...currentProduct,
      exportQuantity,
      exportLocation,
      exportReason
    };

    // Check if product already exists in the export list
    const existingIndex = exportItems.findIndex(item => item.id === currentProduct.id);
    if (existingIndex >= 0) {
      // Update existing item
      const updatedItems = [...exportItems];
      updatedItems[existingIndex] = exportItem;
      setExportItems(updatedItems);
    } else {
      // Add new item
      setExportItems([...exportItems, exportItem]);
    }

    // Close dialog
    setFormDialogOpen(false);
  };

  // Remove item from export
  const handleRemoveFromExport = (id) => {
    setExportItems(exportItems.filter(item => item.id !== id));
  };

  // Handle save export
  const handleSaveExport = () => {
    if (exportItems.length === 0) {
      alert('ກະລຸນາເລືອກສິນຄ້າກ່ອນບັນທຶກການນຳອອກ');
      return;
    }

    // Create the new export object
    const newExport = {
      id: Date.now(), // Use timestamp as ID
      date: formatDate(exportDate),
      items: exportItems,
      status: 'ດຳເນີນການແລ້ວ'
    };
    
    // Save to localStorage for history tracking
    saveExportToHistory(newExport);
    
    console.log('Saving export:', newExport);
    
    // Show success dialog
    setShowSuccessDialog(true);
  };

  // Handle dialog actions
  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
    // Clear form after dialog is closed
    setExportItems([]);
  };

  const handleNavigateToExportHistory = () => {
    setShowSuccessDialog(false);
    // Clear form and navigate
    setExportItems([]);
    navigate('/export-detail');
  };

  const handleCloseErrorDialog = () => {
    setShowErrorDialog(false);
  };

  const handleTryAgain = () => {
    setShowErrorDialog(false);
  };

  // Handle print dialog
  const handleOpenPrintDialog = () => {
    if (exportItems.length === 0) {
      alert('ກະລຸນາເລືອກສິນຄ້າກ່ອນພິມໃບນຳອອກ');
      return;
    }
    setPrintDialogOpen(true);
  };

  const handleClosePrintDialog = () => {
    setPrintDialogOpen(false);
  };

  const handlePrintExport = () => {
    // Print functionality would be implemented here
    // For now, just close the dialog
    setPrintDialogOpen(false);
  };

  return (
    <Layout title="ນຳອອກສິນຄ້າ">
      {/* Success Dialog */}
      <SuccessDialog 
        open={showSuccessDialog} 
        onClose={handleCloseSuccessDialog} 
        onDashboard={handleNavigateToExportHistory} 
      />
      
      {/* Error Dialog */}
      <ErrorDialog 
        open={showErrorDialog} 
        onClose={handleCloseErrorDialog} 
        onTryAgain={handleTryAgain} 
      />
      
      {/* Form Dialog for adding products to export */}
      <Dialog 
        open={formDialogOpen} 
        onClose={handleCloseFormDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>ນຳອອກສິນຄ້າ</DialogTitle>
        <DialogContent>
          {currentProduct && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                <strong>ສິນຄ້າ:</strong> {currentProduct.name}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="ຊື່ສິນຄ້າ"
                    value={currentProduct.name}
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
                      inputProps: { min: 1, max: currentProduct.stock } 
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
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFormDialog} color="error">
            ຍົກເລີກ
          </Button>
          <Button onClick={handleAddToExport} color="primary" variant="contained">
            ນຳອອກ
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Print Dialog */}
      <Dialog
        open={printDialogOpen}
        onClose={handleClosePrintDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', py: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">ລາຍລະອຽດນຳອອກສິນຄ້າ</Typography>
            <Button 
              variant="contained" 
              color="error" 
              onClick={handleClosePrintDialog}
            >
              ປິດ
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 3, mb: 4 }}>
            <Typography variant="h5" align="center" sx={{ mb: 1, fontWeight: 'bold' }}>
              ລາຍລະອຽດນຳອອກສິນຄ້າ
            </Typography>
            <Typography variant="h6" align="center" sx={{ mb: 3 }}>
              ວັນທີ: {formatDate(exportDate)}
            </Typography>
            
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="center">#</TableCell>
                    <TableCell align="center">ເລກທີນຳອອກ</TableCell>
                    <TableCell align="center">ສິນຄ້າ</TableCell>
                    <TableCell align="center">ຈຳນວນ</TableCell>
                    <TableCell align="center">ບ່ອນຈັດວາງ</TableCell>
                    <TableCell align="center">ສາເຫດການນຳອອກ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {exportItems.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell align="center">{index + 1}</TableCell>
                      <TableCell align="center">{item.id}</TableCell>
                      <TableCell align="center">{item.name}</TableCell>
                      <TableCell align="center">{item.exportQuantity}</TableCell>
                      <TableCell align="center">{item.exportLocation}</TableCell>
                      <TableCell align="center">{item.exportReason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 5 }}>
              <Box sx={{ textAlign: 'center', width: '200px' }}>
                <Typography variant="body2">ຜູ້ນຳອອກ</Typography>
                <Box sx={{ borderTop: '1px solid #ccc', mt: 8, pt: 1 }}>
                  <Typography variant="body2">ລາຍເຊັນ</Typography>
                </Box>
              </Box>
              <Box sx={{ textAlign: 'center', width: '200px' }}>
                <Typography variant="body2">ຜູ້ອະນຸມັດ</Typography>
                <Box sx={{ borderTop: '1px solid #ccc', mt: 8, pt: 1 }}>
                  <Typography variant="body2">ລາຍເຊັນ</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<PrintIcon />}
            onClick={handlePrintExport}
          >
            ພິມໃບນຳອອກ
          </Button>
        </DialogActions>
      </Dialog>
      
      <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" fontWeight="bold" color="primary">
          ຟອມນຳອອກສິນຄ້າ
        </Typography>
        <Button 
          variant="contained" 
          color="info" 
          onClick={() => navigate('/export-detail')}
        >
          ເບິ່ງປະຫວັດການນຳອອກ
        </Button>
      </Box>

      {/* Export Form */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="ວັນເວລາ"
              type="date"
              value={exportDate}
              onChange={(e) => setExportDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="ສາງສິນຄ້າ"
              value={warehouse}
              onChange={(e) => setWarehouse(e.target.value)}
            >
              <MenuItem value="">ເລືອກສາງສິນຄ້າ</MenuItem>
              <MenuItem value="ສາງໃຫຍ່">ສາງໃຫຍ່</MenuItem>
              <MenuItem value="ສາງຍ່ອຍ 1">ສາງຍ່ອຍ 1</MenuItem>
              <MenuItem value="ສາງຍ່ອຍ 2">ສາງຍ່ອຍ 2</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={2}>
        {/* Left column - Product selection */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                ເລືອກສິນຄ້າ
              </Typography>
            </Box>
            
            <TextField
              fullWidth
              placeholder="ຄົ້ນຫາສິນຄ້າ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            <TableContainer sx={{ maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center">ລະຫັດ</TableCell>
                    <TableCell align="center">ຊື່</TableCell>
                    <TableCell align="center">ຈຳນວນຄົງຄັງ</TableCell>
                    <TableCell align="center"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id} hover>
                      <TableCell align="center">{product.code}</TableCell>
                      <TableCell align="center">{product.name}</TableCell>
                      <TableCell align="center">{product.stock}</TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          size="small"
                          color="primary"
                          onClick={() => handleOpenFormDialog(product)}
                          sx={{ fontSize: '0.7rem', py: 0.5 }}
                        >
                          ເລືອກ
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Right column - Export items */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                ລາຍລະອຽດນຳອອກສິນຄ້າ
              </Typography>
            </Box>

            <TableContainer sx={{ maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center">#</TableCell>
                    <TableCell align="center">ເລກທີນຳອອກ</TableCell>
                    <TableCell align="center">ສິນຄ້າ</TableCell>
                    <TableCell align="center">ຈຳນວນ</TableCell>
                    <TableCell align="center">ບ່ອນຈັດວາງ</TableCell>
                    <TableCell align="center">ສາເຫດການນຳອອກ</TableCell>
                    <TableCell align="center"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {exportItems.map((item, index) => (
                    <TableRow 
                      key={item.id} 
                      sx={{ 
                        "&:nth-of-type(odd)": { 
                          bgcolor: 'action.hover' 
                        } 
                      }}
                    >
                      <TableCell align="center">{index + 1}</TableCell>
                      <TableCell align="center">{item.id}</TableCell>
                      <TableCell align="center">{item.name}</TableCell>
                      <TableCell align="center">{item.exportQuantity}</TableCell>
                      <TableCell align="center">{item.exportLocation}</TableCell>
                      <TableCell align="center">{item.exportReason}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveFromExport(item.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  setExportItems([]);
                }}
              >
                ຍົກເລີກ
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<PrintIcon />}
                onClick={handleOpenPrintDialog}
                disabled={exportItems.length === 0}
              >
                ພິມໃບນຳອອກ
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<SaveIcon />}
                onClick={handleSaveExport}
                disabled={exportItems.length === 0}
              >
                ບັນທຶກ
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Layout>
  );
}

export default Export;