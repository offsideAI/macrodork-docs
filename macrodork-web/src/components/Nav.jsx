import { useState } from 'react'
import { NAV, LINKS } from '../data.js'
import { useTheme } from '../hooks/useTheme.js'

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  )
}

export default function Nav() {
  const [open, setOpen] = useState(false)
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'
  return (
    <div className="nav-wrap">
      <nav className={`nav${open ? ' open' : ''}`} aria-label="Primary">
        <a className="brand" href="#top" aria-label="OffsideRobotics home">OFFSIDE ROBOTICS</a>
        <div className="nav-links mono" onClick={() => setOpen(false)}>
          {NAV.map(item => (
            <a key={item.label} href={item.href} target={item.external ? '_blank' : undefined} rel={item.external ? 'noreferrer' : undefined}>
              {item.label}
            </a>
          ))}
        </div>
        <button className="theme-toggle" type="button" onClick={toggle} aria-pressed={dark} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} title={dark ? 'Light mode' : 'Dark mode'}>
          <span className="theme-track" aria-hidden="true"><span className="theme-knob">{dark ? <MoonIcon /> : <SunIcon />}</span></span>
        </button>
        <a className="btn btn-brand hide-sm" href={LINKS.repo} target="_blank" rel="noreferrer">Get the files</a>
        <button className="nav-toggle" aria-expanded={open} aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(v => !v)}>
          {open ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 4l12 12M16 4L4 16" /></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 6h14M3 10h14M3 14h14" /></svg>
          )}
        </button>
      </nav>
    </div>
  )
}
