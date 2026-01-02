import type { ReactNode } from 'react';
import styles from './HowToPlay.module.css';

type Props = {
  title?: string;
  children: ReactNode;
};

export function HowToPlay({ title = 'How to play', children }: Props) {
  return (
    <details className={styles.root}>
      <summary className={styles.summary}>{title}</summary>
      <div className={styles.body}>{children}</div>
    </details>
  );
}
