import { useMemo, useRef } from 'react';
import styles from './BipBoard.module.css';

export type Pos = { row: number; col: number };

export type ZipPuzzle = {
  id: string;
  size: number;
  blockedCells: Pos[];
  waypointsInOrder: Pos[]; // number i is at waypointsInOrder[i-1]
};

type Props = {
  puzzle: ZipPuzzle;
  pathKeys: string[];
  candidateKeys: string[]; // legal next moves from head
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

function closestCellButton(el: Element | null): HTMLButtonElement | null {
  if (!el) return null;
  if (el instanceof HTMLButtonElement && el.dataset.cellKey) return el;
  return (
    (el.closest('button[data-cell-key]') as HTMLButtonElement | null) ?? null
  );
}

export function BipBoard({
  puzzle,
  pathKeys,
  candidateKeys,
  onCellAction,
}: Props) {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastKeyRef = useRef<string | null>(null);

  const blockedSet = useMemo(
    () => new Set(puzzle.blockedCells.map(keyFromPos)),
    [puzzle.blockedCells],
  );

  const numberByKey = useMemo(() => {
    const map = new Map<string, number>();
    puzzle.waypointsInOrder.forEach((pos, index) => {
      map.set(keyFromPos(pos), index + 1);
    });
    return map;
  }, [puzzle.waypointsInOrder]);

  const pathIndexByKey = useMemo(() => {
    const map = new Map<string, number>();
    pathKeys.forEach((k, idx) => map.set(k, idx));
    return map;
  }, [pathKeys]);

  const pathSet = useMemo(() => new Set(pathKeys), [pathKeys]);
  const candidateSet = useMemo(() => new Set(candidateKeys), [candidateKeys]);
  const headKey = pathKeys[pathKeys.length - 1];

  function startDrawFromEvent(e: React.PointerEvent<HTMLDivElement>) {
    const button = closestCellButton(e.target as Element);
    if (!button) return;

    const cellKey = button.dataset.cellKey;
    if (!cellKey) return;

    isDrawingRef.current = true;
    lastKeyRef.current = cellKey;

    const [rowStr, colStr] = cellKey.split(',');
    onCellAction({ row: Number(rowStr), col: Number(colStr) });

    try {
      boardRef.current?.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  }

  function continueDrawFromEvent(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDrawingRef.current) return;
    if (e.buttons !== 1) return;

    const el = document.elementFromPoint(e.clientX, e.clientY);
    const button = closestCellButton(el);
    if (!button) return;

    const cellKey = button.dataset.cellKey;
    if (!cellKey) return;
    if (cellKey === lastKeyRef.current) return;

    lastKeyRef.current = cellKey;
    const [rowStr, colStr] = cellKey.split(',');
    onCellAction({ row: Number(rowStr), col: Number(colStr) });
  }

  function endDraw() {
    isDrawingRef.current = false;
    lastKeyRef.current = null;
  }

  return (
    <div
      className={styles.boardWrap}
      data-testid="zip-board-wrap"
      aria-label="Zip board"
      ref={boardRef}
      onPointerDown={(e) => {
        e.preventDefault();
        startDrawFromEvent(e);
      }}
      onPointerMove={(e) => {
        e.preventDefault();
        continueDrawFromEvent(e);
      }}
      onPointerUp={() => endDraw()}
      onPointerCancel={() => endDraw()}
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

          const isBlocked = blockedSet.has(cellKey);
          const numberHere = numberByKey.get(cellKey);

          const isInPath = pathSet.has(cellKey);
          const isHead = cellKey === headKey;
          const isCandidate = candidateSet.has(cellKey);

          const pathIndex = pathIndexByKey.get(cellKey);

          // Zip “track” connections
          let connUp = false;
          let connDown = false;
          let connLeft = false;
          let connRight = false;

          if (pathIndex !== undefined) {
            const prevKey = pathIndex > 0 ? pathKeys[pathIndex - 1] : null;
            const nextKey =
              pathIndex < pathKeys.length - 1 ? pathKeys[pathIndex + 1] : null;

            if (prevKey) {
              const prevPos = posFromKey(prevKey);
              const dir = direction(pos, prevPos);
              if (dir === 'up') connUp = true;
              if (dir === 'down') connDown = true;
              if (dir === 'left') connLeft = true;
              if (dir === 'right') connRight = true;
            }

            if (nextKey) {
              const nextPos = posFromKey(nextKey);
              const dir = direction(pos, nextPos);
              if (dir === 'up') connUp = true;
              if (dir === 'down') connDown = true;
              if (dir === 'left') connLeft = true;
              if (dir === 'right') connRight = true;
            }
          }

          if (isBlocked) {
            return (
              <div
                key={cellKey}
                className={styles.blocked}
                aria-hidden="true"
              />
            );
          }

          const className = [
            styles.cell,
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
              data-cell-key={cellKey}
              aria-label={
                numberHere
                  ? `Row ${row + 1}, Column ${col + 1}, Number ${numberHere}`
                  : `Row ${row + 1}, Column ${col + 1}`
              }
              // Still allow plain click (non-drag)
              onClick={() => onCellAction(pos)}
            >
              {isInPath ? (
                <span className={styles.track} aria-hidden="true">
                  <span className={styles.trackCenter} />
                  {connUp ? (
                    <span className={`${styles.trackSeg} ${styles.segUp}`} />
                  ) : null}
                  {connDown ? (
                    <span className={`${styles.trackSeg} ${styles.segDown}`} />
                  ) : null}
                  {connLeft ? (
                    <span className={`${styles.trackSeg} ${styles.segLeft}`} />
                  ) : null}
                  {connRight ? (
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
