import { SimplePage } from '../../shared/SimplePage';
import { GameShell } from '../../../components/games/GameShell/GameShell';
import { HowToPlay } from '../../../components/games/HowToPlay/HowToPlay';

export function SudokuPage() {
  return (
    <SimplePage title="">
      <div data-testid="sudoku-page">
        <GameShell
          title="Sudoku"
          description="Mini Sudoku: fill the grid with valid numbers."
          onNewPuzzle={undefined}
          onReset={undefined}
          howToPlay={
            <HowToPlay>
              <ul>
                <li>Fill empty cells with numbers.</li>
                <li>No duplicates are allowed in any row or column.</li>
                <li>Smaller sub-grids also must not contain duplicates.</li>
              </ul>
            </HowToPlay>
          }
        >
          <p>Game UI coming soon.</p>
        </GameShell>
      </div>
    </SimplePage>
  );
}
