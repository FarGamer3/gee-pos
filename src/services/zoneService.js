// src/services/zoneService.js
import axios from 'axios';

// API base URL - ຄວນເກັບໄວ້ໃນໄຟລ໌ .env ແລະ ໃຊ້ process.env.REACT_APP_API_URL ແທນ
const API_URL = 'http://localhost:4422';

/**
 * ດຶງຂໍ້ມູນໂຊນທັງໝົດ
 */
export const getAllZones = async () => {
  try {
    const response = await axios.get(`${API_URL}/All/Zone`);
    
    if (response.data && response.data.result_code === "200") {
      return response.data.user_info;
    }
    
    throw new Error(response.data?.result || 'Failed to fetch zones');
  } catch (error) {
    console.error('Error fetching zones:', error);
    throw error;
  }
};

/**
 * ເພີ່ມໂຊນໃໝ່
 */
export const addZone = async (zone, zone_detail) => {
  try {
    const response = await axios.post(`${API_URL}/Insert/Zone`, { zone, zone_detail });
    
    if (response.data && (response.data.result_code === "200" || response.data.result_code === "201")) {
      return response.data;
    }
    
    throw new Error(response.data?.result || 'Failed to add zone');
  } catch (error) {
    console.error('Error adding zone:', error);
    throw error;
  }
};

/**
 * ແກ້ໄຂຂໍ້ມູນໂຊນ
 */
export const updateZone = async (zone_id, zone, zone_detail) => {
  try {
    const response = await axios.put(`${API_URL}/Update/Zone`, { zone_id, zone, zone_detail });
    
    if (response.data && response.data.result_code === "200") {
      return response.data;
    }
    
    throw new Error(response.data?.result || 'Failed to update zone');
  } catch (error) {
    console.error('Error updating zone:', error);
    throw error;
  }
};

/**
 * ລຶບຂໍ້ມູນໂຊນ
 */
export const deleteZone = async (zone_id) => {
  try {
    const response = await axios.delete(`${API_URL}/Delete/Zone`, { 
      data: { zone_id } 
    });
    
    if (response.data && response.data.result_code === "200") {
      return response.data;
    }
    
    throw new Error(response.data?.result || 'Failed to delete zone');
  } catch (error) {
    console.error('Error deleting zone:', error);
    throw error;
  }
};