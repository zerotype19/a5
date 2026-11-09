import type {Metadata} from 'next';
import Link from 'next/link';
import {SITE} from '@config/site';
import {Button} from '@/components/Button';
import {HomeImage} from '@/components/HomeImage';
import {PageIntro} from '@/components/templates/PageIntro';
import {phoneTelHref} from '@/lib/phone';
import template from '@/components/templates/templates.module.css';
import styles from '@/components/templates/network.module.css';
export const metadata:Metadata={title:'About A5',description:'A5 helps Northern New Jersey homeowners explain a repair and find local pros for repairs, maintenance and improvements.',alternates:{canonical:'/about'}};
export default function AboutPage(){return <main className={`${template.page} ${styles.page}`}>
 <div className={styles.hero}><div><PageIntro eyebrow="Local home services marketplace" title="Find the right pro for your home project." description="Home projects are easier with the right help. Tell us what you need, and we’ll help find a local pro. Free to request. No obligation to hire."/><div className={styles.actions}><Button href="/request-service">Find a home pro</Button><Link href="/how-it-works">See how it works</Link></div></div><HomeImage name="hero" priority alt="A welcoming home entrance with a green door and garden planting"/></div>
 <section className={styles.section} aria-labelledby="help-heading"><h2 id="help-heading">Less searching. More getting things done.</h2><div className={styles.grid}><div className={styles.card}><h3>Tell us about your project</h3><p>A5 is a local home services marketplace that helps homeowners connect with professionals for repairs, maintenance, renovations and more. Tell us what you need, and we’ll help find a pro for the job.</p></div><div className={styles.card}><h3>Find help close to home</h3><p>We help homeowners across Northern New Jersey find local service providers. Discuss the job and price with the pro, then decide whether to hire.</p><p><Link href="/home-services">Find your town</Link></p></div></div><p className={styles.note}><Link href="/how-it-works">How it works and common questions</Link></p></section>
 <section className={styles.cta}><h2>What do you need help with?</h2><p>Tell us about your project, or give us a call.</p><div className={styles.actions}><Button href="/request-service">Find a home pro</Button><a href={phoneTelHref(SITE.phone)}>Call {SITE.phone}</a><a href={`mailto:${SITE.email}`}>Email A5</a></div></section>
 </main>;}
