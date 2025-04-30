// src/services/exportService.js - Updated version with fixes for export functionality

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
      // Process the response to ensure all exports have item_count if possible
      const exports = response.data.exports || [];
      
      // Add item counts where missing (for demo only, in production this should be handled server-side)
      // This is just a temporary measure until the API is updated to include item_count
      const processedExports = exports.map(exportItem => {
        // If the export already has an item_count, use it
        if (typeof exportItem.item_count === 'number') {
          return exportItem;
        }
        
        // If the export has items array, count those
        if (exportItem.items && Array.isArray(exportItem.items)) {
          return {
            ...exportItem,
            item_count: exportItem.items.length
          };
        }
        
        // If the export has export_details array, count those
        if (exportItem.export_details && Array.isArray(exportItem.export_details)) {
          return {
            ...exportItem,
            item_count: exportItem.export_details.length
          };
        }
        
        // No item count available
        return exportItem;
      });
      
      return processedExports;
    }
    
    // ດຶງຈາກ localStorage ຖ້າ API ບໍ່ສາມາດດຶງໄດ້
    const localExports = getExportsFromLocalStorage();
    return localExports;
  } catch (error) {
    console.error('ຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນປະຫວັດການນຳອອກສິນຄ້າ:', error);
    
    // ດຶງຈາກ localStorage ຖ້າມີຂໍ້ຜິດພາດໃນການຮ້ອງຂໍຈາກ API
    const localExports = getExportsFromLocalStorage();
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
      // Process the details for consistent field names
      const details = response.data.export_details || [];
      
      const processedDetails = details.map(item => ({
        ...item,
        // Add standardized fields to handle different APIs
        name: item.name || item.ProductName || 'ບໍ່ລະບຸຊື່',
        exportQuantity: item.qty || item.exportQuantity || 0,
        exportLocation: item.location || (item.zone_id ? `Zone ${item.zone_id}` : 'ບໍ່ລະບຸ'),
        exportReason: item.reason || item.exportReason || 'ບໍ່ລະບຸສາເຫດ'
      }));
      
      return processedDetails;
    }
    
    // Try to get from localStorage if API fails
    return getExportDetailsFromLocalStorage(exportId);
  } catch (error) {
    console.error('ຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນລາຍລະອຽດການນຳອອກສິນຄ້າ:', error);
    
    // Get from localStorage as fallback
    return getExportDetailsFromLocalStorage(exportId);
  }
};

/**
 * Get export details from localStorage for fallback
 * @param {number} exportId - Export ID to find
 * @returns {Array} Export details if found, empty array if not
 */
function getExportDetailsFromLocalStorage(exportId) {
  try {
    const localExports = JSON.parse(localStorage.getItem('exportHistory') || '[]');
    const exportItem = localExports.find(item => 
      item.id === parseInt(exportId) || item.export_id === parseInt(exportId)
    );
    
    if (exportItem && exportItem.items && Array.isArray(exportItem.items)) {
      return exportItem.items;
    }
    
    return [];
  } catch (error) {
    console.error('Error getting export details from localStorage:', error);
    return [];
  }
}
    

/**
 * ບັນທຶກການນຳອອກສິນຄ້າ (ປັບປຸງໃຫ້ຮອງຮັບການໃຊ້ງານທີ່ດີຂຶ້ນ)
 * @param {Object} exportData - ຂໍ້ມູນການນຳອອກສິນຄ້າ
 * @returns {Promise<Object>} ຜົນການບັນທຶກການນຳອອກສິນຄ້າ
 */
export const createExport = async (exportData) => {
  console.log('ກຳລັງສົ່ງຄຳຂໍການນຳອອກສິນຄ້າ:', exportData);
  
  try {
    // Process item data to ensure compatibility with API
    const processedItems = exportData.items.map(item => ({
      proid: item.id || item.proid,  // Make sure we have proid set
      qty: item.exportQuantity || item.qty, // Ensure qty is set
      zone_id: item.zone_id || 1,  // Include zone_id or default to 1
      reason: item.exportReason || item.reason || ''
    }));
    
    // Prepare data in format expected by the API
    const apiData = {
      emp_id: exportData.emp_id,
      export_date: exportData.export_date,
      status: exportData.status || 'ລໍຖ້າອະນຸມັດ',
      items: processedItems
    };
    
    console.log('ຂໍ້ມູນທີ່ປັບຮຽບຮ້ອຍແລ້ວສຳລັບ API:', apiData);
    
    // Send data to API
    const response = await axios.post(`${API_BASE_URL}/export/Create/Export`, apiData);
    
    if (response.data && response.data.result_code === "200") {
      // Save to localStorage as well
      saveExportToLocalStorage(exportData, response.data.export_id);
      return response.data;
    } else {
      throw new Error(response.data?.result || 'ບໍ່ສາມາດບັນທຶກການນຳອອກສິນຄ້າໄດ້');
    }
  } catch (error) {
    console.error('ຂໍ້ຜິດພາດໃນການບັນທຶກການນຳອອກສິນຄ້າ:', error);
    console.log('ກຳລັງພະຍາຍາມບັນທຶກແບບ fallback ໃນ localStorage...');
    
    // Fallback - store in localStorage if API fails
    const localResult = saveExportToLocalStorage(exportData);
    
    if (localResult) {
      return {
        result_code: "200",
        result: "ບັນທຶກສຳເລັດ (ບັນທຶກໄວ້ໃນເຄື່ອງເທົ່ານັ້ນ)",
        export_id: Date.now()
      };
    }
    
    throw error;
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
    
    // Fallback - update in localStorage
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
    console.log("ກຳລັງລຶບການນຳອອກສິນຄ້າ ID:", exportId);
    
    const response = await axios.delete(`${API_BASE_URL}/export/Delete/Export`, {
      data: { export_id: exportId }
    });
    
    if (response.data && response.data.result_code === "200") {
      // Remove from localStorage as well
      deleteExportFromLocalStorage(exportId);
      return true;
    }
    return false;
  } catch (error) {
    console.error('ຂໍ້ຜິດພາດໃນການລຶບການນຳອອກສິນຄ້າ:', error);
    
    // Try to delete from localStorage anyway
    deleteExportFromLocalStorage(exportId);
    throw error;
  }
};

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
      export_id: serverExportId || Date.now(), // ສຳຮອງໄວ້ເພື່ອຄວາມເຂົ້າກັນໄດ້ກັບ API
      date: exportData.export_date || new Date().toLocaleDateString('lo-LA'),
      export_date: exportData.export_date || new Date().toLocaleDateString('lo-LA'),
      items: exportData.items.map(item => ({
        ...item,
        proid: item.id,
        qty: item.exportQuantity,
        location: item.exportLocation,
        reason: item.exportReason
      })),
      status: exportData.status || 'ລໍຖ້າອະນຸມັດ',
      emp_id: exportData.emp_id || 1
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
      (item.id === parseInt(exportId) || item.export_id === parseInt(exportId)) 
        ? { ...item, status } 
        : item
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
    const filteredHistory = existingHistory.filter(item => 
      item.id !== parseInt(exportId) && item.export_id !== parseInt(exportId)
    );
    
    // ບັນທຶກກັບຄືນໄປຍັງ localStorage
    localStorage.setItem('exportHistory', JSON.stringify(filteredHistory));
    
    return true;
  } catch (error) {
    console.error('ຂໍ້ຜິດພາດໃນການລຶບຈາກ localStorage:', error);
    return false;
  }
}

/**
 * ຟັງຊັນທົດສອບການເຊື່ອມຕໍ່
 * @returns {Promise<Object>} ຄຳຕອບຈາກ API
 */
export const testExportAPI = async () => {
  try {
    // Create a simple test payload
    const testData = {
      test: true,
      timestamp: new Date().toISOString()
    };
    
    const response = await axios.post(`${API_BASE_URL}/export/test-export`, testData);
    console.log("ຜົນການທົດສອບ API:", response.data);
    return response.data;
  } catch (error) {
    console.error('ຂໍ້ຜິດພາດໃນການທົດສອບ API:', error);
    throw error;
  }
};