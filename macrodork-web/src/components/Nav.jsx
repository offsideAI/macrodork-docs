import { useEffect, useRef, useState } from "react";
import { useTheme } from "../hooks/useTheme.js";
import { NAV } from "../data.js";

export function Brand() {
  return (
    <span className="brand">
      <svg viewBox="0 0 40 24" aria-hidden="true">
        <rect x="1" y="2" width="38" height="20" rx="8" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="28" cy="12" r="4" />
      </svg>
      <span>
        OFFSIDE<span className="brand-sub">ROBOTICS</span>
      </span>
    </span>
  );
}
export default function Nav() {
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const toggle = useRef(null);
  useEffect(() => {
    const close = (event) => {
      if (event.key === "Escape" && open) {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);
  return (
    <header className="site-header">
      <nav className="nav wrap" aria-label="Main navigation">
        <a href="#meet" aria-label="Offside Robotics home">
          <Brand />
        </a>
        <div id="nav-links" className={`nav-links ${open ? "is-open" : ""}`}>
          {NAV.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </a>
          ))}
          <a
            className="button button-small"
            href="#preorder"
            onClick={() => setOpen(false)}
          >
            Preorder details <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="nav-actions">
          <button
            className="theme-toggle"
            type="button"
            role="switch"
            aria-checked={theme === "dark"}
            aria-label="Dark mode"
            title={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
            onClick={toggleTheme}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {theme === "dark" ? (
                <>
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
                </>
              ) : (
                <path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" />
              )}
            </svg>
          </button>
          <button
            ref={toggle}
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="nav-links"
            onClick={() => setOpen(!open)}
          >
            {open ? "Close −" : "Menu +"}
          </button>
        </div>
      </nav>
    </header>
  );
}
