import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { laoLanguage } from './theme/laoLanguage';

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
import Buy from './pages/Buy';
import PurchaseOrders from './pages/PurchaseOrders';
import Import from './pages/Import';
import ImportDetail from './pages/import-detail';
import Export from './pages/Export';
import ExportDetail from './pages/ExportDetail';

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

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
                <Login onLogin={() => setIsLoggedIn(true)} />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isLoggedIn ? 
                <Dashboard /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/Manage_data" 
            element={
              isLoggedIn ? 
                <MainMenu /> : 
                <Navigate to="/login" replace />
            } 
          />
          {/* ເສັ້ນທາງສຳລັບຈັດການຂໍ້ມູນສິນຄ້າ */}
          <Route 
            path="/products" 
            element={
              isLoggedIn ? 
                <Products /> : 
                <Navigate to="/login" replace />
            } 
          />
     
          
          {/* ເສັ້ນທາງສຳລັບຈັດການຂໍ້ມູນອື່ນໆ */}
          <Route 
            path="/categories" 
            element={
              isLoggedIn ? 
                <Categories /> : 
                <Navigate to="/login" replace />
            } 
          />
             <Route 
            path="/Units" 
            element={
              isLoggedIn ? 
                <Units /> : 
                <Navigate to="/login" replace />
            } 
          />

          <Route 
            path="/warehouse" 
            element={
              isLoggedIn ? 
                <Warehouse /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/suppliers" 
            element={
              isLoggedIn ? 
                <Suppliers /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/customers" 
            element={
              isLoggedIn ? 
                <Customers /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/employees" 
            element={
              isLoggedIn ? 
                <Employees /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/village" 
            element={
              isLoggedIn ? 
                <Village /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/city" 
            element={
              isLoggedIn ? 
                <City /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/province" 
            element={
              isLoggedIn ? 
                <Province /> : 
                <Navigate to="/login" replace />
            } 
          />
          
          {/* ເສັ້ນທາງສຳລັບລາຍງານ */}
          <Route 
            path="/Reports" 
            element={
              isLoggedIn ? 
                <Reports /> : 
                <Navigate to="/login" replace />
            } 
          />

          <Route 
            path="/Sales" 
            element={
              isLoggedIn ? 
                <Sales /> : 
                <Navigate to="/login" replace />
            } 
          />
          
          <Route 
            path="/Buy" 
            element={
              isLoggedIn ? 
                <Buy /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/Purchase-Orders" 
            element={
              isLoggedIn ? 
                <PurchaseOrders /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/Import" 
            element={
              isLoggedIn ? 
                <Import /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/import-detail" 
            element={
              isLoggedIn ? 
                <ImportDetail /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/export" 
            element={
              isLoggedIn ? 
                <Export /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/export-detail" 
            element={
              isLoggedIn ? 
                <ExportDetail /> : 
                <Navigate to="/login" replace />
            } 
          />

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;