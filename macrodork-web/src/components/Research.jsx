import { RESEARCH, LINKS } from '../data.js'

export default function Research() {
  return (
    <section id="research">
      <div className="wrap">
        <div className="section-bar" data-reveal>
          <h2 className="h2">Research</h2>
          <a className="mono" href={LINKS.readme} target="_blank" rel="noreferrer">View all →</a>
        </div>
        <div className="research-grid">
          {RESEARCH.map((r, i) => (
            <a className="paper" href={r.href} target="_blank" rel="noreferrer" key={r.title} data-reveal data-delay={String(i)}>
              <div className="media"><img src={r.image} alt="" loading="lazy" /></div>
              <span className="date mono">{r.date}</span>
              <h3>{r.title}</h3>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
