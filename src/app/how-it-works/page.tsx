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
 ['Tell us what needs attention','Choose a service or select “Not sure.” Describe the job, share your location and preferred timing, and add photos if they help.'],
 ['A5 looks for a relevant professional','We review the service and location, then offer the opportunity to an independent professional in the network.'],
 ['Discuss the work directly','After a professional accepts, they can view your full request and contact details. Talk with them about the scope, estimate and timing, and decide whether to go ahead.'],
 ['Let us know how it went','We may ask whether you heard from the professional and how the project went. Your updates help us follow up on connections that didn’t work out.'],
];
export default function HowItWorksPage(){return <main className={`${template.page} ${styles.page}`}>
 <PageIntro eyebrow="How A5 works" title="One request. A clear next step." description="Tell us what needs fixing. A5 helps you connect with an independent local professional, and you arrange the work directly with them."/>
 <div className={styles.actions}><Button href="/request-service">Request service</Button><Link href="/services">Explore services</Link></div>
 <section className={styles.section} aria-labelledby="process-heading"><h2 id="process-heading">From your project list to a conversation.</h2><ol className={styles.steps}>{steps.map(([title,body],i)=><li className={styles.card} key={title}><span className={styles.number} aria-hidden="true">{i+1}</span><h3>{title}</h3><p>{body}</p></li>)}</ol><p className={styles.note}>A request starts a conversation. A suitable connection or response is not guaranteed. It does not book an appointment or commit you to a quote. A5 makes the introduction; the independent professional handles the estimate, scheduling and work.</p></section>
 <section className={styles.section} aria-labelledby="prepare-heading"><h2 id="prepare-heading">You don’t need a perfect project brief.</h2><div className={styles.grid}><div className={styles.card}><h3>A few details are enough</h3><p>What is happening, where the job is, and when you hope to start. Mention whether you want a repair, a replacement or help figuring that out.</p></div><div className={styles.card}><h3>Photos can help explain it</h3><p>Add a wider view and a close-up if useful. Photos are optional and are shared with the professional after they accept; they are not published on the website.</p></div></div></section>
 <section className={styles.section} aria-labelledby="questions-heading"><h2 id="questions-heading">Before you send a request.</h2>{HOME_FAQ.map(f=><details className={styles.faq} key={f.question}><summary>{f.question}</summary><p>{f.answer}</p></details>)}</section>
 <section className={styles.cta}><h2>What can we help you with?</h2><p>Start with the problem in your own words. We’ll help identify the next step.</p><div className={styles.actions}><Button href="/request-service">Tell us what needs fixing</Button><a href={phoneTelHref(SITE.phone)}>Call {SITE.phone}</a></div></section>
 </main>;}
