import { useMemo, useRef } from 'react';
import styles from './BangoBoard.module.css';
import type { Pos, TangoCell, TangoPuzzle, TangoSymbol } from './bangoPuzzles';

type Props = {
  puzzle: TangoPuzzle;
  grid: TangoCell[][];
  active: Pos;
  conflictCells: Set<string>;
  conflictLinks: Set<string>;
  onCycle: (pos: Pos) => void;
  onSet: (pos: Pos, value: TangoCell) => void;
  onMoveActive: (pos: Pos) => void;
};

function keyFromPos(pos: Pos): string {
  return `${pos.row},${pos.col}`;
}

function glyph(value: TangoCell): string {
  if (value === 'sun') return '☀';
  if (value === 'moon') return '☾';
  return '';
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function TangoBoard({
  puzzle,
  grid,
  active,
  conflictCells,
  conflictLinks,
  onCycle,
  onSet,
  onMoveActive,
}: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const givens = puzzle.givens;

  // map links for fast render of right/down markers from each cell
  const linkRight = useMemo(() => {
    const m = new Map<string, 'same' | 'diff'>();
    for (const link of puzzle.links) {
      const { a, b, kind } = link;
      // normalize: left cell is key, right marker
      if (a.row === b.row && Math.abs(a.col - b.col) === 1) {
        const left = a.col < b.col ? a : b;
        const right = a.col < b.col ? b : a;
        m.set(`${left.row},${left.col}|${right.row},${right.col}`, kind);
      }
    }
    return m;
  }, [puzzle.links]);

  const linkDown = useMemo(() => {
    const m = new Map<string, 'same' | 'diff'>();
    for (const link of puzzle.links) {
      const { a, b, kind } = link;
      // normalize: top cell is key, down marker
      if (a.col === b.col && Math.abs(a.row - b.row) === 1) {
        const top = a.row < b.row ? a : b;
        const bottom = a.row < b.row ? b : a;
        m.set(`${top.row},${top.col}|${bottom.row},${bottom.col}`, kind);
      }
    }
    return m;
  }, [puzzle.links]);

  function linkId(a: Pos, b: Pos) {
    const ka = keyFromPos(a);
    const kb = keyFromPos(b);
    return ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
  }

  function handleKeyDown(e: React.KeyboardEvent) {
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
      onSet(active, null);
      return;
    }

    if (e.key.toLowerCase() === 's') {
      e.preventDefault();
      onSet(active, 'sun');
      return;
    }

    if (e.key.toLowerCase() === 'm') {
      e.preventDefault();
      onSet(active, 'moon');
      return;
    }
  }

  return (
    <div
      ref={wrapRef}
      className={styles.wrap}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Tango board"
    >
      <div className={`${styles.board} ${styles.size6}`}>
        {Array.from({ length: puzzle.size * puzzle.size }).map((_, index) => {
          const row = Math.floor(index / puzzle.size);
          const col = index % puzzle.size;
          const pos = { row, col };
          const k = keyFromPos(pos);

          const isActive = row === active.row && col === active.col;
          const isLocked = Boolean(givens[k]);
          const value = isLocked ? (givens[k] as TangoSymbol) : grid[row][col];

          const hasConflict = conflictCells.has(k);

          const cellClass = [
            styles.cell,
            isLocked ? styles.locked : '',
            isActive ? styles.active : '',
            hasConflict ? styles.conflict : '',
          ]
            .filter(Boolean)
            .join(' ');

          const rightKey =
            col < puzzle.size - 1 ? `${row},${col}|${row},${col + 1}` : null;
          const downKey =
            row < puzzle.size - 1 ? `${row},${col}|${row + 1},${col}` : null;

          const rightKind = rightKey ? linkRight.get(rightKey) : undefined;
          const downKind = downKey ? linkDown.get(downKey) : undefined;

          const rightLinkBad =
            rightKind && col < puzzle.size - 1
              ? conflictLinks.has(linkId(pos, { row, col: col + 1 }))
              : false;

          const downLinkBad =
            downKind && row < puzzle.size - 1
              ? conflictLinks.has(linkId(pos, { row: row + 1, col }))
              : false;

          return (
            <button
              key={k}
              type="button"
              className={cellClass}
              onClick={() => onCycle(pos)}
              aria-label={`Row ${row + 1}, Column ${col + 1}`}
            >
              <span className={styles.value} aria-hidden="true">
                {glyph(value)}
              </span>

              {rightKind ? (
                <span
                  className={[
                    styles.linkRight,
                    rightKind === 'same' ? styles.same : styles.diff,
                    rightLinkBad ? styles.linkBad : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-hidden="true"
                >
                  {rightKind === 'same' ? '=' : '×'}
                </span>
              ) : null}

              {downKind ? (
                <span
                  className={[
                    styles.linkDown,
                    downKind === 'same' ? styles.same : styles.diff,
                    downLinkBad ? styles.linkBad : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-hidden="true"
                >
                  {downKind === 'same' ? '=' : '×'}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
