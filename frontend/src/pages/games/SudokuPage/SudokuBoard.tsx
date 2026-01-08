import { useMemo, useRef } from 'react';
import styles from './SudokuBoard.module.css';
import type { Pos, SudokuGrid, SudokuPuzzle } from './sudokuPuzzles';
import { hasNote } from './sudokuPuzzles';

type Props = {
  puzzle: SudokuPuzzle;
  grid: SudokuGrid;
  active: Pos;
  notesMode: boolean;
  conflictCells: Set<string>;
  onSelect: (pos: Pos) => void;
  onMoveActive: (pos: Pos) => void;
  onInputDigit: (digit: number) => void;
  onClear: () => void;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function keyFromPos(pos: Pos): string {
  return `${pos.row},${pos.col}`;
}

export function SudokuBoard({
  puzzle,
  grid,
  active,
  notesMode,
  conflictCells,
  onSelect,
  onMoveActive,
  onInputDigit,
  onClear,
}: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const givens = puzzle.givens;

  const lockedSet = useMemo(() => new Set(Object.keys(givens)), [givens]);

  function handleKeyDown(e: React.KeyboardEvent) {
    const { row, col } = active;

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      onMoveActive({ row: clamp(row - 1, 0, 8), col });
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      onMoveActive({ row: clamp(row + 1, 0, 8), col });
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onMoveActive({ row, col: clamp(col - 1, 0, 8) });
      return;
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      onMoveActive({ row, col: clamp(col + 1, 0, 8) });
      return;
    }

    if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
      e.preventDefault();
      onClear();
      return;
    }

    // Digits 1..9
    if (e.key.length === 1) {
      const digit = Number(e.key);
      if (digit >= 1 && digit <= 9) {
        e.preventDefault();
        onInputDigit(digit);
      }
    }
  }

  return (
    <div
      ref={wrapRef}
      className={styles.wrap}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Sudoku board"
    >
      <div className={styles.board} aria-label="Sudoku grid">
        {/* 9 blocks, each 3x3 */}
        {Array.from({ length: 9 }).map((_, blockIndex) => {
          const blockRow = Math.floor(blockIndex / 3);
          const blockCol = blockIndex % 3;

          return (
            <div key={`block-${blockRow}-${blockCol}`} className={styles.block}>
              {Array.from({ length: 9 }).map((__, cellIndex) => {
                const innerRow = Math.floor(cellIndex / 3);
                const innerCol = cellIndex % 3;

                const row = blockRow * 3 + innerRow;
                const col = blockCol * 3 + innerCol;

                const pos = { row, col };
                const k = keyFromPos(pos);

                const isLocked = lockedSet.has(k);
                const isActive = row === active.row && col === active.col;
                const hasConflict = conflictCells.has(k);

                const cell = grid[row][col];

                const className = [
                  styles.cell,
                  isLocked ? styles.locked : '',
                  isActive ? styles.active : '',
                  hasConflict ? styles.conflict : '',
                ]
                  .filter(Boolean)
                  .join(' ');

                return (
                  <button
                    key={k}
                    type="button"
                    className={className}
                    onClick={() => {
                      wrapRef.current?.focus();
                      onSelect(pos);
                    }}
                    aria-label={`Row ${row + 1}, Column ${col + 1}${
                      isLocked ? ', Given' : ''
                    }${notesMode ? ', Notes mode' : ''}`}
                  >
                    {cell.value ? (
                      <span className={styles.value} aria-hidden="true">
                        {cell.value}
                      </span>
                    ) : (
                      <span className={styles.notes} aria-hidden="true">
                        {Array.from({ length: 9 }, (_, i) => i + 1).map((d) => (
                          <span key={d} className={styles.note}>
                            {hasNote(cell.notesMask, d) ? d : ''}
                          </span>
                        ))}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
