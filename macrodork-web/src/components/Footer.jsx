import { LINKS, OFFSIDE_AI } from '../data.js'

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot-cols mono">
          <ul>
            <li><a href="#macrodork">MacroDork</a></li>
            <li><a href="#spec">Specifications</a></li>
            <li><a href="#build">Build log</a></li>
          </ul>
          <ul>
            <li><a href={LINKS.readme} target="_blank" rel="noreferrer">Docs</a></li>
            <li><a href={LINKS.bom} target="_blank" rel="noreferrer">Bill of materials</a></li>
            <li><a href={LINKS.print} target="_blank" rel="noreferrer">Printable parts</a></li>
            <li><a href={LINKS.cad} target="_blank" rel="noreferrer">CAD</a></li>
          </ul>
          <ul>
            <li><a href="#research">Research</a></li>
            <li><a href={LINKS.asimovStudy} target="_blank" rel="noreferrer">Asimov-1 study</a></li>
            <li><a href={LINKS.teardown} target="_blank" rel="noreferrer">Hardware teardown</a></li>
          </ul>
          <ul>
            <li><a href={LINKS.repo} target="_blank" rel="noreferrer">GitHub</a></li>
            <li><a href={LINKS.notice} target="_blank" rel="noreferrer">Attribution</a></li>
            <li><a href={LINKS.provenance} target="_blank" rel="noreferrer">Provenance</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
          <p className="tagline">OffsideRobotics<br />Powered by <a href={OFFSIDE_AI} target="_blank" rel="noreferrer">Offside.AI</a></p>
        </div>
        <div className="wordmark" aria-hidden="true">OFFSIDE ROBOTICS</div>
        <div className="foot-bottom mono">
          <span>OffsideRobotics © 2026 · Powered by Offside.AI</span>
          <span>
            <a href={LINKS.notice} target="_blank" rel="noreferrer">Licence</a>
            <a href={LINKS.provenance} target="_blank" rel="noreferrer">Provenance</a>
          </span>
        </div>
      </div>
    </footer>
  )
}
