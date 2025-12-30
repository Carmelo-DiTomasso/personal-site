import { Link } from 'react-router-dom';
import styles from './ExternalIconLink.module.css';

type Props = {
  href: string;
  label: string;
  icon: React.ReactNode;
  ariaLabel?: string;
};

export function ExternalIconLink({ href, label, icon, ariaLabel }: Props) {
  const isExternal = /^https?:\/\//.test(href);

  const content = (
    <>
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
      <span className={styles.label}>{label}</span>
    </>
  );

  if (isExternal) {
    return (
      <a
        className={styles.link}
        href={href}
        target="_blank"
        rel="noreferrer"
        aria-label={ariaLabel ?? label}
      >
        {content}
      </a>
    );
  }

  return (
    <Link className={styles.link} to={href} aria-label={ariaLabel ?? label}>
      {content}
    </Link>
  );
}
