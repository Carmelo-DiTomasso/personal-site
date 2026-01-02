import type { ReactNode } from 'react';
import styles from './GameShell.module.css';

type Props = {
  title: string;
  description?: string;
  controls?: ReactNode;
  status?: ReactNode;
  howToPlay?: ReactNode;
  children: ReactNode;
};

export function GameShell({
  title,
  description,
  controls,
  status,
  howToPlay,
  children,
}: Props) {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>{title}</h1>
          {description ? (
            <p className={styles.description}>{description}</p>
          ) : null}
        </div>

        {controls ? <div className={styles.controls}>{controls}</div> : null}
      </header>

      {howToPlay ? <div className={styles.howToPlay}>{howToPlay}</div> : null}

      {status ? <div className={styles.status}>{status}</div> : null}

      <section className={styles.content} aria-label={`${title} game`}>
        {children}
      </section>
    </div>
  );
}
