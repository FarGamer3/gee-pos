// src/components/AccessDenied.jsx
import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Block as BlockIcon } from '@mui/icons-material';

/**
 * ໜ້າສະແດງເມື່ອຜູ້ໃຊ້ພະຍາຍາມເຂົ້າເຖິງໜ້າທີ່ບໍ່ມີສິດ
 */
const AccessDenied = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 5,
          maxWidth: 500,
          textAlign: 'center',
          borderRadius: 2,
        }}
      >
        <BlockIcon
          color="error"
          sx={{ fontSize: 80, mb: 2 }}
        />
        <Typography variant="h4" color="error" gutterBottom>
          ບໍ່ສາມາດເຂົ້າເຖິງໄດ້
        </Typography>
        <Typography variant="body1" paragraph>
          ທ່ານບໍ່ມີສິດເຂົ້າເຖິງໜ້ານີ້. ກະລຸນາຕິດຕໍ່ຜູ້ບໍລິຫານລະບົບຖ້າທ່ານຕ້ອງການສິດເຂົ້າເຖິງເພີ່ມເຕີມ.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/dashboard')}
          sx={{ mt: 2 }}
        >
          ກັບໄປໜ້າຫຼັກ
        </Button>
      </Paper>
    </Box>
  );
};

export default AccessDenied;