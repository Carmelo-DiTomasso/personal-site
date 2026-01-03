import { useMemo, useState } from 'react';
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
  waypointStepIndexes: number[]; // indices into solutionPath
};

function makePuzzle(config: ZipPuzzleConfig): ZipPuzzle {
  return {
    id: config.id,
    size: config.size,
    blockedCells: config.blockedCells,
    waypointsInOrder: config.waypointStepIndexes.map(
      (idx) => config.solutionPath[idx],
    ),
  };
}

function totalPlayableCells(puzzle: ZipPuzzle): number {
  return puzzle.size * puzzle.size - puzzle.blockedCells.length;
}

function nextExpectedNumber(puzzle: ZipPuzzle, pathKeys: string[]): number {
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

  const blockedSet = new Set<string>(puzzle.blockedCells.map(keyFromPos));
  const startKey = keyFromPos(puzzle.waypointsInOrder[0]);
  const endKey = keyFromPos(puzzle.waypointsInOrder[lastNumber - 1]);

  if (pathKeys[0] !== startKey) return false;
  if (pathKeys[pathKeys.length - 1] !== endKey) return false;

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

// Two solvable puzzles with different start/end and different waypoint counts.
// (No blocked tiles yet, but the model supports them.)
const PUZZLE_CONFIGS: ZipPuzzleConfig[] = [
  {
    id: 'zip-a',
    size: 6,
    blockedCells: [],
    // Start (2,2), End (4,3) — interior endpoints.
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
    // 12 waypoints (not required, but common)
    waypointStepIndexes: [0, 3, 6, 10, 14, 18, 21, 24, 27, 30, 33, 35],
  },
  {
    id: 'zip-b',
    size: 6,
    blockedCells: [],
    // Start (1,3), End (2,5) — not top/bottom.
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
    // 9 waypoints (varies by puzzle)
    waypointStepIndexes: [0, 4, 8, 12, 16, 20, 24, 28, 35],
  },
];

const PUZZLES: ZipPuzzle[] = PUZZLE_CONFIGS.map(makePuzzle);

export function BipPage() {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const puzzle = PUZZLES[puzzleIndex];

  const startKey = keyFromPos(puzzle.waypointsInOrder[0]);
  const [pathKeys, setPathKeys] = useState<string[]>(() => [startKey]);

  const playableCount = totalPlayableCells(puzzle);
  const lastNumber = puzzle.waypointsInOrder.length;

  const blockedSet = useMemo(() => {
    return new Set<string>(puzzle.blockedCells.map(keyFromPos));
  }, [puzzle.blockedCells]);

  const numberByKey = useMemo(() => {
    const map = new Map<string, number>();
    puzzle.waypointsInOrder.forEach((pos, idx) =>
      map.set(keyFromPos(pos), idx + 1),
    );
    return map;
  }, [puzzle.waypointsInOrder]);

  const expectedNext = useMemo(
    () => nextExpectedNumber(puzzle, pathKeys),
    [puzzle, pathKeys],
  );
  const solved = useMemo(() => isSolved(puzzle, pathKeys), [puzzle, pathKeys]);

  function handleReset() {
    setPathKeys([keyFromPos(puzzle.waypointsInOrder[0])]);
  }

  function handleNewPuzzle() {
    const nextIndex = (puzzleIndex + 1) % PUZZLES.length;
    const nextPuzzle = PUZZLES[nextIndex];
    setPuzzleIndex(nextIndex);
    setPathKeys([keyFromPos(nextPuzzle.waypointsInOrder[0])]);
  }

  const candidateKeys = useMemo(() => {
    const keys: string[] = [];
    const headKey = pathKeys[pathKeys.length - 1];
    const headPos = posFromKey(headKey);

    const headNumber = numberByKey.get(headKey);
    if (headNumber === lastNumber && pathKeys.length < playableCount)
      return keys;

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
      if (steppedNumber !== undefined && steppedNumber !== expectedNext)
        continue;

      keys.push(k);
    }

    return keys;
  }, [
    blockedSet,
    expectedNext,
    lastNumber,
    numberByKey,
    pathKeys,
    playableCount,
    puzzle.size,
  ]);

  function handleCellAction(pos: Pos) {
    const cellKey = keyFromPos(pos);

    setPathKeys((prev) => {
      if (blockedSet.has(cellKey)) return prev;

      // Backtrack
      const existingIndex = prev.indexOf(cellKey);
      if (existingIndex >= 0) return prev.slice(0, existingIndex + 1);

      // Must extend from head, adjacent only
      if (prev.length >= playableCount) return prev;

      const headKey = prev[prev.length - 1];
      const headPos = posFromKey(headKey);
      if (!isAdjacent(headPos, pos)) return prev;

      // Cannot revisit
      if (prev.includes(cellKey)) return prev;

      // If stepping onto a waypoint, must be the next expected number
      const steppedNumber = numberByKey.get(cellKey);
      if (steppedNumber !== undefined && steppedNumber !== expectedNext)
        return prev;

      // If already at last number and not complete, don’t allow extending past it
      const headNumber = numberByKey.get(headKey);
      if (headNumber === lastNumber && prev.length < playableCount) return prev;

      return [...prev, cellKey];
    });
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
                <li>Move up/down/left/right only (no diagonals).</li>
                <li>
                  Visit numbered waypoints in order: 1 → 2 → … → {lastNumber}.
                </li>
                <li>
                  Fill <strong>every playable cell exactly once</strong>.
                </li>
                <li>Drag to draw; click a cell in your path to backtrack.</li>
              </ul>
            </HowToPlay>
          }
        >
          <BipBoard
            puzzle={puzzle}
            pathKeys={pathKeys}
            candidateKeys={candidateKeys}
            onCellAction={handleCellAction}
          />
        </GameShell>
      </div>
    </SimplePage>
  );
}
