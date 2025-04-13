import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Avatar,
  Container,
  InputAdornment,
  IconButton,
  Divider,
  CircularProgress,
  Paper,
  Alert,
  Snackbar
} from '@mui/material';
import {
  LockOutlined as LockOutlinedIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { login, isAuthenticated } from '../services/authService';
import logoImage from '../assets/logo.png';
import bgimg from '../assets/login-bg.jpg';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // ກວດສອບເມື່ອໜ້າຖືກໂຫຼດວ່າມີການເຂົ້າສູ່ລະບົບໄວ້ແລ້ວຫຼືບໍ່
  useEffect(() => {
    // ຖ້າມີການເຂົ້າສູ່ລະບົບແລ້ວແມ່ນໃຫ້ເຂົ້າສູ່ dashboard ທັນທີ
    if (isAuthenticated()) {
      onLogin();
    }
  }, [onLogin]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ກວດສອບຂໍ້ມູນປ້ອນເຂົ້າ
    if (!username.trim() || !password.trim()) {
      setError('ກະລຸນາປ້ອນຊື່ຜູ້ໃຊ້ ແລະ ລະຫັດຜ່ານ');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // ເຊື່ອມຕໍ່ກັບ API ເພື່ອກວດສອບການເຂົ້າສູ່ລະບົບ
      const user = await login(username, password);
      
      // ຖ້າສຳເລັດ, ຮຽກໃຊ້ onLogin ເພື່ອເຂົ້າສູ່ໜ້າຫຼັກ
      onLogin();
      
    } catch (err) {
      setError(err.message || 'ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseAlert = () => {
    setError(null);
  };
  
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `url(${bgimg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          zIndex: 1
        }
      }}
    >
      <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 2 }}>
        <Paper 
          elevation={5}
          sx={{ 
            borderRadius: 3,
            overflow: 'hidden'
          }}
        >
          <Box 
            sx={{ 
              bgcolor: 'primary.main',
              color: 'white',
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <Avatar 
              src={logoImage} 
              alt="GeePOS Logo"
              sx={{ 
                width: 100, 
                height: 100, 
                bgcolor: 'white',
                boxShadow: 2,
                mb: 2
              }}
            />
            <Typography component="h1" variant="h4" fontWeight="bold" align="center">
              GeePOS
            </Typography>
            <Typography variant="subtitle1" align="center">
              ລະບົບບໍລິຫານຈັດການສິນຄ້າ
            </Typography>
          </Box>
          
          <CardContent sx={{ p: 4 }}>
            <Typography component="h2" variant="h5" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
              ເຂົ້າສູ່ລະບົບ
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={handleCloseAlert}>
                {error}
              </Alert>
            )}
            
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="ຊື່ຜູ້ໃຊ້"
                name="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="ລະຫັດຜ່ານ"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                sx={{ mt: 4, mb: 2, py: 1.5, borderRadius: 2 }}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'ເຂົ້າສູ່ລະບົບ'
                )}
              </Button>
            </Box>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Typography variant="body2" color="text.secondary" align="center">
                © GeePOS {new Date().getFullYear()}. ໂດຍ ທີມພັດທະນາ
              </Typography>
            </Box>
          </CardContent>
        </Paper>
      </Container>
    </Box>
  );
}

export default Login;