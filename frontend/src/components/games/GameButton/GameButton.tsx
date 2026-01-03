import type { ButtonHTMLAttributes } from 'react';
import styles from './GameButton.module.css';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

export function GameButton({
  variant = 'secondary',
  className,
  ...rest
}: Props) {
  const classes = [styles.button, styles[variant], className]
    .filter(Boolean)
    .join(' ');
  return <button className={classes} {...rest} />;
}
