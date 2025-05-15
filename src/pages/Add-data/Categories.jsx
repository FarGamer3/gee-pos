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
  CircularProgress
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
  getAllCategories,
  addCategory,
  updateCategory,
  deleteCategory
} from '../../services/categoryService';

function Categories() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    category: '',
    cat_id: null
  });

  // ດຶງຂໍ້ມູນທັງໝົດເມື່ອໜ້າຖືກໂຫຼດ
  useEffect(() => {
    fetchCategories();
  }, []);

  // ຟັງຊັນດຶງຂໍ້ມູນປະເພດສິນຄ້າ
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getAllCategories();
      setCategories(data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError('ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ');
    } finally {
      setLoading(false);
    }
  };

  // Open add dialog
  const handleOpenAddDialog = () => {
    setCurrentCategory({ category: '', cat_id: null });
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
  const handleAddCategory = async () => {
    if (!currentCategory.category.trim()) {
      showSnackbar('ກະລຸນາປ້ອນຊື່ປະເພດ', 'error');
      return;
    }

    setLoading(true);
    try {
      const result = await addCategory(currentCategory.category);
      
      if (result) {
        await fetchCategories(); // ດຶງຂໍ້ມູນໃໝ່
        setOpenAddDialog(false);
        showSnackbar('ເພີ່ມປະເພດສຳເລັດແລ້ວ');
      }
    } catch (err) {
      console.error("Error adding category:", err);
      showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການເພີ່ມຂໍ້ມູນ', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Save edited category
  const handleSaveEdit = async () => {
    if (!currentCategory.category.trim()) {
      showSnackbar('ກະລຸນາປ້ອນຊື່ປະເພດ', 'error');
      return;
    }

    setLoading(true);
    try {
      const result = await updateCategory(currentCategory.cat_id, currentCategory.category);
      
      if (result) {
        await fetchCategories(); // ດຶງຂໍ້ມູນໃໝ່
        setOpenEditDialog(false);
        showSnackbar('ແກ້ໄຂປະເພດສຳເລັດແລ້ວ');
      }
    } catch (err) {
      console.error("Error updating category:", err);
      showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການແກ້ໄຂຂໍ້ມູນ', 'error');
    } finally {
      setLoading(false);
    }
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
  const handleDeleteCategory = async (id) => {
    setLoading(true);
    try {
      const result = await deleteCategory(id);
      
      if (result) {
        await fetchCategories(); // ດຶງຂໍ້ມູນໃໝ່
        setOpenDeleteDialog(false);
        showSnackbar('ລຶບປະເພດສຳເລັດແລ້ວ');
      }
    } catch (err) {
      console.error("Error deleting category:", err);
      showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການລຶບຂໍ້ມູນ', 'error');
    } finally {
      setLoading(false);
      setSelectedCategoryId(null);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter categories based on search
  const filteredCategories = categories.filter(category => {
    return category.category.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <Layout title="ຈັດການຂໍ້ມູນປະເພດ">
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
                <TableCell align="center" width={80}>#</TableCell>
                <TableCell>ຊື່ປະເພດ</TableCell>
                <TableCell align="center" width={120}>ແກ້ໄຂ</TableCell>
                <TableCell align="center" width={120}>ລຶບ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category, index) => (
                  <TableRow key={category.cat_id} hover>
                    <TableCell align="center">{index + 1}</TableCell>
                    <TableCell>{category.category}</TableCell>
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
                          onClick={() => handleOpenDeleteDialog(category.cat_id)}
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
          ເພີ່ມປະເພດໃໝ່
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
              label="ຊື່ປະເພດ"
              name="category"
              value={currentCategory.category}
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
          <Button 
            onClick={handleAddCategory} 
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
          ແກ້ໄຂຂໍ້ມູນປະເພດ
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
              label="ຊື່ປະເພດ"
              name="category"
              value={currentCategory.category}
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
        onConfirm={handleDeleteCategory}
        itemId={selectedCategoryId}
        loading={loading}
      />
    </Layout>
  );
}

export default Categories;