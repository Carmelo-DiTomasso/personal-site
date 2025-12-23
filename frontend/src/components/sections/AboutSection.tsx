import styles from './AboutSection.module.css';
import { Container } from '../layout/Container';

type AboutSectionProps = {
  shortBio: string;
};

export function AboutSection({ shortBio }: AboutSectionProps) {
  return (
    <section
      id="about"
      className={styles.section}
      aria-labelledby="about-title"
    >
      <Container>
        <h2 id="about-title" className={styles.title}>
          About
        </h2>
        <p className={styles.body}>{shortBio}</p>
      </Container>
    </section>
  );
}
