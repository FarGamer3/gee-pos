import { NavLink } from 'react-router-dom';
import styles from '../pages/CSS/Sidebar.module.css';
import logoImage from '../assets/logo.png';

function Sidebar() {
  return (
    <div className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <img src={logoImage} alt="GeePOS Logo" className={styles.logo} />
      </div>
      
      <nav className={styles.nav}>
        <NavLink to="/dashboard" className={({ isActive }) => 
          `${styles.navItem} ${isActive ? styles.active : ''}`
        }>
          <span className={`${styles.icon} ${styles.homeIcon}`}></span>
          <span>ໜ້າຫຼັກ</span>
        </NavLink>
        
        <NavLink to="/Manage_data" className={({ isActive }) => 
          `${styles.navItem} ${isActive ? styles.active : ''}`
        }>
          <span className={`${styles.icon} ${styles.categoryIcon}`}></span>
          <span>ຈັດການຂໍ້ມູນຫຼັກ</span>
        </NavLink>
        
        <NavLink to="/products" className={({ isActive }) => 
          `${styles.navItem} ${isActive ? styles.active : ''}`
        }>
          <span className={`${styles.icon} ${styles.productIcon}`}></span>
          <span>ສັ່ງຊື້ສິນຄ້າ</span>
        </NavLink>
        
        <NavLink to="/sales" className={({ isActive }) => 
          `${styles.navItem} ${isActive ? styles.active : ''}`
        }>
          <span className={`${styles.icon} ${styles.salesIcon}`}></span>
          <span>ຂາຍສິນຄ້າ</span>
        </NavLink>
        
        <NavLink to="/import" className={({ isActive }) => 
          `${styles.navItem} ${isActive ? styles.active : ''}`
        }>
          <span className={`${styles.icon} ${styles.importIcon}`}></span>
          <span>ນຳເຂົ້າສິນຄ້າ</span>
        </NavLink>
        
        <NavLink to="/check-stock" className={({ isActive }) => 
          `${styles.navItem} ${isActive ? styles.active : ''}`
        }>
          <span className={`${styles.icon} ${styles.stockIcon}`}></span>
          <span>ນຳອອກສິນຄ້າ</span>
        </NavLink>
        
        <NavLink to="/reports" className={({ isActive }) => 
          `${styles.navItem} ${isActive ? styles.active : ''}`
        }>
          <span className={`${styles.icon} ${styles.reportIcon}`}></span>
          <span>ລາຍງານ</span>
        </NavLink>
      </nav>
    </div>
  );
}

export default Sidebar;
