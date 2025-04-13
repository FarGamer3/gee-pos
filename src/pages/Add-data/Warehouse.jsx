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
import {
  getAllZones,
  addZone,
  updateZone,
  deleteZone
} from '../../services/zoneService';

function Warehouse() {
  const [searchTerm, setSearchTerm] = useState('');
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Form state
  const [currentZone, setCurrentZone] = useState({
    zone: '',
    zone_detail: '',
    zone_id: null
  });

  // ດຶງຂໍ້ມູນທັງໝົດເມື່ອໜ້າຖືກໂຫຼດ
  useEffect(() => {
    fetchZones();
  }, []);

  // ຟັງຊັນດຶງຂໍ້ມູນໂຊນຈັດວາງສິນຄ້າ
  const fetchZones = async () => {
    setLoading(true);
    try {
      const data = await getAllZones();
      setZones(data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching zones:", err);
      setError('ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ');
    } finally {
      setLoading(false);
    }
  };

  // Open add dialog
  const handleOpenAddDialog = () => {
    setCurrentZone({ zone: '', zone_detail: '', zone_id: null });
    setOpenAddDialog(true);
  };

  // Close add dialog
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  // Open edit dialog
  const handleOpenEditDialog = (zone) => {
    setCurrentZone({ ...zone });
    setOpenEditDialog(true);
  };

  // Close edit dialog
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentZone(prev => ({
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

  // Add new zone
  const handleAddZone = async () => {
    if (!currentZone.zone.trim() || !currentZone.zone_detail.trim()) {
      showSnackbar('ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ', 'error');
      return;
    }

    setLoading(true);
    try {
      const result = await addZone(currentZone.zone, currentZone.zone_detail);
      
      if (result) {
        await fetchZones(); // ດຶງຂໍ້ມູນໃໝ່
        setOpenAddDialog(false);
        showSnackbar('ເພີ່ມບ່ອນຈັດວາງສຳເລັດແລ້ວ');
      }
    } catch (err) {
      console.error("Error adding zone:", err);
      showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການເພີ່ມຂໍ້ມູນ', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Save edited zone
  const handleSaveEdit = async () => {
    if (!currentZone.zone.trim() || !currentZone.zone_detail.trim()) {
      showSnackbar('ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ', 'error');
      return;
    }

    setLoading(true);
    try {
      const result = await updateZone(currentZone.zone_id, currentZone.zone, currentZone.zone_detail);
      
      if (result) {
        await fetchZones(); // ດຶງຂໍ້ມູນໃໝ່
        setOpenEditDialog(false);
        showSnackbar('ແກ້ໄຂບ່ອນຈັດວາງສຳເລັດແລ້ວ');
      }
    } catch (err) {
      console.error("Error updating zone:", err);
      showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການແກ້ໄຂຂໍ້ມູນ', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Open delete confirmation
  const handleOpenDeleteDialog = (id) => {
    setSelectedZoneId(id);
    setOpenDeleteDialog(true);
  };

  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedZoneId(null);
  };

  // Delete zone
  const handleDeleteZone = async (id) => {
    setLoading(true);
    try {
      const result = await deleteZone(id);
      
      if (result) {
        await fetchZones(); // ດຶງຂໍ້ມູນໃໝ່
        setOpenDeleteDialog(false);
        showSnackbar('ລຶບບ່ອນຈັດວາງສຳເລັດແລ້ວ');
      }
    } catch (err) {
      console.error("Error deleting zone:", err);
      showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການລຶບຂໍ້ມູນ', 'error');
    } finally {
      setLoading(false);
      setSelectedZoneId(null);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter zones based on search
  const filteredZones = zones.filter(zone => {
    return (
      zone.zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zone.zone_detail.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <Layout title="ຈັດການຂໍ້ມູນບ່ອນຈັດວາງ">
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
                <TableCell align="center">ໂຊນ</TableCell>
                <TableCell align="center">ລາຍລະອຽດ</TableCell>
                <TableCell align="center" width={120}>ແກ້ໄຂ</TableCell>
                <TableCell align="center" width={120}>ລຶບ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredZones.length > 0 ? (
                filteredZones.map((zone, index) => (
                  <TableRow key={zone.zone_id} hover>
                    <TableCell align="center">{index + 1}</TableCell>
                    <TableCell align="center">{zone.zone}</TableCell>
                    <TableCell align="center">{zone.zone_detail}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="ແກ້ໄຂ">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleOpenEditDialog(zone)}
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
                          onClick={() => handleOpenDeleteDialog(zone.zone_id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
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

      {/* Add Dialog */}
      <Dialog 
        open={openAddDialog} 
        onClose={handleCloseAddDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          ເພີ່ມບ່ອນຈັດວາງໃໝ່
          <IconButton
            aria-label="close"
            onClick={handleCloseAddDialog}
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="ໂຊນ"
                  name="zone"
                  value={currentZone.zone}
                  onChange={handleChange}
                  required
                  autoFocus
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="ລາຍລະອຽດ"
                  name="zone_detail"
                  value={currentZone.zone_detail}
                  onChange={handleChange}
                  required
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog} color="error" variant="outlined">
            ຍົກເລີກ
          </Button>
          <Button 
            onClick={handleAddZone} 
            color="primary" 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'ບັນທຶກ'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog 
        open={openEditDialog} 
        onClose={handleCloseEditDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          ແກ້ໄຂຂໍ້ມູນບ່ອນຈັດວາງ
          <IconButton
            aria-label="close"
            onClick={handleCloseEditDialog}
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="ໂຊນ"
                  name="zone"
                  value={currentZone.zone}
                  onChange={handleChange}
                  required
                  autoFocus
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="ລາຍລະອຽດ"
                  name="zone_detail"
                  value={currentZone.zone_detail}
                  onChange={handleChange}
                  required
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} color="error" variant="outlined">
            ຍົກເລີກ
          </Button>
          <Button 
            onClick={handleSaveEdit} 
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
        onConfirm={handleDeleteZone}
        itemId={selectedZoneId}
        loading={loading}
      />
    </Layout>
  );
}

export default Warehouse;