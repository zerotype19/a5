import {AreaDirectory} from './AreaDirectory';
import Link from 'next/link';
import {SERVICES} from '@config/services';
import {fetchPublishedPages} from '@/lib/authority/query';
import {PageIntro} from '@/components/templates/PageIntro';
import {Button} from '@/components/Button';
import {requestHref} from '@/lib/intake/context';
import {SERVICE_PRESENTATION} from '@/lib/home-services';
import type {ContentPageRecord} from '@/lib/authority/types';
import {ServiceFinder} from './ServiceFinder';
import styles from './ServiceDirectory.module.css';
import template from '@/components/templates/templates.module.css';
export async function ServiceDirectory({by,records}:{by:'service'|'town';records?:ContentPageRecord[]}){
 const pages=(records??await fetchPublishedPages()).filter(p=>p.status==='PUBLISHED');
 if(by==='town')return <AreaDirectory pages={pages}/>;
 const published=pages.filter(p=>p.indexable);
 return <main className={`${template.page} ${styles.page}`}><PageIntro eyebrow="Repairs, maintenance and improvements" title="What does your home need?" description="Choose a service below, or search for the repair you have in mind. You can explore your options or send a request right away."/>
  <ServiceFinder services={SERVICES.map(s=>({id:s.id,name:s.name,path:`/services/${s.slug}`,request:requestHref({service:s.id}),alt:SERVICE_PRESENTATION[s.id].alt,jobs:SERVICE_PRESENTATION[s.id].jobs,problems:published.filter(p=>p.page_type==='PROBLEM'&&p.primary_service_id===s.id).map(p=>({title:p.h1,path:`/services/${s.id}/${p.slug}`}))}))}/>
  <aside className={styles.help}><div><h2>Not sure who to call?</h2><p>Describe what needs attention. A5 will review your request and look for a relevant professional in the network.</p></div><Button href="/request-service">Describe your project</Button></aside>
  <nav className={styles.links} aria-label="More ways to find help"><Link href="/home-services">Find services in your town</Link><Link href="/how-it-works">How A5 works</Link><Link href="/guides">Project planning guides</Link></nav>
 </main>;
}
