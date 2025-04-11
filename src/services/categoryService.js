// src/services/categoryService.js
import axios from 'axios';

// API base URL - ຄວນເກັບໄວ້ໃນໄຟລ໌ .env ແລະ ໃຊ້ process.env.REACT_APP_API_URL ແທນ
const API_URL = 'http://localhost:4422';

/**
 * ດຶງຂໍ້ມູນປະເພດສິນຄ້າທັງໝົດ
 */
export const getAllCategories = async () => {
  try {
    const response = await axios.get(`${API_URL}/All/Category`);
    
    if (response.data && response.data.result_code === "200") {
      return response.data.user_info;
    }
    
    throw new Error(response.data?.result || 'Failed to fetch categories');
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * ເພີ່ມປະເພດສິນຄ້າໃໝ່
 */
export const addCategory = async (category) => {
  try {
    const response = await axios.post(`${API_URL}/Insert/Category`, { category });
    
    if (response.data && (response.data.result_code === "200" || response.data.result_code === "201")) {
      return response.data;
    }
    
    throw new Error(response.data?.result || 'Failed to add category');
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
};

/**
 * ແກ້ໄຂຂໍ້ມູນປະເພດສິນຄ້າ
 */
export const updateCategory = async (cat_id, category) => {
  try {
    const response = await axios.put(`${API_URL}/Update/Category`, { cat_id, category });
    
    if (response.data && response.data.result_code === "200") {
      return response.data;
    }
    
    throw new Error(response.data?.result || 'Failed to update category');
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

/**
 * ລຶບຂໍ້ມູນປະເພດສິນຄ້າ
 */
export const deleteCategory = async (cat_id) => {
  try {
    const response = await axios.delete(`${API_URL}/Delete/Category`, { 
      data: { cat_id } 
    });
    
    if (response.data && response.data.result_code === "200") {
      return response.data;
    }
    
    throw new Error(response.data?.result || 'Failed to delete category');
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};