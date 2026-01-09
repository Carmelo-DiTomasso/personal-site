export type Pos = { row: number; col: number };

export type SudokuPuzzle = {
  id: string;
  size: 9;
  givens: Record<string, number>; // "r,c" -> 1..9
};

export type SudokuCell = {
  value: number | null;
  notesMask: number; // bitmask for digits 1..9
};

export type SudokuGrid = SudokuCell[][];

function keyFromPos(pos: Pos): string {
  return `${pos.row},${pos.col}`;
}

function randomInt(maxExclusive: number): number {
  return Math.floor(Math.random() * maxExclusive);
}

function shuffle<T>(items: T[]): T[] {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function boxStart(n: number): number {
  return Math.floor(n / 3) * 3;
}

function isValidPlacement(
  values: number[][],
  row: number,
  col: number,
  v: number,
) {
  // Row/col
  for (let i = 0; i < 9; i += 1) {
    if (values[row][i] === v) return false;
    if (values[i][col] === v) return false;
  }

  // 3x3 box
  const rs = boxStart(row);
  const cs = boxStart(col);
  for (let r = rs; r < rs + 3; r += 1) {
    for (let c = cs; c < cs + 3; c += 1) {
      if (values[r][c] === v) return false;
    }
  }

  return true;
}

function findNextEmpty(values: number[][]): Pos | null {
  for (let r = 0; r < 9; r += 1) {
    for (let c = 0; c < 9; c += 1) {
      if (values[r][c] === 0) return { row: r, col: c };
    }
  }
  return null;
}

function makeEmptyValues(): number[][] {
  return Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => 0));
}

/**
 * Randomized backtracking solver to generate a full valid Sudoku solution.
 */
function generateFullSolution(): number[][] {
  const values = makeEmptyValues();
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  function backtrack(): boolean {
    const empty = findNextEmpty(values);
    if (!empty) return true;

    const { row, col } = empty;
    for (const d of shuffle(digits)) {
      if (!isValidPlacement(values, row, col, d)) continue;
      values[row][col] = d;
      if (backtrack()) return true;
      values[row][col] = 0;
    }
    return false;
  }

  // Should always succeed.
  backtrack();
  return values;
}

/**
 * Counts solutions up to 2 (early exit). Used to keep puzzles unique.
 */
function countSolutionsUpTo2(values: number[][]): number {
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  let count = 0;

  function backtrack(): void {
    if (count >= 2) return;

    const empty = findNextEmpty(values);
    if (!empty) {
      count += 1;
      return;
    }

    const { row, col } = empty;

    for (const d of digits) {
      if (!isValidPlacement(values, row, col, d)) continue;
      values[row][col] = d;
      backtrack();
      values[row][col] = 0;
      if (count >= 2) return;
    }
  }

  backtrack();
  return count;
}

function cloneValues(values: number[][]): number[][] {
  return values.map((row) => row.slice());
}

function stableIdFromGivens(givens: Record<string, number>): string {
  // enough to detect repeats; order-independent
  const entries = Object.entries(givens).sort(([a], [b]) => (a < b ? -1 : 1));
  return entries.map(([k, v]) => `${k}:${v}`).join('|');
}

/**
 * Generate a Sudoku puzzle by:
 * 1) generating a full solution
 * 2) removing cells while keeping a unique solution (solution count stays 1)
 */
export function makeRandomSudokuPuzzle(): SudokuPuzzle {
  const full = generateFullSolution();

  // Start with all clues present.
  const current = cloneValues(full);

  // Choose target clue count (roughly easy/medium).
  const targetClues = 30 + randomInt(11); // 30..40

  const positions: Pos[] = [];
  for (let r = 0; r < 9; r += 1)
    for (let c = 0; c < 9; c += 1) positions.push({ row: r, col: c });

  const removalOrder = shuffle(positions);

  let clues = 81;

  for (const pos of removalOrder) {
    if (clues <= targetClues) break;

    const prev = current[pos.row][pos.col];
    if (prev === 0) continue;

    // Try removing this clue.
    current[pos.row][pos.col] = 0;

    const test = cloneValues(current);
    const solCount = countSolutionsUpTo2(test);

    if (solCount !== 1) {
      // put it back; removal breaks uniqueness
      current[pos.row][pos.col] = prev;
    } else {
      clues -= 1;
    }
  }

  // Build givens map.
  const givens: Record<string, number> = {};
  for (let r = 0; r < 9; r += 1) {
    for (let c = 0; c < 9; c += 1) {
      const v = current[r][c];
      if (v !== 0) givens[`${r},${c}`] = v;
    }
  }

  const id = stableIdFromGivens(givens);
  return { id, size: 9, givens };
}

export function makeInitialGrid(puzzle: SudokuPuzzle): SudokuGrid {
  const grid: SudokuGrid = Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => ({ value: null, notesMask: 0 })),
  );

  for (const [k, v] of Object.entries(puzzle.givens)) {
    const [rStr, cStr] = k.split(',');
    const r = Number(rStr);
    const c = Number(cStr);
    if (!Number.isNaN(r) && !Number.isNaN(c)) {
      grid[r][c] = { value: v, notesMask: 0 };
    }
  }

  return grid;
}

export function validateSudoku(
  puzzle: SudokuPuzzle,
  grid: SudokuGrid,
): {
  solved: boolean;
  filledCount: number;
  conflictCells: Set<string>;
} {
  const conflictCells = new Set<string>();
  let filledCount = 0;

  // Convenience: values 0..9
  const values: number[][] = Array.from({ length: 9 }, (_, r) =>
    Array.from({ length: 9 }, (_, c) => grid[r][c].value ?? 0),
  );

  for (let r = 0; r < 9; r += 1) {
    for (let c = 0; c < 9; c += 1) {
      if (values[r][c] !== 0) filledCount += 1;
    }
  }

  function markGroup(cells: Pos[]) {
    const seen = new Map<number, Pos[]>();
    for (const pos of cells) {
      const v = values[pos.row][pos.col];
      if (v === 0) continue;
      const arr = seen.get(v);
      if (arr) arr.push(pos);
      else seen.set(v, [pos]);
    }
    for (const positions of seen.values()) {
      if (positions.length <= 1) continue;
      for (const p of positions) conflictCells.add(keyFromPos(p));
    }
  }

  // Rows
  for (let r = 0; r < 9; r += 1) {
    markGroup(Array.from({ length: 9 }, (_, c) => ({ row: r, col: c })));
  }

  // Cols
  for (let c = 0; c < 9; c += 1) {
    markGroup(Array.from({ length: 9 }, (_, r) => ({ row: r, col: c })));
  }

  // Boxes
  for (let br = 0; br < 3; br += 1) {
    for (let bc = 0; bc < 3; bc += 1) {
      const cells: Pos[] = [];
      for (let r = br * 3; r < br * 3 + 3; r += 1) {
        for (let c = bc * 3; c < bc * 3 + 3; c += 1) {
          cells.push({ row: r, col: c });
        }
      }
      markGroup(cells);
    }
  }

  // Givens mismatch safety (should never happen)
  for (const [k, v] of Object.entries(puzzle.givens)) {
    const [rStr, cStr] = k.split(',');
    const r = Number(rStr);
    const c = Number(cStr);
    if (values[r]?.[c] !== v) conflictCells.add(k);
  }

  const solved = filledCount === 81 && conflictCells.size === 0;
  return { solved, filledCount, conflictCells };
}

export function setNoteMask(mask: number, digit: number, on: boolean): number {
  const bit = 1 << digit;
  return on ? mask | bit : mask & ~bit;
}

export function hasNote(mask: number, digit: number): boolean {
  return (mask & (1 << digit)) !== 0;
}
