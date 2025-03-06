import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import './App.css';
import MainMenu from './pages/Manage_data';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Units from './pages/Units';
import Brands from './pages/Brands';
import Warehouse from './pages/Warehouse';
import Suppliers from './pages/Suppliers';
import Customers from './pages/Customers';
import Employees from './pages/Employees';
import Village from './pages/Village';
import City from './pages/City';
import Province from './pages/Province';
import Reports from './pages/Reports';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
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
        <Route 
          path="/add-product" 
          element={
            isLoggedIn ? 
              <AddProduct /> : 
              <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/edit-product/:id" 
          element={
            isLoggedIn ? 
              <EditProduct /> : 
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
          path="/units" 
          element={
            isLoggedIn ? 
              <Units /> : 
              <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/brands" 
          element={
            isLoggedIn ? 
              <Brands /> : 
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
        
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;