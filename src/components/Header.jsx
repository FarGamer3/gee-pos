import styles from './Header.module.css';

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.notificationArea}>
        <div className={styles.notificationBell}>
          <img src="/src/assets/icons/bell.svg" alt="Notifications" />
        </div>
      </div>
      <div className={styles.userInfo}>
        <span className={styles.userName}>Admin_user</span>
        <div className={styles.userAvatar}>
          <img src="/src/assets/icons/user.svg" alt="User" />
        </div>
      </div>
    </header>
  );
}

export default Header;