import { Container } from "@/components/layout/Container";
import styles from "./ResumePage.module.css";

export function ResumePage() {
  return (
    <main className={styles.page}>
      <Container>
        <header className={styles.header}>
          <h1 className={styles.title}>Resume</h1>
          <p className={styles.subtitle}>
            Download the PDF or view it inline below.
          </p>

          <div className={styles.actions}>
            <a className={styles.primaryButton} href="/resume.pdf" download>
              Download PDF
            </a>
            <a className={styles.secondaryButton} href="/">
              Back home
            </a>
          </div>
        </header>

        <section className={styles.viewerSection} aria-label="Resume PDF viewer">
          {/* iframe works well on desktop; mobile varies, so keep the download link above */}
          <iframe
            className={styles.viewer}
            src="/resume.pdf"
            title="Resume PDF"
          />
          <p className={styles.fallback}>
            If the PDF doesn’t render,{" "}
            <a href="/resume.pdf" target="_blank" rel="noopener noreferrer">
              open it in a new tab
            </a>
            .
          </p>
        </section>
      </Container>
    </main>
  );
}
