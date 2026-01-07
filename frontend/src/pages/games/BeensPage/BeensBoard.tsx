import { useRef } from 'react';
import styles from './BeensBoard.module.css';
import type { Pos, QueensCell, QueensPuzzle } from './beensPuzzles';

type Props = {
  puzzle: QueensPuzzle;
  grid: QueensCell[][];
  active: Pos;
  conflictCells: Set<string>;
  onCycle: (pos: Pos) => void;
  onClear: (pos: Pos) => void;
  onMoveActive: (pos: Pos) => void;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function keyFromPos(pos: Pos): string {
  return `${pos.row},${pos.col}`;
}

export function BeensBoard({
  puzzle,
  grid,
  active,
  conflictCells,
  onCycle,
  onClear,
  onMoveActive,
}: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const { row, col } = active;

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      onMoveActive({ row: clamp(row - 1, 0, puzzle.size - 1), col });
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      onMoveActive({ row: clamp(row + 1, 0, puzzle.size - 1), col });
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onMoveActive({ row, col: clamp(col - 1, 0, puzzle.size - 1) });
      return;
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      onMoveActive({ row, col: clamp(col + 1, 0, puzzle.size - 1) });
      return;
    }

    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onCycle(active);
      return;
    }

    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      onClear(active);
      return;
    }
  }

  return (
    <div
      ref={wrapRef}
      className={styles.boardWrap}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Beens board"
    >
      <div className={styles.board}>
        {Array.from({ length: puzzle.size * puzzle.size }).map((_, index) => {
          const row = Math.floor(index / puzzle.size);
          const col = index % puzzle.size;
          const pos = { row, col };
          const k = keyFromPos(pos);

          const isActive = row === active.row && col === active.col;
          const hasConflict = conflictCells.has(k);

          const regionId = puzzle.regions[row][col];
          const regionClass =
            regionId === 0
              ? styles.region0
              : regionId === 1
                ? styles.region1
                : regionId === 2
                  ? styles.region2
                  : regionId === 3
                    ? styles.region3
                    : regionId === 4
                      ? styles.region4
                      : styles.region5;

          const className = [
            styles.cell,
            regionClass,
            isActive ? styles.active : '',
            hasConflict ? styles.conflict : '',
          ]
            .filter(Boolean)
            .join(' ');

          const value = grid[row][col];

          return (
            <button
              key={k}
              type="button"
              className={className}
              onClick={() => onCycle(pos)}
              aria-label={`Row ${row + 1}, Column ${col + 1}, Region ${regionId + 1}`}
            >
              {value === 'queen' ? (
                <span className={styles.queen} aria-hidden="true">
                  ♛
                </span>
              ) : value === 'x' ? (
                <span className={styles.mark} aria-hidden="true">
                  ×
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
