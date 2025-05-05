import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Save as SaveIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { getCurrentUser, updateUserProfile } from '../services/authService';
import axios from 'axios';
import API_BASE_URL from '../config/api';

function UserProfile() {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    emp_name: '',
    emp_lname: '',
    gender: '',
    date_of_b: '',
    tel: '',
    address: '',
    username: '',
    password: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch user data when component mounts
  useEffect(() => {
    fetchUserData();
  }, []);

  // Function to fetch user data
  const fetchUserData = async () => {
    setLoading(true);
    try {
      // First try to get user from auth service
      const currentUser = getCurrentUser();
      
      if (currentUser && currentUser.emp_id) {
        // If we have an emp_id, fetch complete user data from API
        try {
          const response = await axios.post(`${API_BASE_URL}/users/Employee/With/ID`, {
            emp_id: currentUser.emp_id
          });
          
          if (response.data && response.data.result_code === "200") {
            const userData = response.data.user_info[0] || currentUser;
            setUser(userData);
            
            // Initialize form data
            setFormData({
              emp_name: userData.emp_name || '',
              emp_lname: userData.emp_lname || '',
              gender: userData.gender || '',
              date_of_b: formatDateForInput(userData.date_of_b) || '',
              tel: userData.tel || '',
              address: userData.address || '',
              username: userData.username || '',
              password: '',
              currentPassword: '',
              newPassword: '',
              confirmPassword: ''
            });
          } else {
            // If API call fails, use the data from auth service
            setUser(currentUser);
            setFormData({
              emp_name: currentUser.emp_name || '',
              emp_lname: currentUser.emp_lname || '',
              gender: currentUser.gender || '',
              date_of_b: formatDateForInput(currentUser.date_of_b) || '',
              tel: currentUser.tel || '',
              address: currentUser.address || '',
              username: currentUser.username || '',
              password: '',
              currentPassword: '',
              newPassword: '',
              confirmPassword: ''
            });
          }
        } catch (apiError) {
          console.error("Error fetching user details:", apiError);
          // Fall back to current user from auth service
          setUser(currentUser);
          setFormData({
            emp_name: currentUser.emp_name || '',
            emp_lname: currentUser.emp_lname || '',
            gender: currentUser.gender || '',
            date_of_b: formatDateForInput(currentUser.date_of_b) || '',
            tel: currentUser.tel || '',
            address: currentUser.address || '',
            username: currentUser.username || '',
            password: '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
        }
      } else {
        setError("ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້");
      }
    } catch (err) {
      console.error("Error getting user data:", err);
      setError("ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນຜູ້ໃຊ້");
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // Try parsing different date formats
        if (dateString.includes('/')) {
          // If already in DD/MM/YYYY format
          return dateString;
        }
        return '-';
      }
      
      // Format to DD/MM/YYYY
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error("Date formatting error:", error);
      return dateString;
    }
  };

  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    
    try {
      let date;
      
      // Handle DD/MM/YYYY format
      if (dateString.includes('/')) {
        const parts = dateString.split('/');
        if (parts.length === 3) {
          // Convert from DD/MM/YYYY to YYYY-MM-DD
          date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        } else {
          date = new Date(dateString);
        }
      } else {
        date = new Date(dateString);
      }
      
      if (isNaN(date.getTime())) {
        return '';
      }
      
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    } catch (error) {
      console.error("Date input formatting error:", error);
      return '';
    }
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    if (editMode) {
      // Reset form data when canceling
      setFormData({
        emp_name: user.emp_name || '',
        emp_lname: user.emp_lname || '',
        gender: user.gender || '',
        date_of_b: formatDateForInput(user.date_of_b) || '',
        tel: user.tel || '',
        address: user.address || '',
        username: user.username || '',
        password: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
    setEditMode(!editMode);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Validate password fields if attempting to change password
      if (formData.newPassword || formData.confirmPassword) {
        if (!formData.currentPassword) {
          throw new Error("ກະລຸນາປ້ອນລະຫັດຜ່ານປັດຈຸບັນ");
        }
        
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error("ລະຫັດຜ່ານໃໝ່ແລະການຢືນຢັນບໍ່ກົງກັນ");
        }
      }
      
      // Prepare data for API
      const updateData = {
        emp_id: user.emp_id,
        emp_name: formData.emp_name,
        emp_lname: formData.emp_lname,
        gender: formData.gender,
        date_of_b: formData.date_of_b,
        tel: formData.tel,
        address: formData.address,
        username: formData.username,
        status: user.status,
        active: user.active,
      };
      
      // Add password only if changing it
      if (formData.newPassword) {
        updateData.password = formData.newPassword;
        // In a real app, you would also send currentPassword for verification
      }
      
      // Send update request to API
      const response = await axios.put(`${API_BASE_URL}/users/Update/Emp`, updateData);
      
      if (response.data && response.data.result_code === "200") {
        // Update local user data
        setUser({
          ...user,
          ...updateData
        });
        
        // Update auth service user data
        const updatedUser = {
          ...getCurrentUser(),
          ...updateData
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setSuccess(true);
        setEditMode(false);
      } else {
        throw new Error(response.data?.result || "ການອັບເດດບໍ່ສຳເລັດ");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message || "ເກີດຂໍ້ຜິດພາດໃນການອັບເດດໂປຣໄຟລ໌");
    } finally {
      setLoading(false);
    }
  };

  // Close success message
  const handleCloseSuccess = () => {
    setSuccess(false);
  };

  // Close error message
  const handleCloseError = () => {
    setError(null);
  };

  // Get initials for avatar
  const getInitials = () => {
    if (!user) return "U";
    
    const firstName = user.emp_name || "";
    const lastName = user.emp_lname || "";
    
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };

  return (
    <Layout title="ຂໍ້ມູນສ່ວນຕົວ">
      {/* Success message */}
      <Snackbar
        open={success}
        autoHideDuration={5000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSuccess}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          ອັບເດດຂໍ້ມູນສຳເລັດແລ້ວ
        </Alert>
      </Snackbar>
      
      {/* Error message */}
      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseError}
          severity="error"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
      
      {loading && !user ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto', borderRadius: 2 }}>
          {/* Profile header with avatar */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar
              sx={{ 
                width: 80, 
                height: 80,
                bgcolor: 'primary.main',
                fontSize: '2rem',
                mr: 3
              }}
            >
              {getInitials()}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {user?.emp_name} {user?.emp_lname}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {user?.status || 'ຜູ້ໃຊ້'}
              </Typography>
            </Box>
            <Box sx={{ ml: 'auto' }}>
              <Button
                variant={editMode ? "outlined" : "contained"}
                color={editMode ? "error" : "primary"}
                onClick={toggleEditMode}
                startIcon={editMode ? <CancelIcon /> : <EditIcon />}
                sx={{ mb: 1 }}
              >
                {editMode ? 'ຍົກເລີກ' : 'ແກ້ໄຂຂໍ້ມູນ'}
              </Button>
            </Box>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          {/* User information */}
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ຊື່"
                  name="emp_name"
                  value={formData.emp_name}
                  onChange={handleChange}
                  disabled={!editMode}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ນາມສະກຸນ"
                  name="emp_lname"
                  value={formData.emp_lname}
                  onChange={handleChange}
                  disabled={!editMode}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={!editMode} required>
                  <InputLabel id="gender-label">ເພດ</InputLabel>
                  <Select
                    labelId="gender-label"
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
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
                  label="ວັນເດືອນປີເກີດ"
                  name="date_of_b"
                  type="date"
                  value={formData.date_of_b}
                  onChange={handleChange}
                  disabled={!editMode}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ເບີໂທ"
                  name="tel"
                  value={formData.tel}
                  onChange={handleChange}
                  disabled={!editMode}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ຊື່ຜູ້ໃຊ້"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={!editMode}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="ທີ່ຢູ່"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={!editMode}
                  multiline
                  rows={3}
                />
              </Grid>
              
              {/* Password fields (only visible in edit mode) */}
              {editMode && (
                <>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="h6" sx={{ mb: 2, mt: 1 }}>
                      ປ່ຽນລະຫັດຜ່ານ (ຖ້າຕ້ອງການ)
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="ລະຫັດຜ່ານປັດຈຸບັນ"
                      name="currentPassword"
                      type="password"
                      value={formData.currentPassword}
                      onChange={handleChange}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="ລະຫັດຜ່ານໃໝ່"
                      name="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={handleChange}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="ຢືນຢັນລະຫັດຜ່ານໃໝ່"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      error={formData.newPassword !== formData.confirmPassword && formData.confirmPassword !== ''}
                      helperText={formData.newPassword !== formData.confirmPassword && formData.confirmPassword !== '' ? "ລະຫັດຜ່ານບໍ່ກົງກັນ" : ""}
                    />
                  </Grid>
                </>
              )}
              
              {/* Submit button (only visible in edit mode) */}
              {editMode && (
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    disabled={loading}
                    sx={{ px: 4 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'ບັນທຶກ'}
                  </Button>
                </Grid>
              )}
            </Grid>
          </Box>
          
          {!editMode && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem', textAlign: 'center' }}>
                ກົດປຸ່ມ "ແກ້ໄຂຂໍ້ມູນ" ເພື່ອປ່ຽນແປງຂໍ້ມູນສ່ວນຕົວຂອງທ່ານ
              </Typography>
            </Box>
          )}
        </Paper>
      )}
    </Layout>
  );
}

export default UserProfile;