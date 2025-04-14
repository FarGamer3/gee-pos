// src/services/orderService.js
import axios from 'axios';
import API_BASE_URL from '../config/api';

/**
 * ດຶງຂໍ້ມູນລາຍການສັ່ງຊື້ທັງໝົດ
 */
export const getAllOrders = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/order/All/Order`);
    
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
export const addOrder = async (orderData) => {
  try {
    console.log('Sending order data:', orderData);
    
    // ແກ້ໄຂເສັ້ນທາງໃຫ້ຖືກຕ້ອງ
    const response = await axios.post(`${API_BASE_URL}/order/All/Order`, orderData);
    
    console.log('API Response:', response.data);
    
    if (response.data && (response.data.result_code === "200" || response.data.result_code === "201")) {
      return response.data;
    }
    
    throw new Error(response.data?.result || 'Failed to add order');
  } catch (error) {
    console.error('Error adding order:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Status code:', error.response.status);
    }
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
    
    const response = await axios.put(`${API_BASE_URL}/order/Update/Orders`, orderData);
    
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
    const response = await axios.delete(`${API_BASE_URL}/order/Delete/Orders`, {
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