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

function Customers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState([
    {
      id: 1,
      firstName: 'ທ້າວ ສຸລິຍາ',
      lastName: 'ສຸພັນທອງ',
      gender: 'ຊາຍ',
      address: 'ບ້ານ ຫາຍໂສກ, ເມືອງ ຈັນທະບູລີ, ນະຄອນຫຼວງວຽງຈັນ',
      phone: '020 9999 8888',
    },
    {
      id: 2,
      firstName: 'ນາງ ສຸພາພອນ',
      lastName: 'ວິໄລສັກ',
      gender: 'ຍິງ',
      address: 'ບ້ານ ສີສະຫວາດ, ເມືອງ ຈັນທະບູລີ, ນະຄອນຫຼວງວຽງຈັນ',
      phone: '030 7777 5555',
    }
  ]);

  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  
  // Current customer for editing
  // ໃຊ້ useRef ເພື່ອເກັບຄ່າຊົ່ວຄາວແລະປ້ອງກັນການ re-render ແຕ່ລະຄັ້ງທີ່ພິມ
  const customerFormRef = React.useRef(null);
  
  const [currentCustomer, setCurrentCustomer] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    address: '',
    phone: '',
  });

  // ຟັງຊັນເປີດ dialog ເພີ່ມລູກຄ້າໃໝ່
  const handleOpenAddDialog = () => {
    const emptyCustomer = {
      firstName: '',
      lastName: '',
      gender: '',
      address: '',
      phone: '',
    };
    
    setCurrentCustomer(emptyCustomer);
    customerFormRef.current = emptyCustomer; // ຕັ້ງຄ່າເລີ່ມຕົ້ນໃນ ref
    setOpenAddDialog(true);
  };

  // ຟັງຊັນປິດ dialog ເພີ່ມລູກຄ້າ
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    customerFormRef.current = null; // ລ້າງຂໍ້ມູນໃນ ref ເມື່ອປິດ dialog
  };

  // ຟັງຊັນເປີດ dialog ແກ້ໄຂລູກຄ້າ
  const handleOpenEditDialog = (customer) => {
    setCurrentCustomer({ ...customer });
    customerFormRef.current = { ...customer }; // ກຳນົດຄ່າເລີ່ມຕົ້ນໃນ ref ເປັນຂໍ້ມູນລູກຄ້າປັດຈຸບັນ
    setOpenEditDialog(true);
  };

  // ຟັງຊັນປິດ dialog ແກ້ໄຂລູກຄ້າ
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    customerFormRef.current = null; // ລ້າງຂໍ້ມູນໃນ ref ເມື່ອປິດ dialog
  };

  // ຟັງຊັນການປ່ຽນແປງຂໍ້ມູນລູກຄ້າແບບປັບປຸງໃໝ່
  const handleChange = (e) => {
    const { name, value } = e.target;
    // ແທນທີ່ຈະໃຊ້ setCurrentCustomer ທຸກຄັ້ງທີ່ພິມ (ເຊິ່ງຈະ re-render)
    // ເຮົາຈະເກັບຄ່າໄວ້ໃນ ref ກ່ອນ
    customerFormRef.current = {
      ...(customerFormRef.current || currentCustomer),
      [name]: value
    };
  };

  // ຟັງຊັນບັນທຶກລູກຄ້າໃໝ່
  const handleAddCustomer = () => {
    // ໃຊ້ຂໍ້ມູນຈາກ ref ເພື່ອບັນທຶກ
    const formData = customerFormRef.current || currentCustomer;
    
    const newCustomer = {
      ...formData,
      id: customers.length > 0 ? Math.max(...customers.map(p => p.id)) + 1 : 1
    };
    
    setCustomers([...customers, newCustomer]);
    setOpenAddDialog(false);
    customerFormRef.current = null; // ລ້າງຂໍ້ມູນໃນ ref
    
    // ໃນກໍລະນີຈິງ, ສົ່ງຂໍ້ມູນໄປຍັງ API ເພື່ອບັນທຶກ
    console.log('Adding new customer:', newCustomer);
  };

  // ຟັງຊັນບັນທຶກການແກ້ໄຂລູກຄ້າ
  const handleSaveEdit = () => {
    // ໃຊ້ຂໍ້ມູນຈາກ ref ເພື່ອບັນທຶກ
    const formData = customerFormRef.current || currentCustomer;
    
    setCustomers(customers.map(p => p.id === currentCustomer.id ? {...formData, id: currentCustomer.id} : p));
    setOpenEditDialog(false);
    customerFormRef.current = null; // ລ້າງຂໍ້ມູນໃນ ref
    
    // ໃນກໍລະນີຈິງ, ສົ່ງຂໍ້ມູນໄປຍັງ API ເພື່ອອັບເດດ
    console.log('Updating customer:', formData);
  };

  // ຟັງຊັນເປີດ dialog ລຶບລູກຄ້າ
  const handleOpenDeleteDialog = (id) => {
    setSelectedCustomerId(id);
    setOpenDeleteDialog(true);
  };

  // ຟັງຊັນປິດ dialog ລຶບລູກຄ້າ
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedCustomerId(null);
  };

  // ຟັງຊັນລຶບລູກຄ້າ
  const handleDeleteCustomer = (id) => {
    setCustomers(customers.filter(customer => customer.id !== id));
    setOpenDeleteDialog(false);
    setSelectedCustomerId(null);
    // ໃນກໍລະນີຈິງ, ສົ່ງຄຳຂໍລຶບໄປຍັງ API
    console.log('Deleting customer with ID:', id);
  };

  // ຟັງຊັນຄົ້ນຫາ
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // ກັ່ນຕອງລູກຄ້າຕາມການຄົ້ນຫາ
  const filteredCustomers = customers.filter(customer => {
    return (
      customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Form dialog component for add and edit operations
  const CustomerFormDialog = ({ open, onClose, title, customer, onChange, onSave }) => (
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
                defaultValue={customer.firstName}
                onChange={onChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ນາມສະກຸນ"
                name="lastName"
                defaultValue={customer.lastName}
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
                  defaultValue={customer.gender}
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
                defaultValue={customer.phone}
                onChange={onChange}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ທີ່ຢູ່"
                name="address"
                defaultValue={customer.address}
                onChange={onChange}
                multiline
                rows={2}
                required
              />
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
    <Layout title="ຈັດການຂໍ້ມູນລູກຄ້າ">
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
              <TableCell align="center">ແກ້ໄຂ</TableCell>
              <TableCell align="center">ລຶບ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCustomers.map((customer, index) => (
              <TableRow key={customer.id} hover>
                <TableCell align="center">{index + 1}</TableCell>
                <TableCell align="center">{customer.firstName}</TableCell>
                <TableCell align="center">{customer.lastName}</TableCell>
                <TableCell align="center">{customer.gender}</TableCell>
                <TableCell align="center">{customer.phone}</TableCell>
                <TableCell align="center">{customer.address}</TableCell>
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
                      onClick={() => handleOpenDeleteDialog(customer.id)}
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

      {/* Dialog for adding new customer */}
      <CustomerFormDialog
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        title="ເພີ່ມລູກຄ້າໃໝ່"
        customer={currentCustomer}
        onChange={handleChange}
        onSave={handleAddCustomer}
      />

      {/* Dialog for editing customer */}
      <CustomerFormDialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        title="ແກ້ໄຂຂໍ້ມູນລູກຄ້າ"
        customer={currentCustomer}
        onChange={handleChange}
        onSave={handleSaveEdit}
      />

      {/* Dialog for confirming deletion */}
      <DeleteConfirmDialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteCustomer}
        itemId={selectedCustomerId}
      />
    </Layout>
  );
}

export default Customers;