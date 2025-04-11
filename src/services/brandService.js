// src/services/brandService.js
import axios from 'axios';

// API base URL - ຄວນເກັບໄວ້ໃນໄຟລ໌ .env ແລະ ໃຊ້ process.env.REACT_APP_API_URL ແທນ
const API_URL = 'http://localhost:4422';

/**
 * ດຶງຂໍ້ມູນຍີ່ຫໍ້ທັງໝົດ
 */
export const getAllBrands = async () => {
  try {
    const response = await axios.get(`${API_URL}/All/Brand`);
    
    if (response.data && response.data.result_code === "200") {
      return response.data.user_info;
    }
    
    throw new Error(response.data?.result || 'Failed to fetch brands');
  } catch (error) {
    console.error('Error fetching brands:', error);
    throw error;
  }
};

/**
 * ເພີ່ມຍີ່ຫໍ້ໃໝ່
 */
export const addBrand = async (brand) => {
  try {
    const response = await axios.post(`${API_URL}/Insert/Brand`, { brand });
    
    if (response.data && (response.data.result_code === "200" || response.data.result_code === "201")) {
      return response.data;
    }
    
    throw new Error(response.data?.result || 'Failed to add brand');
  } catch (error) {
    console.error('Error adding brand:', error);
    throw error;
  }
};

/**
 * ແກ້ໄຂຂໍ້ມູນຍີ່ຫໍ້
 */
export const updateBrand = async (brand_id, brand) => {
  try {
    const response = await axios.put(`${API_URL}/Update/Brand`, { brand_id, brand });
    
    if (response.data && response.data.result_code === "200") {
      return response.data;
    }
    
    throw new Error(response.data?.result || 'Failed to update brand');
  } catch (error) {
    console.error('Error updating brand:', error);
    throw error;
  }
};

/**
 * ລຶບຂໍ້ມູນຍີ່ຫໍ້
 */
export const deleteBrand = async (brand_id) => {
  try {
    const response = await axios.delete(`${API_URL}/Delete/Brand`, { 
      data: { brand_id } 
    });
    
    if (response.data && response.data.result_code === "200") {
      return response.data;
    }
    
    throw new Error(response.data?.result || 'Failed to delete brand');
  } catch (error) {
    console.error('Error deleting brand:', error);
    throw error;
  }
};