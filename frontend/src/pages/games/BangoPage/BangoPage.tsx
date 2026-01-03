import { SimplePage } from '../../shared/SimplePage';
import { GameShell } from '../../../components/games/GameShell/GameShell';
import { HowToPlay } from '../../../components/games/HowToPlay/HowToPlay';

export function BangoPage() {
  return (
    <SimplePage title="">
      <div data-testid="bango-page">
        <GameShell
          title="Bango"
          description="Place two symbols while obeying row/column constraints."
          onNewPuzzle={undefined}
          onReset={undefined}
          howToPlay={
            <HowToPlay>
              <ul>
                <li>Each cell can be one of two symbols (or empty).</li>
                <li>
                  Rows and columns must satisfy the constraints (no invalid
                  patterns).
                </li>
                <li>Fill the grid until all constraints are met.</li>
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
