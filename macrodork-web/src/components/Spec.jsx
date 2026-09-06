import { SPEC_POINTS } from '../data.js'

export default function Spec() {
  return (
    <section className="spec" id="spec">
      <div className="wrap">
        <h2 className="h1" data-reveal>25 cm. 737 g. <span>14+1 DoF.</span></h2>
        <div className="points">
          {SPEC_POINTS.map((p, i) => (
            <div className="point" key={p.title} data-reveal data-delay={String(i % 3)}>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
