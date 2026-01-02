import styles from './HomePage.module.css';
import { ApiStatusSection } from '../../components/sections/ApiStatusSection';
import { HeroSection } from '../../components/sections/HeroSection';
import { AboutSection } from '../../components/sections/AboutSection';

/**
 * HomePage:
 * Route-level component (even before routing exists).
 * Keeps data/structure here, and pushes UI rendering down to sections.
 */
export function HomePage() {
  const shortBio = `
      Welcome to my personal site!
      The purpose of this site is for me to learn, practice, and demonstrate full-stack web development skills.
    `.trim();

  return (
    <div className={styles.page}>
      <HeroSection tagline="Welcome" locationLine="Computer Science @ Purdue" />

      <main className={styles.main}>
        <AboutSection shortBio={shortBio} />
        <ApiStatusSection />
      </main>
    </div>
  );
}
