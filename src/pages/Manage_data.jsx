import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import styles from '../pages/CSS/Manage_data.module.css';
import productIcon from '../assets/icons/product.svg';
import categoryIcon from '../assets/icons/category.svg';
import unitIcon from '../assets/icons/unit.svg';
import brandIcon from '../assets/icons/brand.svg';
import supplierIcon from '../assets/icons/supplier.svg';
import reportIcon from '../assets/icons/report.svg';
import employeeIcon from '../assets/icons/employee.svg';
import customerIcon from '../assets/icons/customer.svg';
import storeIcon from '../assets/icons/store.svg';
import locationIcon from '../assets/icons/location.svg';
import houseIcon from '../assets/icons/house.svg';

function Manage_data() {
    const navigate = useNavigate();
  
    // ຂໍ້ມູນປຸ່ມທັງໝົດ
    const menuItems = [
      { id: 'products', title: 'ຂໍ້ມູນສິນຄ້າ', icon: productIcon, path: '/products' },
      { id: 'categories', title: 'ຂໍ້ມູນປະເພດ', icon: categoryIcon, path: '/categories' },
      { id: 'units', title: 'ຂໍ້ມູນຍີ່ຫໍ້', icon: unitIcon, path: '/units' },
      { id: 'brands', title: 'ຂໍ້ມູນລຸ້ນ', icon: brandIcon, path: '/brands' },
      { id: 'warehouse', title: 'ຂໍ້ມູນບ່ອນຈັດວາງ', icon: storeIcon, path: '/warehouse' },
      { id: 'reports', title: 'ຂໍ້ມູນພະນັກງານ', icon: reportIcon, path: '/reports' },
      { id: 'suppliers', title: 'ຂໍ້ມູນຜູ້ສະໜອງ', icon: supplierIcon, path: '/suppliers' },
      { id: 'customers', title: 'ຂໍ້ມູນລູກຄ້າ', icon: customerIcon, path: '/customers' },
      { id: 'house', title: 'ຂໍ້ມູນບ້ານ', icon: houseIcon, path: '/house' },
      { id: 'locations', title: 'ຂໍ້ມູນເມືອງ', icon: locationIcon, path: '/city' },
      { id: 'locations', title: 'ຂໍ້ມູນແຂວງ', icon: locationIcon, path: '/prowin' },
    ];
  
    // ຟັງຊັນເມື່ອກົດປຸ່ມ
    const handleMenuClick = (path) => {
      navigate(path);
    };
  
    return (
      <div className={styles.container}>
        <Sidebar />
        <div className={styles.content}>
          <Header />
          <main className={styles.mainContent}>
            <h1 className={styles.pageTitle}>ຈັດການຂໍ້ມູນຫຼັກ</h1>
            
            <div className={styles.menuHeader}>
              <p>ຈັດການຂໍ້ມູນຫຼັກ</p>
            </div>
            
            <div className={styles.menuGrid}>
              {menuItems.map((item) => (
                <div 
                  key={item.id} 
                  className={styles.menuItem}
                  onClick={() => handleMenuClick(item.path)}
                >
                  <div className={styles.menuIcon}>
                    <img src={item.icon} alt={item.title} />
                  </div>
                  <p className={styles.menuTitle}>{item.title}</p>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  export default Manage_data;