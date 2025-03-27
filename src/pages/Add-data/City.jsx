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

// Province data structure with districts
const provincesData = {
  'ນະຄອນຫຼວງວຽງຈັນ': [
    'ເມືອງ ຈັນທະບູລີ', 'ເມືອງ ໄຊເສດຖາ', 'ເມືອງ ສີໂຄດຕະບອງ', 
    'ເມືອງ ສີສັດຕະນາກ', 'ເມືອງ ຫາດຊາຍຟອງ', 'ເມືອງ ນາຊາຍທອງ', 
    'ເມືອງ ໄຊທານີ', 'ເມືອງ ສັງທອງ', 'ເມືອງ ໃໝ່ປາກງື່ມ'
  ],
  'ແຂວງຜົ້ງສາລີ': [
    'ເມືອງ ບຸນໃຕ້', 'ເມືອງ ຂວາ', 'ເມືອງ ໃໝ່', 'ເມືອງ ຍອດອູ', 
    'ເມືອງ ຜົ້ງສາລີ', 'ເມືອງ ສຳພັນ', 'ເມືອງ ບຸນເໜືອ'
  ],
  'ແຂວງຫຼວງນ້ຳທາ': [
    'ເມືອງ ຫຼວງນໍ້າທາ', 'ເມືອງ ສີງ', 'ເມືອງ ລອງ', 
    'ເມືອງ ວຽງພູຄາ', 'ເມືອງ ນາແລ'
  ],
  'ແຂວງບໍ່ແກ້ວ': [
    'ເມືອງ ຫ້ວຍຊາຍ', 'ເມືອງ ຕົ້ນເຜິ້ງ', 'ເມືອງ ເມິງ', 
    'ເມືອງ ຜາອຸດົມ', 'ເມືອງ ປາກທາ'
  ],
  'ແຂວງອຸດົມໄຊ': [
    'ເມືອງ ໄຊ', 'ເມືອງ ຫລາ', 'ເມືອງ ນາໝໍ້', 'ເມືອງ ງາ', 
    'ເມືອງ ແບ່ງ', 'ເມືອງ ຮຸນ', 'ເມືອງ ປາກແບ່ງ'
  ],
  'ແຂວງຫລວງພະບາງ': [
    'ເມືອງ ຫຼວງພະບາງ', 'ເມືອງ ຊຽງເງິນ', 'ເມືອງ ນານ', 'ເມືອງ ປາກອູ', 
    'ເມືອງ ນ້ຳບາກ', 'ເມືອງ ງອຍ', 'ເມືອງ ປາກແຊງ', 'ເມືອງ ໂພນໄຊ', 
    'ເມືອງ ຈອມເພັດ', 'ເມືອງ ວຽງຄຳ', 'ເມືອງ ພູຄູນ', 'ເມືອງ ໂພນທອງ'
  ],
  'ແຂວງໄຊຍະບູລີ': [
    'ເມືອງ ບໍ່ແຕນ', 'ເມືອງ ຫົງສາ', 'ເມືອງ ແກ່ນທ້າວ', 'ເມືອງ ຄອບ', 
    'ເມືອງ ເງິນ', 'ເມືອງ ປາກລາຍ', 'ເມືອງ ພຽງ', 'ເມືອງ ທົ່ງມີໄຊ', 
    'ເມືອງ ໄຊຍະບູລີ', 'ເມືອງ ຊຽງຮ່ອນ', 'ເມືອງ ໄຊສະຖານ'
  ],
  'ແຂວງຫົວພັນ': [
    'ເມືອງ ຊຳເໜືອ', 'ເມືອງ ຊຽງຄໍ້', 'ເມືອງ ຮ້ຽມ', 'ເມືອງ ວຽງໄຊ', 
    'ເມືອງ ຫົວເມືອງ', 'ເມືອງ ຊຳໃຕ້', 'ເມືອງ ສົບເບົາ', 'ເມືອງ ແອດ', 
    'ເມືອງ ກວັນ', 'ເມືອງ ຊ່ອນ'
  ],
  'ແຂວງຊຽງຂວາງ': [
    'ເມືອງ ແປກ(ໂພນສະຫວັນ)', 'ເມືອງ ຄຳ', 'ເມືອງ ໜອງແຮດ', 'ເມືອງ ຄູນ', 
    'ເມືອງ ໝອກ', 'ເມືອງ ພູກູດ', 'ເມືອງ ຜາໄຊ'
  ],
  'ແຂວງວຽງຈັນ': [
    'ເມືອງ ເຟືອງ', 'ເມືອງ ຫີນເຫີບ', 'ເມືອງ ກາສີ', 'ເມືອງ ແກ້ວອຸດົມ', 
    'ເມືອງ ແມດ', 'ເມືອງ ໂພນໂຮງ', 'ເມືອງ ທຸລະຄົມ', 'ເມືອງ ວັງວຽງ', 
    'ເມືອງ ວຽງຄຳ', 'ເມືອງ ຊະນະຄາມ', 'ເມືອງ ໝື່ນ'
  ],
  'ແຂວງໄຊສົມບູນ': [
    'ເມືອງ ລ້ອງແຈ້ງ', 'ເມືອງ ທ່າໂທມ', 'ເມືອງ ອະນຸວົງ', 
    'ເມືອງ ລ້ອງຊານ', 'ເມືອງ ຮົ່ມ'
  ],
  'ແຂວງບໍລິຄຳໄຊ': [
    'ເມືອງ ປາກຊັນ', 'ເມືອງ ທ່າພະບາດ', 'ເມືອງ ປາກກະດິງ', 'ເມືອງ ຄຳເກີດ(ຫຼັກ20)', 
    'ເມືອງ ບໍລິຄັນ', 'ເມືອງ ວຽງທອງ', 'ເມືອງ ໄຊຈຳພອນ'
  ],
  'ແຂວງຄຳມ່ວນ': [
    'ເມືອງ ທ່າແຂກ', 'ເມືອງ ມະຫາໄຊ', 'ເມືອງ ໜອງບົກ', 'ເມືອງ ຫີນບູນ', 
    'ເມືອງ ຍົມມະລາດ', 'ເມືອງ ບົວລະພາ', 'ເມືອງ ນາກາຍ', 'ເມືອງ ເຊບັ້ງໄຟ', 
    'ເມືອງ ໄຊບົວທອງ', 'ເມືອງ ຄູນຄຳ'
  ],
  'ແຂວງສະຫວັນນະເຂດ': [
    'ເມືອງ ໄກສອນ ພົມວິຫານ', 'ເມືອງ ອຸທຸມພອນ', 'ເມືອງ ອາດສະພັງທອງ', 'ເມືອງ ພີນ', 
    'ເມືອງ ເຊໂປນ', 'ເມືອງ ນອງ', 'ເມືອງ ທ່າປາງທອງ', 'ເມືອງ ສອງຄອນ', 'ເມືອງ ຈຳພອນ', 
    'ເມືອງ ຊົນນະບູລີ', 'ເມືອງ ໄຊບູລີ', 'ເມືອງ ວິລະບູລີ', 'ເມືອງ ອາດສະພອນ', 
    'ເມືອງ ໄຊພູທອງ', 'ເມືອງ ພະລານໄຊ'
  ],
  'ແຂວງສາລະວັນ': [
    'ເມືອງ ສາລະວັນ', 'ເມືອງ ລະຄອນເພັງ', 'ເມືອງ ວາປີ', 'ເມືອງ ເລົ່າງາມ', 
    'ເມືອງ ຕຸ້ມລານ', 'ເມືອງ ຕະໂອ້ຍ', 'ເມືອງ ຄົງເຊໂດນ', 'ເມືອງ ສະມ້ວຍ'
  ],
  'ແຂວງຈຳປາສັກ': [
    'ເມືອງ ປາກເຊ', 'ເມືອງ ຊະນະສົມບູນ', 'ເມືອງ ບາຈຽງຈະເລີນສຸກ', 'ເມືອງ ປາກຊ່ອງ', 
    'ເມືອງ ປະທຸມພອນ', 'ເມືອງ ໂພນທອງ', 'ເມືອງ ຈຳປາສັກ', 'ເມືອງ ສຸຂຸມາ', 
    'ເມືອງ ມູນລະປະໂມກ', 'ເມືອງ ໂຂງ'
  ],
  'ແຂວງເຊກອງ': [
    'ເມືອງ ທ່າແຕງ', 'ເມືອງ ລະມາມ', 'ເມືອງ ກະລຶມ', 'ເມືອງ ດັກຈຶງ'
  ],
  'ແຂວງອັດຕະປື': [
    'ເມືອງ ໄຊເຊດຖາ', 'ເມືອງ ສາມັກຄີໄຊ', 'ເມືອງ ສະໜາມໄຊ', 
    'ເມືອງ ຊານໄຊ', 'ເມືອງ ພູວົງ'
  ]
};

// Get all provinces as an array
const provinces = Object.keys(provincesData);

function City() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cities, setCities] = useState([
    { id: 1, name: 'ເມືອງ ຈັນທະບູລີ', province: 'ນະຄອນຫຼວງວຽງຈັນ' },
    { id: 2, name: 'ເມືອງ ໄຊເສດຖາ', province: 'ນະຄອນຫຼວງວຽງຈັນ' },
    { id: 3, name: 'ເມືອງ ສີໂຄດຕະບອງ', province: 'ນະຄອນຫຼວງວຽງຈັນ' },
    { id: 4, name: 'ເມືອງ ສີສັດຕະນາກ', province: 'ນະຄອນຫຼວງວຽງຈັນ' },
    { id: 5, name: 'ເມືອງ ນາຊາຍທອງ', province: 'ນະຄອນຫຼວງວຽງຈັນ' },
    { id: 6, name: 'ເມືອງ ຫາດຊາຍຟອງ', province: 'ນະຄອນຫຼວງວຽງຈັນ' },
    { id: 7, name: 'ເມືອງ ສັງທອງ', province: 'ນະຄອນຫຼວງວຽງຈັນ' },
    { id: 8, name: 'ເມືອງ ໄຊທານີ', province: 'ນະຄອນຫຼວງວຽງຈັນ' },
    { id: 9, name: 'ເມືອງ ໃໝ່ປາກງື່ມ', province: 'ນະຄອນຫຼວງວຽງຈັນ' },
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
    province: '',
  });

  // ຟັງຊັນເປີດ dialog ເພີ່ມເມືອງໃໝ່
  const handleOpenAddDialog = () => {
    const emptyCity = {
      name: '',
      province: '',
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

  // Handle province change to auto-update the city's name format
  const handleProvinceChange = (e) => {
    const { value } = e.target;
    cityFormRef.current = {
      ...(cityFormRef.current || currentCity),
      province: value,
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
    return (
      city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      city.province.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Form dialog component for add and edit operations
  const CityFormDialog = ({ open, onClose, title, city, onChange, onProvinceChange, onSave }) => (
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
              <FormControl fullWidth required>
                <InputLabel id="province-label">ແຂວງ</InputLabel>
                <Select
                  labelId="province-label"
                  id="province"
                  name="province"
                  defaultValue={city.province}
                  onChange={onProvinceChange}
                  label="ແຂວງ"
                >
                  <MenuItem value="">ເລືອກແຂວງ</MenuItem>
                  {provinces.map((province) => (
                    <MenuItem key={province} value={province}>{province}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              {city.province ? (
                <FormControl fullWidth required>
                  <InputLabel id="city-name-label">ຊື່ເມືອງ</InputLabel>
                  <Select
                    labelId="city-name-label"
                    id="name"
                    name="name"
                    defaultValue={city.name}
                    onChange={onChange}
                    label="ຊື່ເມືອງ"
                  >
                    <MenuItem value="">ເລືອກເມືອງ</MenuItem>
                    {provincesData[city.province]?.map((cityName) => (
                      <MenuItem key={cityName} value={cityName}>{cityName}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <TextField
                  fullWidth
                  label="ຊື່ເມືອງ"
                  name="name"
                  defaultValue={city.name}
                  onChange={onChange}
                  disabled={!city.province}
                  required
                  helperText={!city.province ? "ກະລຸນາເລືອກແຂວງກ່ອນ" : ""}
                />
              )}
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error" variant="outlined">
          ຍົກເລີກ
        </Button>
        <Button 
          onClick={onSave} 
          color="secondary" 
          variant="contained"
          disabled={!city.name || !city.province}
        >
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
              <TableCell align="center">ແຂວງ</TableCell>
              <TableCell align="center" width={120}>ແກ້ໄຂ</TableCell>
              <TableCell align="center" width={120}>ລຶບ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCities.map((city, index) => (
              <TableRow key={city.id} hover>
                <TableCell align="center">{index + 1}</TableCell>
                <TableCell align="center">{city.name}</TableCell>
                <TableCell align="center">{city.province}</TableCell>
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
        onProvinceChange={handleProvinceChange}
        onSave={handleAddCity}
      />

      {/* Dialog for editing city */}
      <CityFormDialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        title="ແກ້ໄຂຂໍ້ມູນເມືອງ"
        city={currentCity}
        onChange={handleChange}
        onProvinceChange={handleProvinceChange}
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