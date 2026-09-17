import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUp, BarChart3, Check, CheckCircle2, ChevronDown, CircleDollarSign, ClipboardList, Menu, Package, ShieldCheck, Sparkles, Truck, Users, X } from 'lucide-react'
import './LandingPage.css'

const features = [
  { icon: ClipboardList, number: '01', title: 'Create without friction', text: 'Build purchase orders in seconds with saved suppliers, products, terms, and smart defaults.' },
  { icon: Users, number: '02', title: 'Align every stakeholder', text: 'Route requests to the right people, keep suppliers in sync, and leave nothing in the inbox.' },
  { icon: BarChart3, number: '03', title: 'See the full picture', text: 'Turn every order into a live view of spend, delivery, cash flow, and supplier performance.' },
]

const faqs = ['Can I try OrderFlow before committing?', 'How does the platform fee work?', 'Can I invite my finance and operations team?', 'Is my purchasing data secure?']

function Dashboard() {
  return <div className="dashboard-shell">
    <div className="dashboard-top"><div className="brand-mini"><span className="brand-mark">O</span><span>OrderFlow</span></div><div className="dashboard-actions"><span className="live-dot" /> Live workspace <span className="avatar">AR</span></div></div>
    <div className="dashboard-body"><aside><div className="dash-label">WORKSPACE</div>{['Overview', 'Purchase orders', 'Suppliers', 'Invoices', 'Reports'].map((item, index) => <div className={`dash-nav ${index === 0 ? 'active' : ''}`} key={item}><span className="dash-icon">{index === 0 ? '◒' : index === 1 ? '□' : index === 2 ? '♧' : index === 3 ? '▤' : '⌁'}</span>{item}</div>)}<div className="dash-bottom"><div className="dash-label">YOUR TEAM</div><div className="team-row"><span className="avatar small">AR</span><span>Alya Rahma</span><span>⌄</span></div></div></aside><div className="dash-main"><div className="dash-heading"><div><p className="eyebrow">Monday, 17 September 2026</p><h3>Good morning, Alya</h3></div><button className="small-button">+ New purchase order</button></div><div className="metric-grid">{[['Total spend', 'Rp 248,6 jt', '+18.4%', 'up'], ['Open orders', '24', '+6 this month', 'up'], ['Awaiting approval', '07', 'Needs attention', 'warn']].map(([label, value, note, state]) => <div className="metric" key={label}><span>{label}</span><strong>{value}</strong><small className={state}>{note}</small></div>)}</div><div className="chart-card"><div className="chart-header"><div><strong>Purchase activity</strong><span>Last 6 months</span></div><span className="chart-total">Rp 1,2 M <small>total</small></span></div><div className="chart"><div className="chart-y"><span>300M</span><span>200M</span><span>100M</span><span>0</span></div><div className="chart-bars">{[52, 71, 48, 86, 68, 100].map((height, i) => <div className="bar-group" key={i}><div className={`bar ${i === 5 ? 'hot' : ''}`} style={{height: `${height}%`}} /><small>{['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'][i]}</small></div>)}</div></div></div><div className="orders-card"><div className="orders-heading"><strong>Recent purchase orders</strong><span>View all →</span></div>{[['PO-2026-00124', 'PT Sumber Makmur', 'Rp 12.500.000', 'Confirmed'], ['PO-2026-00123', 'CV Prima Logistik', 'Rp 8.750.000', 'Processing'], ['PO-2026-00122', 'UD Berkah Jaya', 'Rp 5.250.000', 'Pending']].map(([id, supplier, amount, status]) => <div className="order-row" key={id}><b>{id}</b><span>{supplier}</span><span>{amount}</span><em className={status.toLowerCase()}>{status}</em></div>)}</div></div></div>
  </div>
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [language, setLanguage] = useState<'id' | 'en'>('id')
  const [modalOpen, setModalOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [email, setEmail] = useState('')
  const [faq, setFaq] = useState<number | null>(null)
  
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  useEffect(() => {
    const revealTargets = document.querySelectorAll<HTMLElement>('.hero-copy, .hero-note, .dashboard-wrap, .logo-strip > *, .intro > *, .workflow > *, .stats > *, .pricing > *, .faq > *, .share-section > *, .final-cta > *, footer > *')
    revealTargets.forEach((element) => element.classList.add('reveal'))
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' })
    revealTargets.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])
  
  const submit = (event: React.FormEvent) => { event.preventDefault(); setSubmitted(true) }
  const openModal = () => { setSubmitted(false); setModalOpen(true) }
  
  return <div className="landing-page"><main id="top">
    <header className={`site-header ${isScrolled ? 'is-scrolled' : ''}`}><nav><a href="#top" className="logo"><span>O</span>OrderFlow</a><div className="nav-links"><a href="#product">Product</a><a href="#workflow">How it works</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a></div><div className="nav-cta"><Link className="login" to="/login">Log in / Masuk</Link><button className="language-pill" onClick={() => setLanguage(language === 'id' ? 'en' : 'id')} aria-label="Switch language">{language === 'id' ? 'EN' : 'ID'}</button><button className="button dark small" onClick={openModal}>Get started <ArrowRight /></button></div><button className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">{menuOpen ? <X /> : <Menu />}</button></nav>{menuOpen && <div className="mobile-nav"><a href="#product">Product</a><a href="#workflow">How it works</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a><button className="button dark" onClick={openModal}>Get started <ArrowRight /></button></div>}</header>
    <button className={`scroll-top ${isScrolled ? 'is-visible' : ''}`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Scroll to top"><ArrowUp /></button>
    <section className="hero"><div className="hero-grid"><div className="hero-copy"><div className="announcement"><Sparkles /> Sistem PO untuk bisnis yang terus bergerak</div><h1>Kelola setiap PO <i>tanpa ribet.</i></h1><p>OrderFlow menyatukan pembuatan purchase order, approval, supplier, invoice, dan pembayaran dalam satu sistem yang jelas—seller tetap gratis 100%.</p><div className="hero-actions"><button className="button dark" onClick={openModal}>Buat PO pertama <ArrowRight /></button><a className="text-link" href="#workflow">See how it works <ArrowRight /></a></div><div className="trust-line"><div className="faces"><span>AN</span><span>RS</span><span>MK</span><span>+</span></div><span>Join 2,000+ modern teams purchasing with clarity.</span></div></div><div className="hero-note"><span className="note-line" /><p>Purchase orders should not<br /><strong>slow your business down.</strong></p><span className="note-arrow">↘</span></div></div><div className="dashboard-wrap"><Dashboard /><div className="float-card spend"><CircleDollarSign /><span><b>18.4%</b><small>spend efficiency</small></span></div><div className="float-card approved"><CheckCircle2 /><span><b>PO approved</b><small>just now · PO-00124</small></span></div></div></section>
    <section className="logo-strip"><span>Teams at</span><b>northstar</b><b>acme<span>co</span></b><b>VERDANT</b><b>Forma.</b><b>orbit</b></section>
    <section id="product" className="intro section"><div className="section-kicker">A better way to buy</div><div className="split-heading"><h2>Less chasing.<br /><em>More moving.</em></h2><p>Procurement is a team sport. OrderFlow gives everyone the context they need to make decisions faster, without adding another layer of complexity.</p></div><div className="feature-grid">{features.map(({icon: Icon, number, title, text}) => <article className="feature-card" key={number}><div className="feature-top"><span>{number}</span><Icon /></div><h3>{title}</h3><p>{text}</p><a href="#workflow">Explore feature <ArrowRight /></a></article>)}</div></section>
    <section id="workflow" className="workflow section"><div className="workflow-copy"><div className="section-kicker light">From request to received</div><h2>One flow.<br /><em>Zero blind spots.</em></h2><p>Every order has a story. Keep it moving with a clear, collaborative workflow that your entire team can actually follow.</p><button className="button light-button" onClick={openModal}>See OrderFlow in action <ArrowRight /></button></div><div className="steps">{[['01','Create','Start with the essentials. Products, quantities, supplier, done.'],['02','Approve','The right people review every request in context.'],['03','Deliver','Track shipments, invoices, and payment through the finish line.']].map(([num, title, text], i) => <div className="step" key={num}><span className="step-num">{num}</span><div><h3>{title}</h3><p>{text}</p></div>{i < 2 && <span className="step-connector" />}</div>)}</div></section>
    <section className="stats section"><div className="stats-intro"><div className="section-kicker">The clear advantage</div><h2>Good operations<br /><em>compound.</em></h2><p>Small improvements in the everyday add up to a faster, more predictable business.</p></div><div className="stat-grid">{[['32%', 'less time spent chasing updates'], ['4.8×', 'faster approval cycles'], ['100%', 'visibility from PO to payment']].map(([num, text]) => <div className="stat" key={num}><strong>{num}</strong><span>{text}</span></div>)}</div></section>
    <section id="pricing" className="pricing section"><div className="section-kicker">Biaya yang transparan</div><div className="pricing-head"><h2>Seller gratis.<br /><em>Buyer yang membayar.</em></h2><p>Sistem OrderFlow 100% gratis untuk seller. Untuk PO hingga 20 order tidak ada biaya platform; setelah melewati 20 order, biaya layanan Rp1.000 per order hanya dibebankan kepada buyer.</p></div><div className="price-card"><div><span className="price-label">BUYER SERVICE FEE</span><strong>Rp 1.000 <small>/ order buyer</small></strong><p>Seller tidak membayar biaya platform apa pun.</p></div><div className="price-list"><span><Check /> Seller free 100%</span><span><Check /> Buyer fee transparan per order</span><span><Check /> Approval workflows</span><span><Check /> Reports & analytics</span></div><button className="button dark" onClick={openModal}>Get started free <ArrowRight /></button></div></section>
    <section id="faq" className="faq section"><div><div className="section-kicker">Questions, answered</div><h2>Still curious?</h2><p>Here are a few things teams ask us most.</p></div><div className="faq-list">{faqs.map((question, i) => <div className={`faq-item ${faq === i ? 'open' : ''}`} key={question}><button onClick={() => setFaq(faq === i ? null : i)}><span>{question}</span><ChevronDown /></button>{faq === i && <p>Yes. OrderFlow is designed to make this part simple, secure, and transparent for your team.</p>}</div>)}</div></section>
    <section className="share-section section"><div className="share-copy"><div className="section-kicker">Share & sell faster</div><h2>PO siap dibagikan<br /><em>langsung dari WhatsApp.</em></h2><p>Buat satu link checkout untuk setiap purchase order. Seller tinggal copy, paste, dan kirim ke buyer—tanpa PDF bolak-balik atau chat yang tercecer.</p><a className="button dark" href="https://wa.me/?text=OrderFlow%20-%20Buat%20PO%20lebih%20rapi" target="_blank" rel="noreferrer">Share on WhatsApp <ArrowRight /></a></div><div className="share-preview"><span className="share-bubble">OrderFlow</span><strong>PO-2026-00124</strong><span>12 items · Rp 12.500.000</span><button>Open purchase order ↗</button></div></section>
    <section className="final-cta"><div className="orb orb-one" /><div className="orb orb-two" /><div className="section-kicker light">Ready when you are</div><h2>Make buying<br /><i>the easy part.</i></h2><p>Start building a calmer, clearer purchasing operation today.</p><button className="button light-button" onClick={openModal}>Create your workspace <ArrowRight /></button></section>
    <footer><a href="#top" className="logo"><span>O</span>OrderFlow</a><p>Purchase orders, without the busywork.</p><div><a href="#product">Product</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a><a href="#top">Privacy</a></div><small>© 2026 OrderFlow. Built for better business.</small></footer>
    {modalOpen && <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="modal"><button className="modal-close" onClick={() => setModalOpen(false)} aria-label="Close"><X /></button>{submitted ? <div className="success"><CheckCircle2 /><h2>You&apos;re in.</h2><p>We&apos;ll send the next steps to <b>{email}</b>.</p><button className="button dark" onClick={() => setModalOpen(false)}>Done</button></div> : <><div className="section-kicker">Start your workspace</div><h2>Let&apos;s make buying easier.</h2><p>Enter your email and we&apos;ll get your OrderFlow workspace ready.</p><form onSubmit={submit}><label htmlFor="email">Work email</label><input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" /><button className="button dark" type="submit">Create workspace <ArrowRight /></button></form></>}</div></div>}
  </main></div>
}
