import { ExternalLink } from "lucide-react";

export function SourceLink({ href, label = "NASA source", className = "" }: { href: string; label?: string; className?: string }) {
  return <a className={`source-link ${className}`} href={href} target="_blank" rel="noopener noreferrer">
    <span>{label}</span><ExternalLink size={12} aria-hidden="true" />
  </a>;
}
