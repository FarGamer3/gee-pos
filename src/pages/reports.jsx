import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import styles from './CSS/Reports.module.css';

// ນຳເຂົ້າໄອຄອນສຳລັບປຸ່ມລາຍງານ
/*import salesReportIcon from '../assets/icon/sales-report.png';
import purchaseReportIcon from '../assets/icon/purchase-report.png';
import stockReportIcon from '../assets/icon/stock-report.png';
import productReportIcon from '../assets/icon/product-report.png';
import customerReportIcon from '../assets/icon/customer-report.png';
import supplierReportIcon from '../assets/icon/supplier-report.png';
import employeeReportIcon from '../assets/icon/employee-report.png';
import profitReportIcon from '../assets/icon/profit-report.png';
import taxReportIcon from '../assets/icon/tax-report.png';*/

function Reports() {
  const navigate = useNavigate();
  
  // ຂໍ້ມູນປຸ່ມທັງໝົດ
  const reportItems = [
    { id: 'sales', title: 'ລາຍງານຂາຍ', icon: salesReportIcon, path: '/reports/sales' },
    { id: 'purchase', title: 'ລາຍງານການຊື້', icon: purchaseReportIcon, path: '/reports/purchase' },
    { id: 'stock', title: 'ລາຍງານສາງ', icon: stockReportIcon, path: '/reports/stock' },
    { id: 'product', title: 'ລາຍງານສິນຄ້າ', icon: productReportIcon, path: '/reports/product' },
    { id: 'customer', title: 'ລາຍງານລູກຄ້າ', icon: customerReportIcon, path: '/reports/customer' },
    { id: 'supplier', title: 'ລາຍງານຜູ້ສະໜອງ', icon: supplierReportIcon, path: '/reports/supplier' },
    { id: 'employee', title: 'ລາຍງານພະນັກງານ', icon: employeeReportIcon, path: '/reports/employee' },
    { id: 'profit', title: 'ລາຍງານກຳໄລ', icon: profitReportIcon, path: '/reports/profit' },
    { id: 'tax', title: 'ລາຍງານພາສີ', icon: taxReportIcon, path: '/reports/tax' },
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