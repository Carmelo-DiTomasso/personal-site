import { useEffect, useMemo, useRef, useState } from 'react';
import { loadTurnstileScript } from '@/lib/turnstile';
import styles from './SubmissionForm.module.css';

type Mode = 'contact' | 'feedback';

type Props = {
  mode: Mode;
};

type SubmitState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success' }
  | {
      kind: 'error';
      message: string;
      code?: 'COOLDOWN' | 'DUPLICATE' | 'OTHER';
    };

export function SubmissionForm({ mode }: Props) {
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const [blockedUntilMs, setBlockedUntilMs] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState(0);

  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const [submitState, setSubmitState] = useState<SubmitState>({ kind: 'idle' });

  const widgetIdRef = useRef<string | null>(null);
  const widgetHostRef = useRef<HTMLDivElement | null>(null);

  const isBlocked = blockedUntilMs !== null && nowMs < blockedUntilMs;

  const remainingSeconds =
    blockedUntilMs && blockedUntilMs > nowMs
      ? Math.ceil((blockedUntilMs - nowMs) / 1000)
      : 0;

  function looksLikeEmail(value: string): boolean {
    const trimmed = value.trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  }

  const nameRequired = mode === 'contact';
  const emailRequired = mode === 'contact';
  const subjectRequired = mode === 'contact';
  const messageRequired = true;

  const emailOk = !email.trim() ? !emailRequired : looksLikeEmail(email);

  const nameOk = !nameRequired || !!name.trim();
  const subjectOk = !subjectRequired || !!subject.trim();
  const messageOk = !messageRequired || !!message.trim();

  const disabledReason = useMemo(() => {
    if (!siteKey) return 'CAPTCHA is not configured.';
    if (!name.trim() && nameRequired) return 'Please enter your name.';
    if (!email.trim() && emailRequired) return 'Please enter your email.';
    if (emailRequired && email.trim() && !emailOk)
      return 'Please enter a valid email.';
    if (!subject.trim() && subjectRequired) return 'Please enter a subject.';
    if (!message.trim()) return 'Please enter a message.';
    if (!turnstileToken) return 'Please complete the CAPTCHA.';
    if (isBlocked && remainingSeconds > 0)
      return `Please wait ${remainingSeconds}s before submitting again.`;
    if (submitState.kind === 'submitting') return 'Sending...';
    return null;
  }, [
    siteKey,
    name,
    nameRequired,
    email,
    emailRequired,
    emailOk,
    subject,
    subjectRequired,
    message,
    turnstileToken,
    isBlocked,
    remainingSeconds,
    submitState.kind,
  ]);

  const canSubmit = useMemo(() => {
    if (!siteKey) return false;
    if (!turnstileToken) return false;

    if (!nameOk) return false;
    if (!emailOk) return false;
    if (!subjectOk) return false;
    if (!messageOk) return false;

    if (blockedUntilMs && nowMs < blockedUntilMs) return false;
    if (submitState.kind === 'submitting') return false;
    return true;
  }, [
    siteKey,
    turnstileToken,
    nameOk,
    emailOk,
    subjectOk,
    messageOk,
    blockedUntilMs,
    nowMs,
    submitState.kind,
  ]);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      if (!siteKey) return;

      // Cloudflare Turnstile may log console warnings (PAT challenge / preload).
      // This is expected and not actionable for our app.
      try {
        await loadTurnstileScript();
        if (!isMounted) return;

        const host = widgetHostRef.current;
        if (!host || !window.turnstile) return;

        widgetIdRef.current = window.turnstile.render(host, {
          sitekey: siteKey,
          callback: (token) => setTurnstileToken(token),
          'expired-callback': () => setTurnstileToken(''),
          'error-callback': () => setTurnstileToken(''),
        });
      } catch (err) {
        setSubmitState({
          kind: 'error',
          message:
            err instanceof Error ? err.message : 'Failed to load CAPTCHA',
        });
      }
    }

    init();

    return () => {
      isMounted = false;
      const widgetId = widgetIdRef.current;
      if (widgetId && window.turnstile) {
        window.turnstile.remove(widgetId);
      }
    };
  }, [siteKey]);

  useEffect(() => {
    if (!blockedUntilMs) return;

    const id = window.setInterval(() => setNowMs(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [blockedUntilMs]);

  function startBlock(seconds: number) {
    const until = Date.now() + seconds * 1000;
    setBlockedUntilMs(until);
    setNowMs(Date.now()); // immediate countdown without using an effect
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitState({ kind: 'submitting' });

    try {
      const resp = await fetch('/api/submissions/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: mode,
          name,
          email,
          subject,
          message,
          page_url: window.location.href,
          turnstile_token: turnstileToken,
          honeypot,
        }),
      });

      if (resp.status === 204) {
        // Honeypot triggered (silent drop).
        setSubmitState({ kind: 'success' });
        return;
      }

      if (resp.status === 429) {
        const body = await resp.json().catch(() => null);
        const retrySeconds =
          Number(body?.retry_after_seconds) ||
          Number(resp.headers.get('Retry-After')) ||
          60;

        startBlock(retrySeconds);
        setSubmitState({
          kind: 'error',
          code: 'COOLDOWN',
          message: `Please wait ${retrySeconds}s before submitting again.`,
        });
        return;
      }

      if (resp.status === 409) {
        const body = await resp.json().catch(() => null);
        const retrySeconds = Number(body?.retry_after_seconds) || 0;

        if (retrySeconds > 0) startBlock(retrySeconds);

        setSubmitState({
          kind: 'error',
          code: 'DUPLICATE',
          message:
            retrySeconds > 0
              ? `Looks like you already sent this. Try again in ${retrySeconds}s.`
              : `Looks like you already sent this recently.`,
        });
        return;
      }

      if (!resp.ok) {
        const maybe = await resp.json().catch(() => null);
        const msg =
          maybe?.detail ??
          (resp.status === 400
            ? 'Please check your inputs and try again.'
            : 'Request failed.');
        setSubmitState({ kind: 'error', message: msg });
        return;
      }

      const data = await resp.json().catch(() => null);
      const cooldownSeconds = Number(data?.cooldown_seconds ?? 60);
      startBlock(cooldownSeconds);

      setSubmitState({ kind: 'success' });

      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setHoneypot('');
      setTurnstileToken('');

      const widgetId = widgetIdRef.current;
      if (widgetId && window.turnstile) {
        window.turnstile.reset(widgetId);
      }
    } catch (err) {
      setSubmitState({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {!siteKey && (
        <p className={styles.notice}>
          CAPTCHA is not configured. Set{' '}
          <code className={styles.code}>VITE_TURNSTILE_SITE_KEY</code>.
        </p>
      )}

      <div className={styles.grid}>
        <label className={styles.field}>
          <span className={styles.label}>
            Name
            {mode === 'contact' && (
              <span className={styles.requiredMark}> *</span>
            )}
          </span>
          <input
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required={mode === 'contact'}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>
            Email
            {mode === 'contact' && (
              <span className={styles.requiredMark}> *</span>
            )}
          </span>
          <input
            className={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            inputMode="email"
            required={mode === 'contact'}
          />
        </label>

        {mode === 'contact' && (
          <label className={styles.fieldFull}>
            <span className={styles.label}>Subject *</span>
            <input
              className={styles.input}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </label>
        )}

        <label className={styles.fieldFull}>
          <span className={styles.label}>
            {mode === 'contact' ? 'Message' : 'Feedback'} *
          </span>
          <textarea
            className={styles.textarea}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            required
          />
        </label>

        {/* Honeypot (visually hidden). Bots often fill it; humans won't. */}
        <label className={styles.honeypot} aria-hidden="true">
          Website
          <input
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
          />
        </label>
      </div>

      <div className={styles.captchaRow}>
        <div ref={widgetHostRef} className={styles.turnstileHost} />

        <div className={styles.submitCol}>
          <button className={styles.button} type="submit" disabled={!canSubmit}>
            {submitState.kind === 'submitting' ? 'Sending...' : 'Send'}
          </button>

          {!canSubmit && disabledReason && (
            <p className={styles.submitHint} role="status">
              {disabledReason}
            </p>
          )}
        </div>
      </div>

      {submitState.kind === 'success' && (
        <p className={styles.success}>Thanks - received.</p>
      )}

      {submitState.kind === 'error' &&
        (submitState.code === 'OTHER' || isBlocked) && (
          <p className={styles.error} role="alert">
            {submitState.message}
          </p>
        )}

      {isBlocked && remainingSeconds > 0 && (
        <p className={styles.notice} role="status">
          You can submit again in {remainingSeconds}s.
        </p>
      )}
    </form>
  );
}
