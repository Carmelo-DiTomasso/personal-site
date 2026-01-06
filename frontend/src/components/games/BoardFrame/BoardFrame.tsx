import type { ReactNode } from 'react';
import styles from './BoardFrame.module.css';

type Props = {
  children: ReactNode;

  /** Useful for keyboard-driven boards (Tango). */
  focusable?: boolean;

  /** Passed through to the wrapper div. */
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;

  /** For accessibility. Example: "Tango board" */
  ariaLabel?: string;

  /** For test selectors. */
  testId?: string;

  /** Optional extra class for the wrapper. */
  className?: string;
};

export function BoardFrame({
  children,
  focusable = false,
  onKeyDown,
  ariaLabel,
  testId,
  className,
}: Props) {
  const wrapClassName = [styles.root, className].filter(Boolean).join(' ');

  return (
    <div
      className={wrapClassName}
      tabIndex={focusable ? 0 : undefined}
      onKeyDown={onKeyDown}
      aria-label={ariaLabel}
      data-testid={testId}
    >
      {children}
    </div>
  );
}
