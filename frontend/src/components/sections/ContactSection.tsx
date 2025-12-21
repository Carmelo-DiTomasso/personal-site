import styles from "./ContactSection.module.css";
import { Container } from "../layout/Container";

type ContactSectionProps = {
  email: string;
};

export function ContactSection({ email }: ContactSectionProps) {
  return (
    <section id="contact" className={styles.section} aria-labelledby="contact-title">
      <Container>
        <h2 id="contact-title" className={styles.title}>
          Contact
        </h2>
        <p className={styles.body}>
          Want to reach out? Email me and I’ll get back to you.
        </p>

        <a className={styles.emailLink} href={`mailto:${email}`}>
          {email}
        </a>
      </Container>
    </section>
  );
}
