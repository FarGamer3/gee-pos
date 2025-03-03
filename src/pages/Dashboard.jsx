import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import InfoCard from '../components/Dashboard/InfoCard';
import styles from './Dashboard.module.css';
import inventoryIcon from '../assets/icons/inventory.svg';
import importIcon from '../assets/icons/import-icon.svg';
import exportIcon from '../assets/icons/export-icon.svg';
import purchaseIcon from '../assets/icons/purchase.svg';
import salesIcon from '../assets/icons/sales-total.svg';
import staffIcon from '../assets/icons/staff.svg';

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
                title="ລາຍຮັບຄ້າ" 
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