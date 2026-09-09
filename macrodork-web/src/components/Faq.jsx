import { FAQ } from "../data.js";
export default function Faq() {
  return (
    <section
      className="faq wrap section-space"
      id="questions"
      aria-labelledby="faq-title"
    >
      <div>
        <p className="eyebrow">A FEW THINGS TO KNOW</p>
        <h2 id="faq-title">
          Curious?
          <br />
          <em>So are we.</em>
        </h2>
      </div>
      <div>
        {FAQ.map(([q, a]) => (
          <details key={q}>
            <summary>
              {q}
              <span aria-hidden="true">+</span>
            </summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
