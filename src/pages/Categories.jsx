import { Box, Paper, Typography } from '@mui/material';
import Layout from '../components/Layout';

function Categories() {
  return (
    <Layout title="ຈັດການໝວດໝູ່ສິນຄ້າ">
      <Paper sx={{ p: 4, height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          ກຳລັງພັດທະນາ...
        </Typography>
      </Paper>
    </Layout>
  );
}

export default Categories;