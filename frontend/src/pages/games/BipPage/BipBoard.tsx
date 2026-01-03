import { useMemo, useRef } from 'react';
import styles from './BipBoard.module.css';

export type Pos = { row: number; col: number };

export type ZipPuzzle = {
  id: string;
  size: number;
  blockedCells: Pos[]; // walls (entire squares)
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
  const isDrawingRef = useRef(false);

  const blockedSet = useMemo(
    () => new Set<string>(puzzle.blockedCells.map(keyFromPos)),
    [puzzle.blockedCells],
  );

  const numberByKey = useMemo(() => {
    const map = new Map<string, number>();
    puzzle.waypointsInOrder.forEach((pos, idx) =>
      map.set(keyFromPos(pos), idx + 1),
    );
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

          const isWall = blockedSet.has(cellKey);
          if (isWall) {
            return (
              <div
                key={cellKey}
                className={styles.wallTile}
                aria-hidden="true"
              />
            );
          }

          const numberHere = numberByKey.get(cellKey);
          const isInPath = pathSet.has(cellKey);
          const isHead = cellKey === headKey;
          const isCandidate = candidateSet.has(cellKey);

          const pathIndex = pathIndexByKey.get(cellKey);

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
              aria-label={
                numberHere
                  ? `Row ${row + 1}, Column ${col + 1}, Number ${numberHere}`
                  : `Row ${row + 1}, Column ${col + 1}`
              }
              onPointerDown={(e) => {
                e.preventDefault();
                isDrawingRef.current = true;
                onCellAction(pos);
                try {
                  (e.currentTarget as HTMLElement).setPointerCapture(
                    e.pointerId,
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
