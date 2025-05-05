import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { laoLanguage } from './theme/laoLanguage';
import { isAuthenticated, logout } from './services/authService';

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
      main: '#6CBAD9',
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

// ສ້າງ component ເພື່ອກວດສອບການເຂົ້າສູ່ລະບົບກ່ອນເຂົ້າເຖິງໜ້າທີ່ຕ້ອງການ
const ProtectedRoute = ({ children }) => {
  // ກວດສອບວ່າຜູ້ໃຊ້ເຂົ້າສູ່ລະບົບແລ້ວຫຼືບໍ່
  if (!isAuthenticated()) {
    // ຖ້າຍັງບໍ່ໄດ້ເຂົ້າສູ່ລະບົບ, ສົ່ງໄປໜ້າ login
    return <Navigate to="/login" replace />;
  }
  
  // ຖ້າເຂົ້າສູ່ລະບົບແລ້ວ, ສະແດງ component ທີ່ຕ້ອງການ
  return children;
};

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
          
          {/* ເສັ້ນທາງທັງໝົດທີ່ຕ້ອງການການກວດສອບການເຂົ້າສູ່ລະບົບ */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard onLogout={handleLogout} />
              </ProtectedRoute>
            } 
          />
          <Route 
          
  path="/user-profile" 
  element={
    <ProtectedRoute>
      <UserProfile />
    </ProtectedRoute>
  } 
/>
          <Route 
            path="/Manage_data" 
            element={
              <ProtectedRoute>
                <MainMenu />
              </ProtectedRoute>
            } 
          />
          
          {/* ເສັ້ນທາງສຳລັບຈັດການຂໍ້ມູນສິນຄ້າ */}
          <Route 
            path="/products" 
            element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            } 
          />
          
          {/* ເສັ້ນທາງສຳລັບຈັດການຂໍ້ມູນອື່ນໆ */}
          <Route 
            path="/categories" 
            element={
              <ProtectedRoute>
                <Categories />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/Units" 
            element={
              <ProtectedRoute>
                <Units />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/warehouse" 
            element={
              <ProtectedRoute>
                <Warehouse />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/suppliers" 
            element={
              <ProtectedRoute>
                <Suppliers />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/customers" 
            element={
              <ProtectedRoute>
                <Customers />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/employees" 
            element={
              <ProtectedRoute>
                <Employees />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/village" 
            element={
              <ProtectedRoute>
                <Village />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/city" 
            element={
              <ProtectedRoute>
                <City />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/province" 
            element={
              <ProtectedRoute>
                <Province />
              </ProtectedRoute>
            } 
          />
          
          {/* ເສັ້ນທາງສຳລັບລາຍງານ */}
          <Route 
            path="/Reports" 
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/Sales" 
            element={
              <ProtectedRoute>
                <Sales />
              </ProtectedRoute>
            } 
          />
          
          {/* ເສັ້ນທາງໃໝ່ໄປຫາໜ້າປະຫວັດການຂາຍ */}
          <Route 
            path="/SalesHistory" 
            element={
              <ProtectedRoute>
                <SalesHistory />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/Buy" 
            element={
              <ProtectedRoute>
                <Buy />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/Purchase-Orders" 
            element={
              <ProtectedRoute>
                <PurchaseOrders />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/Import" 
            element={
              <ProtectedRoute>
                <Import />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/import-detail" 
            element={
              <ProtectedRoute>
                <ImportDetail />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/export" 
            element={
              <ProtectedRoute>
                <Export />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/export-detail" 
            element={
              <ProtectedRoute>
                <ExportDetail />
              </ProtectedRoute>
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
          
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;