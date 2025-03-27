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

// Create a flat array of all cities
const allCities = [];
for (const province in provincesData) {
  provincesData[province].forEach(city => {
    allCities.push({ name: city, province: province });
  });
}

function Village() {
  const [searchTerm, setSearchTerm] = useState('');
  const [villages, setVillages] = useState([
    { id: 1, name: 'ບ້ານ ຫາຍໂສກ', city: 'ເມືອງ ຈັນທະບູລີ', province: 'ນະຄອນຫຼວງວຽງຈັນ' },
    { id: 2, name: 'ບ້ານ ສີສະຫວາດ', city: 'ເມືອງ ຈັນທະບູລີ', province: 'ນະຄອນຫຼວງວຽງຈັນ' },
    { id: 3, name: 'ບ້ານ ໂນນສະຫວ່າງ', city: 'ເມືອງ ໄຊເສດຖາ', province: 'ນະຄອນຫຼວງວຽງຈັນ' },
    { id: 4, name: 'ບ້ານ ດົງໂດກ', city: 'ເມືອງ ໄຊເສດຖາ', province: 'ນະຄອນຫຼວງວຽງຈັນ' },
    { id: 5, name: 'ບ້ານ ນາໄຊ', city: 'ເມືອງ ສີໂຄດຕະບອງ', province: 'ນະຄອນຫຼວງວຽງຈັນ' }
  ]);

  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedVillageId, setSelectedVillageId] = useState(null);
  
  // Current village for editing
  // ໃຊ້ useRef ເພື່ອເກັບຄ່າຊົ່ວຄາວແລະປ້ອງກັນການ re-render ແຕ່ລະຄັ້ງທີ່ພິມ
  const villageFormRef = React.useRef(null);
  
  const [currentVillage, setCurrentVillage] = useState({
    name: '',
    city: '',
    province: '',
  });

  // Selected province for filtering cities
  const [selectedProvince, setSelectedProvince] = useState('');

  // ຟັງຊັນເປີດ dialog ເພີ່ມບ້ານໃໝ່
  const handleOpenAddDialog = () => {
    const emptyVillage = {
      name: '',
      city: '',
      province: '',
    };
    
    setCurrentVillage(emptyVillage);
    villageFormRef.current = emptyVillage; // ຕັ້ງຄ່າເລີ່ມຕົ້ນໃນ ref
    setOpenAddDialog(true);
  };

  // ຟັງຊັນປິດ dialog ເພີ່ມບ້ານ
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    villageFormRef.current = null; // ລ້າງຂໍ້ມູນໃນ ref ເມື່ອປິດ dialog
  };

  // ຟັງຊັນເປີດ dialog ແກ້ໄຂບ້ານ
  const handleOpenEditDialog = (village) => {
    setCurrentVillage({ ...village });
    villageFormRef.current = { ...village }; // ກຳນົດຄ່າເລີ່ມຕົ້ນໃນ ref ເປັນຂໍ້ມູນບ້ານປັດຈຸບັນ
    setOpenEditDialog(true);
  };

  // ຟັງຊັນປິດ dialog ແກ້ໄຂບ້ານ
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    villageFormRef.current = null; // ລ້າງຂໍ້ມູນໃນ ref ເມື່ອປິດ dialog
  };

  // ຟັງຊັນການປ່ຽນແປງຂໍ້ມູນບ້ານແບບປັບປຸງໃໝ່
  const handleChange = (e) => {
    const { name, value } = e.target;
    // ແທນທີ່ຈະໃຊ້ setCurrentVillage ທຸກຄັ້ງທີ່ພິມ (ເຊິ່ງຈະ re-render)
    // ເຮົາຈະເກັບຄ່າໄວ້ໃນ ref ກ່ອນ
    villageFormRef.current = {
      ...(villageFormRef.current || currentVillage),
      [name]: value
    };
  };

  // ຟັງຊັນບັນທຶກບ້ານໃໝ່
  const handleAddVillage = () => {
    // ໃຊ້ຂໍ້ມູນຈາກ ref ເພື່ອບັນທຶກ
    const formData = villageFormRef.current || currentVillage;
    
    const newVillage = {
      ...formData,
      id: villages.length > 0 ? Math.max(...villages.map(p => p.id)) + 1 : 1
    };
    
    setVillages([...villages, newVillage]);
    setOpenAddDialog(false);
    villageFormRef.current = null; // ລ້າງຂໍ້ມູນໃນ ref
    
    // ໃນກໍລະນີຈິງ, ສົ່ງຂໍ້ມູນໄປຍັງ API ເພື່ອບັນທຶກ
    console.log('Adding new village:', newVillage);
  };

  // ຟັງຊັນບັນທຶກການແກ້ໄຂບ້ານ
  const handleSaveEdit = () => {
    // ໃຊ້ຂໍ້ມູນຈາກ ref ເພື່ອບັນທຶກ
    const formData = villageFormRef.current || currentVillage;
    
    setVillages(villages.map(p => p.id === currentVillage.id ? {...formData, id: currentVillage.id} : p));
    setOpenEditDialog(false);
    villageFormRef.current = null; // ລ້າງຂໍ້ມູນໃນ ref
    
    // ໃນກໍລະນີຈິງ, ສົ່ງຂໍ້ມູນໄປຍັງ API ເພື່ອອັບເດດ
    console.log('Updating village:', formData);
  };

  // ຟັງຊັນເປີດ dialog ລຶບບ້ານ
  const handleOpenDeleteDialog = (id) => {
    setSelectedVillageId(id);
    setOpenDeleteDialog(true);
  };

  // ຟັງຊັນປິດ dialog ລຶບບ້ານ
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedVillageId(null);
  };

  // ຟັງຊັນລຶບບ້ານ
  const handleDeleteVillage = (id) => {
    setVillages(villages.filter(village => village.id !== id));
    setOpenDeleteDialog(false);
    setSelectedVillageId(null);
    // ໃນກໍລະນີຈິງ, ສົ່ງຄຳຂໍລຶບໄປຍັງ API
    console.log('Deleting village with ID:', id);
  };

  // ຟັງຊັນຄົ້ນຫາ
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle province change
  const handleProvinceChange = (e) => {
    const { value } = e.target;
    setSelectedProvince(value);
    villageFormRef.current = {
      ...(villageFormRef.current || currentVillage),
      province: value,
      city: '' // Reset city when province changes
    };
    setCurrentVillage(prev => ({
      ...prev,
      province: value,
      city: '' // Reset city when province changes
    }));
  };

  // ກັ່ນຕອງບ້ານຕາມການຄົ້ນຫາ
  const filteredVillages = villages.filter(village => {
    return (
      village.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      village.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      village.province.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Form dialog component for add and edit operations
  const VillageFormDialog = ({ open, onClose, title, village, onChange, onSave }) => (
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
                label="ຊື່ບ້ານ"
                name="name"
                defaultValue={village.name}
                onChange={onChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel id="province-label">ແຂວງ</InputLabel>
                <Select
                  labelId="province-label"
                  id="province"
                  name="province"
                  value={village.province || ''}
                  onChange={handleProvinceChange}
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
              <FormControl fullWidth required disabled={!village.province}>
                <InputLabel id="city-label">ເມືອງ</InputLabel>
                <Select
                  labelId="city-label"
                  id="city"
                  name="city"
                  value={village.city || ''}
                  onChange={onChange}
                  label="ເມືອງ"
                >
                  <MenuItem value="">ເລືອກເມືອງ</MenuItem>
                  {village.province && provincesData[village.province]?.map((city) => (
                    <MenuItem key={city} value={city}>{city}</MenuItem>
                  ))}
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
        <Button 
          onClick={onSave} 
          color="secondary" 
          variant="contained"
          disabled={!village.name || !village.city || !village.province}
        >
          ບັນທຶກ
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Layout title="ຈັດການຂໍ້ມູນບ້ານ">
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
              <TableCell align="center">ຊື່ບ້ານ</TableCell>
              <TableCell align="center">ເມືອງ</TableCell>
              <TableCell align="center">ແຂວງ</TableCell>
              <TableCell align="center" width={120}>ແກ້ໄຂ</TableCell>
              <TableCell align="center" width={120}>ລຶບ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredVillages.map((village, index) => (
              <TableRow key={village.id} hover>
                <TableCell align="center">{index + 1}</TableCell>
                <TableCell align="center">{village.name}</TableCell>
                <TableCell align="center">{village.city}</TableCell>
                <TableCell align="center">{village.province}</TableCell>
                <TableCell align="center">
                  <Tooltip title="ແກ້ໄຂ">
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => handleOpenEditDialog(village)}
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
                      onClick={() => handleOpenDeleteDialog(village.id)}
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

      {/* Dialog for adding new village */}
      <VillageFormDialog
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        title="ເພີ່ມບ້ານໃໝ່"
        village={currentVillage}
        onChange={handleChange}
        onSave={handleAddVillage}
      />

      {/* Dialog for editing village */}
      <VillageFormDialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        title="ແກ້ໄຂຂໍ້ມູນບ້ານ"
        village={currentVillage}
        onChange={handleChange}
        onSave={handleSaveEdit}
      />

      {/* Dialog for confirming deletion */}
      <DeleteConfirmDialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteVillage}
        itemId={selectedVillageId}
      />
    </Layout>
  );
}

export default Village;