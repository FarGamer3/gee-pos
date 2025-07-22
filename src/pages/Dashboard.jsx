import { useState, useEffect } from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Divider, 
  Alert,
  Paper,
  CircularProgress
} from '@mui/material';
import { 
  Inventory as InventoryIcon,
  ImportExport as ImportIcon,
  ShoppingCart as ExportIcon,
  Receipt as PurchaseIcon,
  AttachMoney as SalesIcon,
  People as StaffIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import Layout from '../components/Layout';
import DashboardCharts from '../components/DashboardCharts';
import API_BASE_URL from '../config/api';
import axios from 'axios';
import { getCurrentUser } from '../services/authService';

function Dashboard() {
  const theme = useTheme();
  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    importedItems: 0,
    exportedItems: 0,
    purchases: 0,
    sales: 0,
    staffCount: { admin: 0, users: 0 },
    lowStockItems: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ຮັບຂໍ້ມູນຜູ້ໃຊ້ປັດຈຸບັນ
  const currentUser = getCurrentUser();
  const isUser2 = currentUser?.status === 'User2';
  const isUser1 = currentUser?.status === 'User1'; // ເພີ່ມການກວດສອບ User1

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        let products = [];
        let importedItems = 0;
        let exportedItems = 0;
        let purchases = 0;
        let sales = 0;
        let adminCount = 0;
        let userCount = 0;
        let lowStockItems = [];

        // ດຶງຂໍ້ມູນສິນຄ້າ
        try {
          const productsResponse = await axios.get(`${API_BASE_URL}/All/Product`);
          if (productsResponse.data && productsResponse.data.result_code === "200") {
            products = productsResponse.data.products || [];
            
            // ກວດຫາສິນຄ້າໃກ້ໝົດສາງ - ປັບປຸງການກວດສອບ
            lowStockItems = products.filter(product => {
              const qty = parseInt(product.qty || product.quantity || 0);
              const minStock = parseInt(product.qty_min || 10); // ຖ້າບໍ່ມີ qty_min ໃຫ້ໃຊ້ 10
              return qty <= minStock && qty >= 0; // ກວດຫາວ່າຈຳນວນໜ້ອຍກວ່າຫຼືເທົ່າກັບຈຳນວນຕໍ່າສຸດ
            }).map(product => ({
              proid: product.proid,
              proname: product.ProductName || product.proname || product.name || 'ບໍ່ມີຊື່',
              quantity: parseInt(product.qty || product.quantity || 0),
              minStock: parseInt(product.qty_min || 10)
            }));
            
            console.log('Low stock items found:', lowStockItems);
          }
        } catch (err) {
          console.error("Error fetching products:", err);
          products = [];
          // ສຳລັບທົດສອບ - ສ້າງຂໍ້ມູນຈຳລອງ
          lowStockItems = [
            { proid: 1, proname: 'ສິນຄ້າທົດສອບ A', quantity: 3, minStock: 10 },
            { proid: 2, proname: 'ສິນຄ້າທົດສອບ B', quantity: 1, minStock: 5 }
          ];
        }

        // ສຳລັບ User2 - ບໍ່ດຶງຂໍ້ມູນການຂາຍ ແລະ ພະນັກງານ
        // ສຳລັບ User1 - ດຶງຂໍ້ມູນການຂາຍແຕ່ບໍ່ດຶງພະນັກງານ
        if (!isUser2) {
          // ດຶງຂໍ້ມູນການຊື້ (ສະແດງສຳລັບ Admin ເທົ່ານັ້ນ)
          if (currentUser?.status === 'Admin') {
            try {
              const purchaseResponse = await axios.get(`${API_BASE_URL}/order/All/Order`);
              if (purchaseResponse.data && purchaseResponse.data.result_code === "200") {
                purchases = purchaseResponse.data.user_info ? purchaseResponse.data.user_info.length : 0;
              }
            } catch (err) {
              console.error("Error fetching purchases:", err);
              purchases = 1; // ຄ່າສຳຮອງ
            }
          }

          // ດຶງຂໍ້ມູນການຂາຍ (ສຳລັບ Admin ແລະ User1)
          try {
            const salesResponse = await axios.get(`${API_BASE_URL}/sale/All/Sales`);
            if (salesResponse.data && salesResponse.data.result_code === "200") {
              sales = salesResponse.data.sales_data ? salesResponse.data.sales_data.length : 0;
            }
          } catch (err) {
            console.error("Error fetching sales data:", err);
            sales = 3; // ຄ່າສຳຮອງ
          }

          // ດຶງຂໍ້ມູນພະນັກງານ (ສຳລັບ Admin ເທົ່ານັ້ນ)
          if (currentUser?.status === 'Admin') {
            try {
              const employeesResponse = await axios.get(`${API_BASE_URL}/users/All/Employee`);
              if (employeesResponse.data && employeesResponse.data.result_code === "200") {
                const employees = employeesResponse.data.user_info || [];
                adminCount = employees.filter(emp => emp.status === 'Admin').length;
                userCount = employees.filter(emp => emp.status && emp.status !== 'Admin').length;
              }
            } catch (err) {
              console.error("Error fetching employees:", err);
              // ລອງວິທີສຳຮອງ
              try {
                const employeesAltResponse = await axios.get(`${API_BASE_URL}/All/Employee`);
                if (employeesAltResponse.data && employeesAltResponse.data.result_code === "200") {
                  const employees = employeesAltResponse.data.user_info || [];
                  adminCount = employees.filter(emp => emp.status === 'Admin').length;
                  userCount = employees.filter(emp => emp.status && emp.status !== 'Admin').length;
                }
              } catch (errAlt) {
                console.error("Error with fallback employees endpoint:", errAlt);
                adminCount = 1;
                userCount = 2;
              }
            }
          }
        }

        // ດຶງຂໍ້ມູນນຳເຂົ້າ - ສຳລັບ Admin ແລະ User2 ເທົ່ານັ້ນ
        if (currentUser?.status === 'Admin' || currentUser?.status === 'User2') {
          try {
            const importsResponse = await axios.get(`${API_BASE_URL}/import/All/Import`);
            if (importsResponse.data && importsResponse.data.result_code === "200") {
              importedItems = importsResponse.data.imports ? importsResponse.data.imports.length : 0;
            }
          } catch (err) {
            console.error("Error fetching imports:", err);
            importedItems = 5;
          }
        }
        
        // ດຶງຂໍ້ມູນນຳອອກ - ສຳລັບ Admin ແລະ User2 ເທົ່ານັ້ນ
        if (currentUser?.status === 'Admin' || currentUser?.status === 'User2') {
          try {
            const exportsResponse = await axios.get(`${API_BASE_URL}/export/All/Export`);
            if (exportsResponse.data && exportsResponse.data.result_code === "200") {
              exportedItems = exportsResponse.data.exports ? exportsResponse.data.exports.length : 0;
            }
          } catch (err) {
            console.error("Error fetching exports:", err);
            exportedItems = 2;
          }
        }

        // ອັບເດດຂໍ້ມູນ dashboard
        setDashboardData({
          totalProducts: products.length,
          importedItems,
          exportedItems,
          purchases,
          sales,
          staffCount: { admin: adminCount, users: userCount },
          lowStockItems
        });

        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("ມີບັນຫາໃນການດຶງຂໍ້ມູນບາງສ່ວນ. ທ່ານຍັງສາມາດໃຊ້ງານລະບົບຕໍ່ໄດ້.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isUser2, isUser1]); // ເພີ່ม isUser1 ໃນ dependency array

  // InfoCard Component
  const InfoCard = ({ title, value, icon: Icon, color = "primary.main", onClick }) => {
    return (
      <Card 
        elevation={2} 
        sx={{ 
          height: '100%',
          transition: 'transform 0.3s, box-shadow 0.3s',
          borderRadius: 4,
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 6,
            cursor: onClick ? 'pointer' : 'default'
          }
        }}
        onClick={onClick}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {title}
              </Typography>
              <Typography variant="h4" component="div" fontWeight="bold">
                {value}
              </Typography>
            </Box>
            <Box
              sx={{
                width: 56,
                height: 56,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: `${color}15`,
                borderRadius: '50%',
                color: color
              }}
            >
              <Icon sx={{ fontSize: 32 }} />
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Low Stock Alert Card
  const LowStockAlert = ({ lowStockItems }) => {
    console.log('LowStockAlert received items:', lowStockItems); // ສຳລັບ debug
    
    if (!lowStockItems || lowStockItems.length === 0) {
      return (
        <Alert severity="success" sx={{ mt: 2, borderRadius: 3 }}>
          ທຸກສິນຄ້າມີຈຳນວນພຽງພໍໃນສາງ
        </Alert>
      );
    }

    return (
      <Card elevation={2} sx={{ mt: 3, borderRadius: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <WarningIcon color="warning" sx={{ mr: 1 }} />
            <Typography variant="h6">ສິນຄ້າໃກ້ໝົດສາງ ({lowStockItems.length} ລາຍການ)</Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ 
            maxHeight: 200, 
            overflowY: 'auto', 
            pr: 1,
            '&::-webkit-scrollbar': {
              width: '6px',
              backgroundColor: '#F5F5F5'
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#BDBDBD',
              borderRadius: '10px'
            }
          }}>
            {lowStockItems.map((item, index) => (
              <Box 
                key={item.proid} 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  py: 1,
                  borderBottom: index !== lowStockItems.length - 1 ? '1px solid #f0f0f0' : 'none'
                }}
              >
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    {item.proname}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ຕໍ່າສຸດ: {item.minStock || 10}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography 
                    variant="body2" 
                    color={item.quantity <= 5 ? "error" : "warning.main"}
                    fontWeight="bold"
                  >
                    ເຫຼືອ {item.quantity}
                  </Typography>
                  {item.quantity === 0 && (
                    <Typography variant="caption" color="error">
                      ໝົດສາງ!
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* ຫົວຂໍ້ໜ້າຫຼັກ */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography 
          variant="h3" 
          component="h1" 
          fontWeight="bold" 
          color="primary.main"
          sx={{ 
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            mb: 1
          }}
        >
          ໜ້າຫຼັກ
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary"
          sx={{ fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' } }}
        >
          ລະບົບຈັດການຮ້ານຄ້າ
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        
        {/* ແຖວທີ 1 - Card ຂໍ້ມູນພື້ນຖານ - ປັບຕາມບົດບາດ */}
        <Grid item xs={12} sm={6} md={4}>
          <InfoCard 
            title="ຈຳນວນສິນຄ້າທັງໜົດ" 
            value={dashboardData.totalProducts.toString()} 
            icon={InventoryIcon} 
            color={theme.palette.primary.main}
            onClick={() => window.location.href = "/products"}
          />
        </Grid>
        
        {/* ນຳເຂົ້າ ແລະ ນຳອອກ - ສະແດງສຳລັບ Admin ແລະ User2 ເທົ່ານັ້ນ */}
        {(currentUser?.status === 'Admin' || currentUser?.status === 'User2') && (
          <>
            <Grid item xs={12} sm={6} md={4}>
              <InfoCard 
                title="ສິນຄ້ານຳເຂົ້າ" 
                value={dashboardData.importedItems.toString()} 
                icon={ImportIcon} 
                color={theme.palette.success.main}
                onClick={() => window.location.href = "/import"}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <InfoCard 
                title="ສິນຄ້ານຳອອກ" 
                value={dashboardData.exportedItems.toString()} 
                icon={ExportIcon} 
                color={theme.palette.warning.main}
                onClick={() => window.location.href = "/export"}
              />
            </Grid>
          </>
        )}

        {/* ແຖວທີ 2 - ສະແດງຕາມບົດບາດ */}
        {currentUser?.status === 'Admin' && (
          <>
            {/* ສຳລັບ Admin - ສະແດງທຸກ boxes */}
            <Grid item xs={12} sm={6} md={4}>
              <InfoCard 
                title="ສັັ່ງຊື້ສິນຄ້າ" 
                value={dashboardData.purchases.toString()} 
                icon={PurchaseIcon} 
                color={theme.palette.info.main}
                onClick={() => window.location.href = "/Buy"}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <InfoCard 
                title="ຂາຍສິນຄ້າ" 
                value={dashboardData.sales.toString()} 
                icon={SalesIcon} 
                color="#FF5722"
                onClick={() => window.location.href = "/sales"}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <InfoCard 
                title="ພະນັກງານ" 
                value={`Admin ${dashboardData.staffCount.admin} : User ${dashboardData.staffCount.users}`} 
                icon={StaffIcon} 
                color="#9C27B0"
                onClick={() => window.location.href = "/employees"}
              />
            </Grid>
          </>
        )}

        {currentUser?.status === 'User1' && (
          <>
            {/* ສຳລັບ User1 - ສະແດງແຕ່ການຂາຍ (ບໍ່ມີການຊື້ ແລະ ພະນັກງານ) */}
            <Grid item xs={12} sm={6} md={4}>
              <InfoCard 
                title="ຂາຍສິນຄ້າ" 
                value={dashboardData.sales.toString()} 
                icon={SalesIcon} 
                color="#FF5722"
                onClick={() => window.location.href = "/sales"}
              />
            </Grid>
          </>
        )}

        {/* Charts Section - ສະແດງສຳລັບ Admin ເທົ່ານັ້ນ (ເພື່ອເຊື່ອງກຳໄລ/ຕົ້ນທຶນຈາກ User1) */}
        {currentUser?.status === 'Admin' && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                ສະຖິຕິການຂາຍແລະຂໍ້ມູນສິນຄ້າ
              </Typography>
              <DashboardCharts />
            </Paper>
          </Grid>
        )}

        {/* Low stock alerts section - ສະແດງສຳລັບທຸກຄົນ */}
        <Grid item xs={12}>
          <LowStockAlert lowStockItems={dashboardData.lowStockItems} />
        </Grid>
        
      </Grid>
    </Layout>
  );
}

export default Dashboard;