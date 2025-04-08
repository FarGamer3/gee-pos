import React from 'react';
import {
  Box,
  Paper,
  Typography
} from '@mui/material';
import Layout from '../components/Layout';

function Reports() {
  return (
    <Layout title="ລາຍງານ">
      <Box sx={{ mb: 3 }}>
        <Paper 
          sx={{ 
            p: 2, 
            bgcolor: 'primary.main', 
            color: 'white',
            borderRadius: 1
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            ລາຍງານຕ່າງໆ
          </Typography>
        </Paper>
      </Box>

      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          ກຳລັງພັດທະນາ...
        </Typography>
      </Paper>
    </Layout>
  );
}

export default Reports;