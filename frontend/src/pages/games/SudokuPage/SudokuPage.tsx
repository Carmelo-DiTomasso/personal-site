import { useMemo, useRef, useState } from 'react';

import { GameShell } from '../../../components/games/GameShell/GameShell';
import { HowToPlay } from '../../../components/games/HowToPlay/HowToPlay';
import { GameButton } from '../../../components/games/GameButton/GameButton';

import { SudokuBoard } from './SudokuBoard';
import {
  type Pos,
  type SudokuCell,
  type SudokuGrid,
  type SudokuPuzzle,
  makeInitialGrid,
  makeRandomSudokuPuzzle,
  setNoteMask,
  validateSudoku,
} from './sudokuPuzzles';

import styles from './SudokuPage.module.css';

function cloneGrid(grid: SudokuGrid): SudokuGrid {
  return grid.map((row) => row.map((cell) => ({ ...cell })));
}

export function SudokuPage() {
  const [puzzle, setPuzzle] = useState<SudokuPuzzle>(() =>
    makeRandomSudokuPuzzle(),
  );
  const [grid, setGrid] = useState<SudokuGrid>(() => makeInitialGrid(puzzle));
  const [active, setActive] = useState<Pos>({ row: 0, col: 0 });
  const [notesMode, setNotesMode] = useState(false);

  const wasSolvedRef = useRef(false);
  const [showSolved, setShowSolved] = useState(false);

  const validation = useMemo(
    () => validateSudoku(puzzle, grid),
    [puzzle, grid],
  );

  const statusText = useMemo(() => {
    const conflicts = validation.conflictCells.size;
    if (validation.solved) return `Solved ✅ (${validation.filledCount}/81)`;
    if (conflicts > 0)
      return `Conflicts: ${conflicts} • Filled: ${validation.filledCount}/81`;
    return `Filled: ${validation.filledCount}/81`;
  }, [validation]);

  function startNewPuzzle() {
    const next = makeRandomSudokuPuzzle();
    setPuzzle(next);
    setGrid(makeInitialGrid(next));
    setActive({ row: 0, col: 0 });
    setNotesMode(false);
    wasSolvedRef.current = false;
    setShowSolved(false);
  }

  function resetPuzzle() {
    setGrid(makeInitialGrid(puzzle));
    setActive({ row: 0, col: 0 });
    setNotesMode(false);
    wasSolvedRef.current = false;
    setShowSolved(false);
  }

  function applyEdit(nextGrid: SudokuGrid) {
    const nextValidation = validateSudoku(puzzle, nextGrid);

    // show popup on rising edge only
    if (nextValidation.solved && !wasSolvedRef.current) setShowSolved(true);
    wasSolvedRef.current = nextValidation.solved;

    setGrid(nextGrid);
  }

  function selectCell(pos: Pos) {
    setActive(pos);
  }

  function moveActive(pos: Pos) {
    setActive(pos);
  }

  function isLocked(pos: Pos): boolean {
    return Boolean(puzzle.givens[`${pos.row},${pos.col}`]);
  }

  function inputDigit(digit: number) {
    if (isLocked(active)) return;

    const next = cloneGrid(grid);
    const cell = next[active.row][active.col];

    if (notesMode) {
      const currentlyOn = (cell.notesMask & (1 << digit)) !== 0;
      cell.notesMask = setNoteMask(cell.notesMask, digit, !currentlyOn);
      cell.value = null; // notes imply not a committed value
    } else {
      cell.value = digit;
      cell.notesMask = 0;
    }

    applyEdit(next);
  }

  function clearCell() {
    if (isLocked(active)) return;

    const next = cloneGrid(grid);
    next[active.row][active.col] = { value: null, notesMask: 0 } as SudokuCell;
    applyEdit(next);
  }

  return (
    <GameShell
      title="Sudoku"
      description="Fill the grid so each row, column, and 3×3 box contains 1–9."
      status={statusText}
      howToPlay={
        <HowToPlay>
          <ul className={styles.howList}>
            <li>
              Each row, column, and 3×3 box must contain digits 1–9 exactly
              once.
            </li>
            <li>Click a cell to select it. Use arrow keys to move.</li>
            <li>Type 1–9 to fill a cell. Backspace/Delete clears.</li>
            <li>Notes mode toggles pencil marks instead of setting a value.</li>
          </ul>
        </HowToPlay>
      }
      controls={
        <>
          <GameButton
            type="button"
            aria-pressed={notesMode}
            onClick={() => setNotesMode((v) => !v)}
          >
            Notes: {notesMode ? 'On' : 'Off'}
          </GameButton>
          <GameButton type="button" onClick={startNewPuzzle}>
            New puzzle
          </GameButton>
          <GameButton type="button" onClick={resetPuzzle}>
            Reset
          </GameButton>
        </>
      }
    >
      <SudokuBoard
        puzzle={puzzle}
        grid={grid}
        active={active}
        notesMode={notesMode}
        conflictCells={validation.conflictCells}
        onSelect={selectCell}
        onMoveActive={moveActive}
        onInputDigit={inputDigit}
        onClear={clearCell}
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
