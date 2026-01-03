import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { HowToPlay } from '../../../components/games/HowToPlay/HowToPlay';
import { BipBoard, type Pos, type Wall, type ZipPuzzle } from './BipBoard';
import styles from './BipPage.module.css';

function keyFromPos(pos: Pos): string {
  return `${pos.row},${pos.col}`;
}

function posFromKey(key: string): Pos {
  const [rowStr, colStr] = key.split(',');
  return { row: Number(rowStr), col: Number(colStr) };
}

function isAdjacent(a: Pos, b: Pos): boolean {
  const rowDelta = Math.abs(a.row - b.row);
  const colDelta = Math.abs(a.col - b.col);
  return rowDelta + colDelta === 1;
}

function randomIntInclusive(minValue: number, maxValue: number): number {
  const span = maxValue - minValue + 1;
  return minValue + Math.floor(Math.random() * span);
}

function neighbors(pos: Pos, size: number): Pos[] {
  const candidates: Pos[] = [
    { row: pos.row - 1, col: pos.col },
    { row: pos.row + 1, col: pos.col },
    { row: pos.row, col: pos.col - 1 },
    { row: pos.row, col: pos.col + 1 },
  ];

  return candidates.filter(
    (candidate) =>
      candidate.row >= 0 &&
      candidate.row < size &&
      candidate.col >= 0 &&
      candidate.col < size,
  );
}

/**
 * Generates a Hamiltonian path on a size x size grid using backtracking + a "fewest onward moves" heuristic.
 * This makes puzzles feel more like Zip because start/end can land anywhere (not always corners).
 */
function generateHamiltonianPath(size: number): Pos[] {
  const totalCells = size * size;

  const toIndex = (pos: Pos) => pos.row * size + pos.col;

  for (let attempt = 0; attempt < 300; attempt += 1) {
    const start: Pos = {
      row: randomIntInclusive(0, size - 1),
      col: randomIntInclusive(0, size - 1),
    };

    const visited = new Uint8Array(totalCells);
    const path: Pos[] = new Array(totalCells);

    const dfs = (depth: number, current: Pos): boolean => {
      visited[toIndex(current)] = 1;
      path[depth] = current;

      if (depth === totalCells - 1) return true;

      const nextCandidates = neighbors(current, size).filter(
        (candidate) => visited[toIndex(candidate)] === 0,
      );

      // Fewest onward options first (Warnsdorff-ish).
      nextCandidates.sort((a, b) => {
        const onwardA = neighbors(a, size).filter(
          (candidate) => visited[toIndex(candidate)] === 0,
        ).length;
        const onwardB = neighbors(b, size).filter(
          (candidate) => visited[toIndex(candidate)] === 0,
        ).length;

        if (onwardA !== onwardB) return onwardA - onwardB;
        return Math.random() < 0.5 ? -1 : 1;
      });

      for (const nextPos of nextCandidates) {
        if (dfs(depth + 1, nextPos)) return true;
      }

      visited[toIndex(current)] = 0;
      return false;
    };

    if (dfs(0, start)) return path;
  }

  // This *should* basically never happen on 6x6.
  return Array.from({ length: totalCells }).map((_, index) => ({
    row: Math.floor(index / size),
    col: index % size,
  }));
}

function edgeKey(a: Pos, b: Pos, size: number): string {
  const aIndex = a.row * size + a.col;
  const bIndex = b.row * size + b.col;
  return aIndex < bIndex ? `${aIndex}-${bIndex}` : `${bIndex}-${aIndex}`;
}

/**
 * Builds a ZipPuzzle with:
 * - Waypoints (numbers) placed along a guaranteed Hamiltonian solution
 * - Walls placed only on edges NOT used by the Hamiltonian solution (so the puzzle is solvable)
 */
function generateZipPuzzle(size: number): ZipPuzzle {
  const solutionPath = generateHamiltonianPath(size);
  const totalCells = size * size;

  const maxWaypoints = Math.min(30, totalCells);
  const waypointCount = randomIntInclusive(5, maxWaypoints);

  // Pick waypoint indices along the solution path. Force:
  // - "1" is at the start of the path
  // - last number is at the end of the path
  const interiorCount = Math.max(0, waypointCount - 2);
  const chosenInteriorIndices = new Set<number>();

  while (chosenInteriorIndices.size < interiorCount) {
    chosenInteriorIndices.add(randomIntInclusive(1, totalCells - 2));
  }

  const waypointIndices = [
    0,
    ...Array.from(chosenInteriorIndices).sort((a, b) => a - b),
    totalCells - 1,
  ];
  const waypointsInOrder = waypointIndices.map((index) => solutionPath[index]);

  // Mark solution edges so we never wall them off.
  const solutionEdgeSet = new Set<string>();
  for (let index = 1; index < solutionPath.length; index += 1) {
    solutionEdgeSet.add(
      edgeKey(solutionPath[index - 1], solutionPath[index], size),
    );
  }

  // Create random walls between adjacent cells that are NOT in the solution path.
  const walls: Wall[] = [];
  const wallProbability = 0.18;

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const here: Pos = { row, col };

      // Horizontal edge: here <-> right
      if (col + 1 < size) {
        const right: Pos = { row, col: col + 1 };
        const isSolutionEdge = solutionEdgeSet.has(edgeKey(here, right, size));

        if (!isSolutionEdge && Math.random() < wallProbability) {
          // Represent a vertical wall as "left" wall of the right cell.
          walls.push({ row: right.row, col: right.col, side: 'left' });
        }
      }

      // Vertical edge: here <-> down
      if (row + 1 < size) {
        const down: Pos = { row: row + 1, col };
        const isSolutionEdge = solutionEdgeSet.has(edgeKey(here, down, size));

        if (!isSolutionEdge && Math.random() < wallProbability) {
          // Represent a horizontal wall as "top" wall of the down cell.
          walls.push({ row: down.row, col: down.col, side: 'top' });
        }
      }
    }
  }

  return {
    id: crypto.randomUUID(),
    size,
    walls,
    waypointsInOrder,
  };
}

function buildWallSets(puzzle: ZipPuzzle): {
  wallTopSet: Set<string>;
  wallLeftSet: Set<string>;
} {
  const wallTopSet = new Set<string>();
  const wallLeftSet = new Set<string>();

  puzzle.walls.forEach((wall) => {
    const key = keyFromPos({ row: wall.row, col: wall.col });
    if (wall.side === 'top') wallTopSet.add(key);
    if (wall.side === 'left') wallLeftSet.add(key);
  });

  return { wallTopSet, wallLeftSet };
}

function moveBlockedByWall(
  fromPos: Pos,
  toPos: Pos,
  puzzle: ZipPuzzle,
): boolean {
  const { wallTopSet, wallLeftSet } = buildWallSets(puzzle);

  // Up: check "top wall" of the FROM cell
  if (toPos.row === fromPos.row - 1 && toPos.col === fromPos.col) {
    return wallTopSet.has(keyFromPos(fromPos));
  }

  // Down: check "top wall" of the TO cell
  if (toPos.row === fromPos.row + 1 && toPos.col === fromPos.col) {
    return wallTopSet.has(keyFromPos(toPos));
  }

  // Left: check "left wall" of the FROM cell
  if (toPos.row === fromPos.row && toPos.col === fromPos.col - 1) {
    return wallLeftSet.has(keyFromPos(fromPos));
  }

  // Right: check "left wall" of the TO cell
  if (toPos.row === fromPos.row && toPos.col === fromPos.col + 1) {
    return wallLeftSet.has(keyFromPos(toPos));
  }

  return false;
}

export function BipPage() {
  const size = 6;

  const [puzzle, setPuzzle] = useState<ZipPuzzle>(() =>
    generateZipPuzzle(size),
  );

  const startKey = useMemo(
    () => keyFromPos(puzzle.waypointsInOrder[0]),
    [puzzle.waypointsInOrder],
  );

  // Path is stored as a list of keys ("row,col") so it's easy to use Sets/Maps.
  const [pathKeys, setPathKeys] = useState<string[]>(() => [startKey]);

  // If the user closes the solved popup, we remember it per puzzle id.
  const [acknowledgedSolvedPuzzleId, setAcknowledgedSolvedPuzzleId] =
    useState<string>('');

  // Keep refs for key handlers (so we don’t rebind listeners constantly).
  const puzzleRef = useRef<ZipPuzzle>(puzzle);
  const pathRef = useRef<string[]>(pathKeys);

  useEffect(() => {
    puzzleRef.current = puzzle;
  }, [puzzle]);

  useEffect(() => {
    pathRef.current = pathKeys;
  }, [pathKeys]);

  const numberByKey = useMemo(() => {
    const map = new Map<string, number>();
    puzzle.waypointsInOrder.forEach((pos, index) =>
      map.set(keyFromPos(pos), index + 1),
    );
    return map;
  }, [puzzle]);

  const totalCells = puzzle.size * puzzle.size;
  const lastNumber = puzzle.waypointsInOrder.length;

  const reachedMaxNumber = useMemo(() => {
    // Because we enforce order, "max reached" is basically how far we progressed (1..N).
    let maxReached = 0;
    for (const key of pathKeys) {
      const numberHere = numberByKey.get(key);
      if (numberHere && numberHere === maxReached + 1) {
        maxReached = numberHere;
      }
    }
    return maxReached;
  }, [pathKeys, numberByKey]);

  const nextNumber =
    reachedMaxNumber >= lastNumber ? null : reachedMaxNumber + 1;
  const headKey = pathKeys[pathKeys.length - 1];
  const headPos = posFromKey(headKey);

  const pathSet = useMemo(() => new Set(pathKeys), [pathKeys]);

  const canEnterCell = useCallback(
    (fromPos: Pos, toPos: Pos): boolean => {
      if (!isAdjacent(fromPos, toPos)) return false;
      if (moveBlockedByWall(fromPos, toPos, puzzle)) return false;

      const toKey = keyFromPos(toPos);

      // Disallow revisiting (Zip path is a single trail).
      if (pathSet.has(toKey)) return false;

      const numberHere = numberByKey.get(toKey);

      // If it's a numbered cell, it MUST be the next number.
      if (numberHere) {
        if (!nextNumber) return false;
        if (numberHere !== nextNumber) return false;

        // Zip expects the last number to be the endpoint of the full trail.
        if (numberHere === lastNumber && pathKeys.length !== totalCells - 1)
          return false;

        return true;
      }

      return true;
    },
    [
      puzzle,
      pathSet,
      numberByKey,
      nextNumber,
      lastNumber,
      pathKeys.length,
      totalCells,
    ],
  );

  const candidateKeys = useMemo(() => {
    if (pathKeys.length === 0) return [];
    if (nextNumber === null && pathKeys.length === totalCells) return [];

    const candidates: string[] = [];
    for (const neighborPos of neighbors(headPos, puzzle.size)) {
      if (canEnterCell(headPos, neighborPos))
        candidates.push(keyFromPos(neighborPos));
    }
    return candidates;
  }, [
    pathKeys.length,
    headPos,
    puzzle.size,
    canEnterCell,
    nextNumber,
    totalCells,
  ]);

  const isSolved =
    pathKeys.length === totalCells && reachedMaxNumber === lastNumber;
  const shouldShowSolved = isSolved && acknowledgedSolvedPuzzleId !== puzzle.id;

  const resetPuzzle = useCallback(() => {
    setPathKeys([startKey]);
  }, [startKey]);

  const newPuzzle = useCallback(() => {
    const nextPuzzle = generateZipPuzzle(size);
    setPuzzle(nextPuzzle);
    setPathKeys([keyFromPos(nextPuzzle.waypointsInOrder[0])]);
    setAcknowledgedSolvedPuzzleId('');
  }, [size]);

  const handleCellAction = useCallback(
    (pos: Pos) => {
      const clickedKey = keyFromPos(pos);

      // Allow backtracking by stepping onto the immediately previous cell.
      const previousKey =
        pathKeys.length >= 2 ? pathKeys[pathKeys.length - 2] : null;
      if (previousKey && clickedKey === previousKey) {
        setPathKeys((previous) => previous.slice(0, -1));
        return;
      }

      // Starting over by clicking "1" is a nice UX.
      if (clickedKey === startKey && pathKeys.length > 1) {
        resetPuzzle();
        return;
      }

      // Only allow extending into currently-valid candidates.
      if (!candidateKeys.includes(clickedKey)) return;

      setPathKeys((previous) => [...previous, clickedKey]);
    },
    [candidateKeys, pathKeys, resetPuzzle, startKey],
  );

  // Arrow key support.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const currentPuzzle = puzzleRef.current;
      const currentPath = pathRef.current;
      if (!currentPuzzle || currentPath.length === 0) return;

      const currentHeadKey = currentPath[currentPath.length - 1];
      const currentHeadPos = posFromKey(currentHeadKey);

      let targetPos: Pos | null = null;

      if (event.key === 'ArrowUp')
        targetPos = { row: currentHeadPos.row - 1, col: currentHeadPos.col };
      if (event.key === 'ArrowDown')
        targetPos = { row: currentHeadPos.row + 1, col: currentHeadPos.col };
      if (event.key === 'ArrowLeft')
        targetPos = { row: currentHeadPos.row, col: currentHeadPos.col - 1 };
      if (event.key === 'ArrowRight')
        targetPos = { row: currentHeadPos.row, col: currentHeadPos.col + 1 };

      if (!targetPos) return;

      // Prevent page scrolling when using arrow keys.
      event.preventDefault();

      if (
        targetPos.row < 0 ||
        targetPos.row >= currentPuzzle.size ||
        targetPos.col < 0 ||
        targetPos.col >= currentPuzzle.size
      ) {
        return;
      }

      // We route through the same click/drag logic.
      handleCellAction(targetPos);
    };

    window.addEventListener('keydown', onKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleCellAction]);

  const cellsLabel = `${pathKeys.length}/${totalCells}`;
  const nextLabel = nextNumber ? String(nextNumber) : 'Done';

  return (
    <div className={styles.root} data-testid="bip-page">
      <div className={styles.headerRow}>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>Bip</h1>
          <p className={styles.description}>
            Connect 1 → {lastNumber} in order and fill every cell.
          </p>
        </div>

        <div className={styles.controls} aria-label="Game controls">
          <button
            type="button"
            className={styles.controlBtn}
            onClick={newPuzzle}
          >
            New puzzle
          </button>
          <button
            type="button"
            className={styles.controlBtn}
            onClick={resetPuzzle}
          >
            Reset
          </button>
        </div>
      </div>

      <HowToPlay>
        <ul>
          <li>
            Start at <strong>1</strong>.
          </li>
          <li>Draw a single continuous path through the grid (no revisits).</li>
          <li>
            When you step on a number, it must be the <strong>next</strong>{' '}
            number.
          </li>
          <li>
            Fill <strong>every</strong> cell exactly once. The last number is
            the final cell.
          </li>
          <li>Use click+drag, or arrow keys.</li>
        </ul>
      </HowToPlay>

      <div className={styles.metaRow} aria-label="Puzzle status">
        <div className={styles.metaLeft}>Cells {cellsLabel}</div>
        <div className={styles.metaRight}>Next: {nextLabel}</div>
      </div>

      <BipBoard
        puzzle={puzzle}
        pathKeys={pathKeys}
        candidateKeys={candidateKeys}
        onCellAction={handleCellAction}
      />

      {shouldShowSolved ? (
        <div
          className={styles.modalBackdrop}
          role="dialog"
          aria-modal="true"
          aria-label="Puzzle solved"
        >
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>Solved 🎉</h2>
            <p className={styles.modalBody}>
              You connected 1 → {lastNumber} in order and filled every cell.
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.controlBtn}
                onClick={() => setAcknowledgedSolvedPuzzleId(puzzle.id)}
              >
                Close
              </button>
              <button
                type="button"
                className={styles.controlBtn}
                onClick={newPuzzle}
              >
                New puzzle
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
