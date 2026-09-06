import { LINKS } from '../data.js'

export default function BuildPublic() {
  return (
    <section className="build" id="build">
      <div className="wrap">
        <div className="photo" data-reveal>
          <img src="/images/build/first-printed-parts.jpg" alt="The first printed MacroDork parts on a workbench: head shell with red face plate, trunk shell, leg structure and yellow feet" loading="lazy" />
        </div>
        <div className="copy" data-reveal>
          <h2 className="h2">Built in public</h2>
          <p>The head, trunk, legs and feet are printed and the M2 screws go where the drawings say they do. Every step, and every mistake, goes in the build log.</p>
          <div className="row">
            <a className="btn btn-outline" href={LINKS.repo} target="_blank" rel="noreferrer">GitHub</a>
            <a className="btn btn-outline" href={LINKS.buildLog} target="_blank" rel="noreferrer">Build log</a>
            <a className="btn btn-outline" href={LINKS.readme} target="_blank" rel="noreferrer">Documentation</a>
          </div>
        </div>
      </div>
    </section>
  )
}
