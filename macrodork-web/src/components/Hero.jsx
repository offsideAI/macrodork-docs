export default function Hero() {
  return (
    <section className="hero wrap" id="meet" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow">
          <span className="status-dot" /> INTRODUCING MARK 1
        </p>
        <h1 id="hero-title">
          A new kind
          <br />
          of <em>company.</em>
        </h1>
        <p className="hero-description">
          A curious little personality. A big step toward a more personal kind
          of robot.
        </p>
        <p className="hero-detail">
          Meet Mark 1, our home companion robot in development. Designed to
          bring a friendly face to everyday technology.
        </p>
        <a className="button" href="#design">
          Get to know Mark 1 <span aria-hidden="true">↗</span>
        </a>
        <div className="hero-foot">
          <span className="mono">01 / THE COMPANION SERIES</span>
          <span>
            Designed with character.
            <br />
            Built with curiosity.
          </span>
        </div>
      </div>
      <figure className="hero-image">
        <div className="image-topline">
          <span className="mono">MARK 1</span>
          <span className="finish-swatch">Silver / Graphite / Amber</span>
        </div>
        <img
          src="/images/mark-1/hero.png"
          alt="Mark 1 concept: a friendly silver robot with two round camera eyes, gesture arms and a wheeled base"
          width="1200"
          height="1500"
          fetchPriority="high"
        />
        <figcaption>
          <span>CONCEPT RENDER / R001</span>
          <span>60 IN · 1524 MM</span>
        </figcaption>
      </figure>
    </section>
  );
}
