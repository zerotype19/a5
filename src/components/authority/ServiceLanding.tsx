import {COUNTIES, countyPath} from "@config/counties";
import { ArrowIcon } from "@/components/ArrowIcon";
import Link from 'next/link';
import { getServiceById, type ServiceId } from '@config/services';
import { getLocationById, type LocationId } from '@config/locations';
import { SITE } from '@config/site';
import { Button } from '@/components/Button';
import { HomeImage } from '@/components/HomeImage';
import { SERVICE_PRESENTATION } from '@/lib/home-services';
import { requestHref } from '@/lib/intake/context';
import { phoneTelHref } from '@/lib/phone';
import type { PublicContentPage } from '@/lib/authority/types';
import styles from './ServiceLanding.module.css';
export function ServiceLanding({page,children}:{page:PublicContentPage;children:React.ReactNode}) {
 const service = getServiceById(page.primary_service_id as ServiceId);
 if(!service) return children;
 const info = SERVICE_PRESENTATION[service.id];
 const location = page.primary_location_id ? getLocationById(page.primary_location_id as LocationId) : undefined;
 const href=requestHref({service:service.slug,location:location?.slug});
 return <>
 <section className={styles.hero}><div><p className={styles.eyebrow}>{service.name} · {location?`${location.name}, NJ`:'Northern New Jersey'}</p><h1>{page.h1}</h1><p className={styles.summary}>{location ? page.meta_description ?? info.summary : info.summary}</p><Button href={href} dataCta={`service-${service.id}-request`}>Request {service.name.toLowerCase()} service <ArrowIcon /></Button><a className={styles.phone} href={phoneTelHref(SITE.phone)} data-cta="service-call">Or call {SITE.phone}</a><p className={styles.note}>{location?.requestReviewRequired ? `Provider availability in ${location.name} is checked individually. A request does not confirm a match.` : "A5 coordinates the introduction. Discuss the estimate and work directly with the provider."}</p></div><figure><HomeImage name={service.id} alt={info.alt} priority/><figcaption>Illustrative image · not an A5 project photograph</figcaption></figure></section>
 <div className={styles.jobs}><p>Common requests</p><ul>{info.jobs.map(job=><li key={job}>{job}</li>)}</ul></div>
 <section className={styles.expect}><div><p className={styles.eyebrow}>A clear place to start</p><h2>Tell us about your project.</h2><p>{info.preparation}</p></div><div><h3>What happens next?</h3><p>A5 reviews your request and checks for an appropriate local provider. When there is a match, you discuss scope, timing and an estimate directly. Availability is confirmed after review.</p><p className={styles.boundary}>{info.boundary}</p></div></section>
 <div className={styles.editorial}><div className={styles.reading}><p className={styles.eyebrow}>Understand your options</p>{children}</div><aside className={styles.aside}><p className={styles.eyebrow}>Your next step</p><h2>Ready to get started?</h2><p>You don’t need a diagnosis. A description and optional photos are enough to start.</p><Button href={href} dataCta="service-sidebar-request">Request service <ArrowIcon /></Button><hr/><h3>Explore local services</h3><ul>{COUNTIES.map(l=><li key={l.id}><Link href={countyPath(l)}>{l.name}</Link></li>)}</ul><p className={styles.note}>Scheduled projects and repairs. A5 is not an emergency dispatch service.</p></aside></div>
 </>;
}
