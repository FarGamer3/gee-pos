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

function Suppliers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [suppliers, setSuppliers] = useState([
    {
      id: 1,
      name: 'ບໍລິສັດ ຈຳກັດ ຣັດສະໝີເທັກໂນໂລຢີ',
      contactPerson: 'ທ້າວ ສົມສະຫວັດ',
      email: 'contact@ratsamy.com',
      phone: '020 7777 8888',
      address: 'ບ້ານ ໂນນສະຫວ່າງ, ເມືອງ ໄຊເສດຖາ, ນະຄອນຫຼວງວຽງຈັນ',
    },
    {
      id: 2,
      name: 'ບໍລິສັດ ທ້າວກ້າ ຈຳກັດ',
      contactPerson: 'ທ້າວກ້າ',
      email: 'thaoka@example.com',
      phone: '030 1234 5678',
      address: 'ບ້ານ ຫາຍໂສກ, ເມືອງ ຈັນທະບູລີ, ນະຄອນຫຼວງວຽງຈັນ',
    }
  ]);

  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  
  // Current supplier for editing
  // ໃຊ້ useRef ເພື່ອເກັບຄ່າຊົ່ວຄາວແລະປ້ອງກັນການ re-render ແຕ່ລະຄັ້ງທີ່ພິມ
  const supplierFormRef = React.useRef(null);
  
  const [currentSupplier, setCurrentSupplier] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
  });

  // ຟັງຊັນເປີດ dialog ເພີ່ມຜູ້ສະໜອງໃໝ່
  const handleOpenAddDialog = () => {
    const emptySupplier = {
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
    };
    
    setCurrentSupplier(emptySupplier);
    supplierFormRef.current = emptySupplier; // ຕັ້ງຄ່າເລີ່ມຕົ້ນໃນ ref
    setOpenAddDialog(true);
  };

  // ຟັງຊັນປິດ dialog ເພີ່ມຜູ້ສະໜອງ
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    supplierFormRef.current = null; // ລ້າງຂໍ້ມູນໃນ ref ເມື່ອປິດ dialog
  };

  // ຟັງຊັນເປີດ dialog ແກ້ໄຂຜູ້ສະໜອງ
  const handleOpenEditDialog = (supplier) => {
    setCurrentSupplier({ ...supplier });
    supplierFormRef.current = { ...supplier }; // ກຳນົດຄ່າເລີ່ມຕົ້ນໃນ ref ເປັນຂໍ້ມູນຜູ້ສະໜອງປັດຈຸບັນ
    setOpenEditDialog(true);
  };

  // ຟັງຊັນປິດ dialog ແກ້ໄຂຜູ້ສະໜອງ
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    supplierFormRef.current = null; // ລ້າງຂໍ້ມູນໃນ ref ເມື່ອປິດ dialog
  };

  // ຟັງຊັນການປ່ຽນແປງຂໍ້ມູນຜູ້ສະໜອງແບບປັບປຸງໃໝ່
  const handleChange = (e) => {
    const { name, value } = e.target;
    // ແທນທີ່ຈະໃຊ້ setCurrentSupplier ທຸກຄັ້ງທີ່ພິມ (ເຊິ່ງຈະ re-render)
    // ເຮົາຈະເກັບຄ່າໄວ້ໃນ ref ກ່ອນ
    supplierFormRef.current = {
      ...(supplierFormRef.current || currentSupplier),
      [name]: value
    };
  };

  // ຟັງຊັນບັນທຶກຜູ້ສະໜອງໃໝ່
  const handleAddSupplier = () => {
    // ໃຊ້ຂໍ້ມູນຈາກ ref ເພື່ອບັນທຶກ
    const formData = supplierFormRef.current || currentSupplier;
    
    const newSupplier = {
      ...formData,
      id: suppliers.length > 0 ? Math.max(...suppliers.map(p => p.id)) + 1 : 1
    };
    
    setSuppliers([...suppliers, newSupplier]);
    setOpenAddDialog(false);
    supplierFormRef.current = null; // ລ້າງຂໍ້ມູນໃນ ref
    
    // ໃນກໍລະນີຈິງ, ສົ່ງຂໍ້ມູນໄປຍັງ API ເພື່ອບັນທຶກ
    console.log('Adding new supplier:', newSupplier);
  };

  // ຟັງຊັນບັນທຶກການແກ້ໄຂຜູ້ສະໜອງ
  const handleSaveEdit = () => {
    // ໃຊ້ຂໍ້ມູນຈາກ ref ເພື່ອບັນທຶກ
    const formData = supplierFormRef.current || currentSupplier;
    
    setSuppliers(suppliers.map(p => p.id === currentSupplier.id ? {...formData, id: currentSupplier.id} : p));
    setOpenEditDialog(false);
    supplierFormRef.current = null; // ລ້າງຂໍ້ມູນໃນ ref
    
    // ໃນກໍລະນີຈິງ, ສົ່ງຂໍ້ມູນໄປຍັງ API ເພື່ອອັບເດດ
    console.log('Updating supplier:', formData);
  };

  // ຟັງຊັນເປີດ dialog ລຶບຜູ້ສະໜອງ
  const handleOpenDeleteDialog = (id) => {
    setSelectedSupplierId(id);
    setOpenDeleteDialog(true);
  };

  // ຟັງຊັນປິດ dialog ລຶບຜູ້ສະໜອງ
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedSupplierId(null);
  };

  // ຟັງຊັນລຶບຜູ້ສະໜອງ
  const handleDeleteSupplier = (id) => {
    setSuppliers(suppliers.filter(supplier => supplier.id !== id));
    setOpenDeleteDialog(false);
    setSelectedSupplierId(null);
    // ໃນກໍລະນີຈິງ, ສົ່ງຄຳຂໍລຶບໄປຍັງ API
    console.log('Deleting supplier with ID:', id);
  };

  // ຟັງຊັນຄົ້ນຫາ
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // ກັ່ນຕອງຜູ້ສະໜອງຕາມການຄົ້ນຫາ
  const filteredSuppliers = suppliers.filter(supplier => {
    return (
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.phone.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Form dialog component for add and edit operations
  const SupplierFormDialog = ({ open, onClose, title, supplier, onChange, onSave }) => (
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
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ຊື່ບໍລິສັດ/ຫ້າງຮ້ານ"
                name="name"
                defaultValue={supplier.name}
                onChange={onChange}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ຊື່ຜູ້ຕິດຕໍ່"
                name="contactPerson"
                defaultValue={supplier.contactPerson}
                onChange={onChange}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ທີ່ຢູ່"
                name="address"
                defaultValue={supplier.address}
                onChange={onChange}
                multiline
                rows={2}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                defaultValue={supplier.email}
                onChange={onChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ເບີໂທ"
                name="phone"
                defaultValue={supplier.phone}
                onChange={onChange}
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
    <Layout title="ຈັດການຂໍ້ມູນຜູ້ສະໜອງສິນຄ້າ">
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
              <TableCell align="center">ຊື່ບໍລິສັດ/ຫ້າງຮ້ານ</TableCell>
              <TableCell align="center">ຊື່ຜູ້ຕິດຕໍ່</TableCell>
              <TableCell align="center">ທີ່ຢູ່</TableCell>
              <TableCell align="center">Email</TableCell>
              <TableCell align="center">ເບີໂທ</TableCell>
              <TableCell align="center">ແກ້ໄຂ</TableCell>
              <TableCell align="center">ລຶບ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSuppliers.map((supplier, index) => (
              <TableRow key={supplier.id} hover>
                <TableCell align="center">{index + 1}</TableCell>
                <TableCell align="center">{supplier.name}</TableCell>
                <TableCell align="center">{supplier.contactPerson}</TableCell>
                <TableCell align="center">{supplier.address}</TableCell>
                <TableCell align="center">{supplier.email}</TableCell>
                <TableCell align="center">{supplier.phone}</TableCell>
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
                      onClick={() => handleOpenDeleteDialog(supplier.id)}
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

      {/* Dialog for adding new supplier */}
      <SupplierFormDialog
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        title="ເພີ່ມຜູ້ສະໜອງໃໝ່"
        supplier={currentSupplier}
        onChange={handleChange}
        onSave={handleAddSupplier}
      />

      {/* Dialog for editing supplier */}
      <SupplierFormDialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        title="ແກ້ໄຂຂໍ້ມູນຜູ້ສະໜອງ"
        supplier={currentSupplier}
        onChange={handleChange}
        onSave={handleSaveEdit}
      />

      {/* Dialog for confirming deletion */}
      <DeleteConfirmDialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteSupplier}
        itemId={selectedSupplierId}
      />
    </Layout>
  );
}

export default Suppliers;