import { useState } from 'react'
import { FAQ } from '../data.js'

export default function Faq() {
  const [open, setOpen] = useState(-1)
  return (
    <section className="faq" id="faq">
      <div className="wrap">
        <h2 className="h2" data-reveal>FAQ</h2>
        <div className="faq-list" data-reveal>
          {FAQ.map((item, i) => {
            const isOpen = open === i
            return (
              <div className="faq-item" data-open={isOpen} key={item.q}>
                <button aria-expanded={isOpen} aria-controls={`faq-${i}`} onClick={() => setOpen(isOpen ? -1 : i)}>
                  <span>{item.q}</span>
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 7l6 6 6-6" /></svg>
                </button>
                <div id={`faq-${i}`} className="answer" hidden={!isOpen}>{item.a}</div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
