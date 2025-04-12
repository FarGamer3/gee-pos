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
/**
 * ແກ້ໄຂຂໍ້ມູນສິນຄ້າ
 */
/**
 * ແກ້ໄຂຂໍ້ມູນສິນຄ້າ - ສົ່ງສະເພາະຂໍ້ມູນທີ່ຕ້ອງການອັບເດດ
 */
export const updateProduct = async (productData) => {
  try {
    console.log('Original update data:', productData);
    
    // ກວດສອບວ່າມີ proid ຫຼືບໍ່
    if (!productData.proid) {
      throw new Error('Missing required field: proid');
    }

    // ສົ່ງສະເພາະຂໍ້ມູນທີ່ຕ້ອງການອັບເດດ (ບໍ່ຕ້ອງຄົບທຸກຟິລ)
    const payload = {
      proid: productData.proid
    };

    // ເພີ່ມພຽງແຕ່ຄ່າທີ່ມີຢູ່ແລ້ວໃນ productData
    if (productData.ProductName) payload.ProductName = productData.ProductName;
    if (productData.brand_id !== undefined) payload.brand_id = Number(productData.brand_id);
    if (productData.cat_id !== undefined) payload.cat_id = Number(productData.cat_id);
    if (productData.zone_id !== undefined) payload.zone_id = Number(productData.zone_id);
    if (productData.pro_detail !== undefined) payload.pro_detail = productData.pro_detail;
    if (productData.qty !== undefined) payload.qty = Number(productData.qty);
    if (productData.qty_min !== undefined) payload.qty_min = Number(productData.qty_min);
    if (productData.cost_price !== undefined) payload.cost_price = Number(productData.cost_price);
    if (productData.retail_price !== undefined) payload.retail_price = Number(productData.retail_price);
    if (productData.status) payload.status = productData.status;

    console.log('Simplified payload for API:', payload);
    
    // ສົ່ງຂໍ້ມູນໄປຫາ API
    const response = await axios.put(`${API_URL}/Update/Product`, payload);
    
    console.log('API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in updateProduct:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};
/**
 * ລຶບຂໍ້ມູນສິນຄ້າ
 */
export const deleteProduct = async (productId) => {
  try {
    console.log('Deleting product with ID:', productId);
    
    const response = await axios.delete(`${API_URL}/Delete/Product`, { 
      data: { proid: productId } 
    });
    
    console.log('Delete API response:', response.data);
    
    if (response.data && response.data.result_code === "200") {
      return response.data;
    }
    
    throw new Error(response.data?.result || 'Failed to delete product');
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};