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
    // Validate required fields
    if (!saleData.cus_id || !saleData.emp_id || !saleData.products || !saleData.products.length) {
      throw new Error('Missing required sale data fields');
    }
    
    // Make sure all fields are in the correct format
    const formattedData = {
      cus_id: Number(saleData.cus_id),
      emp_id: Number(saleData.emp_id),
      subtotal: Number(saleData.subtotal || 0),
      pay: Number(saleData.pay || 0),
      money_change: Number(saleData.money_change || 0),
      products: saleData.products.map(product => ({
        proid: Number(product.proid),
        qty: Number(product.qty || 1),
        price: Number(product.price || 0),
        total: Number(product.total || product.price * product.qty || 0)
      }))
    };

    // Calculate subtotal if not provided
    if (!formattedData.subtotal) {
      formattedData.subtotal = formattedData.products.reduce(
        (sum, product) => sum + product.total, 0
      );
    }
    
    // Set default pay amount equal to subtotal if not provided
    if (!formattedData.pay) {
      formattedData.pay = formattedData.subtotal;
    }
    
    // Calculate change if not provided
    if (!formattedData.money_change) {
      formattedData.money_change = formattedData.pay - formattedData.subtotal;
    }
    
    console.log('Sending formatted sale data:', JSON.stringify(formattedData));
    
    // Make the API request with properly formatted data
    const response = await axios.post(`${API_BASE_URL}/sale/Insert/Sales`, formattedData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 seconds timeout
    });
    
    if (response.data && (response.data.result_code === "200" || response.data.result_code === "201")) {
      console.log('Sale created successfully:', response.data);
      return response.data;
    }
    
    console.warn('Sale API returned unexpected format:', response.data);
    throw new Error('Sale API returned unexpected response');
  } catch (error) {
    console.error('Error in createSale:', error.message);
    
    // Check for specific error types to provide more helpful messages
    if (error.response) {
      console.error('Server response error:', error.response.data);
      
      if (error.response.status === 400) {
        throw new Error('Bad request: The sales data format is invalid');
      } else if (error.response.status === 500) {
        throw new Error('Server error: The sales could not be processed');
      }
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
      return response.data.user_info || [];
    }
    
    return []; // Return empty array for invalid response
  } catch (error) {
    console.error('Error fetching customers:', error.message);
    return []; // Return empty array on error
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
      return response.data.products || [];
    }
    
    return []; // Return empty array for invalid response
  } catch (error) {
    console.error('Error fetching products:', error.message);
    return []; // Return empty array on error
  }
};

/**
 * ຄົ້ນຫາສິນຄ້າດ້ວຍຄຳຄົ້ນຫາ (Search products by keyword)
 * @param {string} keyword - ຄຳຄົ້ນຫາ
 * @returns {Promise} - ຜົນການຄົ້ນຫາ
 */
export const searchProducts = async (keyword) => {
  if (!keyword || keyword.trim() === '') {
    return getAllProducts(); // Return all products if no keyword
  }
  
  try {
    const response = await axios.post(`${API_BASE_URL}/products/search`, { 
      ProductName: keyword 
    });
    
    if (response.data && response.data.result_code === "200") {
      return response.data.products || [];
    }
    
    return []; // Return empty array for invalid response
  } catch (error) {
    console.error('Error searching products:', error.message);
    return []; // Return empty array on error
  }
};

/**
 * ດຶງປະຫວັດການຂາຍທັງໝົດ (Get all sales history)
 * @returns {Promise<Array>} - ປະຫວັດການຂາຍ
 */
export const getSalesHistory = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/sale/All/Sales`);
    
    if (response.data && response.data.result_code === "200") {
      // Map the API response to a more usable format
      return response.data.sales_data.map(sale => ({
        sale_id: sale.sale_id,
        date_sale: sale.date_sale,
        customer_name: sale.customer_name || "ລູກຄ້າທົ່ວໄປ",
        emp_name: sale.emp_name,
        subtotal: sale.subtotal,
        pay: sale.pay,
        money_change: sale.money_change,
        // Add empty products array that will be populated when viewing details
        products: []
      }));
    }
    
    // If API doesn't return valid data, create empty data for UI
    console.warn('Invalid sales history data format from API');
    return [];
  } catch (error) {
    console.error('Error fetching sales history:', error);
    
    // Return mock data for development/testing if API unavailable
    if (process.env.NODE_ENV === 'development') {
      return getMockSalesHistory();
    }
    
    // In production, return empty array
    return [];
  }
};

/**
 * ດຶງລາຍລະອຽດການຂາຍ (Get sale details)
 * @param {number} saleId - ລະຫັດການຂາຍ
 * @returns {Promise<Object>} - ລາຍລະອຽດການຂາຍ
 */
export const getSaleDetails = async (saleId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/sale/Sale/Details`, {
      sale_id: saleId
    });
    
    if (response.data && response.data.result_code === "200") {
      return response.data.sale_details || [];
    }
    
    return []; // Return empty array for invalid response
  } catch (error) {
    console.error(`Error fetching details for sale #${saleId}:`, error);
    
    // Return mock data for development/testing if API unavailable
    if (process.env.NODE_ENV === 'development') {
      return getMockSaleDetails(saleId);
    }
    
    return []; // Return empty array on error
  }
};

/**
 * ສ້າງຂໍ້ມູນຈຳລອງສຳລັບເຮັດວຽກແບບ Offline
 * @returns {Array} - ຂໍ້ມູນຈຳລອງປະຫວັດການຂາຍ
 */
const getMockSalesHistory = () => {
  const mockData = [
    {
      sale_id: 1001,
      date_sale: '2025-04-15T10:30:00',
      customer_name: 'ລູກຄ້າທົ່ວໄປ',
      emp_name: 'ພະນັກງານ ທົດສອບ',
      subtotal: 350000,
      pay: 400000,
      money_change: 50000,
      products: []
    },
    {
      sale_id: 1002,
      date_sale: '2025-04-15T14:45:00',
      customer_name: 'ທ. ສົມພອນ ວິໄລພອນ',
      emp_name: 'ພະນັກງານ ທົດສອບ',
      subtotal: 750000,
      pay: 800000,
      money_change: 50000,
      products: []
    },
    {
      sale_id: 1003,
      date_sale: '2025-04-16T09:15:00',
      customer_name: 'ນ. ດາລາວອນ ຄຳມີໄຊ',
      emp_name: 'ພະນັກງານ ທົດສອບ',
      subtotal: 1250000,
      pay: 1300000,
      money_change: 50000,
      products: []
    }
  ];
  
  return mockData;
};

/**
 * ສ້າງຂໍ້ມູນຈຳລອງລາຍລະອຽດການຂາຍສຳລັບເຮັດວຽກແບບ Offline
 * @param {number} saleId - ລະຫັດການຂາຍ
 * @returns {Array} - ຂໍ້ມູນຈຳລອງລາຍລະອຽດການຂາຍ
 */
const getMockSaleDetails = (saleId) => {
  const mockSaleDetails = {
    1001: [
      { product_name: 'ແອ Samsung', price: 350000, qty: 1, total: 350000 }
    ],
    1002: [
      { product_name: 'ຕູ້ເຢັນ LG', price: 450000, qty: 1, total: 450000 },
      { product_name: 'ໝໍ້ຫຸງເຂົ້າ Panasonic', price: 300000, qty: 1, total: 300000 }
    ],
    1003: [
      { product_name: 'ໂທລະພາບ Samsung 43"', price: 1250000, qty: 1, total: 1250000 }
    ]
  };
  
  return mockSaleDetails[saleId] || [];
};

/**
 * ຍົກເລີກການຂາຍ (Cancel sale)
 * @param {number} saleId - ລະຫັດການຂາຍ
 * @returns {Promise<boolean>} - ຜົນການຍົກເລີກການຂາຍ
 */
export const cancelSale = async (saleId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/sale/Delete/Sale`, {
      data: { sale_id: saleId }
    });
    
    if (response.data && response.data.result_code === "200") {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error canceling sale #${saleId}:`, error);
    throw error;
  }
};