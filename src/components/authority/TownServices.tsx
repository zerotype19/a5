import {HomeImage} from '@/components/HomeImage';
import {SERVICE_PRESENTATION} from '@/lib/home-services';
import Link from 'next/link';
import {SERVICES,type ServiceId} from '@config/services';
import {getLocationById,type LocationId} from '@config/locations';
import {getCountyById,countyPath} from '@config/counties';
import {requestHref} from '@/lib/intake/context';
import {ArrowIcon} from '@/components/ArrowIcon';
import styles from './TownServices.module.css';
const examples:Record<ServiceId,string>={handyman:'Doors, hardware, shelving and small repairs',masonry:'Brick steps, mortar, walkways and pavers',landscaping:'Yard cleanup, planting and bed refreshes',painting:'Interior rooms, trim and exterior surfaces',drywall:'Wall patches, ceiling repairs and damaged seams',tile:'Cracked tile, grout repairs and backsplashes',plumbing:'Toilets, faucets, fixtures and leaks',electrical:'Lights, outlets, switches and ceiling fans',hvac:'Heating repairs, cooling problems and equipment replacement',roofing:'Roof leaks, damaged shingles and replacement planning','house-cleaning':'Regular cleaning, deep cleans and move-related cleaning',gutters:'Gutter cleaning, leaks, loose sections and downspouts','pest-control':'Pest identification, treatment and prevention','junk-removal':'Furniture, bulky items and project debris removal','tree-services':'Tree assessment, trimming and removal','appliance-repair':'Diagnosis and repairs for household appliances'};
export function TownServices({locationId}:{locationId:string}){
 const location=getLocationById(locationId as LocationId);if(!location)return null;
 const county=getCountyById(location.countyId)!;
 return <section className={styles.section} aria-labelledby="town-services"><p className={styles.area}><Link href={countyPath(county)}>{county.name}, New Jersey</Link></p><h2 id="town-services">What does your home need?</h2><p className={styles.intro}>Choose a service for your {location.name} home. If you are unsure which one fits, describe the problem in your request and we’ll help identify the next step.</p><div className={styles.grid}>{SERVICES.map(s=><article key={s.id} className={styles.card}><HomeImage name={s.id} alt={SERVICE_PRESENTATION[s.id].alt}/><div><h3>{s.name}</h3><p>{examples[s.id]}</p><Link className={styles.cta} href={requestHref({service:s.id,location:location.id})}>Request {s.name.toLowerCase()} <ArrowIcon/></Link><Link className={styles.guide} href={`/services/${s.slug}`}>Explore projects and advice</Link></div></article>)}</div></section>;
}
