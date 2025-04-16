// src/services/salesService.js - Improved with better error handling and data validation
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
 * ວິເຄາະຂໍ້ຜິດພາດຂອງ API (Diagnostic function for API errors)
 * @returns {Promise} - ຜົນການທົດສອບ API
 */
export const diagnosticTest = async () => {
  const results = {
    customerApi: { success: false, message: '', data: null },
    productApi: { success: false, message: '', data: null },
    saleApi: { success: false, message: '', data: null }
  };
  
  // Test customer API
  try {
    const response = await axios.get(`${API_BASE_URL}/users/All/Customer`, { timeout: 3000 });
    results.customerApi.success = true;
    results.customerApi.message = 'API is responding correctly';
    results.customerApi.data = { count: response.data?.user_info?.length || 0 };
  } catch (error) {
    results.customerApi.message = `Error: ${error.message}`;
    if (error.response) {
      results.customerApi.data = { 
        status: error.response.status,
        statusText: error.response.statusText
      };
    }
  }
  
  // Test product API
  try {
    const response = await axios.get(`${API_BASE_URL}/All/Product`, { timeout: 3000 });
    results.productApi.success = true;
    results.productApi.message = 'API is responding correctly';
    results.productApi.data = { count: response.data?.products?.length || 0 };
  } catch (error) {
    results.productApi.message = `Error: ${error.message}`;
    if (error.response) {
      results.productApi.data = { 
        status: error.response.status,
        statusText: error.response.statusText
      };
    }
  }
  
  // Test sale API with minimal data
  try {
    // Don't actually submit, just check if the endpoint exists
    await axios.options(`${API_BASE_URL}/sale/Insert/Sales`, { timeout: 3000 });
    results.saleApi.success = true;
    results.saleApi.message = 'API endpoint exists';
  } catch (error) {
    results.saleApi.message = `Error: ${error.message}`;
    if (error.response) {
      results.saleApi.data = { 
        status: error.response.status,
        statusText: error.response.statusText
      };
    }
  }
  
  return results;
};