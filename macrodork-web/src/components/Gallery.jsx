import { useState } from "react";
import { VIEWS } from "../data.js";
export default function Gallery() {
  const [selected, setSelected] = useState(VIEWS[0]);
  return (
    <section
      className="gallery wrap section-space"
      id="design"
      aria-labelledby="design-title"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">MEET EVERY SIDE OF MARK 1</p>
          <h2 id="design-title">
            Character, <em>in detail.</em>
          </h2>
        </div>
        <p>
          Soft silver forms. Dark optical eyes.
          <br />A warm touch of amber.
        </p>
      </div>
      <div className="gallery-layout">
        <div className="gallery-notes">
          <span className="index-number">01</span>
          <h3>
            A companion.
            <br />
            With a point of view.
          </h3>
          <p>
            We’re shaping every surface around a friendly, unmistakable
            silhouette. These views show our first full-body design study.
          </p>
          <div
            className="view-controls"
            role="group"
            aria-label="Choose a robot view"
          >
            {VIEWS.map((view) => (
              <button
                key={view.id}
                onClick={() => setSelected(view)}
                aria-pressed={selected.id === view.id}
              >
                {view.label}
                <span aria-hidden="true">↗</span>
              </button>
            ))}
          </div>
          <p className="small-note">
            Concept imagery. Physical prototype testing is ahead.
          </p>
        </div>
        <figure className="gallery-image">
          <img
            key={selected.id}
            src={`/images/mark-1/${selected.id}.png`}
            width="1200"
            height="1500"
            loading="lazy"
            alt={selected.alt}
          />
          <figcaption aria-live="polite">
            <span>{selected.caption}</span>
            <span className="mono">{selected.label.toUpperCase()}</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
