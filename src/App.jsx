import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import './App.css';
import MainMenu from './pages/Manage_data';
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
        {/* ເພີ່ມເສັ້ນທາງອື່ນໆຕາມທີ່ຕ້ອງການ */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
