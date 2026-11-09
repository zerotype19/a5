import type {Metadata} from 'next';
import Link from 'next/link';
import {Button} from '@/components/Button';
import {PageIntro} from '@/components/templates/PageIntro';
import {HOME_FAQ} from '@/lib/home-services';
import {SITE} from '@config/site';
import {phoneTelHref} from '@/lib/phone';
import record from '../../../content/core-pages/how-it-works.json';
import template from '@/components/templates/templates.module.css';
import styles from '@/components/templates/network.module.css';
export const metadata:Metadata={title:record.title,description:record.description,alternates:{canonical:record.canonical}};
const steps=[
 ['Tell us what you need','Describe your project, whether it’s plumbing, painting, landscaping or a simple repair.'],
 ['We connect you with a local pro','We review your request and look for a local service provider who handles that type of work.'],
 ['Get your project moving','Once a pro accepts your request, discuss pricing, scheduling and project details directly. You decide whether to hire.'],
];
export default function HowItWorksPage(){return <main className={`${template.page} ${styles.page}`}>
 <PageIntro eyebrow="How A5 works" title="Find the right pro for your home project." description="Tell us what you need, and we’ll help find a local pro for the job. Free to request. No obligation to hire."/>
 <div className={styles.actions}><Button href="/request-service">Find a home pro</Button><Link href="/services">Explore services</Link></div>
 <section className={styles.section} aria-labelledby="process-heading"><h2 id="process-heading">How it works</h2><ol className={styles.steps}>{steps.map(([title,body],i)=><li className={styles.card} key={title}><span className={styles.number} aria-hidden="true">{i+1}</span><h3>{title}</h3><p>{body}</p></li>)}</ol></section>
 <section className={styles.section} aria-labelledby="questions-heading"><h2 id="questions-heading">Before you send a request.</h2>{HOME_FAQ.map(f=><details className={styles.faq} key={f.question}><summary>{f.question}</summary><p>{f.answer}</p></details>)}</section>
 <section className={styles.cta}><h2>What can we help you with?</h2><p>Tell us what you need, and we’ll help find a pro for the job.</p><div className={styles.actions}><Button href="/request-service">Find a home pro</Button><a href={phoneTelHref(SITE.phone)}>Call {SITE.phone}</a></div></section>
 </main>;}
