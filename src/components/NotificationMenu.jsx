import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  Badge,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  Tabs,
  Tab,
  Button,
  Paper
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Inventory as InventoryIcon,
  MoveToInbox as ImportIcon,
  LocalShipping as ExportIcon,
  Error as ErrorIcon,
  MoreHoriz as MoreIcon
} from '@mui/icons-material';
import { getAllNotifications } from '../services/notificationService';
import NotificationsDialog from './NotificationsDialog';

const NotificationItem = ({ notification, onClose }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    // ຈັດການການນຳທາງໄປຍັງໜ້າທີ່ກ່ຽວຂ້ອງ
    switch (notification.type) {
      case 'lowStock':
        navigate('/products');
        break;
      case 'pendingImport':
        navigate('/import');
        break;
      case 'pendingExport':
        navigate('/export-detail');
        break;
      default:
        break;
    }
    
    // ປິດເມນູເມື່ອກົດທີ່ລາຍການ
    if (onClose) onClose();
  };
  
  // ຈັດຮູບແບບວັນທີເວລາໃຫ້ອ່ານງ່າຍ
  const formatDate = (date) => {
    if (!date) return '';
    
    const now = new Date();
    const notifDate = new Date(date);
    
    // ຖ້າເປັນມື້ດຽວກັນ, ສະແດງແຕ່ເວລາ
    if (now.toDateString() === notifDate.toDateString()) {
      return notifDate.toLocaleTimeString('lo-LA', { hour: '2-digit', minute: '2-digit' });
    }
    
    // ຖ້າເປັນປີດຽວກັນ, ບໍ່ຕ້ອງສະແດງປີ
    if (now.getFullYear() === notifDate.getFullYear()) {
      return notifDate.toLocaleDateString('lo-LA', { day: 'numeric', month: 'short' });
    }
    
    // ຖ້າເປັນປີຕ່າງກັນ, ສະແດງວັນທີເຕັມ
    return notifDate.toLocaleDateString('lo-LA', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  
  // ເລືອກໄອຄອນຕາມປະເພດການແຈ້ງເຕືອນ
  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'lowStock':
        return <InventoryIcon color="error" />;
      case 'pendingImport':
        return <ImportIcon color="warning" />;
      case 'pendingExport':
        return <ExportIcon color="warning" />;
      default:
        return <ErrorIcon color="error" />;
    }
  };
  
  return (
    <ListItem
      sx={{
        borderLeft: 3,
        borderLeftColor: notification.read ? 'transparent' : 'primary.main',
        '&:hover': { bgcolor: 'action.hover', cursor: 'pointer' }
      }}
      onClick={handleClick}
    >
      <ListItemIcon>
        {getNotificationIcon()}
      </ListItemIcon>
      <ListItemText
        primary={notification.title}
        secondary={notification.message}
      />
      <Typography variant="body2" color="text.secondary" sx={{ ml: 1, fontSize: '0.75rem' }}>
        {formatDate(notification.date)}
      </Typography>
    </ListItem>
  );
};

function NotificationMenu({ anchorEl, open, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  
  // ດຶງຂໍ້ມູນການແຈ້ງເຕືອນເມື່ອເມນູຖືກເປີດ
  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);
  
  // ດຶງຂໍ້ມູນການແຈ້ງເຕືອນຈາກ API
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await getAllNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // ຈັດການການປ່ຽນແປງແທັບ
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // ເປີດກ່ອງໂຕ້ຕອບການແຈ້ງເຕືອນທັງໝົດ
  const handleOpenAllNotifications = () => {
    onClose(); // ປິດເມນູ
    setDialogOpen(true); // ເປີດກ່ອງໂຕ້ຕອບ
  };
  
  // ປິດກ່ອງໂຕ້ຕອບການແຈ້ງເຕືອນທັງໝົດ
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  
  // ກັ່ນຕອງການແຈ້ງເຕືອນຕາມແທັບທີ່ເລືອກ
  const filteredNotifications = () => {
    if (tabValue === 0) {
      return notifications; // ທັງໝົດ
    } else if (tabValue === 1) {
      return notifications.filter(n => n.type === 'lowStock'); // ສິນຄ້າໃກ້ໝົດ
    } else if (tabValue === 2) {
      return notifications.filter(n => n.type === 'pendingImport' || n.type === 'pendingExport'); // ລໍຖ້າອະນຸມັດ
    }
    return [];
  };
  
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        elevation: 3,
        sx: {
          width: 360,
          maxHeight: 500,
          overflow: 'hidden',
          borderRadius: 2
        }
      }}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="subtitle1" fontWeight="bold">
          ການແຈ້ງເຕືອນ
        </Typography>
      </Box>
      
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="ທັງໝົດ" />
        <Tab 
          label={
            <Badge badgeContent={notifications.filter(n => n.type === 'lowStock').length} color="error">
              ສິນຄ້າໃກ້ໝົດ
            </Badge>
          } 
        />
        <Tab 
          label={
            <Badge 
              badgeContent={
                notifications.filter(n => n.type === 'pendingImport' || n.type === 'pendingExport').length
              } 
              color="warning"
            >
              ລໍຖ້າອະນຸມັດ
            </Badge>
          } 
        />
      </Tabs>
      
      <Box sx={{ maxHeight: 350, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredNotifications().length > 0 ? (
          <List>
            {filteredNotifications().map((notification) => (
              <React.Fragment key={notification.id}>
                <NotificationItem notification={notification} onClose={onClose} />
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              ບໍ່ມີການແຈ້ງເຕືອນໃໝ່
            </Typography>
          </Box>
        )}
      </Box>
      
      <Divider />
      
      <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography 
          variant="body2" 
          sx={{ color: 'primary.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          onClick={() => {
            fetchNotifications();
          }}
        >
          ໂຫຼດຄືນໃໝ່
        </Typography>
        
        <Button
          variant="text"
          color="primary"
          size="small"
          endIcon={<MoreIcon />}
          onClick={handleOpenAllNotifications}
        >
          ເບິ່ງທັງໝົດ
        </Button>
      </Box>
      
      {/* ກ່ອງໂຕ້ຕອບສະແດງລາຍລະອຽດການແຈ້ງເຕືອນທັງໝົດ */}
      <NotificationsDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
      />
    </Menu>
  );
}

export default NotificationMenu;