import { useState } from 'react';
import { SimplePage } from '../shared/SimplePage';
import { SubmissionForm } from '@/components/forms/SubmissionForm';
import { ExternalIconLink } from '@/components/ui/ExternalIconLink/ExternalIconLink';
import {
  GitHubIcon,
  LinkedInIcon,
} from '@/components/ui/ExternalIconLink/icons';
import styles from './ContactPage.module.css';

type Mode = 'contact' | 'feedback';

export function ContactPage() {
  const [mode, setMode] = useState<Mode>('contact');

  return (
    <SimplePage title="Contact">
      <div className={styles.headerRow}>
        <p className={styles.intro}>
          Use the form below, submissions go to a single inbox in the admin.
        </p>

        <div className={styles.links}>
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

      <div className={styles.tabs} role="tablist" aria-label="Contact modes">
        {mode === 'contact' ? (
          <button
            className={styles.tab}
            type="button"
            role="tab"
            id="contact-tab"
            aria-controls="contact-panel"
            aria-selected="true"
            tabIndex={0}
            onClick={() => setMode('contact')}
          >
            Contact
          </button>
        ) : (
          <button
            className={styles.tab}
            type="button"
            role="tab"
            id="contact-tab"
            aria-controls="contact-panel"
            aria-selected="false"
            tabIndex={-1}
            onClick={() => setMode('contact')}
          >
            Contact
          </button>
        )}

        {mode === 'feedback' ? (
          <button
            className={styles.tab}
            type="button"
            role="tab"
            id="feedback-tab"
            aria-controls="feedback-panel"
            aria-selected="true"
            tabIndex={0}
            onClick={() => setMode('feedback')}
          >
            Feedback
          </button>
        ) : (
          <button
            className={styles.tab}
            type="button"
            role="tab"
            id="feedback-tab"
            aria-controls="feedback-panel"
            aria-selected="false"
            tabIndex={-1}
            onClick={() => setMode('feedback')}
          >
            Feedback
          </button>
        )}
      </div>

      <div className={styles.panel}>
        <div
          role="tabpanel"
          id="contact-panel"
          aria-labelledby="contact-tab"
          hidden={mode !== 'contact'}
        >
          <SubmissionForm mode="contact" />
        </div>

        <div
          role="tabpanel"
          id="feedback-panel"
          aria-labelledby="feedback-tab"
          hidden={mode !== 'feedback'}
        >
          <SubmissionForm mode="feedback" />
        </div>
      </div>
    </SimplePage>
  );
}
