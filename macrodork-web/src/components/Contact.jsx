import { useState } from 'react'
import { CONTACT_EMAIL } from '../data.js'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', org: '', country: '', message: '' })
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  function submit(e) {
    e.preventDefault()
    const subject = encodeURIComponent(`MacroDork enquiry from ${form.name || 'a builder'}`)
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\nOrganisation: ${form.org}\nCountry: ${form.country}\n\n${form.message}`)
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`
  }
  return (
    <section className="contact" id="contact">
      <div className="wrap">
        <div className="wide" data-reveal>
          <img src="/images/hw/01-physical-layout.png" alt="Physical layout of MacroDork electronics: camera, main board and HAT in the head; servos, IMU board and battery in the trunk" loading="lazy" />
        </div>
        <div className="contact-grid">
          <h2 className="h2" data-reveal>Interested in building one?</h2>
          <form onSubmit={submit} data-reveal data-delay="1">
            <label className="field"><span className="mono">Name *</span><input required value={form.name} onChange={set('name')} autoComplete="name" /></label>
            <label className="field"><span className="mono">Email *</span><input required type="email" value={form.email} onChange={set('email')} autoComplete="email" /></label>
            <label className="field"><span className="mono">Company / organization</span><input value={form.org} onChange={set('org')} autoComplete="organization" /></label>
            <label className="field"><span className="mono">Country / region</span><input value={form.country} onChange={set('country')} autoComplete="country-name" /></label>
            <label className="field"><span className="mono">What are you planning to build?</span><textarea rows="3" value={form.message} onChange={set('message')} /></label>
            <div className="form-foot">
              <button className="btn btn-brand" type="submit">Send</button>
              <span>Opens your mail client addressed to {CONTACT_EMAIL}.</span>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
