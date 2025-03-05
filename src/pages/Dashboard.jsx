import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import InfoCard from '../components/Dashboard/InfoCard';
import styles from '../pages/CSS/Dashboard.module.css';
import inventoryIcon from '../assets/icon/product.png';
import importIcon from '../assets/icon/import.png';
import exportIcon from '../assets/icon/export.png';
import purchaseIcon from '../assets/icon/purchase.png';
import salesIcon from '../assets/icon/sell.png';
import staffIcon from '../assets/icon/employee.png';

function Dashboard() {
  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <Header />
        <main className={styles.mainContent}>
          <h1 className={styles.pageTitle}>ໜ້າຫຼັກ</h1>
          
          <div className={styles.infoHeader}>
            <p>ຂໍ້ມູນສິນຄ້າ ແລະ ສະຖະຕິຂອງຮ້ານ</p>
          </div>
          
          <div className={styles.cardContainer}>
            <div className={styles.row}>
              <InfoCard 
                title="ຈຳນວນສິນຄ້າ" 
                value="100" 
                icon={inventoryIcon} 
              />
              <InfoCard 
                title="ສິນຄ້ານຳເຂົ້າ" 
                value="100" 
                icon={importIcon} 
              />
              <InfoCard 
                title="ສິນຄ້າຂາຍອອກ" 
                value="100" 
                icon={exportIcon} 
              />
            </div>
            
            <div className={styles.row}>
              <InfoCard 
                title="ຄ່າຊື້ສິນຄ້າ" 
                value="100" 
                icon={purchaseIcon} 
              />
              <InfoCard 
                title="ຂາຍຮັບຄ້າ" 
                value="100" 
                icon={salesIcon} 
              />
              <InfoCard 
                title="ພະນັກງານ" 
                value="100" 
                icon={staffIcon} 
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;