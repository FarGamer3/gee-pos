import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import styles from '../pages/CSS/Manage_data.module.css';
import productIcon from '../assets/icon/product.png';
import categoryIcon from '../assets/icon/category.png';
import unitIcon from '../assets/icon/unit.png';
import brandIcon from '../assets/icon/brand.png';
import supplierIcon from '../assets/icon/supplier.png';
import employeeIcon from '../assets/icon/employee.png';
import customerIcon from '../assets/icon/customer.png';
import locationIcon from '../assets/icon/position.png';
import villageIcon from '../assets/icon/village.png';
import cityicon from '../assets/icon/city.png';
import provinceicon from '../assets/icon/province.png';

function Manage_data() {
    const navigate = useNavigate();
  
    // ຂໍ້ມູນປຸ່ມທັງໝົດ
    const menuItems = [
      { id: 'products', title: 'ຂໍ້ມູນສິນຄ້າ', icon: productIcon, path: '/products' },
      { id: 'categories', title: 'ຂໍ້ມູນປະເພດ', icon: categoryIcon, path: '/categories' },
      { id: 'units', title: 'ຂໍ້ມູນຍີ່ຫໍ້', icon: unitIcon, path: '/units' },
      { id: 'brands', title: 'ຂໍ້ມູນລຸ້ນ', icon: brandIcon, path: '/brands' },
      { id: 'warehouse', title: 'ຂໍ້ມູນບ່ອນຈັດວາງ', icon: locationIcon, path: '/warehouse' },
      { id: 'employee', title: 'ຂໍ້ມູນພະນັກງານ', icon: employeeIcon, path: '/employee' },
      { id: 'suppliers', title: 'ຂໍ້ມູນຜູ້ສະໜອງ', icon: supplierIcon, path: '/suppliers' },
      { id: 'customers', title: 'ຂໍ້ມູນລູກຄ້າ', icon: customerIcon, path: '/customers' },
      { id: 'village', title: 'ຂໍ້ມູນບ້ານ', icon: villageIcon, path: '/village' },
      { id: 'city', title: 'ຂໍ້ມູນເມືອງ', icon: cityicon, path: '/city' },
      { id: 'province', title: 'ຂໍ້ມູນແຂວງ', icon: provinceicon, path: '/province' },
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