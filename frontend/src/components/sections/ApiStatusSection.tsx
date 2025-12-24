import { useEffect, useState } from 'react';
import { ApiError, apiGet } from '@/lib/api';
import { StatusBadge } from '@/components/ui/StatusBadge/StatusBadge';
import styles from './ApiStatusSection.module.css';

// What we render in the UI depending on the fetch result.
type ApiStatusState =
  | { kind: 'loading' }
  | { kind: 'ok' }
  | { kind: 'error'; message: string };

type HealthResponse = { status: 'ok' };

/**
 * ApiStatusSection
 * - Calls GET /api/health/ (proxied by Vite in local dev)
 * - Shows loading/ok/error
 */
export function ApiStatusSection() {
  // React state: drives what we render.
  const [status, setStatus] = useState<ApiStatusState>({ kind: 'loading' });

  useEffect(() => {
    // AbortController lets us cancel fetch if the component unmounts.
    const abortController = new AbortController();

    async function loadHealth() {
      try {
        setStatus({ kind: 'loading' });

        const data = await apiGet<HealthResponse>('/api/health/', {
          signal: abortController.signal,
        });

        if (data.status === 'ok') {
          setStatus({ kind: 'ok' });
          return;
        }

        setStatus({ kind: 'error', message: 'Unexpected response shape' });
      } catch (err) {
        // Ignore abort errors (happens on unmount / fast refresh).
        if (err instanceof DOMException && err.name === 'AbortError') return;

        if (err instanceof ApiError) {
          setStatus({
            kind: 'error',
            message: err.code ? `${err.code}: ${err.message}` : err.message,
          });
          return;
        }

        setStatus({
          kind: 'error',
          message: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    loadHealth();

    return () => {
      abortController.abort();
    };
  }, []);

  const statusLabel =
    status.kind === 'loading'
      ? 'Loading...'
      : status.kind === 'ok'
        ? 'OK'
        : 'Error';

  return (
    <section className={styles.section} aria-labelledby="api-status-title">
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <h2 className={styles.title} id="api-status-title">
            API Status
          </h2>
          <StatusBadge kind={status.kind} label={statusLabel} />
        </div>

        <div className={styles.card}>
          {status.kind === 'loading' && (
            <p className={styles.text}>
              Calling <code className={styles.code}>/api/health/</code>...
            </p>
          )}

          {status.kind === 'ok' && (
            <p className={styles.text}>
              Backend is reachable.{' '}
              <code className={styles.code}>/api/health/</code> returned{' '}
              <code className={styles.code}>{'{ status: "ok" }'}</code>.
            </p>
          )}

          {status.kind === 'error' && (
            <div className={styles.text}>
              <p>
                Backend health check failed:{' '}
                <span className={styles.errorText}>{status.message}</span>
              </p>
              <p className={styles.hint}>
                If you're running locally, try{' '}
                <code className={styles.code}>.\scripts\dev.ps1</code> and
                refresh.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
