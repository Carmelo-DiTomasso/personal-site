import { Link } from 'react-router-dom';
import { SiteNav } from '../nav/SiteNav';
import { Container } from './Container';
import styles from './Header.module.css';

export function Header() {
  return (
    <header className={styles.header}>
      <Container className={styles.inner}>
        <Link to="/" className={styles.brand}>
          Carmelo DiTomasso
        </Link>
        <SiteNav />
      </Container>
    </header>
  );
}
