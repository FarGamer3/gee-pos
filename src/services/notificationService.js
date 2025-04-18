// src/services/notificationService.js
import axios from 'axios';
import API_BASE_URL from '../config/api';

/**
 * ບໍລິການຈັດການກັບການແຈ້ງເຕືອນຕ່າງໆ
 * - ກວດສອບສິນຄ້າໃກ້ໝົດ
 * - ກວດສອບການລໍຖ້າອະນຸມັດ
 */

// ດຶງລາຍການສິນຄ້າທີ່ໃກ້ຈະໝົດ
export const getLowStockProducts = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/All/Min/Product`);
    if (response.data && response.data.result_code === "200") {
      return response.data.products || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    
    // ໃນກໍລະນີທີ່ບໍ່ສາມາດເຊື່ອມຕໍ່ກັບ API ໄດ້, ພະຍາຍາມດຶງຂໍ້ມູນສິນຄ້າທັງໝົດແລ້ວກັ່ນຕອງຢູ່ client
    try {
      const allProductsResponse = await axios.get(`${API_BASE_URL}/All/Product`);
      if (allProductsResponse.data && allProductsResponse.data.result_code === "200") {
        const products = allProductsResponse.data.products || [];
        // ກັ່ນຕອງສິນຄ້າທີ່ຈຳນວນຕໍ່າກວ່າຫຼືເທົ່າກັບຈຳນວນຕໍ່າສຸດ
        return products.filter(product => product.qty <= product.qty_min);
      }
    } catch (fallbackError) {
      console.error('Fallback method also failed:', fallbackError);
    }
    return [];
  }
};

// ດຶງລາຍການນຳເຂົ້າທີ່ລໍຖ້າການອະນຸມັດ
export const getPendingImports = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/import/All/Import`);
    if (response.data && response.data.result_code === "200") {
      const imports = response.data.imports || [];
      // ກັ່ນຕອງສະເພາະລາຍການທີ່ລໍຖ້າການອະນຸມັດ
      return imports.filter(item => item.status === 'Pending' || item.status === 'ລໍຖ້າ');
    }
    return [];
  } catch (error) {
    console.error('Error fetching pending imports:', error);
    
    // ໃນກໍລະນີທີ່ API ບໍ່ສາມາດໃຊ້ງານໄດ້, ລອງດຶງຈາກ localStorage ຖ້າມີ
    try {
      const savedImports = localStorage.getItem('importHistory');
      if (savedImports) {
        const importHistory = JSON.parse(savedImports);
        return importHistory.filter(item => item.status === 'Pending' || item.status === 'ລໍຖ້າ');
      }
    } catch (fallbackError) {
      console.error('Fallback method also failed:', fallbackError);
    }
    return [];
  }
};

// ດຶງລາຍການນຳອອກທີ່ລໍຖ້າການອະນຸມັດ
export const getPendingExports = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/export/All/Export`);
    if (response.data && response.data.result_code === "200") {
      const exports = response.data.exports || [];
      // ກັ່ນຕອງສະເພາະລາຍການທີ່ລໍຖ້າການອະນຸມັດ
      return exports.filter(item => item.status === 'ລໍຖ້າອະນຸມັດ' || item.status === 'Pending');
    }
    return [];
  } catch (error) {
    console.error('Error fetching pending exports:', error);
    
    // ໃນກໍລະນີທີ່ API ບໍ່ສາມາດໃຊ້ງານໄດ້, ລອງດຶງຈາກ localStorage ຖ້າມີ
    try {
      const savedExports = localStorage.getItem('exportHistory');
      if (savedExports) {
        const exportHistory = JSON.parse(savedExports);
        return exportHistory.filter(item => item.status === 'ລໍຖ້າອະນຸມັດ' || item.status === 'Pending');
      }
    } catch (fallbackError) {
      console.error('Fallback method also failed:', fallbackError);
    }
    return [];
  }
};

// ດຶງຈຳນວນການແຈ້ງເຕືອນທັງໝົດ
export const getAllNotificationsCount = async () => {
  try {
    const [lowStockProducts, pendingImports, pendingExports] = await Promise.all([
      getLowStockProducts(),
      getPendingImports(),
      getPendingExports()
    ]);
    
    return {
      lowStock: lowStockProducts.length,
      pendingImports: pendingImports.length,
      pendingExports: pendingExports.length,
      total: lowStockProducts.length + pendingImports.length + pendingExports.length
    };
  } catch (error) {
    console.error('Error getting all notification counts:', error);
    return {
      lowStock: 0,
      pendingImports: 0,
      pendingExports: 0,
      total: 0
    };
  }
};

// ດຶງລາຍການແຈ້ງເຕືອນທັງໝົດ
export const getAllNotifications = async () => {
  try {
    const [lowStockProducts, pendingImports, pendingExports] = await Promise.all([
      getLowStockProducts(),
      getPendingImports(),
      getPendingExports()
    ]);

    const notifications = [
      ...lowStockProducts.map(product => ({
        id: `low-stock-${product.proid}`,
        type: 'lowStock',
        title: 'ສິນຄ້າໃກ້ຈະໝົດ',
        message: `${product.ProductName} ເຫຼືອພຽງ ${product.qty} ອັນ`,
        date: new Date(),
        read: false,
        data: product
      })),
      ...pendingImports.map(item => ({
        id: `import-${item.imp_id || item.id}`,
        type: 'pendingImport',
        title: 'ລໍຖ້າອະນຸມັດການນຳເຂົ້າ',
        message: `ລາຍການນຳເຂົ້າ #${item.imp_id || item.id} ລໍຖ້າການອະນຸມັດ`,
        date: new Date(item.imp_date || item.date),
        read: false,
        data: item
      })),
      ...pendingExports.map(item => ({
        id: `export-${item.export_id || item.id}`,
        type: 'pendingExport',
        title: 'ລໍຖ້າອະນຸມັດການນຳອອກ',
        message: `ລາຍການນຳອອກ #${item.export_id || item.id} ລໍຖ້າການອະນຸມັດ`,
        date: new Date(item.export_date || item.date), 
        read: false,
        data: item
      }))
    ];

    // ຈັດລຽງຕາມລຳດັບເວລາ
    return notifications.sort((a, b) => b.date - a.date);
  } catch (error) {
    console.error('Error getting all notifications:', error);
    return [];
  }
};