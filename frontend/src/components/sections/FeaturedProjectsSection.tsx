import styles from "./FeaturedProjectsSection.module.css";
import { Container } from "../layout/Container";
import { ExternalLink } from "../ui/ExternalLink";

export type FeaturedProject = {
  title: string;
  description: string;
  stack: string[];
  href: string;
};

type FeaturedProjectsSectionProps = {
  projects: FeaturedProject[];
};

export function FeaturedProjectsSection({ projects }: FeaturedProjectsSectionProps) {
  return (
    <section
      id="projects"
      className={styles.section}
      aria-labelledby="featured-projects-title"
    >
      <Container>
        <div className={styles.headerRow}>
          <h2 id="featured-projects-title" className={styles.title}>
            Featured projects
          </h2>

          {/* Placeholder: later this becomes /projects when routing exists */}
          <a className={styles.viewAll} href="#projects">
            View all →
          </a>
        </div>

        <div className={styles.grid}>
          {projects.map((project) => (
            <article key={project.title} className={styles.card}>
              <h3 className={styles.cardTitle}>{project.title}</h3>
              <p className={styles.cardBody}>{project.description}</p>

              <ul className={styles.stack} aria-label="Tech stack">
                {project.stack.map((item, index) => (
                  <li key={`${item}-${index}`} className={styles.stackItem}>
                    {item}
                  </li>
                ))}
              </ul>

              <ExternalLink className={styles.cardLink} href={project.href}>
                Open →
              </ExternalLink>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
