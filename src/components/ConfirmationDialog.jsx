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
  DeleteForever as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  HelpOutline as HelpOutlineIcon,
  Cancel as CancelIcon 
} from '@mui/icons-material';

// Confirmation Dialog for Delete
export const DeleteConfirmDialog = ({ open, onClose, onConfirm, itemId }) => {
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
          <DeleteIcon sx={{ color: 'white', fontSize: 50 }} />
        </Box>
        
        <Typography variant="h5" component="h2" fontWeight="bold" align="center" sx={{ mb: 1 }}>
          ຢືນຢັນການລົບ
        </Typography>
        
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
          ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລົບລາຍການສັ່ງຊື້ນີ້? ການກະທຳນີ້ບໍ່ສາມາດຍ້ອນກັບໄດ້.
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
            onClick={() => onConfirm(itemId)}
            sx={{ 
              borderRadius: 2,
              py: 1.2
            }}
          >
            ລົບ
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

// Confirmation Dialog for Approve
export const ApproveConfirmDialog = ({ open, onClose, onConfirm, itemId }) => {
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
            bgcolor: '#1976d2', 
            borderRadius: '50%', 
            width: 80, 
            height: 80, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            mb: 2
          }}
        >
          <HelpOutlineIcon sx={{ color: 'white', fontSize: 50 }} />
        </Box>
        
        <Typography variant="h5" component="h2" fontWeight="bold" align="center" sx={{ mb: 1 }}>
          ຢືນຢັນການອະນຸມັດ
        </Typography>
        
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
          ທ່ານຕ້ອງການອະນຸມັດການສັ່ງຊື້ນີ້ບໍ່?
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
            color="primary"
            fullWidth
            onClick={() => onConfirm(itemId)}
            sx={{ 
              borderRadius: 2,
              py: 1.2
            }}
          >
            ອະນຸມັດ
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

// Success Dialog after approval or deletion
export const ActionSuccessDialog = ({ open, onClose, title, message, actionType }) => {
  const isApprove = actionType === 'approve';
  
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
            bgcolor: isApprove ? '#00c853' : '#ff9800', 
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
          {title || (isApprove ? 'ອະນຸມັດສຳເລັດ' : 'ລົບສຳເລັດ')}
        </Typography>
        
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
          {message || (isApprove ? 'ການສັ່ງຊື້ໄດ້ຖືກອະນຸມັດແລ້ວ' : 'ລາຍການສັ່ງຊື້ຖືກລົບສຳເລັດແລ້ວ')}
        </Typography>
        
        <Box sx={{ display: 'flex', width: '100%' }}>
          <Button 
            variant="contained" 
            color={isApprove ? "success" : "warning"}
            fullWidth
            onClick={onClose}
            sx={{ 
              borderRadius: 2,
              py: 1.2
            }}
          >
            ຕົກລົງ
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default { DeleteConfirmDialog, ApproveConfirmDialog, ActionSuccessDialog };