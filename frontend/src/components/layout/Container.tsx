import type { ReactNode } from 'react';
import styles from './Container.module.css';

type ContainerProps = {
  children: ReactNode;
};

/**
 * Container:
 * A small layout helper that centers content and limits width.
 * Keeping this separate prevents page components from becoming "god components."
 */
export function Container({ children }: ContainerProps) {
  return <div className={styles.container}>{children}</div>;
}
