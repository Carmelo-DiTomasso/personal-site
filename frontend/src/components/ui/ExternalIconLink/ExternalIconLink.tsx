import styles from './ExternalIconLink.module.css';

type Props = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

export function ExternalIconLink({ href, label, icon }: Props) {
  return (
    <a className={styles.link} href={href} target="_blank" rel="noreferrer">
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
      <span className={styles.label}>{label}</span>
    </a>
  );
}
