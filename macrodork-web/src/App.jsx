import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import MediaStrip from './components/MediaStrip.jsx'
import Features from './components/Features.jsx'
import Spec from './components/Spec.jsx'
import BuildPublic from './components/BuildPublic.jsx'
import Products from './components/Products.jsx'
import Research from './components/Research.jsx'
import Contact from './components/Contact.jsx'
import Faq from './components/Faq.jsx'
import Footer from './components/Footer.jsx'
import { useReveal } from './hooks/useReveal.js'

export default function App() {
  useReveal()
  return (
    <>
      <a className="skip-link" href="#macrodork">Skip to content</a>
      <Nav />
      <main>
        <Hero />
        <MediaStrip />
        <Features />
        <Spec />
        <BuildPublic />
        <Products />
        <Research />
        <Contact />
        <Faq />
      </main>
      <Footer />
    </>
  )
}
