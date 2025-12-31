import { useEffect, useMemo, useState } from 'react';
import { ApiError, apiGet } from '@/lib/api';
import { StatusBadge } from '@/components/ui/StatusBadge/StatusBadge';
import { Container } from '../layout/Container';
import styles from './ApiStatusSection.module.css';

type ApiStatusState =
  | { kind: 'loading' }
  | { kind: 'ok' }
  | { kind: 'error'; message: string };

type HealthResponse = { status: 'ok' };
type AuthCheckResponse = { status: 'ok' };

function badgeLabelFor(kind: ApiStatusState['kind']) {
  return kind === 'loading' ? 'Loading...' : kind === 'ok' ? 'OK' : 'Error';
}

function StatusRow(props: {
  label: string;
  path: string;
  state: ApiStatusState;
}) {
  const ok = props.state.kind === 'ok';
  const loading = props.state.kind === 'loading';
  const dotClass = loading
    ? styles.dotLoading
    : ok
      ? styles.dotOk
      : styles.dotError;

  const text = loading ? 'Loading…' : ok ? 'OK' : 'Error';

  return (
    <div className={styles.row}>
      <div className={styles.rowMain}>
        <div className={styles.rowLeft}>
          <span className={styles.rowLabel}>{props.label}:</span>
          <code className={styles.code}>{props.path}</code>
        </div>

        <div className={styles.rowRight}>
          <span className={`${styles.dot} ${dotClass}`} aria-hidden="true" />
          <span className={styles.rowStatus}>{text}</span>
        </div>
      </div>

      {props.state.kind === 'error' && (
        <div className={styles.rowMeta} role="alert">
          <span className={styles.errorText}>{props.state.message}</span>
        </div>
      )}
    </div>
  );
}

export function ApiStatusSection() {
  const [health, setHealth] = useState<ApiStatusState>({ kind: 'loading' });
  const [authCheck, setAuthCheck] = useState<ApiStatusState>({
    kind: 'loading',
  });

  useEffect(() => {
    const abortController = new AbortController();

    async function runCheck<T>(
      path: string,
      setState: (s: ApiStatusState) => void,
    ) {
      try {
        setState({ kind: 'loading' });

        const data = await apiGet<T>(path, { signal: abortController.signal });

        if ((data as { status?: unknown }).status === 'ok') {
          setState({ kind: 'ok' });
          return;
        }

        setState({ kind: 'error', message: 'Unexpected response shape' });
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;

        if (err instanceof ApiError) {
          setState({
            kind: 'error',
            message: err.code ? `${err.code}: ${err.message}` : err.message,
          });
          return;
        }

        setState({
          kind: 'error',
          message: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    runCheck<HealthResponse>('/api/health/', setHealth);
    runCheck<AuthCheckResponse>('/api/auth-check/', setAuthCheck);

    return () => abortController.abort();
  }, []);

  const overallKind = useMemo<ApiStatusState['kind']>(() => {
    if (health.kind === 'loading' || authCheck.kind === 'loading')
      return 'loading';
    if (health.kind === 'error' || authCheck.kind === 'error') return 'error';
    return 'ok';
  }, [health.kind, authCheck.kind]);

  const anyError = health.kind === 'error' || authCheck.kind === 'error';

  return (
    <section
      className={styles.section}
      aria-labelledby="api-status-title"
      id="api-status"
    >
      <Container>
        <div className={styles.headerRow}>
          <h2 className={styles.title} id="api-status-title">
            API Status
          </h2>
          <StatusBadge kind={overallKind} label={badgeLabelFor(overallKind)} />
        </div>

        <div className={styles.card}>
          <div className={styles.rows}>
            <StatusRow label="Health" path="/api/health/" state={health} />
            <StatusRow
              label="Auth check"
              path="/api/auth-check/"
              state={authCheck}
            />
          </div>

          {anyError && (
            <p className={styles.hint}>
              If you're running locally, try{' '}
              <code className={styles.code}>http://localhost:8000/admin/</code>{' '}
              to log in, then refresh.
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}
