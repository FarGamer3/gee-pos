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

function Warehouse() {
  const [searchTerm, setSearchTerm] = useState('');
  const [warehouses, setWarehouses] = useState([
    {
      id: 1,
      name: 'ສາງໃຫຍ່',
      description: 'ສາງໃຫຍ່ສຳລັບເກັບສິນຄ້າທັງໝົດຂອງຮ້ານ'
    },
    {
      id: 2,
      name: 'ສາງຍ່ອຍ 1',
      description: 'ສາງສຳລັບເກັບເຄື່ອງໃຊ້ໄຟຟ້າ'
    }
  ]);

  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
  
  // Current warehouse for editing
  // ໃຊ້ useRef ເພື່ອເກັບຄ່າຊົ່ວຄາວແລະປ້ອງກັນການ re-render ແຕ່ລະຄັ້ງທີ່ພິມ
  const warehouseFormRef = React.useRef(null);
  
  const [currentWarehouse, setCurrentWarehouse] = useState({
    name: '',
    description: ''
  });

  // ຟັງຊັນເປີດ dialog ເພີ່ມບ່ອນຈັດເກັບໃໝ່
  const handleOpenAddDialog = () => {
    const emptyWarehouse = {
      name: '',
      description: ''
    };
    
    setCurrentWarehouse(emptyWarehouse);
    warehouseFormRef.current = emptyWarehouse; // ຕັ້ງຄ່າເລີ່ມຕົ້ນໃນ ref
    setOpenAddDialog(true);
  };

  // ຟັງຊັນປິດ dialog ເພີ່ມບ່ອນຈັດເກັບ
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    warehouseFormRef.current = null; // ລ້າງຂໍ້ມູນໃນ ref ເມື່ອປິດ dialog
  };

  // ຟັງຊັນເປີດ dialog ແກ້ໄຂບ່ອນຈັດເກັບ
  const handleOpenEditDialog = (warehouse) => {
    setCurrentWarehouse({ ...warehouse });
    warehouseFormRef.current = { ...warehouse }; // ກຳນົດຄ່າເລີ່ມຕົ້ນໃນ ref ເປັນຂໍ້ມູນບ່ອນຈັດເກັບປັດຈຸບັນ
    setOpenEditDialog(true);
  };

  // ຟັງຊັນປິດ dialog ແກ້ໄຂບ່ອນຈັດເກັບ
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    warehouseFormRef.current = null; // ລ້າງຂໍ້ມູນໃນ ref ເມື່ອປິດ dialog
  };

  // ຟັງຊັນການປ່ຽນແປງຂໍ້ມູນບ່ອນຈັດເກັບແບບປັບປຸງໃໝ່
  const handleChange = (e) => {
    const { name, value } = e.target;
    // ແທນທີ່ຈະໃຊ້ setCurrentWarehouse ທຸກຄັ້ງທີ່ພິມ (ເຊິ່ງຈະ re-render)
    // ເຮົາຈະເກັບຄ່າໄວ້ໃນ ref ກ່ອນ
    warehouseFormRef.current = {
      ...(warehouseFormRef.current || currentWarehouse),
      [name]: value
    };
  };

  // ຟັງຊັນບັນທຶກບ່ອນຈັດເກັບໃໝ່
  const handleAddWarehouse = () => {
    // ໃຊ້ຂໍ້ມູນຈາກ ref ເພື່ອບັນທຶກ
    const formData = warehouseFormRef.current || currentWarehouse;
    
    const newWarehouse = {
      ...formData,
      id: warehouses.length > 0 ? Math.max(...warehouses.map(w => w.id)) + 1 : 1
    };
    
    setWarehouses([...warehouses, newWarehouse]);
    setOpenAddDialog(false);
    warehouseFormRef.current = null; // ລ້າງຂໍ້ມູນໃນ ref
    
    // ໃນກໍລະນີຈິງ, ສົ່ງຂໍ້ມູນໄປຍັງ API ເພື່ອບັນທຶກ
    console.log('Adding new warehouse:', newWarehouse);
  };

  // ຟັງຊັນບັນທຶກການແກ້ໄຂບ່ອນຈັດເກັບ
  const handleSaveEdit = () => {
    // ໃຊ້ຂໍ້ມູນຈາກ ref ເພື່ອບັນທຶກ
    const formData = warehouseFormRef.current || currentWarehouse;
    
    setWarehouses(warehouses.map(w => w.id === currentWarehouse.id ? {...formData, id: currentWarehouse.id} : w));
    setOpenEditDialog(false);
    warehouseFormRef.current = null; // ລ້າງຂໍ້ມູນໃນ ref
    
    // ໃນກໍລະນີຈິງ, ສົ່ງຂໍ້ມູນໄປຍັງ API ເພື່ອອັບເດດ
    console.log('Updating warehouse:', formData);
  };

  // ຟັງຊັນເປີດ dialog ລຶບບ່ອນຈັດເກັບ
  const handleOpenDeleteDialog = (id) => {
    setSelectedWarehouseId(id);
    setOpenDeleteDialog(true);
  };

  // ຟັງຊັນປິດ dialog ລຶບບ່ອນຈັດເກັບ
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedWarehouseId(null);
  };

  // ຟັງຊັນລຶບບ່ອນຈັດເກັບ
  const handleDeleteWarehouse = (id) => {
    setWarehouses(warehouses.filter(warehouse => warehouse.id !== id));
    setOpenDeleteDialog(false);
    setSelectedWarehouseId(null);
    // ໃນກໍລະນີຈິງ, ສົ່ງຄຳຂໍລຶບໄປຍັງ API
    console.log('Deleting warehouse with ID:', id);
  };

  // ຟັງຊັນຄົ້ນຫາ
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // ກັ່ນຕອງບ່ອນຈັດເກັບຕາມການຄົ້ນຫາ
  const filteredWarehouses = warehouses.filter(warehouse => {
    return (
      warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warehouse.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Form dialog component for add and edit operations
  const WarehouseFormDialog = ({ open, onClose, title, warehouse, onChange, onSave }) => (
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
                label="ຊື່ບ່ອນຈັດເກັບ"
                name="name"
                defaultValue={warehouse.name}
                onChange={onChange}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ລາຍລະອຽດ"
                name="description"
                defaultValue={warehouse.description}
                onChange={onChange}
                multiline
                rows={4}
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
    <Layout title="ຈັດການຂໍ້ມູນບ່ອນຈັດວາງ">
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
              <TableCell align="center">ຊື່ບ່ອນຈັດວາງ</TableCell>
              <TableCell align="center">ລາຍລະອຽດ</TableCell>
              <TableCell align="center" width={80}>ແກ້ໄຂ</TableCell>
              <TableCell align="center" width={80}>ລຶບ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredWarehouses.map((warehouse, index) => (
              <TableRow key={warehouse.id} hover>
                <TableCell align="center">{index + 1}</TableCell>
                <TableCell align="center">{warehouse.name}</TableCell>
                <TableCell align="center">{warehouse.description}</TableCell>
                <TableCell align="center">
                  <Tooltip title="ແກ້ໄຂ">
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => handleOpenEditDialog(warehouse)}
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
                      onClick={() => handleOpenDeleteDialog(warehouse.id)}
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

      {/* Dialog for adding new warehouse */}
      <WarehouseFormDialog
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        title="ເພີ່ມບ່ອນຈັດວາງໃໝ່"
        warehouse={currentWarehouse}
        onChange={handleChange}
        onSave={handleAddWarehouse}
      />

      {/* Dialog for editing warehouse */}
      <WarehouseFormDialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        title="ແກ້ໄຂຂໍ້ມູນບ່ອນຈັດວາງ"
        warehouse={currentWarehouse}
        onChange={handleChange}
        onSave={handleSaveEdit}
      />

      {/* Dialog for confirming deletion */}
      <DeleteConfirmDialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteWarehouse}
        itemId={selectedWarehouseId}
      />
    </Layout>
  );
}

export default Warehouse;