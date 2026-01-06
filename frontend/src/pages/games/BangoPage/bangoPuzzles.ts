export type Pos = { row: number; col: number };

export type TangoSymbol = 'sun' | 'moon';
export type TangoCell = TangoSymbol | null;

export type TangoLink = {
  a: Pos;
  b: Pos; // must be adjacent orthogonally
  kind: 'same' | 'diff'; // '=' or '×'
};

export type TangoPuzzle = {
  id: string;
  size: number; // even
  givens: Record<string, TangoSymbol>; // "r,c" -> symbol
  links: TangoLink[];
};

function keyFromPos(pos: Pos): string {
  return `${pos.row},${pos.col}`;
}

function randInt(min: number, maxInclusive: number): number {
  return Math.floor(Math.random() * (maxInclusive - min + 1)) + min;
}

function pickDistinct<T>(arr: T[], count: number): T[] {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(count, copy.length));
}

// A guaranteed-valid solution (exists => puzzle always solvable)
// (Not shown to user; we just use it to generate consistent givens/links.)
const SOLUTION_6: TangoSymbol[][] = [
  ['sun', 'moon', 'sun', 'moon', 'moon', 'sun'],
  ['moon', 'sun', 'moon', 'sun', 'sun', 'moon'],
  ['sun', 'sun', 'moon', 'moon', 'sun', 'moon'],
  ['moon', 'moon', 'sun', 'sun', 'moon', 'sun'],
  ['sun', 'moon', 'moon', 'sun', 'moon', 'sun'],
  ['moon', 'sun', 'sun', 'moon', 'sun', 'moon'],
];

export function makeRandomTangoPuzzle(): TangoPuzzle {
  const size = 6;

  const solution = SOLUTION_6;

  const allCells: Pos[] = [];
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++) allCells.push({ row: r, col: c });

  const givenCount = randInt(6, 14);
  const givenCells = pickDistinct(allCells, givenCount);

  const givens: Record<string, TangoSymbol> = {};
  for (const pos of givenCells) {
    givens[keyFromPos(pos)] = solution[pos.row][pos.col];
  }

  // candidate adjacent pairs (right/down only)
  const pairs: { a: Pos; b: Pos }[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (c + 1 < size)
        pairs.push({ a: { row: r, col: c }, b: { row: r, col: c + 1 } });
      if (r + 1 < size)
        pairs.push({ a: { row: r, col: c }, b: { row: r + 1, col: c } });
    }
  }

  const linkCount = randInt(6, 14);
  const chosenPairs = pickDistinct(pairs, linkCount);

  const links: TangoLink[] = chosenPairs.map(({ a, b }) => {
    const same = solution[a.row][a.col] === solution[b.row][b.col];
    return { a, b, kind: same ? 'same' : 'diff' };
  });

  return {
    id: `bango-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    size,
    givens,
    links,
  };
}

export function makeInitialGrid(puzzle: TangoPuzzle): TangoCell[][] {
  const grid: TangoCell[][] = Array.from({ length: puzzle.size }, () =>
    Array.from({ length: puzzle.size }, () => null),
  );

  for (const [k, sym] of Object.entries(puzzle.givens)) {
    const [rStr, cStr] = k.split(',');
    const r = Number(rStr);
    const c = Number(cStr);
    if (!Number.isNaN(r) && !Number.isNaN(c)) {
      grid[r][c] = sym;
    }
  }

  return grid;
}

export function validateTango(
  puzzle: TangoPuzzle,
  grid: TangoCell[][],
): {
  solved: boolean;
  filledCount: number;
  conflictCells: Set<string>;
  conflictLinks: Set<string>;
} {
  const size = puzzle.size;
  const half = size / 2;

  const conflictCells = new Set<string>();
  const conflictLinks = new Set<string>();

  let filledCount = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] !== null) filledCount++;
    }
  }

  // row/col count constraints + "no 3 in a row"
  for (let r = 0; r < size; r++) {
    let suns = 0;
    let moons = 0;
    let empties = 0;

    for (let c = 0; c < size; c++) {
      const v = grid[r][c];
      if (v === 'sun') suns++;
      else if (v === 'moon') moons++;
      else empties++;
    }

    // cannot exceed half
    if (suns > half || moons > half) {
      for (let c = 0; c < size; c++) conflictCells.add(`${r},${c}`);
    }

    // if full, must equal half
    if (empties === 0 && (suns !== half || moons !== half)) {
      for (let c = 0; c < size; c++) conflictCells.add(`${r},${c}`);
    }

    // no triples in rows
    for (let c = 0; c < size - 2; c++) {
      const a = grid[r][c];
      const b = grid[r][c + 1];
      const d = grid[r][c + 2];
      if (a !== null && a === b && b === d) {
        conflictCells.add(`${r},${c}`);
        conflictCells.add(`${r},${c + 1}`);
        conflictCells.add(`${r},${c + 2}`);
      }
    }
  }

  for (let c = 0; c < size; c++) {
    let suns = 0;
    let moons = 0;
    let empties = 0;

    for (let r = 0; r < size; r++) {
      const v = grid[r][c];
      if (v === 'sun') suns++;
      else if (v === 'moon') moons++;
      else empties++;
    }

    if (suns > half || moons > half) {
      for (let r = 0; r < size; r++) conflictCells.add(`${r},${c}`);
    }

    if (empties === 0 && (suns !== half || moons !== half)) {
      for (let r = 0; r < size; r++) conflictCells.add(`${r},${c}`);
    }

    // no triples in columns
    for (let r = 0; r < size - 2; r++) {
      const a = grid[r][c];
      const b = grid[r + 1][c];
      const d = grid[r + 2][c];
      if (a !== null && a === b && b === d) {
        conflictCells.add(`${r},${c}`);
        conflictCells.add(`${r + 1},${c}`);
        conflictCells.add(`${r + 2},${c}`);
      }
    }
  }

  // link constraints
  for (const link of puzzle.links) {
    const av = grid[link.a.row][link.a.col];
    const bv = grid[link.b.row][link.b.col];
    if (av === null || bv === null) continue;

    const ok = link.kind === 'same' ? av === bv : av !== bv;
    if (!ok) {
      const ka = keyFromPos(link.a);
      const kb = keyFromPos(link.b);
      conflictCells.add(ka);
      conflictCells.add(kb);

      // canonical link id
      const id = ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
      conflictLinks.add(id);
    }
  }

  // givens mismatch (shouldn't happen, but keep it safe)
  for (const [k, sym] of Object.entries(puzzle.givens)) {
    const [rStr, cStr] = k.split(',');
    const r = Number(rStr);
    const c = Number(cStr);
    if (grid[r]?.[c] !== sym) conflictCells.add(k);
  }

  const solved =
    filledCount === size * size &&
    conflictCells.size === 0 &&
    conflictLinks.size === 0;

  return { solved, filledCount, conflictCells, conflictLinks };
}
