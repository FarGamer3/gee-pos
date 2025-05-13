// src/components/RoleBasedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { hasPermission } from '../services/roleService';
import { isAuthenticated } from '../services/authService';
import AccessDenied from './AccessDenied';

/**
 * Component ນີ້ໃຊ້ສຳລັບຈຳກັດການເຂົ້າເຖິງເສັ້ນທາງຕາມສິດຂອງຜູ້ໃຊ້
 */
const RoleBasedRoute = ({ children }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // ກວດສອບວ່າຜູ້ໃຊ້ເຂົ້າສູ່ລະບົບຫຼືບໍ່
  if (!isAuthenticated()) {
    // ຖ້າຍັງບໍ່ໄດ້ເຂົ້າສູ່ລະບົບ, ໃຫ້ກັບໄປໜ້າ login
    return <Navigate to="/login" replace />;
  }
  
  // ກວດສອບວ່າຜູ້ໃຊ້ມີສິດເຂົ້າເຖິງໜ້ານີ້ຫຼືບໍ່
  if (!hasPermission(currentPath)) {
    // ຖ້າບໍ່ມີສິດເຂົ້າເຖິງ, ສະແດງໜ້າແຈ້ງເຕືອນບໍ່ມີສິດເຂົ້າເຖິງ
    return <AccessDenied />;
  }
  
  // ຖ້າເຂົ້າສູ່ລະບົບແລ້ວ ແລະ ມີສິດເຂົ້າເຖິງ, ສະແດງ component ທີ່ຕ້ອງການ
  return children;
};

export default RoleBasedRoute;