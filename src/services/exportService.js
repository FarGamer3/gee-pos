// src/services/exportService.js
import axios from 'axios';
import API_BASE_URL from '../config/api';

/**
 * ດຶງຂໍ້ມູນປະຫວັດການນຳອອກສິນຄ້າທັງໝົດ
 * @returns {Promise<Array>} ຂໍ້ມູນປະຫວັດການນຳອອກສິນຄ້າ
 */
export const getAllExports = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/export/All/Export`);
    
    if (response.data && response.data.result_code === "200") {
      return response.data.exports || [];
    }
    
    // ດຶງຈາກ localStorage ຖ້າ API ບໍ່ສາມາດດຶງໄດ້
    const localExports = JSON.parse(localStorage.getItem('exportHistory') || '[]');
    return localExports;
  } catch (error) {
    console.error('ຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນປະຫວັດການນຳອອກສິນຄ້າ:', error);
    
    // ດຶງຈາກ localStorage ຖ້າມີຂໍ້ຜິດພາດໃນການຮ້ອງຂໍຈາກ API
    const localExports = JSON.parse(localStorage.getItem('exportHistory') || '[]');
    return localExports;
  }
};

/**
 * ດຶງຂໍ້ມູນລາຍລະອຽດການນຳອອກສິນຄ້າຕາມລະຫັດ
 * @param {number} exportId - ລະຫັດການນຳອອກສິນຄ້າ
 * @returns {Promise<Object>} ຂໍ້ມູນລາຍລະອຽດການນຳອອກສິນຄ້າ
 */
export const getExportDetails = async (exportId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/export/Export/Details`, {
      export_id: exportId
    });
    
    if (response.data && response.data.result_code === "200") {
      return response.data.export_details || [];
    }
    
    // ດຶງຈາກ localStorage ຖ້າ API ບໍ່ສາມາດດຶງໄດ້
    const localExports = JSON.parse(localStorage.getItem('exportHistory') || '[]');
    const exportItem = localExports.find(item => item.id === parseInt(exportId));
    return exportItem?.items || [];
  } catch (error) {
    console.error('ຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນລາຍລະອຽດການນຳອອກສິນຄ້າ:', error);
    
    // ດຶງຈາກ localStorage ຖ້າມີຂໍ້ຜິດພາດໃນການຮ້ອງຂໍຈາກ API
    const localExports = JSON.parse(localStorage.getItem('exportHistory') || '[]');
    const exportItem = localExports.find(item => item.id === parseInt(exportId));
    return exportItem?.items || [];
  }
};

/**
 * ບັນທຶກການນຳອອກສິນຄ້າ
 * @param {Object} exportData - ຂໍ້ມູນການນຳອອກສິນຄ້າ
 * @returns {Promise<Object>} ຜົນການບັນທຶກການນຳອອກສິນຄ້າ
 */
export const createExport = async (exportData) => {
  if (!exportData.items || exportData.items.length === 0) {
    throw new Error('ຕ້ອງມີລາຍການສິນຄ້າຢ່າງໜ້ອຍ 1 ລາຍການ');
  }
  
  try {
    // ພະຍາຍາມສົ່ງຂໍ້ມູນໄປຍັງ backend API
    const response = await axios.post(`${API_BASE_URL}/export/Create/Export`, exportData);
    
    if (response.data && (response.data.result_code === "200" || response.data.result_code === "201")) {
      saveExportToLocalStorage(exportData, response.data.export_id);
      return response.data;
    } else {
      throw new Error(response.data?.result || 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກການນຳອອກສິນຄ້າ');
    }
  } catch (error) {
    console.error('ຂໍ້ຜິດພາດໃນການບັນທຶກການນຳອອກສິນຄ້າ:', error);
    
    // Fallback ຖ້າ API ບໍ່ສາມາດໃຊ້ໄດ້: ບັນທຶກໄວ້ໃນ localStorage
    const saveResult = saveExportToLocalStorage(exportData);
    
    // ພະຍາຍາມອັບເດດສະຕັອກສິນຄ້າໂດຍກົງ (ຖ້າ API ການນຳອອກສິນຄ້າໃຊ້ບໍ່ໄດ້)
    try {
      await updateProductStockDirectly(exportData.items);
    } catch (stockError) {
      console.error('ບໍ່ສາມາດອັບເດດສະຕັອກສິນຄ້າໄດ້:', stockError);
    }
    
    if (saveResult) {
      return { result_code: "200", result: "ບັນທຶກສຳເລັດ (ເກັບໄວ້ໃນເຄື່ອງ)", local_storage: true };
    } else {
      throw new Error('ບໍ່ສາມາດບັນທຶກຂໍ້ມູນໄດ້');
    }
  }
};

/**
 * ອັບເດດສະຖານະການນຳອອກສິນຄ້າ
 * @param {number} exportId - ລະຫັດການນຳອອກສິນຄ້າ
 * @param {string} status - ສະຖານະໃໝ່
 * @returns {Promise<boolean>} ຜົນການອັບເດດສະຖານະ
 */
export const updateExportStatus = async (exportId, status) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/export/Update/Status`, {
      export_id: exportId,
      status: status
    });
    
    if (response.data && response.data.result_code === "200") {
      updateExportStatusInLocalStorage(exportId, status);
      return true;
    }
    return false;
  } catch (error) {
    console.error('ຂໍ້ຜິດພາດໃນການອັບເດດສະຖານະການນຳອອກສິນຄ້າ:', error);
    
    // Fallback: ອັບເດດສະຖານະໃນ localStorage
    return updateExportStatusInLocalStorage(exportId, status);
  }
};

/**
 * ລຶບການນຳອອກສິນຄ້າ
 * @param {number} exportId - ລະຫັດການນຳອອກສິນຄ້າ
 * @returns {Promise<boolean>} ຜົນການລຶບການນຳອອກສິນຄ້າ
 */
export const deleteExport = async (exportId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/export/Delete/Export`, {
      data: { export_id: exportId }
    });
    
    if (response.data && response.data.result_code === "200") {
      deleteExportFromLocalStorage(exportId);
      return true;
    }
    return false;
  } catch (error) {
    console.error('ຂໍ້ຜິດພາດໃນການລຶບການນຳອອກສິນຄ້າ:', error);
    
    // Fallback: ລຶບຈາກ localStorage
    return deleteExportFromLocalStorage(exportId);
  }
};

/**
 * ອັບເດດສະຕັອກສິນຄ້າໂດຍກົງ (ກໍລະນີບໍ່ສາມາດໃຊ້ API ການນຳອອກສິນຄ້າໄດ້)
 * @param {Array} items - ລາຍການສິນຄ້າທີ່ຈະອັບເດດ
 * @returns {Promise<Object>} ຜົນການອັບເດດສະຕັອກສິນຄ້າ
 */
async function updateProductStockDirectly(items) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error('ຕ້ອງມີລາຍການສິນຄ້າຢ່າງໜ້ອຍ 1 ລາຍການ');
  }
  
  let successCount = 0;
  
  for (const item of items) {
    try {
      // ດຶງຂໍ້ມູນສິນຄ້າປັດຈຸບັນ
      const productsResponse = await axios.get(`${API_BASE_URL}/All/Product`);
      
      if (productsResponse.data && productsResponse.data.products) {
        const products = productsResponse.data.products;
        const product = products.find(p => p.proid === item.id);
        
        if (product) {
          // ຄຳນວນຈຳນວນສິນຄ້າໃໝ່ (ຫຼຸດລົງ)
          const currentQty = parseInt(product.qty) || 0;
          const exportQty = parseInt(item.exportQuantity);
          const newQty = Math.max(0, currentQty - exportQty); // ຮັບປະກັນວ່າບໍ່ຕິດລົບ
          
          // ອັບເດດຈຳນວນສິນຄ້າ
          await axios.put(`${API_BASE_URL}/Update/Product`, {
            proid: item.id,
            qty: newQty
          });
          
          successCount++;
        }
      }
    } catch (error) {
      console.error(`ບໍ່ສາມາດອັບເດດສິນຄ້າລະຫັດ ${item.id} ໄດ້:`, error);
    }
  }
  
  return {
    success: successCount > 0,
    successCount,
    totalItems: items.length
  };
}

/**
 * ບັນທຶກການນຳອອກສິນຄ້າລົງໃນ localStorage
 * @param {Object} exportData - ຂໍ້ມູນການນຳອອກສິນຄ້າ
 * @param {number|null} serverExportId - ລະຫັດການນຳອອກສິນຄ້າຈາກເຊີບເວີ (ຖ້າມີ)
 * @returns {boolean} ຜົນການບັນທຶກ
 */
function saveExportToLocalStorage(exportData, serverExportId = null) {
  try {
    // ດຶງປະຫວັດທີ່ມີຢູ່ແລ້ວ
    const existingHistory = JSON.parse(localStorage.getItem('exportHistory') || '[]');
    
    // ສ້າງຂໍ້ມູນປະຫວັດໃໝ່
    const newExport = {
      id: serverExportId || Date.now(), // ໃຊ້ລະຫັດຈາກເຊີບເວີຖ້າມີ, ບໍ່ດັ່ງນັ້ນໃຊ້ timestamp
      date: exportData.date || new Date().toLocaleDateString('lo-LA'),
      items: exportData.items.map(item => ({
        ...item,
        exportQuantity: item.exportQuantity || item.qty
      })),
      status: exportData.status || 'ລໍຖ້າອະນຸມັດ'
    };
    
    // ເພີ່ມປະຫວັດໃໝ່
    existingHistory.unshift(newExport);
    
    // ບັນທຶກກັບຄືນໄປຍັງ localStorage
    localStorage.setItem('exportHistory', JSON.stringify(existingHistory));
    
    return true;
  } catch (error) {
    console.error('ຂໍ້ຜິດພາດໃນການບັນທຶກປະຫວັດລົງໃນ localStorage:', error);
    return false;
  }
}

/**
 * ອັບເດດສະຖານະການນຳອອກສິນຄ້າໃນ localStorage
 * @param {number} exportId - ລະຫັດການນຳອອກສິນຄ້າ
 * @param {string} status - ສະຖານະໃໝ່
 * @returns {boolean} ຜົນການອັບເດດສະຖານະ
 */
function updateExportStatusInLocalStorage(exportId, status) {
  try {
    // ດຶງປະຫວັດທີ່ມີຢູ່ແລ້ວ
    const existingHistory = JSON.parse(localStorage.getItem('exportHistory') || '[]');
    
    // ຊອກຫາແລະອັບເດດສະຖານະ
    const updatedHistory = existingHistory.map(item => 
      item.id === exportId ? { ...item, status } : item
    );
    
    // ບັນທຶກກັບຄືນໄປຍັງ localStorage
    localStorage.setItem('exportHistory', JSON.stringify(updatedHistory));
    
    return true;
  } catch (error) {
    console.error('ຂໍ້ຜິດພາດໃນການອັບເດດສະຖານະໃນ localStorage:', error);
    return false;
  }
}

/**
 * ລຶບການນຳອອກສິນຄ້າຈາກ localStorage
 * @param {number} exportId - ລະຫັດການນຳອອກສິນຄ້າ
 * @returns {boolean} ຜົນການລຶບ
 */
function deleteExportFromLocalStorage(exportId) {
  try {
    // ດຶງປະຫວັດທີ່ມີຢູ່ແລ້ວ
    const existingHistory = JSON.parse(localStorage.getItem('exportHistory') || '[]');
    
    // ກັ່ນຕອງລາຍການທີ່ຕ້ອງການລຶບອອກ
    const filteredHistory = existingHistory.filter(item => item.id !== exportId);
    
    // ບັນທຶກກັບຄືນໄປຍັງ localStorage
    localStorage.setItem('exportHistory', JSON.stringify(filteredHistory));
    
    return true;
  } catch (error) {
    console.error('ຂໍ້ຜິດພາດໃນການລຶບຈາກ localStorage:', error);
    return false;
  }
}