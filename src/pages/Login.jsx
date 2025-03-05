import { useState } from 'react';
import styles from '../pages/CSS/Login.module.css';
import logoImage from '../assets/logo.png';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // ຈັດການລະບົບເຂົ້າສູ່ລະບົບທີ່ນີ້ (ໃນກໍລະນີຈິງຕ້ອງເຊື່ອມຕໍ່ກັບ API)
    onLogin();
  };
  
  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <img src={logoImage} alt="GeePOS Logo" className={styles.logo} />
        <h2>ເຂົ້າສູ່ລະບົບ</h2>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="username">ຊື່ຜູ້ໃຊ້</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="password">ລະຫັດຜ່ານ</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className={styles.loginButton}>
            ເຂົ້າສູ່ລະບົບ
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;