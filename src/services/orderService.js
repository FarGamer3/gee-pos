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
    const response = await axios.post(`${API_BASE_URL}/order/Insert/Order`, orderData);
    
    if (response.data && response.data.result_code === "200") {
      return response.data;
    }
    
    throw new Error(response.data?.result || 'Failed to add order');
  } catch (error) {
    console.error('Error adding order:', error);
    throw error;
  }
};
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
 */
export const getOrderDetails = async (orderId) => {
  try {
    // Debugging
    console.log(`Making POST request to: ${API_BASE_URL}/order/Order_Detail/With/OrderID`);
    
    const response = await axios.post(`${API_BASE_URL}/order/Order_Detail/With/OrderID`, {
      order_id: orderId
    });
    
    if (response.data && response.data.result_code === "200") {
      return response.data.user_info;
    }
    
    throw new Error(response.data?.result || 'Failed to fetch order details');
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw error;
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