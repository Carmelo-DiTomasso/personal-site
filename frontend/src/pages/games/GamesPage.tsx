import styles from './GamesPage.module.css';
import { SimplePage } from '../shared/SimplePage';

type GameCard = {
  title: string;
  tagline: string;
  href: string;
};

const GAMES: GameCard[] = [
  {
    title: 'Bip',
    tagline: 'Draw a continuous path to satisfy the clues.',
    href: '/games/bip',
  },
  {
    title: 'Bango',
    tagline: 'Place two symbols while obeying row/column constraints.',
    href: '/games/bango',
  },
  {
    title: 'Beens',
    tagline: 'Place queens so they don’t attack each other (with constraints).',
    href: '/games/beens',
  },
  {
    title: 'Sudoku',
    tagline: 'Mini Sudoku: fill the grid with valid numbers.',
    href: '/games/sudoku',
  },
];

export function GamesPage() {
  return (
    <SimplePage title="Games">
      <div className={styles.intro}>
        <p>
          Four puzzle games inspired by the LinkedIn-style daily games —
          playable anytime.
        </p>
      </div>

      <section
        className={styles.grid}
        data-testid="games-hub-page"
        aria-label="Games list"
      >
        {GAMES.map((game) => (
          <a key={game.href} className={styles.card} href={game.href}>
            <div className={styles.cardTop}>
              <h2 className={styles.cardTitle}>{game.title}</h2>
              <span className={styles.playCta} aria-hidden="true">
                Play →
              </span>
            </div>
            <p className={styles.cardTagline}>{game.tagline}</p>
          </a>
        ))}
      </section>
    </SimplePage>
  );
}
