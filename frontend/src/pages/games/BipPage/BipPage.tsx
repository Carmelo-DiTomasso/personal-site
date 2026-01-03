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

function edgeKey(a: Pos, b: Pos): string {
  const aKey = keyFromPos(a);
  const bKey = keyFromPos(b);
  return aKey < bKey ? `${aKey}|${bKey}` : `${bKey}|${aKey}`;
}

function randomInt(minInclusive: number, maxInclusive: number): number {
  const span = maxInclusive - minInclusive + 1;
  return minInclusive + Math.floor(Math.random() * span);
}

type Template = {
  size: number;
  blockedCells: Pos[];
  solutionPath: Pos[]; // covers every playable cell exactly once
};

// Two known-good Hamiltonian paths (solvable by construction). We’ll randomize:
// - template selection
// - direction (reverse or not)
// - waypoint count and positions
// - walls (but never blocking the known solution edges)
const TEMPLATES: Template[] = [
  {
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

function buildPuzzle(): { puzzle: ZipPuzzle; solutionPath: Pos[] } {
  const template = TEMPLATES[randomInt(0, TEMPLATES.length - 1)];
  const size = template.size;

  const blockedSet = new Set<string>(template.blockedCells.map(keyFromPos));

  // Randomly reverse (gives different start/end like LinkedIn)
  const solutionPath =
    Math.random() < 0.5
      ? [...template.solutionPath]
      : [...template.solutionPath].reverse();

  const playableCount = size * size - template.blockedCells.length;

  // Waypoints: between 5 and 30 (capped by playable cells)
  const maxWaypoints = Math.min(30, playableCount);
  const waypointCount = randomInt(5, maxWaypoints);

  // Always include start (index 0) and end (last index)
  const chosen = new Set<number>();
  chosen.add(0);
  chosen.add(solutionPath.length - 1);

  // Pick remaining indices from (1..len-2)
  while (chosen.size < waypointCount) {
    chosen.add(randomInt(1, solutionPath.length - 2));
  }

  const waypointStepIndexes = Array.from(chosen).sort((a, b) => a - b);
  const waypointsInOrder = waypointStepIndexes.map((i) => solutionPath[i]);

  // Walls: place barriers between adjacent cells, but NEVER between consecutive solution steps.
  const solutionEdges = new Set<string>();
  for (let i = 0; i < solutionPath.length - 1; i += 1) {
    solutionEdges.add(edgeKey(solutionPath[i], solutionPath[i + 1]));
  }

  const walls: Array<{ a: Pos; b: Pos }> = [];
  const WALL_DENSITY = 0.22;
  const MAX_WALLS = 22;

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const a = { row, col };
      const aKey = keyFromPos(a);
      if (blockedSet.has(aKey)) continue;

      const right = { row, col: col + 1 };
      const down = { row: row + 1, col };

      const pairs: Array<{ b: Pos; ok: boolean }> = [
        { b: right, ok: col + 1 < size },
        { b: down, ok: row + 1 < size },
      ];

      for (const p of pairs) {
        if (!p.ok) continue;
        const bKey = keyFromPos(p.b);
        if (blockedSet.has(bKey)) continue;

        const eKey = edgeKey(a, p.b);
        if (solutionEdges.has(eKey)) continue; // keep the known solution always possible

        if (Math.random() < WALL_DENSITY) {
          walls.push({ a, b: p.b });
          if (walls.length >= MAX_WALLS) break;
        }
      }
      if (walls.length >= MAX_WALLS) break;
    }
    if (walls.length >= MAX_WALLS) break;
  }

  const puzzle: ZipPuzzle = {
    id: `zip-${Math.random().toString(36).slice(2)}`,
    size,
    blockedCells: template.blockedCells,
    waypointsInOrder,
    walls,
  };

  return { puzzle, solutionPath };
}

function totalPlayableCells(puzzle: ZipPuzzle): number {
  return puzzle.size * puzzle.size - puzzle.blockedCells.length;
}

function computeExpectedNext(
  numberByKey: Map<string, number>,
  pathKeys: string[],
): number {
  let expected = 1;
  for (const k of pathKeys) {
    const n = numberByKey.get(k);
    if (n === expected) expected += 1;
  }
  return expected;
}

function isSolved(
  puzzle: ZipPuzzle,
  pathKeys: string[],
  numberByKey: Map<string, number>,
  wallSet: Set<string>,
): boolean {
  const playableCount = totalPlayableCells(puzzle);
  const lastNumber = puzzle.waypointsInOrder.length;

  if (pathKeys.length !== playableCount) return false;

  const startKey = keyFromPos(puzzle.waypointsInOrder[0]);
  const endKey = keyFromPos(puzzle.waypointsInOrder[lastNumber - 1]);

  if (pathKeys[0] !== startKey) return false;
  if (pathKeys[pathKeys.length - 1] !== endKey) return false;

  const blockedSet = new Set<string>(puzzle.blockedCells.map(keyFromPos));

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
      if (wallSet.has(edgeKey(prev, curr))) return false;
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

export function BipPage() {
  const boardFocusRef = useRef<HTMLDivElement | null>(null);

  const [{ puzzle }, setPuzzleBundle] = useState(() => buildPuzzle());

  const startKey = keyFromPos(puzzle.waypointsInOrder[0]);
  const [pathKeys, setPathKeys] = useState<string[]>(() => [startKey]);

  // Rebuild derived maps when puzzle changes
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

  const wallSet = useMemo(() => {
    const set = new Set<string>();
    for (const w of puzzle.walls) set.add(edgeKey(w.a, w.b));
    return set;
  }, [puzzle.walls]);

  const playableCount = totalPlayableCells(puzzle);
  const lastNumber = puzzle.waypointsInOrder.length;

  const expectedNext = useMemo(
    () => computeExpectedNext(numberByKey, pathKeys),
    [numberByKey, pathKeys],
  );
  const solved = useMemo(
    () => isSolved(puzzle, pathKeys, numberByKey, wallSet),
    [puzzle, pathKeys, numberByKey, wallSet],
  );

  function handleReset() {
    setPathKeys([keyFromPos(puzzle.waypointsInOrder[0])]);
  }

  function handleNewPuzzle() {
    const next = buildPuzzle();
    setPuzzleBundle(next);
    setPathKeys([keyFromPos(next.puzzle.waypointsInOrder[0])]);
    // focus board for arrow keys convenience
    requestAnimationFrame(() => boardFocusRef.current?.focus());
  }

  function applyAction(targetPos: Pos, mode: 'mouse' | 'arrow') {
    const targetKey = keyFromPos(targetPos);

    setPathKeys((prev) => {
      if (blockedSet.has(targetKey)) return prev;

      const existingIndex = prev.indexOf(targetKey);

      // Mouse: allow backtrack to ANY earlier cell (LinkedIn-ish)
      if (mode === 'mouse' && existingIndex >= 0)
        return prev.slice(0, existingIndex + 1);

      // Arrow: only allow step-back by one
      if (mode === 'arrow' && existingIndex >= 0) {
        if (prev.length >= 2 && prev[prev.length - 2] === targetKey)
          return prev.slice(0, prev.length - 1);
        return prev;
      }

      // Must extend from head
      if (prev.length >= playableCount) return prev;

      const headKey = prev[prev.length - 1];
      const headPos = posFromKey(headKey);

      if (!isAdjacent(headPos, targetPos)) return prev;
      if (wallSet.has(edgeKey(headPos, targetPos))) return prev;

      const expected = computeExpectedNext(numberByKey, prev);

      // If stepping on a waypoint, must be the next expected number
      const steppedNumber = numberByKey.get(targetKey);
      if (steppedNumber !== undefined && steppedNumber !== expected)
        return prev;

      // Don’t allow moving past the last number until full path is complete
      const headNumber = numberByKey.get(headKey);
      if (headNumber === lastNumber && prev.length < playableCount) return prev;

      return [...prev, targetKey];
    });
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

    const expected = expectedNext;

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
      if (wallSet.has(edgeKey(headPos, next))) continue;

      const steppedNumber = numberByKey.get(k);
      if (steppedNumber !== undefined && steppedNumber !== expected) continue;

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
    wallSet,
  ]);

  // Arrow-key controls (board must be focused)
  useEffect(() => {
    // If you’d rather not auto-focus on page load, remove this.
    boardFocusRef.current?.focus();
  }, []);

  function onBoardKeyDown(e: React.KeyboardEvent) {
    const headKey = pathKeys[pathKeys.length - 1];
    const headPos = posFromKey(headKey);

    let delta: Pos | null = null;
    if (e.key === 'ArrowUp') delta = { row: -1, col: 0 };
    if (e.key === 'ArrowDown') delta = { row: 1, col: 0 };
    if (e.key === 'ArrowLeft') delta = { row: 0, col: -1 };
    if (e.key === 'ArrowRight') delta = { row: 0, col: 1 };
    if (!delta) return;

    e.preventDefault();

    const next = { row: headPos.row + delta.row, col: headPos.col + delta.col };
    if (
      next.row < 0 ||
      next.row >= puzzle.size ||
      next.col < 0 ||
      next.col >= puzzle.size
    )
      return;
    const nextKey = keyFromPos(next);
    if (blockedSet.has(nextKey)) return;

    applyAction(next, 'arrow');
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
                <li>Move up/down/left/right only.</li>
                <li>Visit waypoints in order: 1 → 2 → … → {lastNumber}.</li>
                <li>
                  Fill <strong>every playable cell exactly once</strong>.
                </li>
                <li>
                  <strong>Mouse:</strong> drag + hold to draw; click a path cell
                  to backtrack.
                </li>
                <li>
                  <strong>Keyboard:</strong> click the board, then use arrow
                  keys.
                </li>
                <li>
                  Thick borders are <strong>walls</strong> you can’t cross.
                </li>
              </ul>
            </HowToPlay>
          }
        >
          <div
            ref={boardFocusRef}
            tabIndex={0}
            aria-label="Bip board (use arrow keys to move)"
            onKeyDown={onBoardKeyDown}
          >
            <BipBoard
              puzzle={puzzle}
              pathKeys={pathKeys}
              candidateKeys={candidateKeys}
              onCellAction={(pos) => applyAction(pos, 'mouse')}
            />
          </div>
        </GameShell>
      </div>
    </SimplePage>
  );
}
