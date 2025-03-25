import React, { useState } from 'react';
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
  Alert
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

function Units() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([
    { id: 1, name: 'samsung' },
    { id: 2, name: 'LG' },
    { id: 3, name: 'Panasonic' },
    { id: 4, name: 'Toshiba' },
    { id: 5, name: 'Philips' }
  ]);

  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Form state
  const [currentCategory, setCurrentCategory] = useState({
    name: ''
  });

  // Open add dialog
  const handleOpenAddDialog = () => {
    setCurrentCategory({ name: '' });
    setOpenAddDialog(true);
  };

  // Close add dialog
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  // Open edit dialog
  const handleOpenEditDialog = (category) => {
    setCurrentCategory({ ...category });
    setOpenEditDialog(true);
  };

  // Close edit dialog
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentCategory(prev => ({
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

  // Add new category
  const handleAddCategory = () => {
    if (!currentCategory.name.trim()) {
      showSnackbar('ກະລຸນາປ້ອນຊື່ໝວດໝູ່', 'error');
      return;
    }
    
    const newCategory = {
      ...currentCategory,
      id: categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1
    };
    
    setCategories([...categories, newCategory]);
    setOpenAddDialog(false);
    showSnackbar('ເພີ່ມໝວດໝູ່ສຳເລັດແລ້ວ');
  };

  // Save edited category
  const handleSaveEdit = () => {
    if (!currentCategory.name.trim()) {
      showSnackbar('ກະລຸນາປ້ອນຊື່ໝວດໝູ່', 'error');
      return;
    }
    
    setCategories(categories.map(c => 
      c.id === currentCategory.id ? currentCategory : c
    ));
    setOpenEditDialog(false);
    showSnackbar('ແກ້ໄຂໝວດໝູ່ສຳເລັດແລ້ວ');
  };

  // Open delete confirmation
  const handleOpenDeleteDialog = (id) => {
    setSelectedCategoryId(id);
    setOpenDeleteDialog(true);
  };

  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedCategoryId(null);
  };

  // Delete category
  const handleDeleteCategory = (id) => {
    setCategories(categories.filter(category => category.id !== id));
    setOpenDeleteDialog(false);
    showSnackbar('ລຶບໝວດໝູ່ສຳເລັດແລ້ວ');
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter categories based on search
  const filteredCategories = categories.filter(category => {
    return category.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <Layout title="ຈັດການຂໍ້ມູນໝວດໝູ່">
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

      <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 240px)', overflow: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell align="center" width={80}>#</TableCell>
              <TableCell>ຊື່ໝວດໝູ່</TableCell>
              <TableCell align="center" width={120}>ແກ້ໄຂ</TableCell>
              <TableCell align="center" width={120}>ລຶບ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category, index) => (
                <TableRow key={category.id} hover>
                  <TableCell align="center">{index + 1}</TableCell>
                  <TableCell>{category.name}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="ແກ້ໄຂ">
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleOpenEditDialog(category)}
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
                        onClick={() => handleOpenDeleteDialog(category.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography variant="body1" sx={{ py: 2, color: 'text.secondary' }}>
                    ບໍ່ພົບຂໍ້ມູນ
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Dialog */}
      <Dialog 
        open={openAddDialog} 
        onClose={handleCloseAddDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          ເພີ່ມໝວດໝູ່ໃໝ່
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
            <TextField
              fullWidth
              label="ຊື່ໝວດໝູ່"
              name="name"
              value={currentCategory.name}
              onChange={handleChange}
              required
              autoFocus
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog} color="error" variant="outlined">
            ຍົກເລີກ
          </Button>
          <Button onClick={handleAddCategory} color="primary" variant="contained">
            ບັນທຶກ
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
          ແກ້ໄຂຂໍ້ມູນໝວດໝູ່
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
            <TextField
              fullWidth
              label="ຊື່ໝວດໝູ່"
              name="name"
              value={currentCategory.name}
              onChange={handleChange}
              required
              autoFocus
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} color="error" variant="outlined">
            ຍົກເລີກ
          </Button>
          <Button onClick={handleSaveEdit} color="primary" variant="contained">
            ບັນທຶກ
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteCategory}
        itemId={selectedCategoryId}
      />

      {/* Snackbar Notification */}
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
    </Layout>
  );
}

export default Units;