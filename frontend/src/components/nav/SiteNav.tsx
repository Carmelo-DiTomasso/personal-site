import { NavLink } from 'react-router-dom';
import styles from './SiteNav.module.css';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Resume', to: '/resume' },
  { label: 'Projects', to: '/projects' },
  { label: 'Games', to: '/games' },
  { label: 'Contact', to: '/contact' },
  { label: 'Site', to: '/site' },
  { label: 'Stats', to: '/stats' },
];

export function SiteNav() {
  return (
    <nav aria-label="Primary">
      <ul className={styles.list}>
        {navItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.active}` : styles.link
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
