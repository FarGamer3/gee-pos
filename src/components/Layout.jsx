import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Badge,
  Container,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import {
  Home as HomeIcon,
  Category as CategoryIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  MoveToInbox as ImportIcon,
  LocalShipping as ExportIcon,
  Assessment as ReportIcon,
  Menu as MenuIcon,
  Notifications as NotificationIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';
import { getCurrentUser, logout } from '../services/authService';
import logoImage from '../assets/logo.png';

// Drawer width
const drawerWidth = 250;

export default function Layout({ children, title, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  
  // ດຶງຂໍ້ມູນຜູ້ໃຊ້ທີ່ເຂົ້າສູ່ລະບົບ
  const currentUser = getCurrentUser();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  // ເປີດເມນູຜູ້ໃຊ້
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  // ປິດເມນູຜູ້ໃຊ້
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // ຈັດການການອອກຈາກລະບົບ
  const handleLogout = () => {
    handleMenuClose();
    logout();
    
    // ຖ້າມີການສົ່ງ callback onLogout, ໃຫ້ເອີ້ນໃຊ້
    if (onLogout) {
      onLogout();
    } else {
      // ຖ້າບໍ່ມີ callback, ນຳທາງກັບໄປຍັງໜ້າເຂົ້າສູ່ລະບົບ
      navigate('/login');
    }
  };

  const menuItems = [
    { text: 'ໜ້າຫຼັກ', icon: <HomeIcon />, path: '/dashboard' },
    { text: 'ຈັດການຂໍ້ມູນຫຼັກ', icon: <CategoryIcon />, path: '/Manage_data' },
    { text: 'ສັ່ງຊື້ສິນຄ້າ', icon: <InventoryIcon />, path: '/Buy' },
    { text: 'ຂາຍສິນຄ້າ', icon: <ShoppingCartIcon />, path: '/sales' },
    { text: 'ນຳເຂົ້າສິນຄ້າ', icon: <ImportIcon />, path: '/import' },
    { text: 'ນຳອອກສິນຄ້າ', icon: <ExportIcon />, path: '/export' },
    { text: 'ລາຍງານ', icon: <ReportIcon />, path: '/reports' },
  ];

  const drawer = (
    <div>
      <Toolbar sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <Avatar
          src={logoImage}
          alt="GeePOS Logo"
          sx={{
            width: 80,
            height: 80,
            bgcolor: 'white'
          }}
        />
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
                py: 1.5
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        color="default"
        elevation={1}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <IconButton size="large" color="inherit">
            <Badge badgeContent={4} color="error">
              <NotificationIcon />
            </Badge>
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
            <Tooltip title="ຈັດການບັນຊີຜູ້ໃຊ້">
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenuOpen}
                color="inherit"
              >
                <AccountCircleIcon />
              </IconButton>
            </Tooltip>
            <Typography variant="body1" sx={{ ml: 1 }}>
              {currentUser ? `${currentUser.emp_name || 'Admin_user'}` : 'Admin_user'}
            </Typography>
            
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleMenuClose}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="inherit">ຂໍ້ມູນຜູ້ໃຊ້</Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" color="error" />
                </ListItemIcon>
                <Typography variant="inherit" color="error">ອອກຈາກລະບົບ</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Sidebar / Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: (theme) => theme.palette.primary.main,
              color: 'white'
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: (theme) => theme.palette.primary.main,
              color: 'white'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          backgroundColor: (theme) => theme.palette.background.default,
        }}
      >
        {title && (
          <Typography 
            variant="h2" 
            component="h1" 
            sx={{
              color: 'black', 
              fontWeight: 'bold',
              mb: 3
            }}
            style={{
              marginLeft: '0.5%',
            }}
          >
            {title}
          </Typography>
        )}
        
        <Container maxWidth="xl" disableGutters>
          {children}
        </Container>
      </Box>
    </Box>
  );
}