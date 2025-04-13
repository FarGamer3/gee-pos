// src/services/authService.js
import axios from 'axios';
import API_BASE_URL from '../config/api';

/**
 * ເຂົ້າສູ່ລະບົບດ້ວຍຊື່ຜູ້ໃຊ້ ແລະ ລະຫັດຜ່ານຈາກຖານຂໍ້ມູນ
 * @param {string} username - ຊື່ຜູ້ໃຊ້
 * @param {string} password - ລະຫັດຜ່ານ
 * @returns {Promise} - ຂໍ້ມູນຜູ້ໃຊ້ເມື່ອເຂົ້າສູ່ລະບົບສຳເລັດ
 */
export const login = async (username, password) => {
  try {
    // ເຮັດການເຊື່ອມຕໍ່ໄປຫາ API Login/Emp ຈາກ back-end
    const response = await axios.post(`${API_BASE_URL}/users/Login/Emp`, {
      username,
      password
    });
    
    // ກວດສອບຜົນຕອບກັບຈາກ API
    if (response.data && response.data.result_code === "200") {
      // ຖ້າລະຫັດຕອບກັບແມ່ນ 200 ໝາຍຄວາມວ່າເຂົ້າສູ່ລະບົບສຳເລັດ
      
      // ຈັດເກັບຂໍ້ມູນຜູ້ໃຊ້ໄວ້ໃນ localStorage ເພື່ອໃຊ້ໃນການເຂົ້າເຖິງໜ້າອື່ນໆ
      localStorage.setItem('user', JSON.stringify(response.data.employee));
      
      return response.data.employee;
    }
    
    // ຖ້າມີຂໍ້ຜິດພາດ ໃຫ້ throw error ເພື່ອໃຫ້ catch ດັກຈັບ
    throw new Error(response.data?.result || 'ເຂົ້າສູ່ລະບົບບໍ່ສຳເລັດ');
  } catch (error) {
    // ດັກຈັບຂໍ້ຜິດພາດທີ່ອາດເກີດຂຶ້ນ
    console.error('Login error:', error);
    
    // ຕັດສິນໃຈວ່າຈະສະແດງຂໍ້ຜິດພາດແບບໃດຂຶ້ນກັບລັກສະນະຂອງຂໍ້ຜິດພາດ
    if (error.response) {
      // ຂໍ້ຜິດພາດຈາກ API (ລະຫັດບໍ່ຖືກຕ້ອງ, ຜູ້ໃຊ້ບໍ່ມີ, ບັນຊີຖືກລະງັບ, ແລະ ອື່ນໆ)
      const errorMsg = error.response.data?.result || 'ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ';
      throw new Error(errorMsg);
    } else if (error.request) {
      // ບໍ່ສາມາດເຊື່ອມຕໍ່ກັບ API ໄດ້ (ບໍ່ມີການຕອບກັບຈາກເຊີບເວີ)
      throw new Error('ບໍ່ສາມາດເຊື່ອມຕໍ່ກັບເຊີບເວີໄດ້. ກະລຸນາກວດສອບການເຊື່ອມຕໍ່ອິນເຕີເນັດ.');
    } else {
      // ຂໍ້ຜິດພາດອື່ນໆ
      throw new Error('ເກີດຂໍ້ຜິດພາດໃນການເຂົ້າສູ່ລະບົບ. ກະລຸນາລອງໃໝ່ອີກຄັ້ງ.');
    }
  }
};

/**
 * ອອກຈາກລະບົບ
 */
export const logout = () => {
  // ລຶບຂໍ້ມູນຜູ້ໃຊ້ຈາກ localStorage
  localStorage.removeItem('user');
};

/**
 * ກວດສອບວ່າຜູ້ໃຊ້ເຂົ້າສູ່ລະບົບຢູ່ຫຼືບໍ່
 * @returns {boolean} - true ຖ້າເຂົ້າສູ່ລະບົບຢູ່, false ຖ້າບໍ່ໄດ້ເຂົ້າສູ່ລະບົບ
 */
export const isAuthenticated = () => {
  const user = localStorage.getItem('user');
  return !!user; // ແປງເປັນ boolean
};

/**
 * ດຶງຂໍ້ມູນຜູ້ໃຊ້ທີ່ເຂົ້າສູ່ລະບົບ
 * @returns {Object|null} - ຂໍ້ມູນຜູ້ໃຊ້ ຫຼື null ຖ້າບໍ່ໄດ້ເຂົ້າສູ່ລະບົບ
 */
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};