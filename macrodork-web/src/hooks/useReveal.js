import { useEffect } from 'react'

// Scroll-in reveal for elements marked with data-reveal. The hidden state is only applied
// once the html element carries the "js" class (set in main.jsx), so the page never hides
// content when scripts fail. Reduced-motion users see everything immediately.
export function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('[data-reveal]'))
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || !('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('is-in'))
      return undefined
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in')
          io.unobserve(entry.target)
        }
      })
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
}
