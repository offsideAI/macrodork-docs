import { Brand } from "./Nav.jsx";
export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-top">
          <a href="#meet" aria-label="Offside Robotics home">
            <Brand />
          </a>
          <p>A more personal kind of robot.</p>
          <a href="#preorder">Preorder information ↗</a>
        </div>
        <div className="footer-wordmark" aria-hidden="true">
          Hello, Mark 1.
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Offside Robotics</span>
          <span>Mark 1 is in development. Images are concept renders.</span>
          <a href="#questions">Questions & answers</a>
        </div>
      </div>
    </footer>
  );
}
