import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  Typography, 
  Box, 
  Button,
  IconButton
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon, 
  Cancel as CancelIcon 
} from '@mui/icons-material';

// Success Dialog component
export const SuccessDialog = ({ open, onClose, onDashboard }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: { 
          borderRadius: 3,
          maxWidth: 380,
          width: '100%',
          p: 2
        }
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
        <Box 
          sx={{ 
            bgcolor: '#00c853', 
            borderRadius: '50%', 
            width: 80, 
            height: 80, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            mb: 2
          }}
        >
          <CheckCircleIcon sx={{ color: 'white', fontSize: 50 }} />
        </Box>
        
        <Typography variant="h5" component="h2" fontWeight="bold" align="center" sx={{ mb: 1 }}>
          ສຳເລັດແລ້ວ
        </Typography>
        
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
          ລາຍການຂອງທ່ານໄດ້ຖືກບັນທຶກສຳເລັດແລ້ວ
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
          <Button 
            variant="outlined" 
            color="inherit"
            fullWidth
            onClick={onClose}
            sx={{ 
              borderRadius: 2,
              py: 1.2,
              color: 'text.secondary',
              borderColor: 'divider'
            }}
          >
            ຍົກເລີກ
          </Button>
          
          <Button 
            variant="contained" 
            color="success"
            fullWidth
            onClick={onDashboard}
            sx={{ 
              borderRadius: 2,
              py: 1.2
            }}
          >
            ເບິ່ງລາຍການ
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

// Error/Failure Dialog component
export const ErrorDialog = ({ open, onClose, onTryAgain }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: { 
          borderRadius: 3,
          maxWidth: 380,
          width: '100%',
          p: 2
        }
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
        <Box 
          sx={{ 
            bgcolor: '#f44336', 
            borderRadius: '50%', 
            width: 80, 
            height: 80, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            mb: 2
          }}
        >
          <CancelIcon sx={{ color: 'white', fontSize: 50 }} />
        </Box>
        
        <Typography variant="h5" component="h2" fontWeight="bold" align="center" sx={{ mb: 1 }}>
          ຂໍອະໄພ
        </Typography>
        
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
          ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
          <Button 
            variant="outlined" 
            color="inherit"
            fullWidth
            onClick={onClose}
            sx={{ 
              borderRadius: 2,
              py: 1.2,
              color: 'text.secondary',
              borderColor: 'divider'
            }}
          >
            ຍົກເລີກ
          </Button>
          
          <Button 
            variant="contained" 
            color="error"
            fullWidth
            onClick={onTryAgain}
            sx={{ 
              borderRadius: 2,
              py: 1.2
            }}
          >
            ລອງໃໝ່
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default { SuccessDialog, ErrorDialog };