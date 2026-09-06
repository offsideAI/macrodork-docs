import { useCallback, useEffect, useState } from 'react'

const KEY = 'offsiderobotics-theme'

function readInitial() {
  const stamped = document.documentElement.getAttribute('data-theme')
  if (stamped === 'dark' || stamped === 'light') return stamped
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'dark' || saved === 'light') return saved
  } catch (e) { /* storage unavailable */ }
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Theme state. index.html stamps data-theme before first paint (no flash); this hook keeps
// the attribute, the stored preference and the browser chrome colour in sync afterwards.
export function useTheme() {
  const [theme, setTheme] = useState(readInitial)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0B0C0E' : '#FF7A00')
    try { localStorage.setItem(KEY, theme) } catch (e) { /* ignore */ }
  }, [theme])

  const toggle = useCallback(() => setTheme(t => (t === 'dark' ? 'light' : 'dark')), [])
  return { theme, toggle }
}
