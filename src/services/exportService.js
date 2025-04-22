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
    const exportItem = localExports.find(item => item.id === parseInt(exportId) || item.export_id === parseInt(exportId));
    return exportItem?.items || [];
  } catch (error) {
    console.error('ຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນລາຍລະອຽດການນຳອອກສິນຄ້າ:', error);
    
    // ດຶງຈາກ localStorage ຖ້າມີຂໍ້ຜິດພາດໃນການຮ້ອງຂໍຈາກ API
    const localExports = JSON.parse(localStorage.getItem('exportHistory') || '[]');
    const exportItem = localExports.find(item => item.id === parseInt(exportId) || item.export_id === parseInt(exportId));
    return exportItem?.items || [];
  }
};

/**
 * ບັນທຶກການນຳອອກສິນຄ້າ
 * @param {Object} exportData - ຂໍ້ມູນການນຳອອກສິນຄ້າ
 * @returns {Promise<Object>} ຜົນການບັນທຶກການນຳອອກສິນຄ້າ
 */
export const createExport = async (exportData) => {
  try {
    // ກຳນົດຂໍ້ມູນທີ່ຈະສົ່ງໄປໃຫ້ API
    const apiExportData = {
      emp_id: exportData.emp_id,
      export_date: exportData.export_date,
      status: exportData.status || 'ລໍຖ້າອະນຸມັດ',
      items: exportData.items.map(item => ({
        proid: item.id,  // ສົ່ງ proid ແທນ id ເພື່ອຄວາມເຂົ້າກັນໄດ້ກັບ API
        qty: item.exportQuantity,
        // ຖ້າມີ zone_id ໃຫ້ໃຊ້, ຖ້າບໍ່ມີໃຫ້ພະຍາຍາມຄົ້ນຫາຈາກ location
        zone_id: item.zone_id || getZoneIdFromLocation(item.exportLocation || item.location),
        reason: item.exportReason,
        // ເພີ່ມຂໍ້ມູນ location ສຳລັບການບັນທຶກ
        location: item.exportLocation || item.location || ''
      }))
    };
    
    console.log('ກຳລັງສົ່ງຂໍ້ມູນໄປຍັງ API:', apiExportData);
    
    // ສົ່ງຂໍ້ມູນໄປ API
    const response = await axios.post(`${API_BASE_URL}/export/Create/Export`, apiExportData);
    
    if (response.data && response.data.result_code === "200") {
      // ບັນທຶກສຳເລັດ, ບັນທຶກປະຫວັດໃນ localStorage ເຊັ່ນກັນ
      saveExportToLocalStorage(exportData, response.data.export_id);
      
      return response.data;
    } else {
      throw new Error(response.data?.result || 'ບໍ່ສາມາດບັນທຶກການນຳອອກສິນຄ້າໄດ້');
    }
  } catch (error) {
    console.error('ຂໍ້ຜິດພາດໃນການບັນທຶກການນຳອອກສິນຄ້າ:', error);
    
    // ທົດລອງສົ່ງ direct request ໄປຍັງຕາຕະລາງ export ແລະ export_detail
    try {
      // ສ້າງລາຍການ export ກ່ອນ
      const exportResponse = await axios.post(`${API_BASE_URL}/export/test-export`, {
        emp_id: exportData.emp_id,
        export_date: exportData.export_date,
        status: exportData.status || 'ລໍຖ້າອະນຸມັດ',
        is_direct: true // ເພື່ອບອກວ່ານີ້ແມ່ນການບັນທຶກໂດຍກົງ
      });
      
      if (exportResponse.data && exportResponse.data.result_code === "200" && exportResponse.data.export_id) {
        const exportId = exportResponse.data.export_id;
        
        // ບັນທຶກລາຍລະອຽດສຳລັບແຕ່ລະລາຍການສິນຄ້າ
        for (const item of exportData.items) {
          await axios.post(`${API_BASE_URL}/export/test-detail`, {
            exp_id: exportId,
            proid: item.id,
            qty: item.exportQuantity,
            zone_id: item.zone_id || getZoneIdFromLocation(item.exportLocation || item.location) || 1,
            reason: item.exportReason
          });
        }
        
        // ບັນທຶກປະຫວັດໃນ localStorage
        saveExportToLocalStorage(exportData, exportId);
        
        return {
          result_code: "200",
          result: "ບັນທຶກສຳເລັດ (ວິທີທາງເລືອກ)",
          export_id: exportId
        };
      }
    } catch (directError) {
      console.error('ຂໍ້ຜິດພາດໃນການບັນທຶກໂດຍກົງ:', directError);
    }
    
    // ພະຍາຍາມບັນທຶກໃສ່ localStorage ໃນກໍລະນີ API ລົ້ມເຫຼວ
    const localResult = saveExportToLocalStorage(exportData);
    
    if (localResult) {
      // ຖ້າບັນທຶກໃນ localStorage ສຳເລັດ, ສົ່ງຄືນຂໍ້ມູນຄ້າຍຄືກັບຈາກ API
      return {
        result_code: "200",
        result: "ບັນທຶກສຳເລັດ (ບັນທຶກໄວ້ໃນເຄື່ອງເທົ່ານັ້ນ)",
        export_id: Date.now()
      };
    }
    
    throw error; // ສົ່ງຕໍ່ຂໍ້ຜິດພາດໄປຍັງຜູ້ເອີ້ນໃຊ້
  }
};

/**
 * ຄົ້ນຫາ zone_id ຈາກຊື່ location
 * @param {string} location - ຊື່ location (ເຊັ່ນ: "A", "B", "C")
 * @returns {number|null} zone_id ຖ້າພົບ, null ຖ້າບໍ່ພົບ
 */
function getZoneIdFromLocation(location) {
  if (!location) return null;
  
  // ສ້າງແມັບແບບງ່າຍສຳລັບຄົ້ນຫາ zone_id ຈາກຊື່ zone
  const zoneMap = {
    'A': 1,
    'B': 2,
    'C': 3,
    'D': 4,
    'E': 5
  };
  
  // ດຶງຕົວອັກສອນທຳອິດຈາກ location ເພື່ອໃຊ້ຄົ້ນຫາ
  const firstChar = location.charAt(0).toUpperCase();
  return zoneMap[firstChar] || 1; // ຖ້າບໍ່ພົບໃຫ້ໃຊ້ 1 ເປັນຄ່າເລີ່ມຕົ້ນ
}

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
    console.log("ກຳລັງລຶບການນຳອອກສິນຄ້າ ID:", exportId);
    
    const response = await axios.delete(`${API_BASE_URL}/export/Delete/Export`, {
      data: { export_id: exportId }
    });
    
    if (response.data && response.data.result_code === "200") {
      // ລຶບຈາກ localStorage ເຊັ່ນກັນ
      deleteExportFromLocalStorage(exportId);
      return true;
    }
    return false;
  } catch (error) {
    console.error('ຂໍ້ຜິດພາດໃນການລຶບການນຳອອກສິນຄ້າ:', error);
    
    // ລອງລຶບຈາກ localStorage ໃນກໍລະນີທີ່ API ລົ້ມເຫຼວ
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
 * @param {Object} exportData - ຂໍ້ມູນທົດສອບທີ່ຈະສົ່ງ
 * @returns {Promise<Object>} ຄຳຕອບຈາກ API
 */
export const testExportAPI = async (testData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/export/test-export`, testData);
    console.log("ຜົນການທົດສອບ API:", response.data);
    return response.data;
  } catch (error) {
    console.error('ຂໍ້ຜິດພາດໃນການທົດສອບ API:', error);
    throw error;
  }
};