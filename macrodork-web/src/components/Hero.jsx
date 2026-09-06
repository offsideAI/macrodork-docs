import { LINKS } from '../data.js'

export default function Hero() {
  return (
    <header className="hero" id="top">
      <figure className="hero-figure" aria-hidden="true">
        <img src="/images/hero/04_three_quarter-cut.png" alt="" width="967" height="1617" fetchpriority="high" />
      </figure>
      <div className="wrap hero-copy">
        <h1>Meet MacroDork</h1>
        <p className="lede">The open, buildable robot duck. Every part drawn, every board decoded, every screw counted.</p>
        <div className="hero-ctas">
          <a className="btn btn-white" href={LINKS.repo} target="_blank" rel="noreferrer">Get the files</a>
          <a className="btn btn-outline-white" href="#contact">Talk to us</a>
        </div>
      </div>
    </header>
  )
}
