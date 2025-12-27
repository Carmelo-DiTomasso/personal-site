import styles from './SimplePage.module.css';

type SimplePageProps = {
  title: string;
  children?: React.ReactNode;
};

export function SimplePage({ title, children }: SimplePageProps) {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.content}>{children}</div>
    </main>
  );
}
