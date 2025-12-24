import { useEffect, useState } from "react";
import { ApiError, apiGet } from "@/lib/api";
import { StatusBadge } from '@/components/ui/StatusBadge/StatusBadge';
import styles from "./ProjectsSection.module.css";

type Project = {
  slug: string;
  title: string;
  description: string;
  live_url: string;
  repo_url: string;
  sort_order: number;
  is_featured: boolean;
};

type ProjectsState =
  | { kind: "loading" }
  | { kind: "empty" }
  | { kind: "ok"; projects: Project[] }
  | { kind: "error"; message: string };

function normalizeProjects(data: unknown): Project[] | null {
  if (Array.isArray(data)) return data as Project[];

  if (typeof data === "object" && data !== null && "results" in data) {
    const results = (data as { results?: unknown }).results;
    if (Array.isArray(results)) return results as Project[];
  }

  return null;
}

export function ProjectsSection() {
  const [state, setState] = useState<ProjectsState>({ kind: "loading" });

  useEffect(() => {
    const abortController = new AbortController();

    async function loadProjects() {
      try {
        setState({ kind: "loading" });

        const raw = await apiGet<unknown>("/api/content/projects/", {
          signal: abortController.signal,
        });

        const projects = normalizeProjects(raw);
        if (!projects) {
          setState({ kind: "error", message: "Unexpected response shape" });
          return;
        }

        if (projects.length === 0) {
          setState({ kind: "empty" });
          return;
        }

        setState({ kind: "ok", projects });
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;

        if (err instanceof ApiError) {
          setState({
            kind: "error",
            message: err.code ? `${err.code}: ${err.message}` : err.message,
          });
          return;
        }

        setState({
          kind: "error",
          message: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    loadProjects();

    return () => abortController.abort();
  }, []);

  const badgeLabel =
    state.kind === 'loading'
        ? 'Loading...'
        : state.kind === 'ok'
        ? 'OK'
        : state.kind === 'empty'
            ? 'Empty'
            : 'Error';

  return (
    <section
      className={styles.section}
      aria-labelledby="projects-title"
      id="projects"
    >
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <h2 className={styles.title} id="projects-title">
            Projects
          </h2>
          <StatusBadge kind={state.kind} label={badgeLabel} />
        </div>

        {state.kind === "loading" && (
          <p className={styles.text}>
            Fetching <code className={styles.code}>/api/content/projects/</code>...
          </p>
        )}

        {state.kind === "empty" && (
          <p className={styles.text}>
            No projects found. Seed locally with{" "}
            <code className={styles.code}>.\scripts\seed-projects.ps1</code>.
          </p>
        )}

        {state.kind === "error" && (
          <div className={styles.text}>
            <p>
              Failed to load projects:{" "}
              <span className={styles.errorText}>{state.message}</span>
            </p>
          </div>
        )}

        {state.kind === "ok" && (
          <div className={styles.grid}>
            {state.projects.map((project) => (
              <article key={project.slug} className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>{project.title}</h3>
                  {project.is_featured && (
                    <span className={styles.featuredTag}>Featured</span>
                  )}
                </div>

                {project.description && (
                  <p className={styles.cardText}>{project.description}</p>
                )}

                <div className={styles.linksRow}>
                  {project.live_url && (
                    <a
                      className={styles.link}
                      href={project.live_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Live
                    </a>
                  )}
                  {project.repo_url && (
                    <a
                      className={styles.link}
                      href={project.repo_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Repo
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
