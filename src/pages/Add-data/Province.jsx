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

function Province() {
  const [searchTerm, setSearchTerm] = useState('');
  const [provinces, setProvinces] = useState([
    { id: 1, name: 'ນະຄອນຫຼວງວຽງຈັນ' },
    { id: 2, name: 'ແຂວງ ຫຼວງພະບາງ' },
    { id: 3, name: 'ແຂວງ ຫຼວງນໍ້າທາ' },
    { id: 4, name: 'ແຂວງ ຫົວພັນ' },
    { id: 5, name: 'ແຂວງ ອຸດົມໄຊ' },
    { id: 6, name: 'ແຂວງ ໄຊຍະບູລີ' },
    { id: 7, name: 'ແຂວງ ຊຽງຂວາງ' },
    { id: 8, name: 'ແຂວງ ວຽງຈັນ' },
    { id: 9, name: 'ແຂວງ ບໍລິຄຳໄຊ' },
    { id: 10, name: 'ແຂວງ ຄຳມ່ວນ' },
    { id: 11, name: 'ແຂວງ ສະຫວັນນະເຂດ' },
    { id: 12, name: 'ແຂວງ ສາລະວັນ' },
    { id: 13, name: 'ແຂວງ ເຊກອງ' },
    { id: 14, name: 'ແຂວງ ຈຳປາສັກ' },
    { id: 15, name: 'ແຂວງ ອັດຕະປື' },
    { id: 16, name: 'ແຂວງ ໄຊສົມບູນ' },
    { id: 17, name: 'ແຂວງ ບໍ່ແກ້ວ' },
    { id: 18, name: 'ແຂວງ ຜົ້ງສາລີ' }
  ]);

  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedProvinceId, setSelectedProvinceId] = useState(null);
  
  // Current province for editing
  // ໃຊ້ useRef ເພື່ອເກັບຄ່າຊົ່ວຄາວແລະປ້ອງກັນການ re-render ແຕ່ລະຄັ້ງທີ່ພິມ
  const provinceFormRef = React.useRef(null);
  
  const [currentProvince, setCurrentProvince] = useState({
    name: '',
  });

  // ຟັງຊັນເປີດ dialog ເພີ່ມແຂວງໃໝ່
  const handleOpenAddDialog = () => {
    const emptyProvince = {
      name: '',
    };
    
    setCurrentProvince(emptyProvince);
    provinceFormRef.current = emptyProvince; // ຕັ້ງຄ່າເລີ່ມຕົ້ນໃນ ref
    setOpenAddDialog(true);
  };

  // ຟັງຊັນປິດ dialog ເພີ່ມແຂວງ
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    provinceFormRef.current = null; // ລ້າງຂໍ້ມູນໃນ ref ເມື່ອປິດ dialog
  };

  // ຟັງຊັນເປີດ dialog ແກ້ໄຂແຂວງ
  const handleOpenEditDialog = (province) => {
    setCurrentProvince({ ...province });
    provinceFormRef.current = { ...province }; // ກຳນົດຄ່າເລີ່ມຕົ້ນໃນ ref ເປັນຂໍ້ມູນແຂວງປັດຈຸບັນ
    setOpenEditDialog(true);
  };

  // ຟັງຊັນປິດ dialog ແກ້ໄຂແຂວງ
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    provinceFormRef.current = null; // ລ້າງຂໍ້ມູນໃນ ref ເມື່ອປິດ dialog
  };

  // ຟັງຊັນການປ່ຽນແປງຂໍ້ມູນແຂວງແບບປັບປຸງໃໝ່
  const handleChange = (e) => {
    const { name, value } = e.target;
    // ແທນທີ່ຈະໃຊ້ setCurrentProvince ທຸກຄັ້ງທີ່ພິມ (ເຊິ່ງຈະ re-render)
    // ເຮົາຈະເກັບຄ່າໄວ້ໃນ ref ກ່ອນ
    provinceFormRef.current = {
      ...(provinceFormRef.current || currentProvince),
      [name]: value
    };
  };

  // ຟັງຊັນບັນທຶກແຂວງໃໝ່
  const handleAddProvince = () => {
    // ໃຊ້ຂໍ້ມູນຈາກ ref ເພື່ອບັນທຶກ
    const formData = provinceFormRef.current || currentProvince;
    
    const newProvince = {
      ...formData,
      id: provinces.length > 0 ? Math.max(...provinces.map(p => p.id)) + 1 : 1
    };
    
    setProvinces([...provinces, newProvince]);
    setOpenAddDialog(false);
    provinceFormRef.current = null; // ລ້າງຂໍ້ມູນໃນ ref
    
    // ໃນກໍລະນີຈິງ, ສົ່ງຂໍ້ມູນໄປຍັງ API ເພື່ອບັນທຶກ
    console.log('Adding new province:', newProvince);
  };

  // ຟັງຊັນບັນທຶກການແກ້ໄຂແຂວງ
  const handleSaveEdit = () => {
    // ໃຊ້ຂໍ້ມູນຈາກ ref ເພື່ອບັນທຶກ
    const formData = provinceFormRef.current || currentProvince;
    
    setProvinces(provinces.map(p => p.id === currentProvince.id ? {...formData, id: currentProvince.id} : p));
    setOpenEditDialog(false);
    provinceFormRef.current = null; // ລ້າງຂໍ້ມູນໃນ ref
    
    // ໃນກໍລະນີຈິງ, ສົ່ງຂໍ້ມູນໄປຍັງ API ເພື່ອອັບເດດ
    console.log('Updating province:', formData);
  };

  // ຟັງຊັນເປີດ dialog ລຶບແຂວງ
  const handleOpenDeleteDialog = (id) => {
    setSelectedProvinceId(id);
    setOpenDeleteDialog(true);
  };

  // ຟັງຊັນປິດ dialog ລຶບແຂວງ
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedProvinceId(null);
  };

  // ຟັງຊັນລຶບແຂວງ
  const handleDeleteProvince = (id) => {
    setProvinces(provinces.filter(province => province.id !== id));
    setOpenDeleteDialog(false);
    setSelectedProvinceId(null);
    // ໃນກໍລະນີຈິງ, ສົ່ງຄຳຂໍລຶບໄປຍັງ API
    console.log('Deleting province with ID:', id);
  };

  // ຟັງຊັນຄົ້ນຫາ
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // ກັ່ນຕອງແຂວງຕາມການຄົ້ນຫາ
  const filteredProvinces = provinces.filter(province => {
    return province.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Form dialog component for add and edit operations
  const ProvinceFormDialog = ({ open, onClose, title, province, onChange, onSave }) => (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
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
                label="ຊື່ແຂວງ"
                name="name"
                defaultValue={province.name}
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
    <Layout title="ຈັດການຂໍ້ມູນແຂວງ">
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
              <TableCell align="center">ຊື່ແຂວງ</TableCell>
              <TableCell align="center" width={120}>ແກ້ໄຂ</TableCell>
              <TableCell align="center" width={120}>ລຶບ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProvinces.map((province, index) => (
              <TableRow key={province.id} hover>
                <TableCell align="center">{index + 1}</TableCell>
                <TableCell align="center">{province.name}</TableCell>
                <TableCell align="center">
                  <Tooltip title="ແກ້ໄຂ">
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => handleOpenEditDialog(province)}
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
                      onClick={() => handleOpenDeleteDialog(province.id)}
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

      {/* Dialog for adding new province */}
      <ProvinceFormDialog
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        title="ເພີ່ມແຂວງໃໝ່"
        province={currentProvince}
        onChange={handleChange}
        onSave={handleAddProvince}
      />

      {/* Dialog for editing province */}
      <ProvinceFormDialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        title="ແກ້ໄຂຂໍ້ມູນແຂວງ"
        province={currentProvince}
        onChange={handleChange}
        onSave={handleSaveEdit}
      />

      {/* Dialog for confirming deletion */}
      <DeleteConfirmDialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteProvince}
        itemId={selectedProvinceId}
      />
    </Layout>
  );
}

export default Province;