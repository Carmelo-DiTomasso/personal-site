import { Container } from './Container';
import styles from './Footer.module.css';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <Container className={styles.inner}>
        <p className={styles.text}>© {year} Carmelo DiTomasso</p>
      </Container>
    </footer>
  );
}
