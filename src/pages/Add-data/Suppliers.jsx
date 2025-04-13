import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  InputAdornment,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import { DeleteConfirmDialog } from '../../components/ConfirmationDialog';
import axios from 'axios';

// API base URL
const API_URL = 'http://localhost:4422/users';

function Suppliers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Form state
  const [currentSupplier, setCurrentSupplier] = useState({
    sup_name: '',
    contract_name: '',
    email: '',
    address: '',
    tel: ''
  });

  // ດຶງຂໍ້ມູນທັງໝົດເມື່ອໜ້າຖືກໂຫຼດ
  useEffect(() => {
    fetchSuppliers();
  }, []);

  // ຟັງຊັນດຶງຂໍ້ມູນຜູ້ສະໜອງທັງໝົດ
  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/All/Supplier`);
      
      if (response.data && response.data.result_code === "200") {
        setSuppliers(response.data.user_info || []);
        setError(null);
      } else {
        throw new Error(response.data?.result || 'Failed to fetch suppliers');
      }
    } catch (err) {
      console.error("Error fetching suppliers:", err);
      setError('ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ');
    } finally {
      setLoading(false);
    }
  };

  // Open add dialog
  const handleOpenAddDialog = () => {
    setCurrentSupplier({
      sup_name: '',
      contract_name: '',
      email: '',
      address: '',
      tel: ''
    });
    
    setOpenAddDialog(true);
  };

  // Close add dialog
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  // Open edit dialog
  const handleOpenEditDialog = (supplier) => {
    setCurrentSupplier({ ...supplier });
    setOpenEditDialog(true);
  };

  // Close edit dialog
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentSupplier(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Show snackbar notification
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Add new supplier
  const handleAddSupplier = async () => {
    // Validate required fields
    if (!currentSupplier.sup_name || !currentSupplier.contract_name || 
        !currentSupplier.email || !currentSupplier.tel) {
      showSnackbar('ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/Insert/Supplier`, currentSupplier);
      
      if (response.data && (response.data.result_code === "200" || response.data.result_code === "201")) {
        await fetchSuppliers(); // ດຶງຂໍ້ມູນໃໝ່
        setOpenAddDialog(false);
        showSnackbar('ເພີ່ມຜູ້ສະໜອງສຳເລັດແລ້ວ');
      } else {
        throw new Error(response.data?.result || 'Failed to add supplier');
      }
    } catch (err) {
      console.error("Error adding supplier:", err);
      showSnackbar(err.response?.data?.result || 'ເກີດຂໍ້ຜິດພາດໃນການເພີ່ມຂໍ້ມູນ', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Save edited supplier
  const handleSaveEdit = async () => {
    // Validate required fields
    if (!currentSupplier.sup_name || !currentSupplier.contract_name || 
        !currentSupplier.email || !currentSupplier.tel) {
      showSnackbar('ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(`${API_URL}/Update/Supplier`, currentSupplier);
      
      if (response.data && response.data.result_code === "200") {
        await fetchSuppliers(); // ດຶງຂໍ້ມູນໃໝ່
        setOpenEditDialog(false);
        showSnackbar('ແກ້ໄຂຂໍ້ມູນຜູ້ສະໜອງສຳເລັດແລ້ວ');
      } else {
        throw new Error(response.data?.result || 'Failed to update supplier');
      }
    } catch (err) {
      console.error("Error updating supplier:", err);
      showSnackbar(err.response?.data?.result || 'ເກີດຂໍ້ຜິດພາດໃນການແກ້ໄຂຂໍ້ມູນ', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Open delete confirmation
  const handleOpenDeleteDialog = (id) => {
    setSelectedSupplierId(id);
    setOpenDeleteDialog(true);
  };

  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedSupplierId(null);
  };

  // Delete supplier
  const handleDeleteSupplier = async (id) => {
    setLoading(true);
    try {
      const response = await axios.delete(`${API_URL}/Delete/Supplier`, {
        data: { sup_id: id }
      });
      
      if (response.data && response.data.result_code === "200") {
        await fetchSuppliers(); // ດຶງຂໍ້ມູນໃໝ່
        setOpenDeleteDialog(false);
        showSnackbar('ລຶບຂໍ້ມູນຜູ້ສະໜອງສຳເລັດແລ້ວ');
      } else {
        throw new Error(response.data?.result || 'Failed to delete supplier');
      }
    } catch (err) {
      console.error("Error deleting supplier:", err);
      showSnackbar(err.response?.data?.result || 'ເກີດຂໍ້ຜິດພາດໃນການລຶບຂໍ້ມູນ', 'error');
    } finally {
      setLoading(false);
      setSelectedSupplierId(null);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter suppliers based on search
  const filteredSuppliers = suppliers.filter(supplier => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      (supplier.sup_name && supplier.sup_name.toLowerCase().includes(searchTermLower)) ||
      (supplier.contract_name && supplier.contract_name.toLowerCase().includes(searchTermLower)) ||
      (supplier.email && supplier.email.toLowerCase().includes(searchTermLower)) ||
      (supplier.tel && supplier.tel.includes(searchTerm))
    );
  });

  return (
    <Layout title="ຈັດການຂໍ້ມູນຜູ້ສະໜອງສິນຄ້າ">
      {/* Snackbar notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
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

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <TextField
          placeholder="ຄົ້ນຫາ..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          sx={{ width: { xs: '60%', sm: '50%', md: '40%' } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
        >
          ເພີ່ມ
        </Button>
      </Box>

      {loading && !openAddDialog && !openEditDialog && !openDeleteDialog ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 240px)', overflow: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell align="center" width={50}>#</TableCell>
                <TableCell>ຊື່ບໍລິສັດ/ຫ້າງຮ້ານ</TableCell>
                <TableCell>ຊື່ຜູ້ຕິດຕໍ່</TableCell>
                <TableCell>ທີ່ຢູ່</TableCell>
                <TableCell>ອີເມວ</TableCell>
                <TableCell>ເບີໂທ</TableCell>
                <TableCell align="center" width={120}>ແກ້ໄຂ</TableCell>
                <TableCell align="center" width={120}>ລຶບ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSuppliers.length > 0 ? (
                filteredSuppliers.map((supplier, index) => (
                  <TableRow key={supplier.sup_id} hover>
                    <TableCell align="center">{index + 1}</TableCell>
                    <TableCell>{supplier.sup_name}</TableCell>
                    <TableCell>{supplier.contract_name}</TableCell>
                    <TableCell>{supplier.address}</TableCell>
                    <TableCell>{supplier.email}</TableCell>
                    <TableCell>{supplier.tel}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="ແກ້ໄຂ">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleOpenEditDialog(supplier)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="ລຶບ">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleOpenDeleteDialog(supplier.sup_id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body1" sx={{ py: 2, color: 'text.secondary' }}>
                      {error ? error : 'ບໍ່ພົບຂໍ້ມູນ'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Supplier Form Dialog */}
      <Dialog 
        open={openAddDialog || openEditDialog} 
        onClose={openAddDialog ? handleCloseAddDialog : handleCloseEditDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {openAddDialog ? 'ເພີ່ມຜູ້ສະໜອງໃໝ່' : 'ແກ້ໄຂຂໍ້ມູນຜູ້ສະໜອງ'}
          <IconButton
            aria-label="close"
            onClick={openAddDialog ? handleCloseAddDialog : handleCloseEditDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="ຊື່ບໍລິສັດ/ຫ້າງຮ້ານ"
                  name="sup_name"
                  value={currentSupplier.sup_name || ''}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="ຊື່ຜູ້ຕິດຕໍ່"
                  name="contract_name"
                  value={currentSupplier.contract_name || ''}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="ທີ່ຢູ່"
                  name="address"
                  value={currentSupplier.address || ''}
                  onChange={handleChange}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ອີເມວ"
                  name="email"
                  type="email"
                  value={currentSupplier.email || ''}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ເບີໂທ"
                  name="tel"
                  value={currentSupplier.tel || ''}
                  onChange={handleChange}
                  required
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={openAddDialog ? handleCloseAddDialog : handleCloseEditDialog} 
            color="error" 
            variant="outlined"
          >
            ຍົກເລີກ
          </Button>
          <Button 
            onClick={openAddDialog ? handleAddSupplier : handleSaveEdit} 
            color="primary" 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'ບັນທຶກ'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteSupplier}
        itemId={selectedSupplierId}
        loading={loading}
      />
    </Layout>
  );
}

export default Suppliers;