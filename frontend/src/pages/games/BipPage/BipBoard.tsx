import { useMemo, useRef } from 'react';
import styles from './BipBoard.module.css';

export type Pos = { row: number; col: number };

/**
 * Walls live on the TOP or LEFT edge of a cell.
 * - A "top" wall at (r,c) blocks movement between (r,c) and (r-1,c)
 * - A "left" wall at (r,c) blocks movement between (r,c) and (r,c-1)
 *
 * (Right/bottom walls are represented as left/top walls of the neighbor cell.)
 */
export type Wall = { row: number; col: number; side: 'top' | 'left' };

export type ZipPuzzle = {
  id: string;
  size: number;
  walls: Wall[];
  waypointsInOrder: Pos[]; // number i is at waypointsInOrder[i-1]
};

type Props = {
  puzzle: ZipPuzzle;
  pathKeys: string[];
  candidateKeys: string[];
  onCellAction: (pos: Pos) => void;
};

function keyFromPos(pos: Pos): string {
  return `${pos.row},${pos.col}`;
}

function posFromKey(key: string): Pos {
  const [rowStr, colStr] = key.split(',');
  return { row: Number(rowStr), col: Number(colStr) };
}

function direction(
  from: Pos,
  to: Pos,
): 'up' | 'down' | 'left' | 'right' | null {
  if (to.row === from.row - 1 && to.col === from.col) return 'up';
  if (to.row === from.row + 1 && to.col === from.col) return 'down';
  if (to.row === from.row && to.col === from.col - 1) return 'left';
  if (to.row === from.row && to.col === from.col + 1) return 'right';
  return null;
}

export function BipBoard({
  puzzle,
  pathKeys,
  candidateKeys,
  onCellAction,
}: Props) {
  // Used for "click and drag" drawing.
  const isDrawingRef = useRef(false);

  const wallTopSet = useMemo(() => {
    const set = new Set<string>();
    puzzle.walls.forEach((wall) => {
      if (wall.side === 'top')
        set.add(keyFromPos({ row: wall.row, col: wall.col }));
    });
    return set;
  }, [puzzle.walls]);

  const wallLeftSet = useMemo(() => {
    const set = new Set<string>();
    puzzle.walls.forEach((wall) => {
      if (wall.side === 'left')
        set.add(keyFromPos({ row: wall.row, col: wall.col }));
    });
    return set;
  }, [puzzle.walls]);

  const numberByKey = useMemo(() => {
    const map = new Map<string, number>();
    puzzle.waypointsInOrder.forEach((pos, index) =>
      map.set(keyFromPos(pos), index + 1),
    );
    return map;
  }, [puzzle.waypointsInOrder]);

  const pathIndexByKey = useMemo(() => {
    const map = new Map<string, number>();
    pathKeys.forEach((key, index) => map.set(key, index));
    return map;
  }, [pathKeys]);

  const pathSet = useMemo(() => new Set(pathKeys), [pathKeys]);
  const candidateSet = useMemo(() => new Set(candidateKeys), [candidateKeys]);
  const headKey = pathKeys[pathKeys.length - 1];

  return (
    <div
      className={styles.boardWrap}
      data-testid="zip-board-wrap"
      aria-label="Zip board"
    >
      <div
        className={`${styles.board} ${styles.cols6}`}
        data-testid="zip-board"
      >
        {Array.from({ length: puzzle.size * puzzle.size }).map((_, index) => {
          const row = Math.floor(index / puzzle.size);
          const col = index % puzzle.size;
          const pos = { row, col };
          const cellKey = keyFromPos(pos);

          const numberHere = numberByKey.get(cellKey);
          const isInPath = pathSet.has(cellKey);
          const isHead = cellKey === headKey;
          const isCandidate = candidateSet.has(cellKey);

          const hasWallTop = wallTopSet.has(cellKey);
          const hasWallLeft = wallLeftSet.has(cellKey);

          const pathIndex = pathIndexByKey.get(cellKey);

          // Used for drawing the green "track" connections.
          let connectsUp = false;
          let connectsDown = false;
          let connectsLeft = false;
          let connectsRight = false;

          if (pathIndex !== undefined) {
            const previousKey = pathIndex > 0 ? pathKeys[pathIndex - 1] : null;
            const nextKey =
              pathIndex < pathKeys.length - 1 ? pathKeys[pathIndex + 1] : null;

            if (previousKey) {
              const previousPos = posFromKey(previousKey);
              const dir = direction(pos, previousPos);
              if (dir === 'up') connectsUp = true;
              if (dir === 'down') connectsDown = true;
              if (dir === 'left') connectsLeft = true;
              if (dir === 'right') connectsRight = true;
            }

            if (nextKey) {
              const nextPos = posFromKey(nextKey);
              const dir = direction(pos, nextPos);
              if (dir === 'up') connectsUp = true;
              if (dir === 'down') connectsDown = true;
              if (dir === 'left') connectsLeft = true;
              if (dir === 'right') connectsRight = true;
            }
          }

          const className = [
            styles.cell,
            hasWallTop ? styles.wallTop : '',
            hasWallLeft ? styles.wallLeft : '',
            isInPath ? styles.inPath : '',
            isHead ? styles.head : '',
            isCandidate ? styles.candidate : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <button
              key={cellKey}
              type="button"
              className={className}
              aria-label={
                numberHere
                  ? `Row ${row + 1}, Column ${col + 1}, Number ${numberHere}`
                  : `Row ${row + 1}, Column ${col + 1}`
              }
              onPointerDown={(event) => {
                event.preventDefault();
                isDrawingRef.current = true;
                onCellAction(pos);

                // Pointer capture improves drag reliability.
                try {
                  (event.currentTarget as HTMLElement).setPointerCapture(
                    event.pointerId,
                  );
                } catch {
                  // ignore
                }
              }}
              onPointerEnter={() => {
                if (!isDrawingRef.current) return;
                onCellAction(pos);
              }}
              onPointerUp={() => {
                isDrawingRef.current = false;
              }}
              onPointerCancel={() => {
                isDrawingRef.current = false;
              }}
            >
              {isInPath ? (
                <span className={styles.track} aria-hidden="true">
                  <span className={styles.trackCenter} />
                  {connectsUp ? (
                    <span className={`${styles.trackSeg} ${styles.segUp}`} />
                  ) : null}
                  {connectsDown ? (
                    <span className={`${styles.trackSeg} ${styles.segDown}`} />
                  ) : null}
                  {connectsLeft ? (
                    <span className={`${styles.trackSeg} ${styles.segLeft}`} />
                  ) : null}
                  {connectsRight ? (
                    <span className={`${styles.trackSeg} ${styles.segRight}`} />
                  ) : null}
                </span>
              ) : null}

              {numberHere ? (
                <span className={styles.number}>{numberHere}</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
