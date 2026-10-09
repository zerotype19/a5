import Link from 'next/link';
import {PageIntro} from '@/components/templates/PageIntro';
import {MunicipalityDirectory} from './MunicipalityDirectory';
import {Button} from '@/components/Button';
import type {ContentPageRecord} from '@/lib/authority/types';
import styles from './AreaDirectory.module.css';
import template from '@/components/templates/templates.module.css';
export function AreaDirectory({pages}:{pages:ContentPageRecord[]}){
 return <main className={`${template.page} ${styles.page}`}>
  <PageIntro eyebrow="Home services across Northern New Jersey" title="Find help in your town." description="Find your town to explore local services, or tell us what needs fixing and we’ll help you take the next step."/>
  <MunicipalityDirectory publishedHubSlugs={pages.filter(p=>p.status==='PUBLISHED'&&p.page_type==='LOCATION').map(p=>p.slug)} publishedCountySlugs={pages.filter(p=>p.status==='PUBLISHED'&&p.page_type==='CORE'&&p.indexable).map(p=>p.slug)}/>
  <aside className={styles.help} aria-labelledby="area-help-heading"><div><h2 id="area-help-heading">Already know what you need?</h2><p>You don’t need to browse every town or know which trade to choose. Describe the job and include your location.</p></div><Button href="/request-service">Request service</Button></aside>
  <nav className={styles.links} aria-label="More ways to find help"><Link href="/services">Browse all services</Link><Link href="/guides">Read project planning guides</Link></nav>
 </main>;
}
