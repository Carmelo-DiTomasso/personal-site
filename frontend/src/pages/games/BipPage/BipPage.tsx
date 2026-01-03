import { SimplePage } from '../../shared/SimplePage';
import { GameShell } from '../../../components/games/GameShell/GameShell';
import { HowToPlay } from '../../../components/games/HowToPlay/HowToPlay';

export function BipPage() {
  return (
    <SimplePage title="">
      <div data-testid="bip-page">
        <GameShell
          title="Bip"
          description="Draw a continuous path to satisfy the clues."
          onNewPuzzle={undefined}
          onReset={undefined}
          howToPlay={
            <HowToPlay>
              <ul>
                <li>Drag to draw a single continuous path through the grid.</li>
                <li>
                  The path must follow the game's rules (shown by clues on the
                  board).
                </li>
                <li>
                  Use Reset to clear your current attempt, or New puzzle for a
                  fresh board.
                </li>
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
