import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import './App.css';

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
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
