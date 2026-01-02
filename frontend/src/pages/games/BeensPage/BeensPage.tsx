import { SimplePage } from '../../shared/SimplePage';
import { GameShell } from '../../../components/games/GameShell/GameShell';
import { HowToPlay } from '../../../components/games/HowToPlay/HowToPlay';

export function BeensPage() {
  return (
    <SimplePage title="">
      <div data-testid="beens-page">
        <GameShell
          title="Beens"
          description="Place queens so they don’t attack each other (with constraints)."
          howToPlay={
            <HowToPlay>
              <ul>
                <li>Place queens on the board.</li>
                <li>Queens cannot share a row, column, or diagonal.</li>
                <li>Satisfy any region/constraint rules shown on the board.</li>
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
