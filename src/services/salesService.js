// src/services/salesService.js
import axios from 'axios';
import API_BASE_URL from '../config/api';

/**
 * ເພີ່ມການຂາຍໃໝ່ (Create a new sale)
 * @param {Object} saleData - ຂໍ້ມູນການຂາຍ
 * @returns {Promise} - ຜົນການບັນທຶກການຂາຍ
 */
export const createSale = async (saleData) => {
  try {
    console.log('Sending sale data to API:', saleData);
    
    const response = await axios.post(`${API_BASE_URL}/sale/Insert/Sales`, saleData);
    
    console.log('API Response:', response.data);
    
    if (response.data && (response.data.result_code === "200" || response.data.result_code === "201")) {
      return response.data;
    }
    
    throw new Error(response.data?.result || 'Failed to save sale');
  } catch (error) {
    console.error('Error in createSale:', error);
    if (error.response) {
      console.error('Error details:', error.response.data);
    }
    throw error;
  }
};

/**
 * ດຶງຂໍ້ມູນລູກຄ້າທັງໝົດ (Get all customers)
 * @returns {Promise} - ຂໍ້ມູນລູກຄ້າ
 */
export const getAllCustomers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/All/Customer`);
    
    if (response.data && response.data.result_code === "200") {
      return response.data.user_info;
    }
    
    throw new Error(response.data?.result || 'Failed to fetch customers');
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

/**
 * ດຶງຂໍ້ມູນສິນຄ້າທັງໝົດ (Get all products)
 * @returns {Promise} - ຂໍ້ມູນສິນຄ້າ
 */
export const getAllProducts = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/All/Product`);
    
    if (response.data && response.data.result_code === "200") {
      return response.data.products;
    }
    
    throw new Error(response.data?.result || 'Failed to fetch products');
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

/**
 * ຄົ້ນຫາສິນຄ້າດ້ວຍຄຳຄົ້ນຫາ (Search products by keyword)
 * @param {string} keyword - ຄຳຄົ້ນຫາ
 * @returns {Promise} - ຜົນການຄົ້ນຫາ
 */
export const searchProducts = async (keyword) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/products/search`, { ProductName: keyword });
    
    if (response.data && response.data.result_code === "200") {
      return response.data.products;
    }
    
    return []; // Return empty array if no results
  } catch (error) {
    console.error('Error searching products:', error);
    return []; // Return empty array on error
  }
};