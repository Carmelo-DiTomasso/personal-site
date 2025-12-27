import styles from './HeroSection.module.css';
import { Container } from '../layout/Container';
import { ExternalLink } from '../ui/ExternalLink';

type HeroSectionProps = {
  tagline: string;
  locationLine?: string;
  primaryCtaHref: string;
  primaryCtaLabel: string;
};

export function HeroSection({
  tagline,
  locationLine,
  primaryCtaHref,
  primaryCtaLabel,
}: HeroSectionProps) {
  return (
    <header className={styles.hero}>
      <Container>
        <nav className={styles.nav} aria-label="Primary">
          {/* In-page links for now. Later this can become real routing. */}
          <div className={styles.navLinks}>
            <a href="#about">About</a>
            <a href="#projects">Projects</a>
          </div>
        </nav>

        <div className={styles.content}>
          <h1 className={styles.title}>{tagline}</h1>
          {locationLine ? (
            <p className={styles.subtitle}>{locationLine}</p>
          ) : null}

          <div className={styles.ctas}>
            <a className={styles.primaryButton} href={primaryCtaHref}>
              {primaryCtaLabel}
            </a>
          </div>

          <div className={styles.links} aria-label="External links">
            <ExternalLink href="/resume" aria-label="Resume">
              Resume
            </ExternalLink>
            <ExternalLink
              href="https://github.com/Carmelo-DiTomasso"
              aria-label="GitHub"
            >
              GitHub
            </ExternalLink>
            <ExternalLink
              href="https://www.linkedin.com/in/carmelo-ditomasso"
              aria-label="LinkedIn"
            >
              LinkedIn
            </ExternalLink>
          </div>
        </div>
      </Container>
    </header>
  );
}
