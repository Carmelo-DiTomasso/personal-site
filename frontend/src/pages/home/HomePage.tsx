import styles from "./HomePage.module.css";
import { ApiStatusSection } from "../../components/sections/ApiStatusSection";
import { HeroSection } from "../../components/sections/HeroSection";
import { AboutSection } from "../../components/sections/AboutSection";
import { ProjectsSection } from "../../components/sections/ProjectsSection";
import { ContactSection } from "../../components/sections/ContactSection";

/**
 * HomePage:
 * Route-level component (even before routing exists).
 * Keeps data/structure here, and pushes UI rendering down to sections.
 */
export function HomePage() {
  return (
    <div className={styles.page}>
      <HeroSection
        name="Carmelo DiTomasso"
        tagline="Making Tings."
        locationLine="Computer Science @ Purdue"
        primaryCtaHref="#projects"
        primaryCtaLabel="See projects"
        secondaryCtaHref="#contact"
        secondaryCtaLabel="Contact me"
      />

      <main className={styles.main}>
        <AboutSection shortBio="I'm Carmelo, a double major in CS + AI at Purdue. I'm working on building reliable web apps and services with security in mind. Most recently I built a Kotlin shipping microservice integrating FedEx/UPS/USPS and helped modernize a large Rails + React codebase. Right now I'm building this site as a real full-stack project (React + Django + Postgres, Docker-first) and I'm targeting software engineering roles that lean towards security and infrastructure." />
        <ApiStatusSection />
        <ProjectsSection />
        <ContactSection email="" />
      </main>
    </div>
  );
}
