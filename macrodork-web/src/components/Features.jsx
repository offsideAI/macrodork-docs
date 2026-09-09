export default function Features() {
  return (
    <>
      <section
        className="intro wrap section-space"
        aria-labelledby="intro-title"
      >
        <p className="eyebrow">TECHNOLOGY WITH A LITTLE SOUL</p>
        <div>
          <h2 id="intro-title">
            Useful by design.
            <br />
            <em>Likeable by nature.</em>
          </h2>
          <p>
            We’re building a companion that feels at home around people.
            Approachable proportions, expressive movement and two camera eyes
            give Mark 1 a character all its own.
          </p>
        </div>
      </section>
      <section className="personality" aria-labelledby="personality-title">
        <figure className="personality-image">
          <img
            src="/images/mark-1/head.png"
            width="1500"
            height="1200"
            loading="lazy"
            alt="Close-up concept render of Mark 1’s binocular camera eyes, amber accents and articulated neck"
          />
          <figcaption>HEAD STUDY / CONCEPT RENDER</figcaption>
        </figure>
        <div className="personality-copy">
          <p className="eyebrow">A FACE YOU’LL GET TO KNOW</p>
          <h2 id="personality-title">
            A glance.
            <br />A nod.
            <br />
            <em>A personality.</em>
          </h2>
          <p>
            The plan is simple: let movement do the talking. A turning, nodding,
            tilting head and gentle arm gestures bring expression into the
            physical world.
          </p>
          <ul className="feature-list">
            <li>
              <span>01</span>
              <div>
                <h3>Two eyes. A shared perspective.</h3>
                <p>Two real cameras are planned for stereo vision.</p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <h3>A conversation, with a presence.</h3>
                <p>
                  Onboard audio, local computing and cloud assistance are part
                  of the design.
                </p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <h3>Room to explore.</h3>
                <p>
                  A wheeled base brings remote-controlled movement to the first
                  indoor prototype.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
