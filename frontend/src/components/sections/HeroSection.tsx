import styles from './HeroSection.module.css';
import { Container } from '../layout/Container';
import { ExternalIconLink } from '@/components/ui/ExternalIconLink/ExternalIconLink';
import {
  GitHubIcon,
  LinkedInIcon,
  ResumeIcon,
} from '@/components/ui/ExternalIconLink/icons';

type HeroSectionProps = {
  tagline: string;
  locationLine?: string;
};

export function HeroSection({ tagline, locationLine }: HeroSectionProps) {
  return (
    <header className={styles.hero}>
      <Container>
        <div className={styles.content}>
          <h1 className={styles.title}>{tagline}</h1>
          {locationLine ? (
            <p className={styles.subtitle}>{locationLine}</p>
          ) : null}

          <div className={styles.links} aria-label="Links">
            <ExternalIconLink
              href="/resume"
              label="Resume"
              icon={<ResumeIcon />}
            />
            <ExternalIconLink
              href="https://github.com/Carmelo-DiTomasso"
              label="GitHub"
              icon={<GitHubIcon />}
            />
            <ExternalIconLink
              href="https://www.linkedin.com/in/carmelo-ditomasso/"
              label="LinkedIn"
              icon={<LinkedInIcon />}
            />
          </div>
        </div>
      </Container>
    </header>
  );
}
