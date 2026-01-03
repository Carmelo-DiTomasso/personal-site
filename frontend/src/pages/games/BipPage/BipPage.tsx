import { useEffect, useMemo, useRef, useState } from 'react';
import { GameShell } from '../../../components/games/GameShell/GameShell';
import { HowToPlay } from '../../../components/games/HowToPlay/HowToPlay';
import { GameButton } from '../../../components/games/GameButton/GameButton';
import { BipBoard, type Pos, type ZipPuzzle } from './BipBoard';
import styles from './BipPage.module.css';

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

function randomInt(minInclusive: number, maxInclusive: number): number {
  const span = maxInclusive - minInclusive + 1;
  return minInclusive + Math.floor(Math.random() * span);
}

// Full templates (6x6). We carve a contiguous segment to create blocked tiles.
type FullTemplate = { size: number; fullPath: Pos[] };

const TEMPLATES: FullTemplate[] = [
  {
    size: 6,
    fullPath: [
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
    fullPath: [
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

function buildPuzzle(): ZipPuzzle {
  const template = TEMPLATES[randomInt(0, TEMPLATES.length - 1)];
  const { size } = template;

  // playable cells count (walls are the rest). keep enough space for up to 30 checkpoints
  const openLength = randomInt(26, 36);

  const startIndex = randomInt(0, template.fullPath.length - openLength);
  let openPath = template.fullPath.slice(startIndex, startIndex + openLength);

  if (Math.random() < 0.5) openPath = [...openPath].reverse();

  const openSet = new Set<string>(openPath.map(keyFromPos));

  const blockedCells: Pos[] = [];
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const pos = { row, col };
      if (!openSet.has(keyFromPos(pos))) blockedCells.push(pos);
    }
  }

  const maxWaypoints = Math.min(30, openPath.length);
  const waypointCount = randomInt(5, maxWaypoints);

  const chosen = new Set<number>();
  chosen.add(0);
  chosen.add(openPath.length - 1);
  while (chosen.size < waypointCount)
    chosen.add(randomInt(1, openPath.length - 2));

  const indexes = Array.from(chosen).sort((a, b) => a - b);
  const waypointsInOrder = indexes.map((i) => openPath[i]);

  return {
    id: `zip-${Math.random().toString(36).slice(2)}`,
    size,
    blockedCells,
    waypointsInOrder,
  };
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

type GameState = {
  puzzle: ZipPuzzle;
  pathKeys: string[];
  dismissedSolvedForPuzzleId: string | null;
};

function newGameState(): GameState {
  const puzzle = buildPuzzle();
  return {
    puzzle,
    pathKeys: [keyFromPos(puzzle.waypointsInOrder[0])],
    dismissedSolvedForPuzzleId: null,
  };
}

export function BipPage() {
  const boardFocusRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<GameState>(() => newGameState());

  const puzzle = state.puzzle;
  const pathKeys = state.pathKeys;

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

  const playableCount = totalPlayableCells(puzzle);
  const lastNumber = puzzle.waypointsInOrder.length;

  const expectedNext = useMemo(
    () => computeExpectedNext(numberByKey, pathKeys),
    [numberByKey, pathKeys],
  );
  const solved = useMemo(
    () => isSolved(puzzle, pathKeys, numberByKey),
    [puzzle, pathKeys, numberByKey],
  );

  const showSolved = solved && state.dismissedSolvedForPuzzleId !== puzzle.id;

  useEffect(() => {
    boardFocusRef.current?.focus();
  }, []);

  function handleReset() {
    setState((prev) => ({
      ...prev,
      pathKeys: [keyFromPos(prev.puzzle.waypointsInOrder[0])],
      dismissedSolvedForPuzzleId: null,
    }));
  }

  function handleNewPuzzle() {
    setState(() => newGameState());
    requestAnimationFrame(() => boardFocusRef.current?.focus());
  }

  function applyAction(targetPos: Pos, mode: 'mouse' | 'arrow') {
    const targetKey = keyFromPos(targetPos);

    setState((prev) => {
      const currentPuzzle = prev.puzzle;
      const currentPath = prev.pathKeys;

      const currentBlocked = new Set<string>(
        currentPuzzle.blockedCells.map(keyFromPos),
      );
      if (currentBlocked.has(targetKey)) return prev;

      const existingIndex = currentPath.indexOf(targetKey);

      // mouse can backtrack by clicking a path cell
      if (mode === 'mouse' && existingIndex >= 0) {
        return { ...prev, pathKeys: currentPath.slice(0, existingIndex + 1) };
      }

      // arrows allow “step back” (only if you move onto the previous cell)
      if (mode === 'arrow' && existingIndex >= 0) {
        if (
          currentPath.length >= 2 &&
          currentPath[currentPath.length - 2] === targetKey
        ) {
          return {
            ...prev,
            pathKeys: currentPath.slice(0, currentPath.length - 1),
          };
        }
        return prev;
      }

      if (currentPath.length >= totalPlayableCells(currentPuzzle)) return prev;

      const headKey = currentPath[currentPath.length - 1];
      const headPos = posFromKey(headKey);
      if (!isAdjacent(headPos, targetPos)) return prev;

      const expected = computeExpectedNext(numberByKey, currentPath);
      const steppedNumber = numberByKey.get(targetKey);
      if (steppedNumber !== undefined && steppedNumber !== expected)
        return prev;

      const headNumber = numberByKey.get(headKey);
      const last = currentPuzzle.waypointsInOrder.length;
      if (
        headNumber === last &&
        currentPath.length < totalPlayableCells(currentPuzzle)
      )
        return prev;

      return { ...prev, pathKeys: [...currentPath, targetKey] };
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
    if (blockedSet.has(keyFromPos(next))) return;

    applyAction(next, 'arrow');
  }

  return (
    <div data-testid="bip-page">
      <GameShell
        title="Bip"
        description={`Zip-style: connect 1 → ${lastNumber} in order and fill every playable cell.`}
        onNewPuzzle={handleNewPuzzle}
        onReset={handleReset}
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
                <strong>Walls</strong> are the shaded squares — you can’t enter
                them.
              </li>
              <li>
                <strong>Mouse:</strong> drag + hold to draw; click a path cell
                to backtrack.
              </li>
              <li>
                <strong>Keyboard:</strong> click the board, then use arrow keys.
              </li>
            </ul>
          </HowToPlay>
        }
      >
        <div className={styles.boardMeta} aria-label="Bip progress">
          <span>
            Cells {pathKeys.length}/{playableCount}
          </span>
          <span>
            {expectedNext <= lastNumber ? `Next: ${expectedNext}` : ''}
          </span>
        </div>

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

      {showSolved ? (
        <div
          className={styles.solvedOverlay}
          role="dialog"
          aria-modal="true"
          aria-label="Puzzle solved"
        >
          <div className={styles.solvedModal}>
            <div className={styles.titleRow}>
              <h2 className={styles.title}>Solved 🎉</h2>
              <button
                type="button"
                className={styles.closeBtn}
                aria-label="Close solved popup"
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    dismissedSolvedForPuzzleId: prev.puzzle.id,
                  }))
                }
              >
                Close
              </button>
            </div>

            <div className={styles.body}>
              You connected <strong>1 → {lastNumber}</strong> and filled every
              playable cell.
            </div>

            <div className={styles.actions} aria-label="Solved actions">
              <GameButton
                type="button"
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    dismissedSolvedForPuzzleId: prev.puzzle.id,
                  }))
                }
                aria-label="Dismiss solved popup"
              >
                Nice
              </GameButton>
              <GameButton
                type="button"
                onClick={handleNewPuzzle}
                aria-label="Start a new puzzle"
              >
                New puzzle
              </GameButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
