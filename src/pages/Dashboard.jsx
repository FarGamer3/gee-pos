import { Grid, Paper, Typography, Box } from '@mui/material';
import Layout from '../components/Layout';
import {
  Inventory as InventoryIcon,
  MoveToInbox as ImportIcon,
  LocalShipping as ExportIcon,
  ShoppingCart as PurchaseIcon,
  Storefront as SalesIcon,
  People as StaffIcon
} from '@mui/icons-material';

// Info Card Component using MUI
function InfoCard({ title, value, icon: Icon }) {
  return (
    <Paper elevation={1} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Box>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="h4" component="div" fontWeight="bold">
          {value}
        </Typography>
      </Box>
      <Box
        sx={{
          width: 48,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'primary.main'
        }}
      >
        <Icon sx={{ fontSize: 32 }} />
      </Box>
    </Paper>
  );
}

function Dashboard() {
  return (
    <Layout title="ໜ້າຫຼັກ">
      <Box sx={{ mb: 3 }}>
        <Paper 
          sx={{ 
            p: 2, 
            bgcolor: 'primary.main', 
            color: 'white',
            borderRadius: 1
          }}
        >
          <Typography variant="subtitle1">
            ຂໍ້ມູນສິນຄ້າ ແລະ ສະຖະຕິຂອງຮ້ານ
          </Typography>
        </Paper>
      </Box>

      <Grid container spacing={3}>
        {/* First row */}
        <Grid item xs={12} md={4}>
          <InfoCard 
            title="ຈຳນວນສິນຄ້າທັງໜົດ" 
            value="100" 
            icon={InventoryIcon} 
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <InfoCard 
            title="ສິນຄ້ານຳເຂົ້າ" 
            value="100" 
            icon={ImportIcon} 
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <InfoCard 
            title="ສິນຄ້ານຳອອກ" 
            value="100" 
            icon={ExportIcon} 
          />
        </Grid>

        {/* Second row */}
        <Grid item xs={12} md={4}>
          <InfoCard 
            title="ສັັ່ງຊື້ສິນຄ້າ" 
            value="100" 
            icon={PurchaseIcon} 
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <InfoCard 
            title="ຂາຍສິນຄ້າ" 
            value="100" 
            icon={SalesIcon} 
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <InfoCard 
            title="ພະນັກງານ" 
            value="Admin 1 : user 4" 
            icon={StaffIcon} 
          />
        </Grid>
      </Grid>
    </Layout>
  );
}

export default Dashboard;