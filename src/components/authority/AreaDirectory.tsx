import Link from 'next/link';
import {COUNTIES,countyPath} from '@config/counties';
import {PageIntro} from '@/components/templates/PageIntro';
import {MunicipalityDirectory} from './MunicipalityDirectory';
import {requestHref} from '@/lib/intake/context';
import type {ContentPageRecord} from '@/lib/authority/types';
import styles from './ServiceDirectory.module.css';
import template from '@/components/templates/templates.module.css';
export function AreaDirectory({pages}:{pages:ContentPageRecord[]}){
 const published=pages.filter(p=>p.status==='PUBLISHED'&&p.indexable);
 return <main className={template.page}><PageIntro eyebrow="North Jersey home services" title="Good help starts close to home." description="Explore eight counties and 226 municipalities. Find the right starting point for repairs, improvements and outdoor projects, then send one request for A5 to forward to a local vendor."/>
 <nav className={styles.switcher} aria-label="Browse home services"><Link href="/services">By service</Link><Link href="/home-services" aria-current="page">By town</Link><Link href="/guides">Planning guides</Link><a href="#municipalities">Find your town</a></nav>
 <div className={styles.grid}>{COUNTIES.map(c=>{const hub=published.find(p=>p.page_type==='CORE'&&p.slug===c.slug);return <section key={c.id} className={styles.card}><h2>{hub?<Link href={countyPath(c)}>{c.name}</Link>:c.name}</h2><p>{hub?.meta_description??`Browse ${c.municipalityCount} municipalities and send a project request for review.`}</p><Link className={styles.cta} href={hub?countyPath(c):requestHref({county:c.id})}>{hub?'Explore towns and project planning':'Request service'}</Link></section>})}</div>
 <MunicipalityDirectory publishedHubSlugs={pages.filter(p=>p.status==='PUBLISHED'&&p.page_type==='LOCATION').map(p=>p.slug)}/></main>;
}
