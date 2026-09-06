import { PRODUCTS } from '../data.js'

export default function Products() {
  return (
    <section className="products" aria-label="Projects">
      <div className="wrap product-grid">
        {PRODUCTS.map((p, i) => (
          <article className={`product${p.tone === 'photo' ? ' photo' : ''}`} key={p.title} data-reveal data-delay={String(i)}>
            <div className="bg" aria-hidden="true"><img src={p.image} alt="" loading="lazy" /></div>
            <div className="panel">
              <span className="eyebrow mono">{p.eyebrow}</span>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
              <a className="btn btn-brand" href={p.href} target="_blank" rel="noreferrer">{p.cta}</a>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
