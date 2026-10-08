import Image from 'next/image';
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
 return <section className={styles.section} aria-labelledby="town-services"><p className={styles.area}><Link href={countyPath(county)}>{county.name}, New Jersey</Link></p><h2 id="town-services">What does your home need?</h2><p className={styles.intro}>Choose a service for your {location.name} project, or describe the work and we’ll help identify the next step. Availability is reviewed for each request.</p><div className={styles.grid}>{SERVICES.map(s=><article key={s.id} className={styles.card}><Image src={`/images/${s.id}.webp`} width={480} height={320} loading={s.id==='handyman'?'eager':'lazy'} alt={`Illustration for ${s.name.toLowerCase()} project planning`} sizes="(max-width:600px) 100vw, (max-width:1000px) 50vw, 25vw"/><div><h3>{s.name}</h3><p>{examples[s.id]}</p><Link className={styles.cta} href={requestHref({service:s.id,location:location.id})}>Request {s.name.toLowerCase()} <ArrowIcon/></Link><Link className={styles.guide} href={`/services/${s.slug}`}>Explore projects and advice</Link></div></article>)}</div><p className={styles.caption}>Service images are illustrative, not photographs of A5 projects.</p></section>;
}
