import { SPECS } from "../data.js";
export default function Spec() {
  return (
    <section
      className="spec-section"
      id="specifications"
      aria-labelledby="spec-title"
    >
      <div className="wrap spec-layout">
        <div className="spec-intro">
          <p className="eyebrow">THE SHAPE OF WHAT’S NEXT</p>
          <h2 id="spec-title">
            Big character.
            <br />
            <em>Thoughtful hardware.</em>
          </h2>
          <p>Our starting point for the first working prototype.</p>
          <div className="height-stat">
            60<span>inches tall</span>
          </div>
          <p className="small-note">
            Design targets, subject to engineering and testing. Runtime depends
            on the final hardware and workload.
          </p>
        </div>
        <dl className="spec-list">
          {SPECS.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
