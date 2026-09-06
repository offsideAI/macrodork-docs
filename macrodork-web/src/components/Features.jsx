import { FEATURES } from '../data.js'

export default function Features() {
  return (
    <section className="features" id="macrodork">
      <div className="wrap">
        <div className="centered" data-reveal>
          <h2 className="h2">Everything <span className="accent">a builder needs, in the open</span></h2>
        </div>
        <div className="feature-grid">
          {FEATURES.map((f, i) => (
            <article className="feature" key={f.title} data-reveal data-delay={String(i)}>
              <div className="media"><img src={f.image} alt={f.alt} loading="lazy" /></div>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
              <a className="btn btn-outline" href={f.href} target="_blank" rel="noreferrer">{f.cta}</a>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
