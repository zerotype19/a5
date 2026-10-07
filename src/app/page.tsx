import Link from 'next/link';
import { SERVICES } from '@config/services';
import { LOCATIONS } from '@config/locations';
import { SITE } from '@config/site';
import { Button } from '@/components/Button';
import { HomeImage } from '@/components/HomeImage';
import { SERVICE_PRESENTATION, HOME_FAQ } from '@/lib/home-services';
import { phoneTelHref } from '@/lib/phone';
import styles from './page.module.css';
const PROBLEMS = [
 {label:'Cracked brick steps',href:'/services/masonry/brick-step-repair'},
 {label:'A ceiling stain',href:'/services/drywall/water-damaged-ceiling'},
 {label:'An outlet that stopped working',href:'/services/electrical/dead-outlet'},
 {label:'A door that sticks',href:'/services/handyman/sticking-interior-door'},
 {label:'A running toilet',href:'/services/plumbing/running-toilet'},
 {label:'Peeling paint',href:'/services/painting/peeling-exterior-paint'},
 {label:'Sunken pavers',href:'/services/masonry/sunken-pavers'},
 {label:'Water sitting in the yard',href:'/services/landscaping/yard-surface-grading'},
];
export default function HomePage() {
 return <main>
  <section className={styles.hero} aria-labelledby="hero-heading">
   <div className={styles.heroCopy}><p className={styles.eyebrow}>Your home. Your neighborhood. A little help.</p>
    <h1 id="hero-heading">A home you love.<br/><em>A little less on your list.</em></h1>
    <p className={styles.lede}>From the door that sticks to the steps that need fixing. Tell A5 what’s going on, and we’ll help connect you with the right kind of local professional.</p>
    <div className={styles.actions}><Button href="/request-service" dataCta="hero-get-help">Tell us what needs fixing <span aria-hidden="true">↗</span></Button><a href={phoneTelHref(SITE.phone)} data-cta="hero-call">Or call {SITE.phone}</a></div>
    <p className={styles.small}>Serving six Northern New Jersey communities. Photos welcome. Contractor jargon optional.</p>
   </div>
   <figure className={styles.heroVisual}><HomeImage name="hero" priority alt="Illustrative home entrance with a teal door, brick steps and garden planting"/><figcaption>Home inspiration · illustrative image</figcaption><div className={styles.imageNote}><span>START WITH WHAT YOU SEE</span><strong>“The front steps<br/>need some attention.”</strong><Link href="/services/masonry">Explore masonry help ↗</Link></div></figure>
  </section>
  <div className={styles.assurances}><span>01 &nbsp; Tell us in your own words</span><span>02 &nbsp; A5 reviews the details</span><span>03 &nbsp; Connect with a local provider</span></div>
  <section id="services" className={styles.section} aria-labelledby="services-heading"><div className={styles.sectionHead}><div><p className={styles.eyebrow}>Around the house</p><h2 id="services-heading">What’s on your list?</h2></div><p>One place to start for everyday repairs<br/>and the projects you’ve been putting off.</p></div>
   <div className={styles.serviceGrid}>{SERVICES.map(s=><Link className={styles.serviceCard} href={`/services/${s.slug}`} key={s.id}><HomeImage name={s.id} alt={SERVICE_PRESENTATION[s.id].alt}/><div><span className={styles.cardTitle}>{s.name}<span aria-hidden="true">↗</span></span><p>{SERVICE_PRESENTATION[s.id].jobs.slice(0,3).join(' · ')}</p></div></Link>)}</div><p className={styles.caption}>Service images are illustrative, not photographs of A5 projects.</p>
   <Link className={styles.unsure} href="/request-service"><strong>Not sure who to call?</strong><span>You don’t need to diagnose it. Start with what’s happening.</span><span aria-hidden="true">↗</span></Link>
  </section>
  <section className={styles.problemSection}><div className={styles.section}><p className={styles.eyebrow}>Start with what you see.</p><h2>Something not quite right?</h2><div className={styles.problemLinks}>{PROBLEMS.map(p=><Link key={p.href} href={p.href}>{p.label} ↗</Link>)}</div></div></section>
  <section id="how-it-works" className={styles.process}><div className={styles.section}><div className={styles.sectionHead}><div><p className={styles.eyebrow}>Less figuring it out. More getting started.</p><h2>We help with the next step.</h2></div><Link href="/about">Meet the idea behind A5 ↗</Link></div><ol className={styles.steps}>{[
   ['Tell us about your home','Describe the project, share your ZIP code, and add photos if they help. A short explanation is enough.'],
   ['We review the details','A5 looks at the request and checks for a local provider who fits the type of work and location.'],
   ['Talk through the project','When there is a match, discuss the scope, estimate and timing directly with the provider.'],
  ].map(([title,body],i)=><li key={title}><span>0{i+1}</span><h3>{title}</h3><p>{body}</p></li>)}</ol><p className={styles.small}>A request starts a conversation. It does not book an appointment or commit you to a provider’s quote.</p></div></section>
  <section id="areas" className={`${styles.section} ${styles.areaSection}`}><div><p className={styles.eyebrow}>Close to home</p><h2>Local help.<br/>A familiar neighborhood.</h2><p className={styles.lede}>We’re focused on a small group of Northern New Jersey communities, so your request starts with where you live.</p><p className={styles.small}>Availability varies by service and project. Send your ZIP code and we’ll review the fit.</p></div><div className={styles.towns}>{LOCATIONS.map(l=><Link key={l.id} href={`/home-services/${l.slug}`}><span>{l.name}</span><span>NJ &nbsp; ↗</span></Link>)}</div></section>
  <section className={styles.questions}><div className={styles.section}><p className={styles.eyebrow}>Before you get started</p><h2>A few good questions.</h2><div className={styles.faqList}>{HOME_FAQ.map(f=><details key={f.question}><summary>{f.question}</summary><p>{f.answer}</p></details>)}</div></div></section>
  <section className={styles.finalCta}><p className={styles.eyebrow}>Let’s start with one thing</p><h2>What would you like<br/>to take off your list?</h2><p>A small repair. A bigger project. Or a few things at once.</p><Button href="/request-service" variant="onHero" dataCta="final-get-help">Tell us what needs fixing ↗</Button><a href={phoneTelHref(SITE.phone)}>Prefer to talk? {SITE.phone}</a></section>
 </main>;
}
