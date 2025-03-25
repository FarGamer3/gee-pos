import React, { useState, useRef } from 'react';
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
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select
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

function Employees() {
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState([
    {
      id: 1,
      firstName: 'ທ້າວ ສົມສັກ',
      lastName: 'ພົມມະຈັນ',
      gender: 'ຊາຍ',
      address: 'ນະຄອນຫຼວງວຽງຈັນ',
      phone: '02055555555',
      hireDate: '2023-01-15',
      username: 'somsak',
      password: '********',
      role: 'ພະນັກງານ',
      status: 'ເຮັດວຽກຢູ່',
    }
  ]);

  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  
  // Current employee for editing
  // ໃຊ້ useRef ເພື່ອເກັບຄ່າຊົ່ວຄາວແລະປ້ອງກັນການ re-render ແຕ່ລະຄັ້ງທີ່ພິມ
  const employeeFormRef = React.useRef(null);
  
  const [currentEmployee, setCurrentEmployee] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    address: '',
    phone: '',
    hireDate: '',
    username: '',
    password: '',
    role: '',
    status: '',
  });

  // ຟັງຊັນເປີດ dialog ເພີ່ມພະນັກງານໃໝ່
  const handleOpenAddDialog = () => {
    const emptyEmployee = {
      firstName: '',
      lastName: '',
      gender: '',
      address: '',
      phone: '',
      hireDate: new Date().toISOString().split('T')[0],
      username: '',
      password: '',
      role: '',
      status: '',
    };
    
    setCurrentEmployee(emptyEmployee);
    employeeFormRef.current = emptyEmployee; // ຕັ້ງຄ່າເລີ່ມຕົ້ນໃນ ref
    setOpenAddDialog(true);
  };

  // ຟັງຊັນປິດ dialog ເພີ່ມພະນັກງານ
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    employeeFormRef.current = null; // ລ້າງຂໍ້ມູນໃນ ref ເມື່ອປິດ dialog
  };

  // ຟັງຊັນເປີດ dialog ແກ້ໄຂພະນັກງານ
  const handleOpenEditDialog = (employee) => {
    setCurrentEmployee({ ...employee });
    employeeFormRef.current = { ...employee }; // ກຳນົດຄ່າເລີ່ມຕົ້ນໃນ ref ເປັນຂໍ້ມູນພະນັກງານປັດຈຸບັນ
    setOpenEditDialog(true);
  };

  // ຟັງຊັນປິດ dialog ແກ້ໄຂພະນັກງານ
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    employeeFormRef.current = null; // ລ້າງຂໍ້ມູນໃນ ref ເມື່ອປິດ dialog
  };

  // ຟັງຊັນການປ່ຽນແປງຂໍ້ມູນພະນັກງານແບບປັບປຸງໃໝ່
  const handleChange = (e) => {
    const { name, value } = e.target;
    // ແທນທີ່ຈະໃຊ້ setCurrentEmployee ທຸກຄັ້ງທີ່ພິມ (ເຊິ່ງຈະ re-render)
    // ເຮົາຈະເກັບຄ່າໄວ້ໃນ ref ກ່ອນ
    employeeFormRef.current = {
      ...(employeeFormRef.current || currentEmployee),
      [name]: value
    };
  };

  // ຟັງຊັນບັນທຶກພະນັກງານໃໝ່
  const handleAddEmployee = () => {
    // ໃຊ້ຂໍ້ມູນຈາກ ref ເພື່ອບັນທຶກ
    const formData = employeeFormRef.current || currentEmployee;
    
    const newEmployee = {
      ...formData,
      id: employees.length > 0 ? Math.max(...employees.map(p => p.id)) + 1 : 1
    };
    
    setEmployees([...employees, newEmployee]);
    setOpenAddDialog(false);
    employeeFormRef.current = null; // ລ້າງຂໍ້ມູນໃນ ref
    
    // ໃນກໍລະນີຈິງ, ສົ່ງຂໍ້ມູນໄປຍັງ API ເພື່ອບັນທຶກ
    console.log('Adding new employee:', newEmployee);
  };

  // ຟັງຊັນບັນທຶກການແກ້ໄຂພະນັກງານ
  const handleSaveEdit = () => {
    // ໃຊ້ຂໍ້ມູນຈາກ ref ເພື່ອບັນທຶກ
    const formData = employeeFormRef.current || currentEmployee;
    
    setEmployees(employees.map(p => p.id === currentEmployee.id ? {...formData, id: currentEmployee.id} : p));
    setOpenEditDialog(false);
    employeeFormRef.current = null; // ລ້າງຂໍ້ມູນໃນ ref
    
    // ໃນກໍລະນີຈິງ, ສົ່ງຂໍ້ມູນໄປຍັງ API ເພື່ອອັບເດດ
    console.log('Updating employee:', formData);
  };

  // ຟັງຊັນເປີດ dialog ລຶບພະນັກງານ
  const handleOpenDeleteDialog = (id) => {
    setSelectedEmployeeId(id);
    setOpenDeleteDialog(true);
  };

  // ຟັງຊັນປິດ dialog ລຶບພະນັກງານ
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedEmployeeId(null);
  };

  // ຟັງຊັນລຶບພະນັກງານ
  const handleDeleteEmployee = (id) => {
    setEmployees(employees.filter(employee => employee.id !== id));
    setOpenDeleteDialog(false);
    setSelectedEmployeeId(null);
    // ໃນກໍລະນີຈິງ, ສົ່ງຄຳຂໍລຶບໄປຍັງ API
    console.log('Deleting employee with ID:', id);
  };

  // ຟັງຊັນຄົ້ນຫາ
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // ກັ່ນຕອງພະນັກງານຕາມການຄົ້ນຫາ
  const filteredEmployees = employees.filter(employee => {
    return (
      employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Form dialog component for add and edit operations
  const EmployeeFormDialog = ({ open, onClose, title, employee, onChange, onSave }) => (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {title}
        <IconButton
          aria-label="close"
          onClick={onClose}
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
        <Box component="form">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ຊື່"
                name="firstName"
                defaultValue={employee.firstName}
                onChange={onChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ນາມສະກຸນ"
                name="lastName"
                defaultValue={employee.lastName}
                onChange={onChange}
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
                  defaultValue={employee.gender}
                  onChange={onChange}
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
                name="phone"
                defaultValue={employee.phone}
                onChange={onChange}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ທີ່ຢູ່"
                name="address"
                defaultValue={employee.address}
                onChange={onChange}
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ມື້ເຂົ້າວຽກ"
                name="hireDate"
                type="date"
                defaultValue={employee.hireDate}
                onChange={onChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="role-label">ສະຖານະໃນລະບົບ</InputLabel>
                <Select
                  labelId="role-label"
                  id="role"
                  name="role"
                  defaultValue={employee.role}
                  onChange={onChange}
                  label="ສະຖານະໃນລະບົບ"
                >
                  <MenuItem value="">ເລືອກສະຖານະ</MenuItem>
                  <MenuItem value="ຜູ້ບໍລິຫານ">ຜູ້ບໍລິຫານ</MenuItem>
                  <MenuItem value="ພະນັກງານ">ພະນັກງານ</MenuItem>
                  <MenuItem value="ຜູ້ຈັດການສາງ">ຜູ້ຈັດການສາງ</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ບັນຊີເຂົ້າໃຊ້"
                name="username"
                defaultValue={employee.username}
                onChange={onChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ລະຫັດ"
                name="password"
                type="password"
                defaultValue={employee.password}
                onChange={onChange}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel id="status-label">ສະຖານະການໃຊ້ງານ</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  defaultValue={employee.status}
                  onChange={onChange}
                  label="ສະຖານະການໃຊ້ງານ"
                >
                  <MenuItem value="">ເລືອກສະຖານະ</MenuItem>
                  <MenuItem value="ເຮັດວຽກຢູ່">ເຮັດວຽກຢູ່</MenuItem>
                  <MenuItem value="ພັກວຽກ">ພັກວຽກ</MenuItem>
                  <MenuItem value="ລາອອກ">ລາອອກ</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error" variant="outlined">
          ຍົກເລີກ
        </Button>
        <Button onClick={onSave} color="secondary" variant="contained">
          ບັນທຶກ
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Layout title="ຈັດການຂໍ້ມູນພະນັກງານ">
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
          color="secondary"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
        >
          ເພີ່ມ
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 240px)', overflow: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell align="center" width={50}>#</TableCell>
              <TableCell align="center">ຊື່</TableCell>
              <TableCell align="center">ນາມສະກຸນ</TableCell>
              <TableCell align="center">ເພດ</TableCell>
              <TableCell align="center">ເບີໂທ</TableCell>
              <TableCell align="center">ທີ່ຢູ່</TableCell>
              <TableCell align="center">ມື້ເຂົ້າວຽກ</TableCell>
              <TableCell align="center">ບັນຊີເຂົ້າໃຊ້</TableCell>
              <TableCell align="center">ສະຖານະໃນລະບົບ</TableCell>
              <TableCell align="center">ສະຖານະການໃຊ້ງານ</TableCell>
              <TableCell align="center">ແກ້ໄຂ</TableCell>
              <TableCell align="center">ລຶບ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEmployees.map((employee, index) => (
              <TableRow key={employee.id} hover>
                <TableCell align="center">{index + 1}</TableCell>
                <TableCell align="center">{employee.firstName}</TableCell>
                <TableCell align="center">{employee.lastName}</TableCell>
                <TableCell align="center">{employee.gender}</TableCell>
                <TableCell align="center">{employee.phone}</TableCell>
                <TableCell align="center">{employee.address}</TableCell>
                <TableCell align="center">{employee.hireDate}</TableCell>
                <TableCell align="center">{employee.username}</TableCell>
                <TableCell align="center">{employee.role}</TableCell>
                <TableCell align="center">{employee.status}</TableCell>
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
                      onClick={() => handleOpenDeleteDialog(employee.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog for adding new employee */}
      <EmployeeFormDialog
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        title="ເພີ່ມພະນັກງານໃໝ່"
        employee={currentEmployee}
        onChange={handleChange}
        onSave={handleAddEmployee}
      />

      {/* Dialog for editing employee */}
      <EmployeeFormDialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        title="ແກ້ໄຂຂໍ້ມູນພະນັກງານ"
        employee={currentEmployee}
        onChange={handleChange}
        onSave={handleSaveEdit}
      />

      {/* Dialog for confirming deletion */}
      <DeleteConfirmDialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteEmployee}
        itemId={selectedEmployeeId}
      />
    </Layout>
  );
}

export default Employees;