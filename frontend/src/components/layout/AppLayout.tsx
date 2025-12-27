import { Outlet } from 'react-router-dom';
import { Footer } from './Footer';
import { Header } from './Header';
import styles from './AppLayout.module.css';

export function AppLayout() {
  return (
    <div className={styles.shell}>
      <Header />
      <div className={styles.main}>
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
