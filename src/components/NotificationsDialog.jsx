import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Box,
  Tabs,
  Tab,
  Badge,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  Inventory as InventoryIcon,
  MoveToInbox as ImportIcon,
  LocalShipping as ExportIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { getAllNotifications } from '../services/notificationService';

function NotificationsDialog({ open, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();
  
  // ດຶງຂໍ້ມູນການແຈ້ງເຕືອນເມື່ອກ່ອງໂຕ້ຕອບຖືກເປີດ
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
  
  // ຈັດການການກົດທີ່ການແຈ້ງເຕືອນ
  const handleNotificationClick = (notification) => {
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
    
    // ປິດກ່ອງໂຕ້ຕອບ
    onClose();
  };
  
  // ຈັດຮູບແບບວັນທີເວລາໃຫ້ອ່ານງ່າຍ
  const formatDate = (date) => {
    if (!date) return '';
    
    try {
      const notifDate = new Date(date);
      return notifDate.toLocaleString('lo-LA', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '';
    }
  };
  
  // ເລືອກໄອຄອນຕາມປະເພດການແຈ້ງເຕືອນ
  const getNotificationIcon = (type) => {
    switch (type) {
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
  
  // ເລືອກສີຂອງ chip ຕາມປະເພດການແຈ້ງເຕືອນ
  const getChipColor = (type) => {
    switch (type) {
      case 'lowStock':
        return 'error';
      case 'pendingImport':
      case 'pendingExport':
        return 'warning';
      default:
        return 'default';
    }
  };
  
  // ຕັ້ງຄ່າຂໍ້ຄວາມ chip ຕາມປະເພດການແຈ້ງເຕືອນ
  const getChipLabel = (type) => {
    switch (type) {
      case 'lowStock':
        return 'ສິນຄ້າໃກ້ໝົດ';
      case 'pendingImport':
        return 'ລໍຖ້ານຳເຂົ້າ';
      case 'pendingExport':
        return 'ລໍຖ້ານຳອອກ';
      default:
        return 'ທົ່ວໄປ';
    }
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', pb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">ການແຈ້ງເຕືອນທັງໝົດ</Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
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
      </Box>
      
      <DialogContent dividers sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <CircularProgress />
          </Box>
        ) : filteredNotifications().length > 0 ? (
          <List sx={{ pt: 0 }}>
            {filteredNotifications().map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem 
                  button 
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    py: 1.5,
                    borderLeft: 4,
                    borderLeftColor: notification.read ? 'transparent' : 'primary.main',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <ListItemIcon>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">{notification.title}</Typography>
                        <Chip 
                          label={getChipLabel(notification.type)} 
                          color={getChipColor(notification.type)} 
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.primary">
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(notification.date)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < filteredNotifications().length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <Typography color="text.secondary">
              ບໍ່ມີການແຈ້ງເຕືອນ
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button 
          onClick={() => {
            fetchNotifications();
          }}
          startIcon={<CheckCircleIcon />}
        >
          ອັບເດດ
        </Button>
        <Button onClick={onClose} variant="contained" color="primary">
          ປິດ
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default NotificationsDialog;