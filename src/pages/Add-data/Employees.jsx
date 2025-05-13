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
  MenuItem,
  Chip
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

function Employees() {
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Form state
  const [currentEmployee, setCurrentEmployee] = useState({
    emp_name: '',
    emp_lname: '',
    gender: '',
    date_of_b: '',
    tel: '',
    address: '',
    start_date: '',
    username: '',
    password: '',
    status: '',
    active: 1
  });

  // ດຶງຂໍ້ມູນທັງໝົດເມື່ອໜ້າຖືກໂຫຼດ
  useEffect(() => {
    fetchEmployees();
  }, []);

  // ຟັງຊັນດຶງຂໍ້ມູນພະນັກງານທັງໝົດ
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/All/Employee`);
      
      if (response.data && response.data.result_code === "200") {
        setEmployees(response.data.user_info || []);
        setError(null);
      } else {
        throw new Error(response.data?.result || 'Failed to fetch employees');
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
      setError('ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ');
    } finally {
      setLoading(false);
    }
  };

  // Open add dialog
  const handleOpenAddDialog = () => {
    const today = new Date().toISOString().split('T')[0];
    
    setCurrentEmployee({
      emp_name: '',
      emp_lname: '',
      gender: '',
      date_of_b: '',
      tel: '',
      address: '',
      start_date: today,
      username: '',
      password: '',
      status: '',
      active: 1
    });
    
    setOpenAddDialog(true);
  };

  // Close add dialog
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  // Open edit dialog
  const handleOpenEditDialog = (employee) => {
    // Create a copy of employee data without the password
    const employeeForEdit = {
      ...employee,
      password: '', // Clear password field for security
      
      // Format dates for the form
      date_of_b: formatDateForInput(employee.date_of_b),
      start_date: formatDateForInput(employee.start_date)
    };
    
    setCurrentEmployee(employeeForEdit);
    setOpenEditDialog(true);
  };

  // Close edit dialog
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentEmployee(prev => ({
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

  // Add new employee
  const handleAddEmployee = async () => {
    // Validate required fields
    if (!currentEmployee.emp_name || !currentEmployee.emp_lname || !currentEmployee.gender ||
        !currentEmployee.date_of_b || !currentEmployee.tel || !currentEmployee.address ||
        !currentEmployee.start_date || !currentEmployee.username || !currentEmployee.password ||
        !currentEmployee.status) {
      showSnackbar('ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/Insert/Emp`, currentEmployee);
      
      if (response.data && (response.data.result_code === "200" || response.data.result_code === "201")) {
        await fetchEmployees(); // ດຶງຂໍ້ມູນໃໝ່
        setOpenAddDialog(false);
        showSnackbar('ເພີ່ມພະນັກງານສຳເລັດແລ້ວ');
      } else {
        throw new Error(response.data?.result || 'Failed to add employee');
      }
    } catch (err) {
      console.error("Error adding employee:", err);
      showSnackbar(err.response?.data?.result || 'ເກີດຂໍ້ຜິດພາດໃນການເພີ່ມຂໍ້ມູນ', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Save edited employee
  const handleSaveEdit = async () => {
    // Validate required fields (except password which may be empty for edits)
    if (!currentEmployee.emp_name || !currentEmployee.emp_lname || !currentEmployee.gender ||
        !currentEmployee.date_of_b || !currentEmployee.tel || !currentEmployee.address ||
        !currentEmployee.start_date || !currentEmployee.username || !currentEmployee.status) {
      showSnackbar('ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ', 'error');
      return;
    }

    setLoading(true);
    try {
      // If password is empty, don't send it in the update request
      const dataToSend = {...currentEmployee};
      if (!dataToSend.password) {
        delete dataToSend.password;
      }
      
      const response = await axios.put(`${API_URL}/Update/Emp`, dataToSend);
      
      if (response.data && response.data.result_code === "200") {
        await fetchEmployees(); // ດຶງຂໍ້ມູນໃໝ່
        setOpenEditDialog(false);
        showSnackbar('ແກ້ໄຂຂໍ້ມູນພະນັກງານສຳເລັດແລ້ວ');
      } else {
        throw new Error(response.data?.result || 'Failed to update employee');
      }
    } catch (err) {
      console.error("Error updating employee:", err);
      showSnackbar(err.response?.data?.result || 'ເກີດຂໍ້ຜິດພາດໃນການແກ້ໄຂຂໍ້ມູນ', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Open delete confirmation
  const handleOpenDeleteDialog = (id) => {
    setSelectedEmployeeId(id);
    setOpenDeleteDialog(true);
  };

  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedEmployeeId(null);
  };

  // Delete employee
  const handleDeleteEmployee = async (id) => {
    setLoading(true);
    try {
      const response = await axios.delete(`${API_URL}/Delete/Emp`, {
        data: { emp_id: id }
      });
      
      if (response.data && response.data.result_code === "200") {
        await fetchEmployees(); // ດຶງຂໍ້ມູນໃໝ່
        setOpenDeleteDialog(false);
        showSnackbar('ລຶບຂໍ້ມູນພະນັກງານສຳເລັດແລ້ວ');
      } else {
        throw new Error(response.data?.result || 'Failed to delete employee');
      }
    } catch (err) {
      console.error("Error deleting employee:", err);
      showSnackbar(err.response?.data?.result || 'ເກີດຂໍ້ຜິດພາດໃນການລຶບຂໍ້ມູນ', 'error');
    } finally {
      setLoading(false);
      setSelectedEmployeeId(null);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Format date for display (DD/MM/YYYY)
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // Try parsing different date formats
        if (dateString.includes('/')) {
          // If already in DD/MM/YYYY format
          return dateString;
        }
        return '-';
      }
      
      // Format to DD/MM/YYYY
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error("Date formatting error:", error);
      return dateString;
    }
  };

  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    
    try {
      let date;
      
      // Handle DD/MM/YYYY format
      if (dateString.includes('/')) {
        const parts = dateString.split('/');
        if (parts.length === 3) {
          // Convert from DD/MM/YYYY to YYYY-MM-DD
          date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        } else {
          date = new Date(dateString);
        }
      } else {
        date = new Date(dateString);
      }
      
      if (isNaN(date.getTime())) {
        return '';
      }
      
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    } catch (error) {
      console.error("Date input formatting error:", error);
      return '';
    }
  };

  // Filter employees based on search
  const filteredEmployees = employees.filter(employee => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      (employee.emp_name && employee.emp_name.toLowerCase().includes(searchTermLower)) ||
      (employee.emp_lname && employee.emp_lname.toLowerCase().includes(searchTermLower)) ||
      (employee.username && employee.username.toLowerCase().includes(searchTermLower)) ||
      (employee.tel && employee.tel.includes(searchTerm))
    );
  });

  return (
    <Layout title="ຈັດການຂໍ້ມູນພະນັກງານ">
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
                <TableCell align="center">ວັນເດືອນປີເກີດ</TableCell>
                <TableCell align="center">ເບີໂທ</TableCell>
                <TableCell align="center">ວັນທີ່ເລີ່ມເຮັດວຽກ</TableCell>
                <TableCell align="center">ສະຖານະ</TableCell>
                <TableCell align="center">ການໃຊ້ງານ</TableCell>
                <TableCell align="center" width={120}>ແກ້ໄຂ</TableCell>
                <TableCell align="center" width={120}>ລຶບ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee, index) => (
                  <TableRow key={employee.emp_id} hover>
                    <TableCell align="center">{index + 1}</TableCell>
                    <TableCell>{employee.emp_name}</TableCell>
                    <TableCell>{employee.emp_lname}</TableCell>
                    <TableCell align="center">{employee.gender}</TableCell>
                    <TableCell align="center">{formatDateForDisplay(employee.date_of_b)}</TableCell>
                    <TableCell align="center">{employee.tel}</TableCell>
                    <TableCell align="center">{formatDateForDisplay(employee.start_date)}</TableCell>
                    <TableCell align="center">{employee.status}</TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={employee.active === 1 ? 'ເປີດໃຊ້ງານ' : 'ປິດໃຊ້ງານ'}
                        color={employee.active === 1 ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="ແກ້ໄຂ">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleOpenEditDialog(employee)}
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
                          onClick={() => handleOpenDeleteDialog(employee.emp_id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={11} align="center">
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

      {/* Add/Edit Employee Form Dialog */}
      <Dialog 
        open={openAddDialog || openEditDialog} 
        onClose={openAddDialog ? handleCloseAddDialog : handleCloseEditDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {openAddDialog ? 'ເພີ່ມພະນັກງານໃໝ່' : 'ແກ້ໄຂຂໍ້ມູນພະນັກງານ'}
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
                  name="emp_name"
                  value={currentEmployee.emp_name || ''}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ນາມສະກຸນ"
                  name="emp_lname"
                  value={currentEmployee.emp_lname || ''}
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
                    value={currentEmployee.gender || ''}
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
                  label="ວັນເດືອນປີເກີດ"
                  name="date_of_b"
                  type="date"
                  value={currentEmployee.date_of_b || ''}
                  onChange={handleChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ເບີໂທ"
                  name="tel"
                  value={currentEmployee.tel || ''}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ວັນທີ່ເລີ່ມເຮັດວຽກ"
                  name="start_date"
                  type="date"
                  value={currentEmployee.start_date || ''}
                  onChange={handleChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="ທີ່ຢູ່"
                  name="address"
                  value={currentEmployee.address || ''}
                  onChange={handleChange}
                  required
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ຊື່ຜູ້ໃຊ້"
                  name="username"
                  value={currentEmployee.username || ''}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ລະຫັດຜ່ານ"
                  name="password"
                  type="password"
                  value={currentEmployee.password || ''}
                  onChange={handleChange}
                  required={openAddDialog} // Required only for new employees
                  helperText={openEditDialog ? "ປ່ອຍວ່າງເພື່ອບໍ່ປ່ຽນລະຫັດຜ່ານ" : ""}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel id="status-label">ສະຖານະ</InputLabel>
                  <Select
                    labelId="status-label"
                    id="status"
                    name="status"
                    value={currentEmployee.status || ''}
                    onChange={handleChange}
                    label="ສະຖານະ"
                  >
                    <MenuItem value="">ເລືອກສະຖານະ</MenuItem>
                    <MenuItem value="Admin">ຜູ້ບໍລິຫານ</MenuItem>
                    <MenuItem value="User1">ພະນັກງານຂາຍ</MenuItem>
                    <MenuItem value="User2">ພະນັກງານສາງ</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel id="active-label">ການໃຊ້ງານ</InputLabel>
                  <Select
                    labelId="active-label"
                    id="active"
                    name="active"
                    value={currentEmployee.active === undefined ? 1 : currentEmployee.active}
                    onChange={handleChange}
                    label="ການໃຊ້ງານ"
                  >
                    <MenuItem value={1}>ເປີດໃຊ້ງານ</MenuItem>
                    <MenuItem value={0}>ປິດໃຊ້ງານ</MenuItem>
                  </Select>
                </FormControl>
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
            onClick={openAddDialog ? handleAddEmployee : handleSaveEdit} 
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
        onConfirm={handleDeleteEmployee}
        itemId={selectedEmployeeId}
        loading={loading}
      />
    </Layout>
  );
}

export default Employees;