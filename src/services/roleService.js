// src/services/roleService.js
import { getCurrentUser } from './authService';

/**
 * ປະເພດຜູ້ໃຊ້ (Role types)
 */
export const ROLES = {
  ADMIN: 'Admin',   // ເຈົ້າຂອງຮ້ານ
  USER1: 'User1',   // ພະນັກງານສາງ
  USER2: 'User2',   // ພະນັກງານຂາຍ
};

/**
 * ກຳນົດສິດເຂົ້າເຖິງໜ້າຕ່າງໆຕາມບົດບາດຂອງຜູ້ໃຊ້
 */
export const ROLE_PERMISSIONS = {
  // ເຈົ້າຂອງຮ້ານ - ເຂົ້າໄດ້ທຸກໜ້າ
  [ROLES.ADMIN]: [
    '/dashboard',
    '/Manage_data',
    '/products',
    '/categories',
    '/units',
    '/warehouse',
    '/suppliers',
    '/customers',
    '/employees',
    '/Buy',           // Admin ສາມາດສັ່ງຊື້ໄດ້
    '/buy',
    '/sales',
    '/Sales',
    '/SalesHistory',
    '/import',
    '/import-detail',
    '/export',
    '/export-detail',
    '/reports',
    '/purchase-orders',
    '/user-profile'
  ],
  
  // ພະນັກງານສາງ - ເຫັນ ຂໍ້ມູນສິນຄ້າ, ຂໍ້ມູນລູກຄ້າ, ໜ້າຂາຍສິນຄ້າ, ລາຍງານສິນຄ້າ, ລາຍງານການຂາຍ
  [ROLES.USER1]: [
    '/dashboard',
    '/Manage_data',   // ແຕ່ຈະສະແດງພຽງບາງເມນູຍ່ອຍ
    '/products',      // ຂໍ້ມູນສິນຄ້າ
    '/customers',     // ຂໍ້ມູນລູກຄ້າ 
    '/sales',         // ໜ້າຂາຍສິນຄ້າ
    '/Sales',         // ໜ້າຂາຍສິນຄ້າ
    '/SalesHistory',  // ປະຫວັດການຂາຍ
    '/reports',       // ລາຍງານ (ແຕ່ຈະເຫັນສະເພາະລາຍງານສິນຄ້າ ແລະ ການຂາຍ)
    '/user-profile'   // ໜ້າຂໍ້ມູນໂປຣໄຟລ໌ ສ່ວນຕົວ
    // ບໍ່ມີ /Buy - User1 ບໍ່ສາມາດສັ່ງຊື້ໄດ້
  ],
  
  // ພະນັກງານຂາຍ - ເຫັນ ຂໍ້ມູນສິນຄ້າ, ປະເພດ, ຍີ່ຫໍ້, ບ່ອນຈັດວາງ, ໜ້ານຳເຂົ້າ, ໜ້ານຳອອກ, ລາຍງານ
  [ROLES.USER2]: [
    '/dashboard',
    '/Manage_data',   // ແຕ່ຈະສະແດງພຽງບາງເມນູຍ່ອຍ
    '/products',      // ຂໍ້ມູນສິນຄ້າ
    '/categories',    // ຂໍ້ມູນປະເພດ
    '/units',         // ຂໍ້ມູນຍີ່ຫໍ້
    '/warehouse',     // ຂໍ້ມູນບ່ອນຈັດວາງ
    '/import',        // ນຳເຂົ້າສິນຄ້າ
    '/import-detail', // ລາຍລະອຽດການນຳເຂົ້າ
    '/export',        // ນຳອອກສິນຄ້າ 
    '/export-detail', // ລາຍລະອຽດການນຳອອກ
    '/reports',       // ລາຍງານ (ບາງລາຍງານເທົ່ານັ້ນ)
    '/user-profile'   // ໜ້າຂໍ້ມູນໂປຣໄຟລ໌ ສ່ວນຕົວ
    // ລຶບ /Buy ອອກ - User2 ບໍ່ສາມາດສັ່ງຊື້ໄດ້
    // ລຶບ /purchase-orders ອອກ - User2 ບໍ່ເຫັນລາຍການສັ່ງຊື້
  ]
};

/**
 * ກຳນົດປະເພດເມນູຍ່ອຍທີ່ສະແດງໃນເມນູຈັດການຂໍ້ມູນຕາມບົດບາດ
 */
export const ROLE_SUBMENU_PERMISSIONS = {
  // ເຈົ້າຂອງຮ້ານ - ເຫັນທຸກເມນູຍ່ອຍ
  [ROLES.ADMIN]: [
    'products',    // ຂໍ້ມູນສິນຄ້າ
    'categories',  // ຂໍ້ມູນປະເພດ
    'units',       // ຂໍ້ມູນຍີ່ຫໍ້
    'warehouse',   // ຂໍ້ມູນບ່ອນຈັດວາງ
    'employees',   // ຂໍ້ມູນພະນັກງານ
    'suppliers',   // ຂໍ້ມູນຜູ້ສະໜອງ
    'customers',   // ຂໍ້ມູນລູກຄ້າ
  ],
  
  // ພະນັກງານສາງ - ເຫັນສະເພາະເມນູຍ່ອຍສິນຄ້າ ແລະ ລູກຄ້າ
  [ROLES.USER1]: [
    'products',    // ຂໍ້ມູນສິນຄ້າ
    'customers',   // ຂໍ້ມູນລູກຄ້າ
  ],
  
  // ພະນັກງານຂາຍ - ເຫັນສິນຄ້າ, ປະເພດ, ຍີ່ຫໍ້, ບ່ອນຈັດວາງ
  [ROLES.USER2]: [
    'products',    // ຂໍ້ມູນສິນຄ້າ
    'categories',  // ຂໍ້ມູນປະເພດ
    'units',       // ຂໍ້ມູນຍີ່ຫໍ້
    'warehouse',   // ຂໍ້ມູນບ່ອນຈັດວາງ
  ],
};

/**
 * ກວດສອບວ່າຜູ້ໃຊ້ມີສິດເຂົ້າເຖິງໜ້າທີ່ລະບຸຫຼືບໍ່
 * @param {string} path - ເສັ້ນທາງ (path) ທີ່ຕ້ອງການກວດສອບ
 * @returns {boolean} - ຜົນການກວດສອບ (true ຖ້າມີສິດ, false ຖ້າບໍ່ມີສິດ)
 */
export const hasPermission = (path) => {
  const currentUser = getCurrentUser();
  
  // ຖ້າບໍ່ມີຜູ້ໃຊ້ ຫຼື ບໍ່ມີຂໍ້ມູນ status, ບໍ່ມີສິດເຂົ້າເຖິງ
  if (!currentUser || !currentUser.status) {
    return false;
  }
  
  // ຮັບປະເພດ (ບົດບາດ) ຂອງຜູ້ໃຊ້
  const userRole = currentUser.status;
  
  // ກວດສອບວ່າມີສິດເຂົ້າເຖິງໜ້າເສັ້ນທາງນີ້ຫຼືບໍ່
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  
  // ກວດສອບວ່າເສັ້ນທາງນີ້ຢູ່ໃນລາຍການທີ່ອະນຸຍາດຫຼືບໍ່
  return permissions.includes(path);
};

/**
 * ກວດສອບວ່າເມນູຍ່ອຍທີ່ລະບຸສະແດງໃຫ້ກັບຜູ້ໃຊ້ນີ້ຫຼືບໍ່
 * @param {string} submenuKey - ຊື່ເມນູຍ່ອຍທີ່ຕ້ອງການກວດສອບ
 * @returns {boolean} - ຜົນການກວດສອບ (true ຖ້າສະແດງ, false ຖ້າບໍ່ສະແດງ)
 */
export const hasSubmenuPermission = (submenuKey) => {
  const currentUser = getCurrentUser();
  
  // ຖ້າບໍ່ມີຜູ້ໃຊ້ ຫຼື ບໍ່ມີຂໍ້ມູນ status, ບໍ່ສະແດງ
  if (!currentUser || !currentUser.status) {
    return false;
  }
  
  // ຮັບປະເພດ (ບົດບາດ) ຂອງຜູ້ໃຊ້
  const userRole = currentUser.status;
  
  // ກວດສອບວ່າມີສິດເຂົ້າເຖິງເມນູຍ່ອຍນີ້ຫຼືບໍ່
  const permissions = ROLE_SUBMENU_PERMISSIONS[userRole] || [];
  
  // ກວດສອບວ່າເມນູຍ່ອຍນີ້ຢູ່ໃນລາຍການທີ່ອະນຸຍາດຫຼືບໍ່
  return permissions.includes(submenuKey);
};

/**
 * ຮັບລາຍຊື່ເສັ້ນທາງທີ່ຜູ້ໃຊ້ປັດຈຸບັນມີສິດເຂົ້າເຖິງ
 * @returns {string[]} - ລາຍການເສັ້ນທາງທີ່ມີສິດເຂົ້າເຖິງ
 */
export const getUserPermissions = () => {
  const currentUser = getCurrentUser();
  
  // ຖ້າບໍ່ມີຜູ້ໃຊ້ ຫຼື ບໍ່ມີຂໍ້ມູນ status, ໃຫ້ສົ່ງລາຍການວ່າງກັບໄປ
  if (!currentUser || !currentUser.status) {
    return [];
  }
  
  // ຮັບປະເພດ (ບົດບາດ) ຂອງຜູ້ໃຊ້
  const userRole = currentUser.status;
  
  // ສົ່ງຄືນລາຍການເສັ້ນທາງທີ່ມີສິດເຂົ້າເຖິງ
  return ROLE_PERMISSIONS[userRole] || [];
};

/**
 * ຮັບລາຍຊື່ເມນູຍ່ອຍທີ່ສະແດງໃຫ້ກັບຜູ້ໃຊ້ປັດຈຸບັນ
 * @returns {string[]} - ລາຍການເມນູຍ່ອຍທີ່ສະແດງ
 */
export const getUserSubmenuPermissions = () => {
  const currentUser = getCurrentUser();
  
  // ຖ້າບໍ່ມີຜູ້ໃຊ້ ຫຼື ບໍ່ມີຂໍ້ມູນ status, ໃຫ້ສົ່ງລາຍການວ່າງກັບໄປ
  if (!currentUser || !currentUser.status) {
    return [];
  }
  
  // ຮັບປະເພດ (ບົດບາດ) ຂອງຜູ້ໃຊ້
  const userRole = currentUser.status;
  
  // ສົ່ງຄືນລາຍການເມນູຍ່ອຍທີ່ສະແດງ
  return ROLE_SUBMENU_PERMISSIONS[userRole] || [];
};

/**
 * ຮັບປະເພດຂອງຜູ້ໃຊ້ປັດຈຸບັນ
 * @returns {string|null} - ປະເພດຂອງຜູ້ໃຊ້ ຫຼື null ຖ້າບໍ່ມີຜູ້ໃຊ້
 */
export const getUserRole = () => {
  const currentUser = getCurrentUser();
  return currentUser?.status || null;
};