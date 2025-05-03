// src/services/importService.js - ປັບປຸງການເຊື່ອມຕໍ່ກັບ API
import axios from 'axios';
import API_BASE_URL from '../config/api';

/**
 * ດຶງຂໍ້ມູນການນຳເຂົ້າສິນຄ້າທັງໝົດ
 */
export const getAllImports = async () => {
  try {
    console.log('ກຳລັງດຶງຂໍ້ມູນການນຳເຂົ້າທັງໝົດ...');
    const response = await axios.get(`${API_BASE_URL}/import/All/Import`);
    
    if (response.data && response.data.result_code === "200") {
      return response.data.imports || [];
    }
    
    console.warn('ຮູບແບບຂໍ້ມູນບໍ່ຖືກຕ້ອງ:', response.data);
    return [];
  } catch (error) {
    console.error('ຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນການນຳເຂົ້າ:', error.message);
    return [];
  }
};

/**
 * ດຶງຂໍ້ມູນລາຍລະອຽດການນຳເຂົ້າສິນຄ້າ
 */
export const getImportDetails = async (impId) => {
  try {
    console.log(`ກຳລັງດຶງລາຍລະອຽດການນຳເຂົ້າລະຫັດ: ${impId}`);
    const response = await axios.post(`${API_BASE_URL}/import/Import/Details`, { 
      imp_id: impId 
    });
    
    if (response.data && response.data.result_code === "200") {
      return response.data.import_details || [];
    }
    
    return [];
  } catch (error) {
    console.error('ຂໍ້ຜິດພາດໃນການດຶງລາຍລະອຽດການນຳເຂົ້າ:', error.message);
    return [];
  }
};

/**
 * ດຶງຂໍ້ມູນລາຍການສັ່ງຊື້ທີ່ຍັງບໍ່ໄດ້ນຳເຂົ້າ
 */
export const getPendingOrders = async () => {
  try {
    console.log('ກຳລັງດຶງລາຍການສັ່ງຊື້ທີ່ລໍຖ້າການນຳເຂົ້າ...');
    
    // ທາງເລືອກທີ 1: ໃຊ້ API ສະເພາະ
    try {
      const response = await axios.get(`${API_BASE_URL}/import/Pending/Orders`);
      
      if (response.data && response.data.result_code === "200") {
        return response.data.pending_orders || [];
      }
    } catch (e) {
      console.warn('API ສະເພາະບໍ່ສາມາດເຮັດວຽກໄດ້, ລອງວິທີສຳຮອງ...');
    }
    
    // ທາງເລືອກທີ 2: ໃຊ້ API ທົ່ວໄປ
    const ordersResponse = await axios.get(`${API_BASE_URL}/order/All/Order`);
    
    if (ordersResponse.data && ordersResponse.data.result_code === "200") {
      return ordersResponse.data.user_info || [];
    }
    
    return [];
  } catch (error) {
    console.error('ຂໍ້ຜິດພາດໃນການດຶງລາຍການສັ່ງຊື້ທີ່ລໍຖ້າ:', error.message);
    return [];
  }
};

/**
 * ດຶງຂໍ້ມູນລາຍການສິນຄ້າໃນລາຍການສັ່ງຊື້
 */
export const getOrderProducts = async (orderId) => {
  if (!orderId) {
    console.error('ຕ້ອງລະບຸລະຫັດການສັ່ງຊື້');
    return [];
  }
  
  try {
    console.log(`ກຳລັງດຶງລາຍການສິນຄ້າສຳລັບລະຫັດການສັ່ງຊື້: ${orderId}`);
    
    // ທາງເລືອກທີ 1: ໃຊ້ API ສະເພາະສຳລັບການດຶງຂໍ້ມູລສິນຄ້າໃນລາຍການສັ່ງຊື້
    try {
      const response = await axios.post(`${API_BASE_URL}/import/Order/Products`, { 
        order_id: orderId 
      });
      
      if (response.data && response.data.result_code === "200") {
        return response.data.order_products || [];
      }
    } catch (e) {
      console.warn(`API ຂໍ້ມູນສິນຄ້າບໍ່ສາມາດເຮັດວຽກໄດ້ສຳລັບການສັ່ງຊື້ ${orderId}, ລອງວິທີສຳຮອງ...`);
    }
    
    // ທາງເລືອກທີ 2: ໃຊ້ API ລາຍລະອຽດການສັ່ງຊື້
    try {
      const response = await axios.post(`${API_BASE_URL}/order/Order_Detail/With/OrderID`, { 
        order_id: orderId 
      });
      
      if (response.data && response.data.result_code === "200") {
        const orderDetails = response.data.user_info || [];
        return orderDetails.map(item => ({
          proid: item.proid,
          ProductName: item.ProductName,
          qty: item.qty,
          cost_price: 0, // ຄ່າເລີ່ມຕົ້ນທີ່ຜູ້ໃຊ້ຕ້ອງປ້ອນ
          subtotal: 0
        }));
      }
    } catch (err) {
      console.warn(`API ລາຍລະອຽດການສັ່ງຊື້ບໍ່ສາມາດເຮັດວຽກໄດ້ສຳລັບການສັ່ງຊື້ ${orderId}, ລອງວິທີສຸດທ້າຍ...`);
    }
    
    // ທາງເລືອກທີ 3: ໃຊ້ຂໍ້ມູນສິນຄ້າທັງໝົດແລ້ວສ້າງຂໍ້ມູນຈຳລອງ
    const productsResponse = await axios.get(`${API_BASE_URL}/All/Product`);
    
    if (productsResponse.data && productsResponse.data.products) {
      const sampleProducts = productsResponse.data.products.slice(0, 3);
      
      return sampleProducts.map(product => ({
        proid: product.proid,
        ProductName: product.ProductName,
        qty: 1,
        cost_price: product.cost_price || 0,
        subtotal: product.cost_price || 0
      }));
    }
    
    return [];
  } catch (error) {
    console.error('ຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນສິນຄ້າໃນລາຍການສັ່ງຊື້:', error.message);
    return [];
  }
};

/**
 * ສ້າງລາຍການນຳເຂົ້າສິນຄ້າໃໝ່
 */
export const createImport = async (importData) => {
  if (!importData || !importData.items || importData.items.length === 0) {
    throw new Error('ຂໍ້ມູນການນຳເຂົ້າຕ້ອງມີລາຍການສິນຄ້າ');
  }
  
  try {
    console.log('ກຳລັງບັນທຶກຂໍ້ມູນການນຳເຂົ້າ:', JSON.stringify(importData));
    
    // ຮັບປະກັນວ່າຂໍ້ມູນມີຮູບແບບທີ່ຖືກຕ້ອງ
    const formattedData = {
      emp_id: Number(importData.emp_id),
      order_id: Number(importData.order_id),
      imp_date: importData.imp_date || new Date().toISOString().split('T')[0],
      status: importData.status || 'Completed',
      total_price: Number(importData.total_price || 0),
      items: importData.items.map(item => ({
        proid: Number(item.proid),
        qty: Number(item.qty || 1),
        cost_price: Number(item.cost_price || 0)
      }))
    };
    
    // ຄຳນວນລາຄາລວມຖ້າບໍ່ໄດ້ລະບຸ
    if (!formattedData.total_price) {
      formattedData.total_price = formattedData.items.reduce(
        (sum, item) => sum + (item.cost_price * item.qty), 0
      );
    }
    
    console.log('ຂໍ້ມູນທີ່ຈະສົ່ງໄປຍັງ API:', JSON.stringify(formattedData));
    
    // ສົ່ງຂໍ້ມູນໄປຍັງ API
    const response = await axios.post(
      `${API_BASE_URL}/import/Create/Import`, 
      formattedData,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // ໃຫ້ເວລາ 10 ວິນາທີ
      }
    );
    
    if (response.data && (response.data.result_code === "200" || response.data.result_code === "201")) {
      console.log('ການບັນທຶກຂໍ້ມູນການນຳເຂົ້າສຳເລັດ:', response.data);
      return response.data;
    }
    
    console.warn('API ສົ່ງຄ່າກັບມາທີ່ບໍ່ຄາດຫວັງ:', response.data);
    throw new Error('API ສົ່ງຄ່າກັບມາທີ່ບໍ່ຄາດຫວັງ');
  } catch (error) {
    console.error('ຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນການນຳເຂົ້າ:', error);
    throw new Error(`ຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນການນຳເຂົ້າ: ${error.message}`);
  }
};

/**
 * ແກ້ໄຂສະຖານະການນຳເຂົ້າສິນຄ້າ
 */
export const updateImportStatus = async (impId, status) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/import/Update/Status`, {
      imp_id: impId,
      status: status
    });
    
    if (response.data && response.data.result_code === "200") {
      return true;
    }
    return false;
  } catch (error) {
    console.error('ຂໍ້ຜິດພາດໃນການອັບເດດສະຖານະການນຳເຂົ້າ:', error);
    return false;
  }
};

export const deleteImport = async (importId) => {
  if (!importId) {
    throw new Error('ຕ້ອງລະບຸລະຫັດການນຳເຂົ້າ');
  }
  
  try {
    console.log(`ກຳລັງລຶບການນຳເຂົ້າລະຫັດ: ${importId}`);
    
    const response = await axios.delete(`${API_BASE_URL}/import/Delete/Import`, {
      data: { imp_id: importId }
    });
    
    if (response.data && response.data.result_code === "200") {
      return response.data;
    }
    
    throw new Error(response.data?.result || 'Failed to delete import');
  } catch (error) {
    console.error('ຂໍ້ຜິດພາດໃນການລຶບການນຳເຂົ້າ:', error);
    throw error;
  }
};
/**
 * ອັບເດດສິນຄ້າໂດຍກົງ (ໃຊ້ໃນກໍລະນີ API ການນຳເຂົ້າບໍ່ເຮັດວຽກ)
 */
export const updateProductStockDirectly = async (importItems) => {
  if (!importItems || !Array.isArray(importItems) || importItems.length === 0) {
    throw new Error('ຕ້ອງມີລາຍການສິນຄ້າຢ່າງໜ້ອຍ 1 ລາຍການ');
  }
  
  try {
    console.log('ກຳລັງອັບເດດສິນຄ້າໂດຍກົງ...');
    let successCount = 0;
    
    for (const item of importItems) {
      try {
        // 1. ດຶງຂໍ້ມູນສິນຄ້າປັດຈຸບັນ
        const productResponse = await axios.post(`${API_BASE_URL}/Product/With/ID`, {
          proid: item.proid
        });
        
        if (productResponse.data && productResponse.data.user_info && productResponse.data.user_info.length > 0) {
          const product = productResponse.data.user_info[0];
          
          // 2. ຄຳນວນຈຳນວນສິນຄ້າໃໝ່
          const currentQty = parseInt(product.qty) || 0;
          const newQty = currentQty + parseInt(item.qty);
          
          // 3. ອັບເດດຈຳນວນສິນຄ້າ
          await axios.put(`${API_BASE_URL}/Update/Product`, {
            proid: item.proid,
            qty: newQty
          });
          
          successCount++;
        }
      } catch (error) {
        console.error(`ຂໍ້ຜິດພາດໃນການອັບເດດສິນຄ້າລະຫັດ ${item.proid}:`, error);
      }
    }
    
    return {
      success: successCount > 0,
      successCount,
      totalItems: importItems.length
    };
  } catch (error) {
    console.error('ຂໍ້ຜິດພາດໃນການອັບເດດສິນຄ້າໂດຍກົງ:', error);
    throw error;
  }
};

/**
 * ທົດສອບການເຊື່ອມຕໍ່ກັບເຊີບເວີ
 */
export const testServerConnection = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/All/Customer`, {
      timeout: 5000
    });
    
    return {
      success: true,
      status: response.status,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      status: error.response?.status
    };
  }
};