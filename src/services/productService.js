// src/services/productService.js
import axios from 'axios';

// API base URL - ຄວນເກັບໄວ້ໃນໄຟລ໌ .env ແລະ ໃຊ້ process.env.REACT_APP_API_URL ແທນ
const API_URL = 'http://localhost:4422';

/**
 * ດຶງຂໍ້ມູນສິນຄ້າທັງໝົດ
 */
export const getAllProducts = async () => {
  try {
    const response = await axios.get(`${API_URL}/All/Product`);
    
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
 * ດຶງຂໍ້ມູນສິນຄ້າຕາມຊື່
 */
export const getProductByName = async (productName) => {
  try {
    const response = await axios.post(`${API_URL}/Product/With/ID`, { ProductName: productName });
    
    if (response.data && response.data.result_code === "200") {
      return response.data.user_info; // API ສົ່ງຂໍ້ມູນກັບມາໃນຮູບແບບນີ້
    }
    
    throw new Error(response.data?.result || 'Failed to fetch product');
  } catch (error) {
    console.error('Error fetching product by name:', error);
    throw error;
  }
};

/**
 * ເພີ່ມສິນຄ້າໃໝ່
 */
export const addProduct = async (productData) => {
    try {
      // ກວດສອບຂໍ້ມູນກ່ອນສົ່ງໄປຫາ API
      console.log('Sending product data to API:', productData);
      
      const response = await axios.post(`${API_URL}/Insert/Product`, productData);
      
      console.log('API Response:', response.data);
      
      if (response.data && (response.data.result_code === "200" || response.data.result_code === "201")) {
        return response.data;
      }
      
      throw new Error(response.data?.result || 'Failed to add product');
    } catch (error) {
      console.error('Error in addProduct:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  };

/**
 * ແກ້ໄຂຂໍ້ມູນສິນຄ້າ
 */
export const updateProduct = async (productData) => {
  try {
    const response = await axios.put(`${API_URL}/Update/Product`, productData);
    
    if (response.data && response.data.result_code === "200") {
      return response.data;
    }
    
    throw new Error(response.data?.result || 'Failed to update product');
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

/**
 * ລຶບຂໍ້ມູນສິນຄ້າ
 */
export const deleteProduct = async (productId) => {
  try {
    const response = await axios.delete(`${API_URL}/Delete/Product`, { 
      data: { proid: productId } 
    });
    
    if (response.data && response.data.result_code === "200") {
      return response.data;
    }
    
    throw new Error(response.data?.result || 'Failed to delete product');
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};