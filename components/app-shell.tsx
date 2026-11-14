"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BookOpen, ChartNoAxesCombined, ChevronRight, CircleHelp, Flame, FlaskConical, GitCompareArrows, Home, Library, MoreHorizontal, Radio, ShieldAlert, Sparkles } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

const nav = [
  { label: "Overview", href: "/", icon: Home },
  { label: "Mission dashboard", href: "/dashboard", icon: ChartNoAxesCombined },
  { label: "Investigations", href: "/investigations", icon: Library },
  { label: "Compare", href: "/compare", icon: GitCompareArrows },
  { label: "SI assistant", href: "/assistant", icon: Sparkles },
  { label: "Safety technology", href: "/safety-tech", icon: ShieldAlert },
  { label: "Earth applications", href: "/earth-applications", icon: Radio },
  { label: "Data gaps", href: "/data-gaps", icon: CircleHelp },
  { label: "Methodology", href: "/methodology", icon: BookOpen },
];

const mobileLabels: Record<string, string> = {
  Overview: "Home",
  "Mission dashboard": "Dashboard",
  Investigations: "Explore",
  Compare: "Compare",
  "SI assistant": "Assistant",
};

export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const mainColumnRef = useRef<HTMLDivElement>(null);
  const activeMorePage = nav.slice(5).some(({ href }) => path === href || path.startsWith(`${href}/`));

  useEffect(() => {
    mainColumnRef.current?.scrollTo(0, 0);
  }, [path]);

  return <div className="app-frame">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <aside className="sidebar" aria-label="Primary navigation">
      <Link href="/" className="brand-lockup" aria-label="NovaForge home"><span className="brand-mark"><Flame size={19} /></span><span><strong>NOVAFORGE</strong><small>SPACE FIRE INTELLIGENCE</small></span></Link>
      <div className="side-rule" />
      <p className="nav-caption">WORKSPACE</p>
      <nav className="nav-list">{nav.map(({ label, href, icon: Icon }, index) => {
        const active = href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`);
        return <Link key={href} href={href} title={label} aria-label={label} className={`nav-item ${index > 4 ? "mobile-secondary" : ""} ${active ? "active" : ""}`} aria-current={active ? "page" : undefined}><Icon size={17} strokeWidth={1.7} /><span className="desktop-nav-label">{label}</span>{index < 5 && <span className="mobile-nav-label">{mobileLabels[label]}</span>}{active && <ChevronRight size={14} className="nav-chevron" />}</Link>;
      })}</nav>
      <details className={`mobile-more ${activeMorePage ? "has-active" : ""}`}>
        <summary aria-label="More pages"><MoreHorizontal size={19} /><span>More</span></summary>
        <nav className="mobile-more-menu" aria-label="More pages">{nav.slice(5).map(({ label, href, icon: Icon }) => {
          const active = path === href || path.startsWith(`${href}/`);
          return <Link href={href} key={href} aria-current={active ? "page" : undefined} className={active ? "active" : ""}><Icon size={16} /><span>{label}</span></Link>;
        })}</nav>
      </details>
      <div className="sidebar-spacer" />
      <div className="sidebar-status"><span className="status-dot" /><div><strong>PSI DATA LINK</strong><small>Snapshot loaded</small></div></div>
      <div className="sidebar-foot"><span>NASA SPACE APPS · 2026</span><span>TEAM NOVAFORGE</span></div>
    </aside>
    <div className="main-column" ref={mainColumnRef}>
      <header className="topbar"><div className="mobile-brand"><span className="brand-mark"><Flame size={16} /></span><strong>NOVAFORGE</strong></div><div className="topbar-status"><span className="signal-bars"><i /><i /><i /></span><span>PSI · combustion science</span><span className="topbar-divider" /><span className="mono">DATASET 01</span></div><Link href="/methodology" className="topbar-note"><Activity size={14} /> Evidence first</Link></header>
      <main id="main-content" className="main-content">{children}</main>
      <footer className="site-footer"><p><strong>Educational research tool.</strong> Not a certified safety system. NASA is not affiliated with or endorsing NovaForge.</p><div><Link href="/methodology">Sources & limitations</Link><span>·</span><Link href="/data-gaps">Data gaps</Link><span>·</span><span>Turning space data into solutions</span></div></footer>
    </div>
  </div>;
}
