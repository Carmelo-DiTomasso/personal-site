import styles from './Container.module.css';

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export function Container({ children, className }: ContainerProps) {
  return (
    <div className={[styles.container, className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}
