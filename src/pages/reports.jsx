import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import styles from './CSS/Reports.module.css';

// ນຳເຂົ້າໄອຄອນສຳລັບປຸ່ມລາຍງານ
import salesReportIcon from '../assets/icon/r-sales.png';
import purchaseReportIcon from '../assets/icon/r-purchase.png';
import exportReportIcon from '../assets/icon/r-export.png';
import importReportIcon from '../assets/icon/r-import.png';
import productReportIcon from '../assets/icon/r-product.png';
import customerReportIcon from '../assets/icon/r-customer.png';
import supplierReportIcon from '../assets/icon/r-supplier.png';
import employeeReportIcon from '../assets/icon/r-employee.png';
import categoryReportIcon from '../assets/icon/r-category.png';
import brandReportIcon from '../assets/icon/r-brand.png';
import modelReportIcon from '../assets/icon/r-model.png';
import positionReportIcon from '../assets/icon/r-position.png';
import villageReportIcon from '../assets/icon/r-village.png';
import cityReportIcon from '../assets/icon/r-city.png';
import provinceReportIcon from '../assets/icon/r-province.png';

function Reports() {
  const navigate = useNavigate();
  
  // ຂໍ້ມູນປຸ່ມທັງໝົດ
  const reportItems = [
    { id: 'sales', title: 'ລາຍງານການຂາຍ', icon: salesReportIcon, path: '/reports/sales' },
    { id: 'purchase', title: 'ລາຍງານການສັ່ງຊື້', icon: purchaseReportIcon, path: '/reports/purchase' },
    { id: 'export', title: 'ລາຍງານສິນຄ້ານຳອອກ', icon: exportReportIcon, path: '/reports/export' },
    { id: 'import', title: 'ລາຍງານສິນຄ້ານຳເຂົ້າ', icon: importReportIcon, path: '/reports/import' },
    { id: 'customer', title: 'ລາຍງານຂໍ້ມູນລູກຄ້າ', icon: customerReportIcon, path: '/reports/customer' },
    { id: 'supplier', title: 'ລາຍງານຂໍ້ມູນຜູ້ສະໜອງ', icon: supplierReportIcon, path: '/reports/supplier' },
    { id: 'employee', title: 'ລາຍງານຂໍ້ມູນພະນັກງານ', icon: employeeReportIcon, path: '/reports/employee' },
    { id: 'product', title: 'ລາຍງານຂໍ້ມູນສິນຄ້າ', icon: productReportIcon, path: '/reports/product' },
    { id: 'category', title: 'ລາຍງານຂໍ້ມູນປະເພດ', icon: categoryReportIcon, path: '/reports/category' },
    { id: 'brand', title: 'ລາຍງານຂໍ້ມູນຢີ່ຫໍ້', icon: brandReportIcon, path: '/reports/brand' },
    { id: 'model', title: 'ລາຍງານຂໍ້ມູນລຸ້ນ', icon: modelReportIcon, path: '/reports/model' },
    { id: 'position', title: 'ລາຍງານຂໍ້ມູນບ່ອນຈັດເກັບ', icon: positionReportIcon, path: '/reports/position' },
    { id: 'village', title: 'ລາຍງານຂໍ້ມູນບ້ານ', icon: villageReportIcon, path: '/reports/village' },
    { id: 'city', title: 'ລາຍງານຂໍ້ມູນເມືອງ', icon: cityReportIcon, path: '/reports/city' },
    { id: 'province', title: 'ລາຍງານແຂວງ', icon: provinceReportIcon, path: '/reports/province' },
  ];
  
  // ຟັງຊັນເມື່ອກົດປຸ່ມ
  const handleReportClick = (path) => {
    navigate(path);
  };
  
  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <Header />
        <main className={styles.mainContent}>
          <h1 className={styles.pageTitle}>ລາຍງານ</h1>
          
          <div className={styles.menuHeader}>
            <p>ເລືອກລາຍງານທີ່ຕ້ອງການ</p>
          </div>
          
          <div className={styles.reportGrid}>
            {reportItems.map((item) => (
              <div 
                key={item.id} 
                className={styles.reportItem}
                onClick={() => handleReportClick(item.path)}
              >
                <div className={styles.reportIcon}>
                  <img src={item.icon} alt={item.title} />
                </div>
                <p className={styles.reportTitle}>{item.title}</p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Reports;