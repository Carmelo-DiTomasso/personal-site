import { useEffect, useMemo, useRef, useState } from 'react';
import { SimplePage } from '../../shared/SimplePage';
import { GameShell } from '../../../components/games/GameShell/GameShell';
import { HowToPlay } from '../../../components/games/HowToPlay/HowToPlay';
import { BipBoard, type Pos, type ZipPuzzle } from './BipBoard';

function keyFromPos(pos: Pos): string {
  return `${pos.row},${pos.col}`;
}

function posFromKey(key: string): Pos {
  const [rowStr, colStr] = key.split(',');
  return { row: Number(rowStr), col: Number(colStr) };
}

function isAdjacent(a: Pos, b: Pos): boolean {
  const dr = Math.abs(a.row - b.row);
  const dc = Math.abs(a.col - b.col);
  return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
}

type ZipPuzzleConfig = {
  id: string;
  size: number;
  blockedCells: Pos[];
  solutionPath: Pos[]; // covers every playable cell exactly once
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function randomWaypointCount(solutionLen: number): number {
  const min = 5;
  const max = Math.min(30, solutionLen);
  return min + Math.floor(Math.random() * (max - min + 1));
}

function chooseWaypointIndices(solutionLen: number, count: number): number[] {
  const last = solutionLen - 1;
  const clampedCount = clamp(count, 5, Math.min(30, solutionLen));

  const indices = new Set<number>();
  indices.add(0);
  indices.add(last);

  for (let i = 1; i <= clampedCount - 2; i += 1) {
    const base = Math.round((i * last) / (clampedCount - 1));
    const jitter = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
    let candidate = clamp(base + jitter, 1, last - 1);

    // ensure uniqueness
    while (indices.has(candidate)) {
      candidate = candidate < last - 1 ? candidate + 1 : candidate - 1;
    }
    indices.add(candidate);
  }

  return Array.from(indices).sort((a, b) => a - b);
}

function makePuzzleFromConfig(
  config: ZipPuzzleConfig,
  waypointCount: number,
): ZipPuzzle {
  const indices = chooseWaypointIndices(
    config.solutionPath.length,
    waypointCount,
  );
  return {
    id: `${config.id}-w${waypointCount}-${indices.join('-')}`, // unique per waypoint selection
    size: config.size,
    blockedCells: config.blockedCells,
    waypointsInOrder: indices.map((i) => config.solutionPath[i]),
  };
}

function totalPlayableCells(puzzle: ZipPuzzle): number {
  return puzzle.size * puzzle.size - puzzle.blockedCells.length;
}

function computeExpectedNext(puzzle: ZipPuzzle, pathKeys: string[]): number {
  const numberByKey = new Map<string, number>();
  puzzle.waypointsInOrder.forEach((pos, idx) =>
    numberByKey.set(keyFromPos(pos), idx + 1),
  );

  let expected = 1;
  for (const k of pathKeys) {
    const n = numberByKey.get(k);
    if (n === expected) expected += 1;
  }
  return expected;
}

function isSolved(puzzle: ZipPuzzle, pathKeys: string[]): boolean {
  const playableCount = totalPlayableCells(puzzle);
  const lastNumber = puzzle.waypointsInOrder.length;
  if (pathKeys.length !== playableCount) return false;

  const startKey = keyFromPos(puzzle.waypointsInOrder[0]);
  const endKey = keyFromPos(puzzle.waypointsInOrder[lastNumber - 1]);
  if (pathKeys[0] !== startKey) return false;
  if (pathKeys[pathKeys.length - 1] !== endKey) return false;

  const blockedSet = new Set<string>(puzzle.blockedCells.map(keyFromPos));
  const numberByKey = new Map<string, number>();
  puzzle.waypointsInOrder.forEach((pos, idx) =>
    numberByKey.set(keyFromPos(pos), idx + 1),
  );

  const seen = new Set<string>();
  for (let i = 0; i < pathKeys.length; i += 1) {
    const k = pathKeys[i];
    if (blockedSet.has(k)) return false;
    if (seen.has(k)) return false;
    seen.add(k);

    if (i > 0) {
      const prev = posFromKey(pathKeys[i - 1]);
      const curr = posFromKey(k);
      if (!isAdjacent(prev, curr)) return false;
    }
  }

  let expected = 1;
  for (const k of pathKeys) {
    const n = numberByKey.get(k);
    if (n !== undefined) {
      if (n !== expected) return false;
      expected += 1;
    }
  }

  return expected === lastNumber + 1;
}

// Two solvable base paths (no walls). Waypoint count is randomized 5–30.
const PUZZLE_CONFIGS: ZipPuzzleConfig[] = [
  {
    id: 'zip-a',
    size: 6,
    blockedCells: [],
    solutionPath: [
      { row: 2, col: 2 },
      { row: 2, col: 3 },
      { row: 2, col: 4 },
      { row: 2, col: 5 },
      { row: 3, col: 5 },
      { row: 4, col: 5 },
      { row: 5, col: 5 },
      { row: 5, col: 4 },
      { row: 5, col: 3 },
      { row: 5, col: 2 },
      { row: 5, col: 1 },
      { row: 5, col: 0 },
      { row: 4, col: 0 },
      { row: 3, col: 0 },
      { row: 2, col: 0 },
      { row: 1, col: 0 },
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
      { row: 0, col: 3 },
      { row: 0, col: 4 },
      { row: 0, col: 5 },
      { row: 1, col: 5 },
      { row: 1, col: 4 },
      { row: 1, col: 3 },
      { row: 1, col: 2 },
      { row: 1, col: 1 },
      { row: 2, col: 1 },
      { row: 3, col: 1 },
      { row: 4, col: 1 },
      { row: 4, col: 2 },
      { row: 3, col: 2 },
      { row: 3, col: 3 },
      { row: 3, col: 4 },
      { row: 4, col: 4 },
      { row: 4, col: 3 },
    ],
  },
  {
    id: 'zip-b',
    size: 6,
    blockedCells: [],
    solutionPath: [
      { row: 1, col: 3 },
      { row: 0, col: 3 },
      { row: 0, col: 4 },
      { row: 0, col: 5 },
      { row: 1, col: 5 },
      { row: 1, col: 4 },
      { row: 2, col: 4 },
      { row: 2, col: 3 },
      { row: 2, col: 2 },
      { row: 1, col: 2 },
      { row: 0, col: 2 },
      { row: 0, col: 1 },
      { row: 0, col: 0 },
      { row: 1, col: 0 },
      { row: 1, col: 1 },
      { row: 2, col: 1 },
      { row: 2, col: 0 },
      { row: 3, col: 0 },
      { row: 3, col: 1 },
      { row: 3, col: 2 },
      { row: 3, col: 3 },
      { row: 3, col: 4 },
      { row: 4, col: 4 },
      { row: 4, col: 3 },
      { row: 4, col: 2 },
      { row: 4, col: 1 },
      { row: 4, col: 0 },
      { row: 5, col: 0 },
      { row: 5, col: 1 },
      { row: 5, col: 2 },
      { row: 5, col: 3 },
      { row: 5, col: 4 },
      { row: 5, col: 5 },
      { row: 4, col: 5 },
      { row: 3, col: 5 },
      { row: 2, col: 5 },
    ],
  },
];

export function BipPage() {
  const focusRef = useRef<HTMLDivElement | null>(null);

  const initialConfigIndex = 0;
  const initialWaypointCount = randomWaypointCount(
    PUZZLE_CONFIGS[0].solutionPath.length,
  );
  const initialPuzzle = makePuzzleFromConfig(
    PUZZLE_CONFIGS[0],
    initialWaypointCount,
  );

  const [configIndex, setConfigIndex] = useState(initialConfigIndex);
  const [waypointCount, setWaypointCount] = useState(initialWaypointCount);
  const [puzzleIdNonce, setPuzzleIdNonce] = useState(() => 0);

  const puzzle = useMemo(() => {
    // nonce forces a rebuild for “New puzzle” even if config index repeats
    const base = makePuzzleFromConfig(
      PUZZLE_CONFIGS[configIndex],
      waypointCount,
    );
    return { ...base, id: `${base.id}-n${puzzleIdNonce}` };
  }, [configIndex, waypointCount, puzzleIdNonce]);

  const [pathKeys, setPathKeys] = useState<string[]>(() => [
    keyFromPos(initialPuzzle.waypointsInOrder[0]),
  ]);

  const blockedSet = useMemo(
    () => new Set(puzzle.blockedCells.map(keyFromPos)),
    [puzzle.blockedCells],
  );

  const numberByKey = useMemo(() => {
    const map = new Map<string, number>();
    puzzle.waypointsInOrder.forEach((pos, idx) =>
      map.set(keyFromPos(pos), idx + 1),
    );
    return map;
  }, [puzzle.waypointsInOrder]);

  const playableCount = totalPlayableCells(puzzle);
  const lastNumber = puzzle.waypointsInOrder.length;

  const expectedNext = useMemo(
    () => computeExpectedNext(puzzle, pathKeys),
    [puzzle, pathKeys],
  );
  const solved = useMemo(() => isSolved(puzzle, pathKeys), [puzzle, pathKeys]);

  useEffect(() => {
    // Focus the keyboard zone when puzzle changes.
    focusRef.current?.focus();
  }, [puzzle.id]);

  function resetToStart(nextPuzzle: ZipPuzzle) {
    setPathKeys([keyFromPos(nextPuzzle.waypointsInOrder[0])]);
  }

  function handleReset() {
    resetToStart(puzzle);
  }

  function handleNewPuzzle() {
    const nextIndex = (configIndex + 1) % PUZZLE_CONFIGS.length;
    const nextCount = randomWaypointCount(
      PUZZLE_CONFIGS[nextIndex].solutionPath.length,
    );
    const nextPuzzle = makePuzzleFromConfig(
      PUZZLE_CONFIGS[nextIndex],
      nextCount,
    );

    setConfigIndex(nextIndex);
    setWaypointCount(nextCount);
    setPuzzleIdNonce((n) => n + 1);
    resetToStart(nextPuzzle);
  }

  function handleCellAction(pos: Pos) {
    const cellKey = keyFromPos(pos);

    setPathKeys((prev) => {
      if (blockedSet.has(cellKey)) return prev;

      // Backtrack to any cell already in the path
      const existingIndex = prev.indexOf(cellKey);
      if (existingIndex >= 0) return prev.slice(0, existingIndex + 1);

      // Don’t extend if already full
      if (prev.length >= playableCount) return prev;

      const headKey = prev[prev.length - 1];
      const headPos = posFromKey(headKey);

      // Must extend from head and be adjacent
      if (!isAdjacent(headPos, pos)) return prev;

      // Cannot revisit
      if (prev.includes(cellKey)) return prev;

      // Zip: once you’ve reached the last number, you must be done (end at N)
      const headNumber = numberByKey.get(headKey);
      if (headNumber === lastNumber && prev.length < playableCount) return prev;

      // Waypoint ordering must be respected
      const expected = computeExpectedNext(puzzle, prev);
      const steppedNumber = numberByKey.get(cellKey);
      if (steppedNumber !== undefined && steppedNumber !== expected)
        return prev;

      return [...prev, cellKey];
    });
  }

  const candidateKeys = useMemo(() => {
    const keys: string[] = [];
    const headKey = pathKeys[pathKeys.length - 1];
    const headPos = posFromKey(headKey);

    const headNumber = numberByKey.get(headKey);
    if (headNumber === lastNumber && pathKeys.length < playableCount)
      return keys;

    const expected = computeExpectedNext(puzzle, pathKeys);

    const deltas = [
      { row: -1, col: 0 },
      { row: 1, col: 0 },
      { row: 0, col: -1 },
      { row: 0, col: 1 },
    ];

    for (const d of deltas) {
      const next = { row: headPos.row + d.row, col: headPos.col + d.col };
      if (
        next.row < 0 ||
        next.row >= puzzle.size ||
        next.col < 0 ||
        next.col >= puzzle.size
      )
        continue;

      const k = keyFromPos(next);
      if (blockedSet.has(k)) continue;
      if (pathKeys.includes(k)) continue;

      const steppedNumber = numberByKey.get(k);
      if (steppedNumber !== undefined && steppedNumber !== expected) continue;

      keys.push(k);
    }

    return keys;
  }, [blockedSet, lastNumber, numberByKey, pathKeys, playableCount, puzzle]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const key = e.key;
    if (!key.startsWith('Arrow')) return;

    e.preventDefault();

    const headPos = posFromKey(pathKeys[pathKeys.length - 1]);
    const delta =
      key === 'ArrowUp'
        ? { row: -1, col: 0 }
        : key === 'ArrowDown'
          ? { row: 1, col: 0 }
          : key === 'ArrowLeft'
            ? { row: 0, col: -1 }
            : { row: 0, col: 1 };

    const next = { row: headPos.row + delta.row, col: headPos.col + delta.col };
    if (
      next.row < 0 ||
      next.row >= puzzle.size ||
      next.col < 0 ||
      next.col >= puzzle.size
    )
      return;

    handleCellAction(next);
  }

  const status = (
    <span>
      Cells {pathKeys.length}/{playableCount}
      {solved
        ? ' • Solved!'
        : expectedNext <= lastNumber
          ? ` • Next: ${expectedNext}`
          : ''}
    </span>
  );

  return (
    <SimplePage title="">
      <div data-testid="bip-page">
        <GameShell
          title="Bip"
          description={`Zip-style: connect 1 → ${lastNumber} in order and fill every cell.`}
          controlsPlacement="belowHowTo"
          onNewPuzzle={handleNewPuzzle}
          onReset={handleReset}
          status={status}
          howToPlay={
            <HowToPlay>
              <ul>
                <li>
                  Start at <strong>1</strong> and end at{' '}
                  <strong>{lastNumber}</strong>.
                </li>
                <li>
                  Fill <strong>every cell exactly once</strong>.
                </li>
                <li>Move up/down/left/right only.</li>
                <li>
                  Use <strong>drag + hold</strong> to draw, or use{' '}
                  <strong>arrow keys</strong> (click board to focus).
                </li>
                <li>
                  Click a cell in your path to <strong>backtrack</strong> to it.
                </li>
              </ul>
            </HowToPlay>
          }
        >
          <div
            ref={focusRef}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            aria-label="Bip board keyboard controls"
          >
            <BipBoard
              puzzle={puzzle}
              pathKeys={pathKeys}
              candidateKeys={candidateKeys}
              onCellAction={handleCellAction}
            />
          </div>
        </GameShell>
      </div>
    </SimplePage>
  );
}
