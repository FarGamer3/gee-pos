import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import styles from './CSS/Common.module.css';

function Village() {
  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <Header />
        <main className={styles.mainContent}>
          <h1 className={styles.pageTitle}>ຈັດການໝວດໝູ່ສິນຄ້າ</h1>
          <div className={styles.pageContent}>
            <p>ກຳລັງພັດທະນາ...</p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Village;