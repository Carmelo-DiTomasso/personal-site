export type Pos = { row: number; col: number };

export type QueensCell = 'queen' | 'x' | null;

export type QueensPuzzle = {
  id: string;
  size: number; // 6
  regions: number[][]; // size x size, values 0..5
};

function regionCount(regions: number[][]): number {
  const set = new Set<number>();
  regions.forEach((row) => row.forEach((v) => set.add(v)));
  return set.size;
}

export function makeInitialGrid(puzzle: QueensPuzzle): QueensCell[][] {
  return Array.from({ length: puzzle.size }).map(() =>
    Array.from({ length: puzzle.size }).map(() => null),
  );
}

export function makeRandomQueensPuzzle(): QueensPuzzle {
  const size = 6;

  for (let attempt = 0; attempt < 200; attempt += 1) {
    const queens = generateQueenSolution(size);
    const regions = generateRegionsFromQueens(size, queens);

    // Safety checks
    if (regions.length !== size || regions.some((r) => r.length !== size)) {
      continue;
    }
    if (regionCount(regions) !== size) {
      continue;
    }

    // Stable-ish id so repeats are detectable even across sessions.
    const id = stableIdFromRegions(regions);

    return { id, size, regions };
  }

  // Should be extremely rare. Fallback so we never crash.
  throw new Error('Failed to generate a Queens puzzle after many attempts.');
}

/** ---------------- Generator helpers ---------------- */

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

/**
 * Generates a hidden solution:
 * - exactly 1 queen per row and per column
 * - no two queens may touch (including diagonally)
 *
 * With 1 per row/col, “touching” reduces to:
 * adjacent rows cannot have columns that differ by 1.
 */
function generateQueenSolution(size: number): Pos[] {
  const allCols = Array.from({ length: size }, (_, c) => c);

  const used = new Set<number>();
  const colByRow = Array.from({ length: size }).map(() => -1);

  function backtrack(row: number): boolean {
    if (row === size) return true;

    for (const col of shuffle(allCols)) {
      if (used.has(col)) continue;

      const prevCol = row > 0 ? colByRow[row - 1] : null;
      if (prevCol !== null && Math.abs(col - prevCol) === 1) continue; // touching diagonal

      used.add(col);
      colByRow[row] = col;

      if (backtrack(row + 1)) return true;

      used.delete(col);
      colByRow[row] = -1;
    }

    return false;
  }

  if (!backtrack(0)) {
    // very unlikely for 6, but keep safe
    return generateQueenSolution(size);
  }

  return colByRow.map((col, row) => ({ row, col }));
}

/**
 * Build 6 connected regions of exactly 6 cells each, seeded at the queen cells.
 * This guarantees the generated puzzle has at least one valid solution.
 */
function generateRegionsFromQueens(size: number, queens: Pos[]): number[][] {
  const target = size; // region size = 6
  const regions = Array.from({ length: size }).map(() =>
    Array.from({ length: size }).map(() => -1),
  );

  const regionSizes = Array.from({ length: size }).map(() => 0);

  // Seed each region at its queen cell
  queens.forEach((pos, regionId) => {
    regions[pos.row][pos.col] = regionId;
    regionSizes[regionId] = 1;
  });

  function inBounds(r: number, c: number) {
    return r >= 0 && r < size && c >= 0 && c < size;
  }

  function key(r: number, c: number) {
    return `${r},${c}`;
  }

  function parse(k: string): Pos {
    const [rStr, cStr] = k.split(',');
    return { row: Number(rStr), col: Number(cStr) };
  }

  function neighbors4(pos: Pos): Pos[] {
    const opts = [
      { row: pos.row - 1, col: pos.col },
      { row: pos.row + 1, col: pos.col },
      { row: pos.row, col: pos.col - 1 },
      { row: pos.row, col: pos.col + 1 },
    ];
    return opts.filter((p) => inBounds(p.row, p.col));
  }

  // Frontier sets: unclaimed cells adjacent to each region
  const frontiers: Array<Set<string>> = Array.from({ length: size }).map(
    () => new Set<string>(),
  );

  function rebuildFrontier(regionId: number) {
    const next = new Set<string>();
    for (let r = 0; r < size; r += 1) {
      for (let c = 0; c < size; c += 1) {
        if (regions[r][c] !== regionId) continue;
        for (const n of neighbors4({ row: r, col: c })) {
          if (regions[n.row][n.col] === -1) next.add(key(n.row, n.col));
        }
      }
    }
    frontiers[regionId] = next;
  }

  for (let regionId = 0; regionId < size; regionId += 1) {
    rebuildFrontier(regionId);
  }

  let remaining = size * size - size; // all cells except the 6 seeded queens

  // If we get stuck, restart region growth (but keep the same queen seeds)
  for (let guard = 0; guard < 5000 && remaining > 0; guard += 1) {
    // pick a region that still needs cells
    const candidates = shuffle(
      Array.from({ length: size }, (_, id) => id).filter(
        (id) => regionSizes[id] < target,
      ),
    );

    let didAssign = false;

    for (const regionId of candidates) {
      if (frontiers[regionId].size === 0) rebuildFrontier(regionId);

      const options = Array.from(frontiers[regionId]);
      if (options.length === 0) continue;

      const chosenKey = options[randomInt(options.length)];
      const cell = parse(chosenKey);

      regions[cell.row][cell.col] = regionId;
      regionSizes[regionId] += 1;
      remaining -= 1;

      frontiers[regionId].delete(chosenKey);
      didAssign = true;
      break;
    }

    if (!didAssign) {
      // restart region growth completely
      return generateRegionsFromQueens(size, queens);
    }
  }

  // If we somehow didn’t fill everything, restart
  if (remaining !== 0) return generateRegionsFromQueens(size, queens);

  return regions;
}

function stableIdFromRegions(regions: number[][]): string {
  // enough to detect repeats in your "recent ids" list
  return regions.map((row) => row.join('')).join('|');
}

function keyFromPos(pos: Pos): string {
  return `${pos.row},${pos.col}`;
}

export function validateQueens(puzzle: QueensPuzzle, grid: QueensCell[][]) {
  const size = puzzle.size;

  const queens: Pos[] = [];
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (grid[row][col] === 'queen') queens.push({ row, col });
    }
  }

  const conflictCells = new Set<string>();

  const byRow = new Map<number, Pos[]>();
  const byCol = new Map<number, Pos[]>();
  const byRegion = new Map<number, Pos[]>();
  const dirs = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ] as const;

  function key(row: number, col: number) {
    return `${row},${col}`;
  }

  function addTouchingConflicts(
    size: number,
    queens: Set<string>,
    conflict: Set<string>,
  ) {
    for (const queenKey of queens) {
      const [rStr, cStr] = queenKey.split(',');
      const r = Number(rStr);
      const c = Number(cStr);

      for (const [dr, dc] of dirs) {
        const rr = r + dr;
        const cc = c + dc;
        if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;

        const neighborKey = key(rr, cc);
        if (queens.has(neighborKey)) {
          conflict.add(queenKey);
          conflict.add(neighborKey);
        }
      }
    }
  }

  function push(map: Map<number, Pos[]>, k: number, pos: Pos) {
    const arr = map.get(k);
    if (arr) arr.push(pos);
    else map.set(k, [pos]);
  }

  for (const pos of queens) {
    push(byRow, pos.row, pos);
    push(byCol, pos.col, pos);

    const regionId = puzzle.regions[pos.row][pos.col];
    push(byRegion, regionId, pos);
  }

  function markConflicts(map: Map<number, Pos[]>) {
    for (const positions of map.values()) {
      if (positions.length <= 1) continue;
      positions.forEach((p) => conflictCells.add(keyFromPos(p)));
    }
  }

  markConflicts(byRow);
  markConflicts(byCol);
  markConflicts(byRegion);

  // const queenKeySet = new Set<string>(queens.map(keyFromPos));
  // addTouchingConflicts(size, queenKeySet, conflictCells);

  const rowCounts = Array.from({ length: size }).map(
    (_, r) => byRow.get(r)?.length ?? 0,
  );
  const colCounts = Array.from({ length: size }).map(
    (_, c) => byCol.get(c)?.length ?? 0,
  );
  const regionIds = new Set<number>();
  puzzle.regions.forEach((r) => r.forEach((v) => regionIds.add(v)));

  const allRowsHaveOne = rowCounts.every((n) => n === 1);
  const allColsHaveOne = colCounts.every((n) => n === 1);
  const allRegionsHaveOne = Array.from(regionIds).every(
    (rid) => (byRegion.get(rid)?.length ?? 0) === 1,
  );

  const placedCount = queens.length;

  const queenKeySet = new Set<string>(queens.map(keyFromPos));
  addTouchingConflicts(size, queenKeySet, conflictCells);

  const solved =
    placedCount === size &&
    conflictCells.size === 0 &&
    allRowsHaveOne &&
    allColsHaveOne &&
    allRegionsHaveOne;

  return {
    placedCount,
    conflictCells,
    solved,
  };
}
