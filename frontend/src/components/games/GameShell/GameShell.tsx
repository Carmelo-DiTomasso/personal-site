import type { ReactNode } from 'react';
import { GameButton } from '../GameButton/GameButton';
import styles from './GameShell.module.css';

type Props = {
  title: string;
  description?: string;
  onNewPuzzle?: () => void;
  onReset?: () => void;
  controls?: ReactNode;
  status?: ReactNode;
  howToPlay?: ReactNode;
  children: ReactNode;
};

export function GameShell({
  title,
  description,
  onNewPuzzle,
  onReset,
  controls,
  status,
  howToPlay,
  children,
}: Props) {
  const hasDefaultControls = Boolean(onNewPuzzle || onReset);

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>{title}</h1>
          {description ? (
            <p className={styles.description}>{description}</p>
          ) : null}
        </div>

        {controls ? (
          <div className={styles.controls}>{controls}</div>
        ) : hasDefaultControls ? (
          <div className={styles.controls} aria-label="Game controls">
            <GameButton
              type="button"
              onClick={onNewPuzzle}
              disabled={!onNewPuzzle}
              aria-label="New puzzle"
            >
              New puzzle
            </GameButton>
            <GameButton
              type="button"
              onClick={onReset}
              disabled={!onReset}
              aria-label="Reset puzzle"
            >
              Reset
            </GameButton>
          </div>
        ) : null}
      </header>

      {howToPlay ? <div className={styles.howToPlay}>{howToPlay}</div> : null}

      {status ? <div className={styles.status}>{status}</div> : null}

      <section className={styles.content} aria-label={`${title} game`}>
        {children}
      </section>
    </div>
  );
}
