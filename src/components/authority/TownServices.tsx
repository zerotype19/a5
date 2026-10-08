import {HomeImage} from '@/components/HomeImage';
import {SERVICE_PRESENTATION} from '@/lib/home-services';
import Link from 'next/link';
import {SERVICES} from '@config/services';
import {getLocationById,type LocationId} from '@config/locations';
import {getCountyById,countyPath} from '@config/counties';
import {requestHref} from '@/lib/intake/context';
import {ArrowIcon} from '@/components/ArrowIcon';
import styles from './TownServices.module.css';
const examples:Record<string,string>={handyman:'Doors, hardware, shelving and small repairs',masonry:'Brick steps, mortar, walkways and pavers',landscaping:'Yard cleanup, planting and bed refreshes',painting:'Interior rooms, trim and exterior surfaces',drywall:'Wall patches, ceiling repairs and damaged seams',tile:'Cracked tile, grout repairs and backsplashes',plumbing:'Toilets, faucets, fixtures and leaks',electrical:'Lights, outlets, switches and ceiling fans'};
export function TownServices({locationId}:{locationId:string}){
 const location=getLocationById(locationId as LocationId);if(!location)return null;
 const county=getCountyById(location.countyId)!;
 return <section className={styles.section} aria-labelledby="town-services"><p className={styles.area}><Link href={countyPath(county)}>{county.name}, New Jersey</Link></p><h2 id="town-services">What does your home need?</h2><p className={styles.intro}>Choose a service for your {location.name} project, or describe the work and we’ll help identify the next step. A5 reviews and forwards your request to a local vendor.</p><div className={styles.grid}>{SERVICES.map(s=><article key={s.id} className={styles.card}><HomeImage name={s.id} alt={SERVICE_PRESENTATION[s.id].alt}/><div><h3>{s.name}</h3><p>{examples[s.id]}</p><Link className={styles.cta} href={requestHref({service:s.id,location:location.id})}>Request {s.name.toLowerCase()} <ArrowIcon/></Link><Link className={styles.guide} href={`/services/${s.slug}`}>Explore projects and advice</Link></div></article>)}</div></section>;
}
