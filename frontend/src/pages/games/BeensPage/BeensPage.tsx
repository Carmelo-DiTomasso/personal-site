import { useMemo, useRef, useState } from 'react';

import { GameShell } from '../../../components/games/GameShell/GameShell';
import { HowToPlay } from '../../../components/games/HowToPlay/HowToPlay';
import { GameButton } from '../../../components/games/GameButton/GameButton';

import { BeensBoard } from './BeensBoard';
import {
  type Pos,
  type QueensCell,
  type QueensPuzzle,
  makeInitialGrid,
  makeRandomQueensPuzzle,
  validateQueens,
} from './beensPuzzles';

import styles from './BeensPage.module.css';

function cloneGrid(grid: QueensCell[][]): QueensCell[][] {
  return grid.map((row) => row.slice());
}

function cycleValue(value: QueensCell): QueensCell {
  if (value === null) return 'x';
  if (value === 'x') return 'queen';
  return null;
}

function regionsHash(puzzle: QueensPuzzle): string {
  // Stable hash for presets (since puzzle.id is randomUUID each time)
  return puzzle.regions.map((row) => row.join(',')).join('|');
}

export function BeensPage() {
  // Keep puzzle+grid consistent at init
  const [game, setGame] = useState<{
    puzzle: QueensPuzzle;
    grid: QueensCell[][];
  }>(() => {
    const puzzle = makeRandomQueensPuzzle();
    return { puzzle, grid: makeInitialGrid(puzzle) };
  });

  const { puzzle, grid } = game;

  const [active, setActive] = useState<Pos>({ row: 0, col: 0 });

  const wasSolvedRef = useRef(false);
  const [showSolved, setShowSolved] = useState(false);

  const recentRegionHashesRef = useRef<string[]>([]);

  const validation = useMemo(
    () => validateQueens(puzzle, grid),
    [puzzle, grid],
  );

  const statusText = useMemo(() => {
    const conflicts = validation.conflictCells.size;
    if (validation.solved)
      return `Solved ✅ (Queens: ${validation.placedCount}/6)`;
    if (conflicts > 0)
      return `Conflicts: ${conflicts} · Queens: ${validation.placedCount}/6`;
    return `Queens: ${validation.placedCount}/6`;
  }, [validation]);

  function makeNonRepeatingPuzzle(): QueensPuzzle {
    for (let attempt = 0; attempt < 25; attempt += 1) {
      const candidate = makeRandomQueensPuzzle();
      const hash = regionsHash(candidate);

      if (!recentRegionHashesRef.current.includes(hash)) {
        recentRegionHashesRef.current = [
          hash,
          ...recentRegionHashesRef.current,
        ].slice(0, 8);
        return candidate;
      }
    }

    // fallback
    const candidate = makeRandomQueensPuzzle();
    const hash = regionsHash(candidate);
    recentRegionHashesRef.current = [
      hash,
      ...recentRegionHashesRef.current,
    ].slice(0, 8);
    return candidate;
  }

  function resetSolvedState() {
    wasSolvedRef.current = false;
    setShowSolved(false);
  }

  function startNewPuzzle() {
    const nextPuzzle = makeNonRepeatingPuzzle();
    setGame({ puzzle: nextPuzzle, grid: makeInitialGrid(nextPuzzle) });
    setActive({ row: 0, col: 0 });
    resetSolvedState();
  }

  function resetPuzzle() {
    setGame((prev) => ({
      puzzle: prev.puzzle,
      grid: makeInitialGrid(prev.puzzle),
    }));
    setActive({ row: 0, col: 0 });
    resetSolvedState();
  }

  function applyEdit(nextGrid: QueensCell[][]) {
    const nextValidation = validateQueens(puzzle, nextGrid);

    if (nextValidation.solved && !wasSolvedRef.current) setShowSolved(true);
    wasSolvedRef.current = nextValidation.solved;

    setGame((prev) => ({ puzzle: prev.puzzle, grid: nextGrid }));
  }

  function cycleCell(pos: Pos) {
    setActive(pos);

    const nextGrid = cloneGrid(grid);
    nextGrid[pos.row][pos.col] = cycleValue(nextGrid[pos.row][pos.col]);

    applyEdit(nextGrid);
  }

  function clearCell(pos: Pos) {
    setActive(pos);

    const nextGrid = cloneGrid(grid);
    nextGrid[pos.row][pos.col] = null;

    applyEdit(nextGrid);
  }

  function moveActive(to: Pos) {
    const r = Math.max(0, Math.min(puzzle.size - 1, to.row));
    const c = Math.max(0, Math.min(puzzle.size - 1, to.col));
    setActive({ row: r, col: c });
  }

  return (
    <GameShell
      title="Beens"
      description="Place exactly one queen per row, column, and region — and no two queens may touch (including diagonally)."
      status={statusText}
      howToPlay={
        <HowToPlay>
          <ul className={styles.howList}>
            <li>
              Place exactly <strong>one</strong> queen in each{' '}
              <strong>row</strong> and <strong>column</strong>.
            </li>
            <li>
              Each <strong>region</strong> must contain exactly{' '}
              <strong>one</strong> queen.
            </li>
            <li>
              Queens cannot <strong>touch</strong> (including
              diagonally-adjacent).
            </li>
            <li>
              Controls: <strong>Click</strong> (or <strong>Space</strong>)
              cycles: <strong>X → Queen → Empty</strong>. Arrow keys move.
            </li>
          </ul>
        </HowToPlay>
      }
      controls={
        <>
          <GameButton type="button" onClick={startNewPuzzle}>
            New puzzle
          </GameButton>
          <GameButton type="button" onClick={resetPuzzle}>
            Reset
          </GameButton>
        </>
      }
    >
      <BeensBoard
        puzzle={puzzle}
        grid={grid}
        active={active}
        conflictCells={validation.conflictCells}
        onCycle={cycleCell}
        onClear={clearCell}
        onMoveActive={moveActive}
      />

      {showSolved ? (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-label="Puzzle solved"
          onClick={() => setShowSolved(false)}
        >
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalTitle}>Puzzle solved ✅</div>
            <div className={styles.modalBody}>
              Nice — all constraints satisfied.
            </div>
            <div className={styles.modalActions}>
              <GameButton type="button" onClick={() => setShowSolved(false)}>
                Close
              </GameButton>
              <GameButton
                type="button"
                onClick={() => {
                  setShowSolved(false);
                  startNewPuzzle();
                }}
              >
                New puzzle
              </GameButton>
            </div>
          </div>
        </div>
      ) : null}
    </GameShell>
  );
}
