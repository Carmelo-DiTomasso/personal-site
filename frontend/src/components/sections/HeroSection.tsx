import styles from './HeroSection.module.css';
import { Container } from '../layout/Container';
import { ExternalLink } from '../ui/ExternalLink';

type HeroSectionProps = {
  name: string;
  tagline: string;
  locationLine?: string;
  primaryCtaHref: string;
  primaryCtaLabel: string;
  secondaryCtaHref: string;
  secondaryCtaLabel: string;
};

export function HeroSection({
  name,
  tagline,
  locationLine,
  primaryCtaHref,
  primaryCtaLabel,
  secondaryCtaHref,
  secondaryCtaLabel,
}: HeroSectionProps) {
  return (
    <header className={styles.hero}>
      <Container>
        <nav className={styles.nav} aria-label="Primary">
          <a className={styles.brand} href="/">
            {name}
          </a>

          {/* In-page links for now. Later this can become real routing. */}
          <div className={styles.navLinks}>
            <a href="#about">About</a>
            <a href="#projects">Projects</a>
            <a href="#contact">Contact</a>
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
            <a className={styles.secondaryButton} href={secondaryCtaHref}>
              {secondaryCtaLabel}
            </a>
          </div>

          <div className={styles.links} aria-label="External links">
            <ExternalLink href="/resume" aria-label="Resume">
              Resume
            </ExternalLink>
            <ExternalLink href="https://github.com/Carmelo-DiTomasso" aria-label="GitHub">
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
