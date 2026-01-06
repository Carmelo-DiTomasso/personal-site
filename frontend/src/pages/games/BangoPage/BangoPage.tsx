import { useMemo, useRef, useState } from 'react';

import { GameShell } from '../../../components/games/GameShell/GameShell';
import { HowToPlay } from '../../../components/games/HowToPlay/HowToPlay';
import { GameButton } from '../../../components/games/GameButton/GameButton';
import styles from './BangoPage.module.css';

import { TangoBoard } from './BangoBoard';
import {
  type Pos,
  type TangoCell,
  type TangoPuzzle,
  makeInitialGrid,
  makeRandomTangoPuzzle,
  validateTango,
} from './bangoPuzzles';

function cloneGrid(grid: TangoCell[][]): TangoCell[][] {
  return grid.map((row) => row.slice());
}

export function BangoPage() {
  const [puzzle, setPuzzle] = useState<TangoPuzzle>(() =>
    makeRandomTangoPuzzle(),
  );
  const [grid, setGrid] = useState<TangoCell[][]>(() =>
    makeInitialGrid(puzzle),
  );
  const [active, setActive] = useState<Pos>({ row: 0, col: 0 });

  const wasSolvedRef = useRef(false);
  const [showSolved, setShowSolved] = useState(false);

  const validation = useMemo(() => validateTango(puzzle, grid), [puzzle, grid]);

  const statusText = useMemo(() => {
    const filled = validation.filledCount;
    const total = puzzle.size * puzzle.size;
    const conflicts =
      validation.conflictCells.size + validation.conflictLinks.size;
    if (validation.solved) return `Solved ✅ (${filled}/${total})`;
    if (conflicts > 0)
      return `Conflicts: ${conflicts} • Filled: ${filled}/${total}`;
    return `Filled: ${filled}/${total}`;
  }, [puzzle.size, validation]);

  function startNewPuzzle() {
    const nextPuzzle = makeRandomTangoPuzzle();
    setPuzzle(nextPuzzle);
    setGrid(makeInitialGrid(nextPuzzle));
    setActive({ row: 0, col: 0 });
    wasSolvedRef.current = false;
    setShowSolved(false);
  }

  function resetPuzzle() {
    setGrid(makeInitialGrid(puzzle));
    setActive({ row: 0, col: 0 });
    wasSolvedRef.current = false;
    setShowSolved(false);
  }

  function applyEdit(nextGrid: TangoCell[][]) {
    const nextValidation = validateTango(puzzle, nextGrid);

    // show popup on rising edge only (no useEffect to avoid lint warnings)
    if (nextValidation.solved && !wasSolvedRef.current) {
      setShowSolved(true);
    }
    wasSolvedRef.current = nextValidation.solved;

    setGrid(nextGrid);
  }

  function cycleCell(pos: Pos) {
    setActive(pos);

    const key = `${pos.row},${pos.col}`;
    if (puzzle.givens[key]) return; // locked

    const next = cloneGrid(grid);
    const cur = next[pos.row][pos.col];
    const nextVal: TangoCell =
      cur === null ? 'sun' : cur === 'sun' ? 'moon' : null;
    next[pos.row][pos.col] = nextVal;

    applyEdit(next);
  }

  function setCell(pos: Pos, value: TangoCell) {
    setActive(pos);

    const key = `${pos.row},${pos.col}`;
    if (puzzle.givens[key]) return; // locked

    const next = cloneGrid(grid);
    next[pos.row][pos.col] = value;
    applyEdit(next);
  }

  function moveActive(to: Pos) {
    const r = Math.max(0, Math.min(puzzle.size - 1, to.row));
    const c = Math.max(0, Math.min(puzzle.size - 1, to.col));
    setActive({ row: r, col: c });
  }

  return (
    <GameShell
      title="Tango"
      description="Fill the grid with ☀ and ☾ using = / × constraints."
      status={statusText}
      howToPlay={
        <HowToPlay>
          <ul className={styles.howToList}>
            <li>Each row and column must have an equal number of ☀ and ☾.</li>
            <li>
              No more than two identical symbols adjacent (no 3-in-a-row)
              horizontally or vertically.
            </li>
            <li>
              Constraint markers between cells:
              <strong> = </strong> means same, <strong>×</strong> means
              different.
            </li>
            <li>
              Controls: Click to cycle. Arrow keys to move. Space/Enter cycles.
              S=☀, M=☾.
            </li>
          </ul>
        </HowToPlay>
      }
      onNewPuzzle={startNewPuzzle}
      onReset={resetPuzzle}
    >
      <TangoBoard
        puzzle={puzzle}
        grid={grid}
        active={active}
        conflictCells={validation.conflictCells}
        conflictLinks={validation.conflictLinks}
        onCycle={cycleCell}
        onSet={setCell}
        onMoveActive={moveActive}
      />

      {showSolved ? (
        <div
          role="dialog"
          aria-modal="true"
          className={styles.solvedBackdrop}
          onClick={() => setShowSolved(false)}
        >
          <div
            className={styles.solvedModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.solvedTitle}>Puzzle solved ✅</div>
            <div className={styles.solvedBody}>Nice — all rules satisfied.</div>

            <div className={styles.solvedActions}>
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
