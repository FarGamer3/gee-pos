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
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
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

function Customers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Form state
  const [currentCustomer, setCurrentCustomer] = useState({
    cus_name: '',
    cus_lname: '',
    gender: '',
    address: '',
    tel: ''
  });

  // ດຶງຂໍ້ມູນທັງໝົດເມື່ອໜ້າຖືກໂຫຼດ
  useEffect(() => {
    fetchCustomers();
  }, []);

  // ຟັງຊັນດຶງຂໍ້ມູນລູກຄ້າທັງໝົດ
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/All/Customer`);
      
      if (response.data && response.data.result_code === "200") {
        setCustomers(response.data.user_info || []);
        setError(null);
      } else {
        throw new Error(response.data?.result || 'Failed to fetch customers');
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError('ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ');
    } finally {
      setLoading(false);
    }
  };

  // Open add dialog
  const handleOpenAddDialog = () => {
    setCurrentCustomer({
      cus_name: '',
      cus_lname: '',
      gender: '',
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
  const handleOpenEditDialog = (customer) => {
    setCurrentCustomer({ ...customer });
    setOpenEditDialog(true);
  };

  // Close edit dialog
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentCustomer(prev => ({
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

  // Add new customer
  const handleAddCustomer = async () => {
    // Validate required fields
    if (!currentCustomer.cus_name || !currentCustomer.cus_lname || 
        !currentCustomer.gender || !currentCustomer.tel) {
      showSnackbar('ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/Insert/Customer`, currentCustomer);
      
      if (response.data && (response.data.result_code === "200" || response.data.result_code === "201")) {
        await fetchCustomers(); // ດຶງຂໍ້ມູນໃໝ່
        setOpenAddDialog(false);
        showSnackbar('ເພີ່ມລູກຄ້າສຳເລັດແລ້ວ');
      } else {
        throw new Error(response.data?.result || 'Failed to add customer');
      }
    } catch (err) {
      console.error("Error adding customer:", err);
      showSnackbar(err.response?.data?.result || 'ເກີດຂໍ້ຜິດພາດໃນການເພີ່ມຂໍ້ມູນ', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Save edited customer
  const handleSaveEdit = async () => {
    // Validate required fields
    if (!currentCustomer.cus_name || !currentCustomer.cus_lname || 
        !currentCustomer.gender || !currentCustomer.tel) {
      showSnackbar('ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(`${API_URL}/Update/Customer`, currentCustomer);
      
      if (response.data && response.data.result_code === "200") {
        await fetchCustomers(); // ດຶງຂໍ້ມູນໃໝ່
        setOpenEditDialog(false);
        showSnackbar('ແກ້ໄຂຂໍ້ມູນລູກຄ້າສຳເລັດແລ້ວ');
      } else {
        throw new Error(response.data?.result || 'Failed to update customer');
      }
    } catch (err) {
      console.error("Error updating customer:", err);
      showSnackbar(err.response?.data?.result || 'ເກີດຂໍ້ຜິດພາດໃນການແກ້ໄຂຂໍ້ມູນ', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Open delete confirmation
  const handleOpenDeleteDialog = (id) => {
    setSelectedCustomerId(id);
    setOpenDeleteDialog(true);
  };

  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedCustomerId(null);
  };

  // Delete customer
  const handleDeleteCustomer = async (id) => {
    setLoading(true);
    try {
      const response = await axios.delete(`${API_URL}/Delete/Customer`, {
        data: { cus_id: id }
      });
      
      if (response.data && response.data.result_code === "200") {
        await fetchCustomers(); // ດຶງຂໍ້ມູນໃໝ່
        setOpenDeleteDialog(false);
        showSnackbar('ລຶບຂໍ້ມູນລູກຄ້າສຳເລັດແລ້ວ');
      } else {
        throw new Error(response.data?.result || 'Failed to delete customer');
      }
    } catch (err) {
      console.error("Error deleting customer:", err);
      showSnackbar(err.response?.data?.result || 'ເກີດຂໍ້ຜິດພາດໃນການລຶບຂໍ້ມູນ', 'error');
    } finally {
      setLoading(false);
      setSelectedCustomerId(null);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter customers based on search
  const filteredCustomers = customers.filter(customer => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      (customer.cus_name && customer.cus_name.toLowerCase().includes(searchTermLower)) ||
      (customer.cus_lname && customer.cus_lname.toLowerCase().includes(searchTermLower)) ||
      (customer.address && customer.address.toLowerCase().includes(searchTermLower)) ||
      (customer.tel && customer.tel.includes(searchTerm))
    );
  });

  return (
    <Layout title="ຈັດການຂໍ້ມູນລູກຄ້າ">
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
                <TableCell>ຊື່</TableCell>
                <TableCell>ນາມສະກຸນ</TableCell>
                <TableCell align="center">ເພດ</TableCell>
                <TableCell>ເບີໂທ</TableCell>
                <TableCell>ທີ່ຢູ່</TableCell>
                <TableCell align="center" width={120}>ແກ້ໄຂ</TableCell>
                <TableCell align="center" width={120}>ລຶບ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer, index) => (
                  <TableRow key={customer.cus_id} hover>
                    <TableCell align="center">{index + 1}</TableCell>
                    <TableCell>{customer.cus_name}</TableCell>
                    <TableCell>{customer.cus_lname}</TableCell>
                    <TableCell align="center">{customer.gender}</TableCell>
                    <TableCell>{customer.tel}</TableCell>
                    <TableCell>{customer.address || '-'}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="ແກ້ໄຂ">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleOpenEditDialog(customer)}
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
                          onClick={() => handleOpenDeleteDialog(customer.cus_id)}
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

      {/* Add/Edit Customer Form Dialog */}
      <Dialog 
        open={openAddDialog || openEditDialog} 
        onClose={openAddDialog ? handleCloseAddDialog : handleCloseEditDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {openAddDialog ? 'ເພີ່ມລູກຄ້າໃໝ່' : 'ແກ້ໄຂຂໍ້ມູນລູກຄ້າ'}
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
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ຊື່"
                  name="cus_name"
                  value={currentCustomer.cus_name || ''}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ນາມສະກຸນ"
                  name="cus_lname"
                  value={currentCustomer.cus_lname || ''}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel id="gender-label">ເພດ</InputLabel>
                  <Select
                    labelId="gender-label"
                    id="gender"
                    name="gender"
                    value={currentCustomer.gender || ''}
                    onChange={handleChange}
                    label="ເພດ"
                  >
                    <MenuItem value="">ເລືອກເພດ</MenuItem>
                    <MenuItem value="ຊາຍ">ຊາຍ</MenuItem>
                    <MenuItem value="ຍິງ">ຍິງ</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ເບີໂທ"
                  name="tel"
                  value={currentCustomer.tel || ''}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="ທີ່ຢູ່"
                  name="address"
                  value={currentCustomer.address || ''}
                  onChange={handleChange}
                  multiline
                  rows={2}
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
            onClick={openAddDialog ? handleAddCustomer : handleSaveEdit} 
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
        onConfirm={handleDeleteCustomer}
        itemId={selectedCustomerId}
        loading={loading}
      />
    </Layout>
  );
}

export default Customers;