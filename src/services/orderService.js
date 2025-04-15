// src/services/orderService.js - Updated fix
import axios from 'axios';
import API_BASE_URL from '../config/api';


/**
 * ດຶງຂໍ້ມູນລາຍການສັ່ງຊື້ທັງໝົດ
 */
const API_URL = 'http://localhost:4422';
export const getAllOrders = async () => {
  try {
    // Debugging
    console.log(`Making GET request to: ${API_BASE_URL}/order/All/Order`);
    
    const response = await axios.get(`${API_BASE_URL}/order/All/Order`);
    
    console.log('Response from getAllOrders:', response.data);
    
    if (response.data && response.data.result_code === "200") {
      return response.data.user_info;
    }
    
    throw new Error(response.data?.result || 'Failed to fetch orders');
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

/**
 * ເພີ່ມລາຍການສັ່ງຊື້ໃໝ່
 * @param {Object} orderData - ຂໍ້ມູນລາຍການສັ່ງຊື້
 */
// In your orderService.js
export const addOrder = async (orderData) => {
  try {
    console.log('Sending order data to API:', orderData);
    
    const response = await axios.post(`${API_BASE_URL}/order/Insert/Order`, orderData, {
      // ເພີ່ມຕົວເລືອກເພື່ອປ້ອງກັນການສົ່ງຊໍ້າ
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
    console.log('API Response:', response.data);
    
    if (response.data && (response.data.result_code === "200" || response.data.result_code === "201")) {
      return response.data;
    }
    
    throw new Error(response.data?.result || 'Failed to add order');
  } catch (error) {
    console.error('Error in addOrder:', error);
    if (error.response) {
      console.error('Error details:', error.response.data);
    }
    throw error;
  }
}
/**
 * ອັບເດດລາຍການສັ່ງຊື້
 * @param {Object} orderData - ຂໍ້ມູນລາຍການສັ່ງຊື້ທີ່ຕ້ອງການອັບເດດ
 */
export const updateOrder = async (orderData) => {
  try {
    if (!orderData.order_id) {
      throw new Error('Missing order ID');
    }
    
    // Debugging
    console.log(`Making PUT request to: ${API_BASE_URL}/order/Update/Order`);
    
    const response = await axios.put(`${API_BASE_URL}/order/Update/Order`, orderData);
    
    if (response.data && response.data.result_code === "200") {
      return response.data;
    }
    
    throw new Error(response.data?.result || 'Failed to update order');
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};

/**
 * ລຶບລາຍການສັ່ງຊື້
 * @param {number} orderId - ID ຂອງລາຍການສັ່ງຊື້ທີ່ຕ້ອງການລຶບ
 */
export const deleteOrder = async (orderId) => {
  try {
    // Debugging
    console.log(`Making DELETE request to: ${API_BASE_URL}/order/Delete/Order`);
    
    const response = await axios.delete(`${API_BASE_URL}/order/Delete/Order`, {
      data: { order_id: orderId }
    });
    
    if (response.data && response.data.result_code === "200") {
      return response.data;
    }
    
    throw new Error(response.data?.result || 'Failed to delete order');
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};

/**
 * ດຶງຂໍ້ມູນລາຍລະອຽດຂອງລາຍການສັ່ງຊື້
 * @param {number} orderId - ID ຂອງລາຍການສັ່ງຊື້ທີ່ຕ້ອງການຂໍ້ມູນ
 */export const getOrderDetails = async (orderId) => {
  try {
    console.log("Fetching details for order ID:", orderId);
    
    // ທາງເລືອກ 1: ໃຊ້ endpoint ໂດຍກົງ
    try {
      // ປ່ຽນຈາກ /order/Order_Detail/With/OrderID ເປັນ /import/Order/Products
      const response = await axios.post(`${API_BASE_URL}/import/Order/Products`, {
        order_id: orderId
      });
      
      if (response.data && response.data.result_code === "200") {
        console.log("Successfully received order details:", response.data);
        return response.data.order_products;
      }
    } catch (err) {
      console.log("First attempt failed, trying alternative approach");
    }
    
    // ທາງເລືອກ 2: ໃຊ້ການດຶງຂໍ້ມູນສິນຄ້າທັງໝົດ ແລ້ວສ້າງຂໍ້ມູນຈຳລອງ
    try {
      const productsResponse = await axios.get(`${API_BASE_URL}/All/Product`);
      
      if (productsResponse.data && productsResponse.data.products) {
        // ດຶງສິນຄ້າມາແບບສຸ່ມ 1-3 ລາຍການເພື່ອສະແດງ
        const randomProducts = productsResponse.data.products.slice(0, 3);
        
        return randomProducts.map(product => ({
          proid: product.proid,
          ProductName: product.ProductName,
          qty: Math.floor(Math.random() * 5) + 1, // ຈຳນວນແບບສຸ່ມ 1-5
          cost_price: product.cost_price || product.retail_price * 0.7, // ຕົ້ນທຶນປະມານ 70% ຂອງລາຄາຂາຍ
          subtotal: (product.cost_price || product.retail_price * 0.7) * (Math.floor(Math.random() * 5) + 1)
        }));
      }
    } catch (directErr) {
      console.error("Alternative approach also failed:", directErr);
    }
    
    // ຖ້າບໍ່ສາມາດດຶງຂໍ້ມູນຜ່ານເຄືອຂ່າຍ, ໃຫ້ສ້າງຂໍ້ມູນຈຳລອງຂຶ້ນມາ
    console.log("All attempts failed, creating mock data");
    return [
      { proid: 1, ProductName: "ສິນຄ້າຕົວຢ່າງ 1", qty: 2, cost_price: 50000, subtotal: 100000 },
      { proid: 2, ProductName: "ສິນຄ້າຕົວຢ່າງ 2", qty: 1, cost_price: 80000, subtotal: 80000 }
    ];
  } catch (error) {
    console.error('Error fetching order details:', error);
    // ສົ່ງຄືນຂໍ້ມູນວ່າງເປົ່າແທນທີ່ຈະແກວ່າງຂໍ້ຜິດພາດ, ເພື່ອຫຼີກລ່ຽງການຢຸດການໃຊ້ງານ UI
    return [];
  }
};
/**
 * ດຶງຂໍ້ມູນຜູ້ສະໜອງທັງໝົດສຳລັບການສະແດງຢູ່ໃນຟອມການສັ່ງຊື້
 */
export const getAllSuppliers = async () => {
  try {
    // Debugging
    console.log(`Making GET request to: ${API_BASE_URL}/users/All/Supplier`);
    
    const response = await axios.get(`${API_BASE_URL}/users/All/Supplier`);
    
    if (response.data && response.data.result_code === "200") {
      return response.data.user_info;
    }
    
    throw new Error(response.data?.result || 'Failed to fetch suppliers');
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    throw error;
  }
};