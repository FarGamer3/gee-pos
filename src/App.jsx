import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { laoLanguage } from './theme/laoLanguage';
import { isAuthenticated, logout } from './services/authService';
import RoleBasedRoute from './components/RoleBasedRoute'; // Import the new component
import AccessDenied from './components/AccessDenied'; // Import the AccessDenied component

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MainMenu from './pages/Manage_data';
import Products from './pages/Add-data/Products';
import Categories from './pages/Add-data/Categories';
import Units from './pages/Add-data/Units';

import Warehouse from './pages/Add-data/Warehouse';
import Suppliers from './pages/Add-data/Suppliers';
import Customers from './pages/Add-data/Customers';
import Employees from './pages/Add-data/Employees';
import Village from './pages/Add-data/Village';
import City from './pages/Add-data/City';
import Province from './pages/Add-data/Province';
import Reports from './pages/Reports';
import Sales from './pages/Sales';
import SalesHistory from './pages/SalesHistory'; // ເພີ່ມໜ້າປະຫວັດການຂາຍ
import Buy from './pages/Buy';
import PurchaseOrders from './pages/PurchaseOrders';
import Import from './pages/Import';
import ImportDetail from './pages/import-detail';
import Export from './pages/Export';
import ExportDetail from './pages/ExportDetail';
import UserProfile from './pages/UserProfile';

// Create MUI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2ca0c7', //#6CBAD9
      light: '#8FCAE3',
      dark: '#5ba8c7',
      contrastText: '#fff',
    },
    secondary: {
      main: '#4CAF50',
      light: '#6FBF73',
      dark: '#3B873E',
      contrastText: '#fff',
    },
    error: {
      main: '#f44336',
      light: '#F88078',
      dark: '#d32f2f',
      contrastText: '#fff',
    },
    success: {
      main: '#4CAF50',
      light: '#6FBF73',
      dark: '#3B873E',
      contrastText: '#fff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#fff',
    },
  },
  typography: {
    fontFamily: '"Noto Sans Lao", "Phetsarath OT", sans-serif',
    ...laoLanguage,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 4,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
  },
});

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // ກວດສອບສະຖານະການເຂົ້າສູ່ລະບົບເມື່ອແອບເລີ່ມເຮັດວຽກ
  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);
  
  // ຟັງຊັນຈັດການເຂົ້າສູ່ລະບົບ
  const handleLogin = () => {
    setIsLoggedIn(true);
  };
  
  // ຟັງຊັນຈັດການອອກຈາກລະບົບ
  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route 
            path="/login" 
            element={
              isLoggedIn ? 
                <Navigate to="/dashboard" replace /> : 
                <Login onLogin={handleLogin} />
            } 
          />
          
          {/* ເສັ້ນທາງທັງໝົດທີ່ຕ້ອງການການກວດສອບການເຂົ້າສູ່ລະບົບແລະກວດສອບສິດ */}
          <Route 
            path="/dashboard" 
            element={
              <RoleBasedRoute>
                <Dashboard onLogout={handleLogout} />
              </RoleBasedRoute>
            } 
          />
          <Route 
            path="/user-profile" 
            element={
              <RoleBasedRoute>
                <UserProfile />
              </RoleBasedRoute>
            } 
          />
          <Route 
            path="/Manage_data" 
            element={
              <RoleBasedRoute>
                <MainMenu />
              </RoleBasedRoute>
            } 
          />
          
          {/* ເສັ້ນທາງສຳລັບຈັດການຂໍ້ມູນສິນຄ້າ */}
          <Route 
            path="/products" 
            element={
              <RoleBasedRoute>
                <Products />
              </RoleBasedRoute>
            } 
          />
          
          {/* ເສັ້ນທາງສຳລັບຈັດການຂໍ້ມູນອື່ນໆ */}
          <Route 
            path="/categories" 
            element={
              <RoleBasedRoute>
                <Categories />
              </RoleBasedRoute>
            } 
          />
          
          <Route 
            path="/units" 
            element={
              <RoleBasedRoute>
                <Units />
              </RoleBasedRoute>
            } 
          />

          <Route 
            path="/warehouse" 
            element={
              <RoleBasedRoute>
                <Warehouse />
              </RoleBasedRoute>
            } 
          />
          
          <Route 
            path="/suppliers" 
            element={
              <RoleBasedRoute>
                <Suppliers />
              </RoleBasedRoute>
            } 
          />
          
          <Route 
            path="/customers" 
            element={
              <RoleBasedRoute>
                <Customers />
              </RoleBasedRoute>
            } 
          />
          
          <Route 
            path="/employees" 
            element={
              <RoleBasedRoute>
                <Employees />
              </RoleBasedRoute>
            } 
          />
          
          <Route 
            path="/village" 
            element={
              <RoleBasedRoute>
                <Village />
              </RoleBasedRoute>
            } 
          />
          
          <Route 
            path="/city" 
            element={
              <RoleBasedRoute>
                <City />
              </RoleBasedRoute>
            } 
          />
          
          <Route 
            path="/province" 
            element={
              <RoleBasedRoute>
                <Province />
              </RoleBasedRoute>
            } 
          />
          
          {/* ເສັ້ນທາງສຳລັບລາຍງານ */}
          <Route 
            path="/Reports" 
            element={
              <RoleBasedRoute>
                <Reports />
              </RoleBasedRoute>
            } 
          />

          <Route 
            path="/Sales" 
            element={
              <RoleBasedRoute>
                <Sales />
              </RoleBasedRoute>
            } 
          />
          
          {/* ເສັ້ນທາງໃໝ່ໄປຫາໜ້າປະຫວັດການຂາຍ */}
          <Route 
            path="/SalesHistory" 
            element={
              <RoleBasedRoute>
                <SalesHistory />
              </RoleBasedRoute>
            } 
          />
          
          <Route 
            path="/Buy" 
            element={
              <RoleBasedRoute>
                <Buy />
              </RoleBasedRoute>
            } 
          />
          
          <Route 
            path="/Purchase-Orders" 
            element={
              <RoleBasedRoute>
                <PurchaseOrders />
              </RoleBasedRoute>
            } 
          />
          
          <Route 
            path="/Import" 
            element={
              <RoleBasedRoute>
                <Import />
              </RoleBasedRoute>
            } 
          />
          
          <Route 
            path="/import-detail" 
            element={
              <RoleBasedRoute>
                <ImportDetail />
              </RoleBasedRoute>
            } 
          />
          
          <Route 
            path="/export" 
            element={
              <RoleBasedRoute>
                <Export />
              </RoleBasedRoute>
            } 
          />
          
          <Route 
            path="/export-detail" 
            element={
              <RoleBasedRoute>
                <ExportDetail />
              </RoleBasedRoute>
            } 
          />
          
          {/* ເສັ້ນທາງເລີ່ມຕົ້ນ ແມ່ນນຳໄປສູ່ໜ້າເຂົ້າສູ່ລະບົບຫຼືໜ້າຫຼັກ */}
          <Route 
            path="/" 
            element={
              isLoggedIn ? 
                <Navigate to="/dashboard" replace /> : 
                <Navigate to="/login" replace />
            } 
          />
          
          {/* ເສັ້ນທາງທີ່ບໍ່ພົບ (404) */}
          <Route 
            path="*" 
            element={
              isLoggedIn ? 
                <AccessDenied /> : 
                <Navigate to="/login" replace />
            } 
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;