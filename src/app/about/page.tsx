import type {Metadata} from 'next';
import Link from 'next/link';
import {SITE} from '@config/site';
import {Button} from '@/components/Button';
import {HomeImage} from '@/components/HomeImage';
import {PageIntro} from '@/components/templates/PageIntro';
import {phoneTelHref} from '@/lib/phone';
import template from '@/components/templates/templates.module.css';
import styles from '@/components/templates/network.module.css';
export const metadata:Metadata={title:'About A5',description:'A5 helps Northern New Jersey homeowners explain a repair and connect with an appropriate local service provider.',alternates:{canonical:'/about'}};
export default function AboutPage(){return <main className={`${template.page} ${styles.page}`}>
 <div className={styles.hero}><div><PageIntro eyebrow="Your Northern New Jersey home services network" title="A simpler way to get things fixed." description="A5 connects homeowners with independent local professionals for repairs, maintenance, cleaning and improvements. One place to start when your home needs attention."/><div className={styles.actions}><Button href="/request-service">Request service</Button><Link href="/how-it-works">See how it works</Link></div></div><HomeImage name="hero" priority alt="A welcoming home entrance with a green door and garden planting"/></div>
 <section className={styles.section} aria-labelledby="roles-heading"><h2 id="roles-heading">A local connection, with clear roles.</h2><div className={styles.grid}><div className={styles.card}><h3>A5 helps you get started</h3><p>Tell us what needs attention. We review your service and location and look for a relevant professional in the network.</p><p>You don’t need to know which trade to choose. Describe the problem in your own words.</p></div><div className={styles.card}><h3>You choose what happens next</h3><p>When a professional accepts, you discuss the scope, estimate and timing directly with them. You decide whether to proceed.</p><p>A5 makes the introduction. Independent professionals perform and manage the work.</p></div></div></section>
 <section className={styles.section} aria-labelledby="network-heading"><h2 id="network-heading">Built around your home and your next step.</h2><div className={styles.grid}><div className={styles.card}><h3>Help close to home</h3><p>Explore services across Northern New Jersey. Your town and the work you need help us identify an appropriate connection.</p><p><Link href="/home-services">Find your town</Link></p></div><div className={styles.card}><h3>Your details stay off the public site</h3><p>Your full request, contact details and optional photos are shared with a professional after they accept the opportunity.</p><p><Link href="/privacy">How we handle your information</Link></p></div></div></section>
 <section className={styles.cta}><h2>Start with what needs fixing.</h2><p>Send a request, or get in touch if you would rather talk through the next step.</p><div className={styles.actions}><Button href="/request-service">Request service</Button><a href={phoneTelHref(SITE.phone)}>Call {SITE.phone}</a><a href={`mailto:${SITE.email}`}>Email A5</a></div></section>
 </main>;}
