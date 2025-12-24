import styles from './StatusBadge.module.css';

export type StatusKind = 'loading' | 'ok' | 'empty' | 'error';

type StatusBadgeProps = {
  kind: StatusKind;
  label: string;
};

export function StatusBadge({ kind, label }: StatusBadgeProps) {
  return (
    <div className={styles.badge} data-kind={kind} aria-label={label}>
      {label}
    </div>
  );
}
