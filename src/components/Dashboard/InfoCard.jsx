import styles from './InfoCard.module.css';

function InfoCard({ title, value, icon }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardContent}>
        <div className={styles.info}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.value}>{value}</p>
        </div>
        <div className={styles.iconContainer}>
          <img src={icon} alt={title} className={styles.icon} />
        </div>
      </div>
    </div>
  );
}

export default InfoCard;
