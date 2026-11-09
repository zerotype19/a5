import { ArrowIcon } from "@/components/ArrowIcon";
import Link from 'next/link';
import { SERVICES } from '@config/services';
import {COUNTIES, countyPath} from '@config/counties';
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
   <div className={styles.heroCopy}><p className={styles.eyebrow}>Local home services marketplace</p>
    <h1 id="hero-heading">Find the right pro<br/>for your home project.</h1>
    <p className={styles.lede}>From small repairs to major improvements, A5 helps connect you with local home service professionals. Tell us what you need, and we’ll help find a pro for the job.</p>
    <div className={styles.actions}><Button href="/request-service" dataCta="hero-get-help">Find a home pro <span aria-hidden="true"><ArrowIcon /></span></Button><Button href="/#services" variant="secondary" dataCta="hero-view-services">Explore services</Button></div>
    <p className={styles.small}>Free to request. No obligation to hire.</p>
   </div>
   <figure className={styles.heroVisual}><HomeImage name="hero" priority alt="Illustrative home entrance with a teal door, brick steps and garden planting"/></figure>
  </section>
  <div className={styles.assurances}><span>Repairs, maintenance and improvements</span><span>Independent local professionals</span><span>One place to get started</span></div>
  <section id="services" className={styles.section} aria-labelledby="services-heading"><div className={styles.sectionHead}><div><p className={styles.eyebrow}>The services you need</p><h2 id="services-heading">Care for every part of your home.</h2></div><p>Explore our most requested categories,<br/>then tell us about your project.</p></div>
   <div className={styles.serviceGrid}>{SERVICES.map(s=><Link className={styles.serviceCard} href={`/services/${s.slug}`} key={s.id}><HomeImage name={s.id} alt={SERVICE_PRESENTATION[s.id].alt}/><div><span className={styles.cardTitle}>{s.name}<span aria-hidden="true"><ArrowIcon direction="up-right" /></span></span><p>{SERVICE_PRESENTATION[s.id].jobs.slice(0,3).join(' · ')}</p></div></Link>)}</div>
   <Link className={styles.unsure} href="/request-service" prefetch={false}><strong>Not sure who to call?</strong><span>Describe the project. We’ll help identify the right service.</span><span aria-hidden="true"><ArrowIcon direction="up-right" /></span></Link>
  </section>
  <section className={styles.problemSection}><div className={styles.section}><p className={styles.eyebrow}>Start with what you see.</p><h2>Find help for a specific problem.</h2><div className={styles.problemLinks}>{PROBLEMS.map(p=><Link key={p.href} href={p.href}>{p.label} <ArrowIcon direction="up-right" /></Link>)}</div></div></section>
  <section className={styles.section} aria-labelledby="cost-planning-heading"><div className={styles.sectionHead}><div><p className={styles.eyebrow}>Before you hire</p><h2 id="cost-planning-heading">What might your project cost?</h2></div><Link href="/cost-guides">All cost guides <ArrowIcon /></Link></div><p>Compare published national cost references, understand visit fees and know what to ask. Your professional confirms the price for your home.</p><div className={styles.problemLinks}><Link href="/cost-guides/gutters-cost">Gutter cleaning costs <ArrowIcon /></Link><Link href="/cost-guides/plumbing-cost">Plumber rates and visit fees <ArrowIcon /></Link><Link href="/cost-guides/handyman-cost">Handyman rates and small jobs <ArrowIcon /></Link><Link href="/cost-guides/hvac-cost">Heating and cooling repair costs <ArrowIcon /></Link></div></section>
  <section id="how-it-works" className={styles.process}><div className={styles.section}><div className={styles.sectionHead}><div><p className={styles.eyebrow}>A simpler process</p><h2>Find local pros in three simple steps.</h2></div><Link href="/how-it-works">How A5 works <ArrowIcon /></Link></div><ol className={styles.steps}>{[
   ['Tell us what you need','Describe your project and where you need help. Add photos if they help explain the job.'],
   ['We connect you with a local pro','We review your request and look for a local service provider who handles that type of work.'],
   ['Get your project moving','Discuss pricing, scheduling and project details directly with the pro. You decide whether to hire.'],
  ].map(([title,body],i)=><li key={title}><span>0{i+1}</span><h3>{title}</h3><p>{body}</p></li>)}</ol><p className={styles.small}>Free to request. No obligation to hire.</p></div></section>
  <section id="areas" className={`${styles.section} ${styles.areaSection}`}><div><p className={styles.eyebrow}>Our service area</p><h2>Serving Northern<br/>New Jersey.</h2><p className={styles.lede}>Find local pros for home repairs and improvements across Northern New Jersey.</p></div><div className={styles.towns}>{COUNTIES.map(l=><Link key={l.id} href={countyPath(l)}><span>{l.name}</span><span>NJ &nbsp; <ArrowIcon direction="up-right" /></span></Link>)}</div></section>
  <section className={styles.questions}><div className={styles.section}><p className={styles.eyebrow}>Before you get started</p><h2>What to expect.</h2><div className={styles.faqList}>{HOME_FAQ.map(f=><details key={f.question}><summary>{f.question}</summary><p>{f.answer}</p></details>)}</div></div></section>
  <section className={styles.finalCta}><p className={styles.eyebrow}>Ready to get started?</p><h2>Get the right help<br/>for your home.</h2><p>Tell us what you need, and we’ll help find a pro for the job.</p><Button href="/request-service" variant="onHero" dataCta="final-get-help">Find a home pro <ArrowIcon /></Button><a href={phoneTelHref(SITE.phone)}>Or call {SITE.phone}</a></section>
 </main>;
}
