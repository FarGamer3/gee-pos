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

function City() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cities, setCities] = useState([
    { id: 1, name: 'ເມືອງ ຈັນທະບູລີ' },
    { id: 2, name: 'ເມືອງ ໄຊເສດຖາ' },
    { id: 3, name: 'ເມືອງ ສີໂຄດຕະບອງ' },
    { id: 4, name: 'ເມືອງ ສີສັດຕະນາກ' },
    { id: 5, name: 'ເມືອງ ນາຊາຍທອງ' },
    { id: 6, name: 'ເມືອງ ຫາດຊາຍຟອງ' },
    { id: 7, name: 'ເມືອງ ສັງທອງ' }
  ]);

  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState(null);
  
  // Current city for editing
  // ໃຊ້ useRef ເພື່ອເກັບຄ່າຊົ່ວຄາວແລະປ້ອງກັນການ re-render ແຕ່ລະຄັ້ງທີ່ພິມ
  const cityFormRef = React.useRef(null);
  
  const [currentCity, setCurrentCity] = useState({
    name: '',
  });

  // ຟັງຊັນເປີດ dialog ເພີ່ມເມືອງໃໝ່
  const handleOpenAddDialog = () => {
    const emptyCity = {
      name: '',
    };
    
    setCurrentCity(emptyCity);
    cityFormRef.current = emptyCity; // ຕັ້ງຄ່າເລີ່ມຕົ້ນໃນ ref
    setOpenAddDialog(true);
  };

  // ຟັງຊັນປິດ dialog ເພີ່ມເມືອງ
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    cityFormRef.current = null; // ລ້າງຂໍ້ມູນໃນ ref ເມື່ອປິດ dialog
  };

  // ຟັງຊັນເປີດ dialog ແກ້ໄຂເມືອງ
  const handleOpenEditDialog = (city) => {
    setCurrentCity({ ...city });
    cityFormRef.current = { ...city }; // ກຳນົດຄ່າເລີ່ມຕົ້ນໃນ ref ເປັນຂໍ້ມູນເມືອງປັດຈຸບັນ
    setOpenEditDialog(true);
  };

  // ຟັງຊັນປິດ dialog ແກ້ໄຂເມືອງ
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    cityFormRef.current = null; // ລ້າງຂໍ້ມູນໃນ ref ເມື່ອປິດ dialog
  };

  // ຟັງຊັນການປ່ຽນແປງຂໍ້ມູນເມືອງແບບປັບປຸງໃໝ່
  const handleChange = (e) => {
    const { name, value } = e.target;
    // ແທນທີ່ຈະໃຊ້ setCurrentCity ທຸກຄັ້ງທີ່ພິມ (ເຊິ່ງຈະ re-render)
    // ເຮົາຈະເກັບຄ່າໄວ້ໃນ ref ກ່ອນ
    cityFormRef.current = {
      ...(cityFormRef.current || currentCity),
      [name]: value
    };
  };

  // ຟັງຊັນບັນທຶກເມືອງໃໝ່
  const handleAddCity = () => {
    // ໃຊ້ຂໍ້ມູນຈາກ ref ເພື່ອບັນທຶກ
    const formData = cityFormRef.current || currentCity;
    
    const newCity = {
      ...formData,
      id: cities.length > 0 ? Math.max(...cities.map(p => p.id)) + 1 : 1
    };
    
    setCities([...cities, newCity]);
    setOpenAddDialog(false);
    cityFormRef.current = null; // ລ້າງຂໍ້ມູນໃນ ref
    
    // ໃນກໍລະນີຈິງ, ສົ່ງຂໍ້ມູນໄປຍັງ API ເພື່ອບັນທຶກ
    console.log('Adding new city:', newCity);
  };

  // ຟັງຊັນບັນທຶກການແກ້ໄຂເມືອງ
  const handleSaveEdit = () => {
    // ໃຊ້ຂໍ້ມູນຈາກ ref ເພື່ອບັນທຶກ
    const formData = cityFormRef.current || currentCity;
    
    setCities(cities.map(p => p.id === currentCity.id ? {...formData, id: currentCity.id} : p));
    setOpenEditDialog(false);
    cityFormRef.current = null; // ລ້າງຂໍ້ມູນໃນ ref
    
    // ໃນກໍລະນີຈິງ, ສົ່ງຂໍ້ມູນໄປຍັງ API ເພື່ອອັບເດດ
    console.log('Updating city:', formData);
  };

  // ຟັງຊັນເປີດ dialog ລຶບເມືອງ
  const handleOpenDeleteDialog = (id) => {
    setSelectedCityId(id);
    setOpenDeleteDialog(true);
  };

  // ຟັງຊັນປິດ dialog ລຶບເມືອງ
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedCityId(null);
  };

  // ຟັງຊັນລຶບເມືອງ
  const handleDeleteCity = (id) => {
    setCities(cities.filter(city => city.id !== id));
    setOpenDeleteDialog(false);
    setSelectedCityId(null);
    // ໃນກໍລະນີຈິງ, ສົ່ງຄຳຂໍລຶບໄປຍັງ API
    console.log('Deleting city with ID:', id);
  };

  // ຟັງຊັນຄົ້ນຫາ
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // ກັ່ນຕອງເມືອງຕາມການຄົ້ນຫາ
  const filteredCities = cities.filter(city => {
    return city.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Form dialog component for add and edit operations
  const CityFormDialog = ({ open, onClose, title, city, onChange, onSave }) => (
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
                label="ຊື່ເມືອງ"
                name="name"
                defaultValue={city.name}
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
    <Layout title="ຈັດການຂໍ້ມູນເມືອງ">
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
              <TableCell align="center">ຊື່ເມືອງ</TableCell>
              <TableCell align="center" width={120}>ແກ້ໄຂ</TableCell>
              <TableCell align="center" width={120}>ລຶບ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCities.map((city, index) => (
              <TableRow key={city.id} hover>
                <TableCell align="center">{index + 1}</TableCell>
                <TableCell align="center">{city.name}</TableCell>
                <TableCell align="center">
                  <Tooltip title="ແກ້ໄຂ">
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => handleOpenEditDialog(city)}
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
                      onClick={() => handleOpenDeleteDialog(city.id)}
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

      {/* Dialog for adding new city */}
      <CityFormDialog
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        title="ເພີ່ມເມືອງໃໝ່"
        city={currentCity}
        onChange={handleChange}
        onSave={handleAddCity}
      />

      {/* Dialog for editing city */}
      <CityFormDialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        title="ແກ້ໄຂຂໍ້ມູນເມືອງ"
        city={currentCity}
        onChange={handleChange}
        onSave={handleSaveEdit}
      />

      {/* Dialog for confirming deletion */}
      <DeleteConfirmDialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteCity}
        itemId={selectedCityId}
      />
    </Layout>
  );
}

export default City;