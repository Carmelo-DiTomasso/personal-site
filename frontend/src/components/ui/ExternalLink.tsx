import type { AnchorHTMLAttributes, ReactNode } from "react";

type ExternalLinkProps = {
  children: ReactNode;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "rel" | "target">;

/**
 * ExternalLink:
 * Standardizes safe external linking (new tab + noopener/noreferrer).
 */
export function ExternalLink({ children, ...anchorProps }: ExternalLinkProps) {
  return (
    <a target="_blank" rel="noopener noreferrer" {...anchorProps}>
      {children}
    </a>
  );
}
