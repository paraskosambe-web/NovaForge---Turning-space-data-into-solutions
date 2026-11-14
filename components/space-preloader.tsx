"use client";

import { Flame } from "lucide-react";
import { useEffect, useState } from "react";

export function SpacePreloader() {
  const [phase, setPhase] = useState<"visible" | "exiting" | "hidden">("visible");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("hidden");
      return;
    }

    const exitTimer = window.setTimeout(() => setPhase("exiting"), 2400);
    const removeTimer = window.setTimeout(() => setPhase("hidden"), 2920);
    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  if (phase === "hidden") return null;

  return (
    <div className={`space-preloader ${phase === "exiting" ? "is-exiting" : ""}`} role="status" aria-live="polite">
      <div className="preloader-starfield" aria-hidden="true" />
      <div className="preloader-grid" aria-hidden="true" />
      <div className="preloader-content">
        <div className="preloader-scene" aria-hidden="true">
          <div className="preloader-orbit preloader-orbit-one"><span /></div>
          <div className="preloader-orbit preloader-orbit-two"><span /></div>
          <div className="preloader-axis" />
          <div className="preloader-world">
            <div className="preloader-continent continent-one" />
            <div className="preloader-continent continent-two" />
            <div className="preloader-continent continent-three" />
            <div className="preloader-clouds" />
            <div className="preloader-limb" />
            <span className="preloader-flame"><Flame size={24} strokeWidth={1.7} /></span>
          </div>
          <span className="preloader-star star-one" />
          <span className="preloader-star star-two" />
          <span className="preloader-star star-three" />
        </div>
        <p className="preloader-kicker"><span /> NOVAFORGE · SPACE FIRE INTELLIGENCE</p>
        <h1>Flame in <em>Freefall</em></h1>
        <p className="preloader-message">Preparing your research workspace</p>
        <div className="preloader-progress" aria-hidden="true"><span /></div>
        <p className="preloader-caption">NASA PSI combustion research · source-grounded exploration</p>
      </div>
    </div>
  );
}
