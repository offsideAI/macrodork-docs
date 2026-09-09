import Nav from "./components/Nav.jsx";
import Hero from "./components/Hero.jsx";
import Features from "./components/Features.jsx";
import Gallery from "./components/Gallery.jsx";
import Spec from "./components/Spec.jsx";
import BuildPublic from "./components/BuildPublic.jsx";
import Preorder from "./components/Preorder.jsx";
import CheckoutStatus from "./components/CheckoutStatus.jsx";
import Faq from "./components/Faq.jsx";
import Footer from "./components/Footer.jsx";
export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <CheckoutStatus />
        <Hero />
        <Features />
        <Gallery />
        <Spec />
        <BuildPublic />
        <Preorder />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
