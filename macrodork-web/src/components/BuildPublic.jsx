const stages = [
  [
    "01",
    "Find the character",
    "Complete",
    "A full-body concept, three head studies and a clear product direction.",
  ],
  [
    "02",
    "Make it work",
    "Current phase",
    "Mechanical design, component selection and a working head on a bench fixture.",
  ],
  [
    "03",
    "Bring it together",
    "Ahead",
    "A loaded rolling chassis, full-size panels and gesture arms. Then testing and refinement.",
  ],
  [
    "04",
    "Meet the world",
    "Planned",
    "Share the working prototype and prepare for a Kickstarter campaign. Timing to be announced.",
  ],
];
export default function BuildPublic() {
  return (
    <section
      className="progress wrap section-space"
      id="progress"
      aria-labelledby="progress-title"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">FROM FIRST SKETCH TO FIRST HELLO</p>
          <h2 id="progress-title">
            Follow the <em>first steps.</em>
          </h2>
        </div>
        <p>
          Good hardware takes iteration.
          <br />
          Here’s where we are.
        </p>
      </div>
      <ol className="timeline">
        {stages.map(([number, title, status, body], i) => (
          <li key={number} className={i === 1 ? "current" : ""}>
            <div className="stage-top">
              <span className="mono">{number}</span>
              <span className="stage-status">{status}</span>
            </div>
            <h3>{title}</h3>
            <p>{body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
