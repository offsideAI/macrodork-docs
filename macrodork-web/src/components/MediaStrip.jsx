import { TILES } from '../data.js'

export default function MediaStrip() {
  return (
    <section className="strip" aria-label="Views of MacroDork">
      <div className="wrap tiles">
        {TILES.map((t, i) => (
          <figure className={`tile${t.photo ? ' photo' : ''}`} key={t.caption} data-reveal data-delay={String(i)}>
            <img src={t.src} alt={t.alt} loading="lazy" />
            <figcaption className="mono">{t.caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
