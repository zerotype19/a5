'use client';
import {useId,useRef,useState} from 'react';
import Link from 'next/link';
import {COUNTIES,countyPath,type CountyId} from '@config/counties';
import {MUNICIPALITIES,type Location} from '@config/locations';
import {requestHref} from '@/lib/intake/context';
import {ArrowIcon} from '@/components/ArrowIcon';
import styles from './MunicipalityDirectory.module.css';
export function MunicipalityDirectory({countyId,publishedHubSlugs=[],publishedCountySlugs=[]}:{countyId?:CountyId;publishedHubSlugs?:string[];publishedCountySlugs?:string[]}){
 const [query,setQuery]=useState('');const id=useId();const search=useRef<HTMLInputElement>(null);
 const counties=COUNTIES.filter(c=>!countyId||c.id===countyId);
 const terms=query.toLowerCase().replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(Boolean);
 const matches=MUNICIPALITIES.filter(l=>(!countyId||l.countyId===countyId)&&terms.every(term=>`${l.name} ${l.countyId} County`.toLowerCase().includes(term))).sort((a,b)=>a.name.localeCompare(b.name));
 const searching=query.trim().length>0;
 function townLink(l:Location){
  const hub=publishedHubSlugs.includes(l.slug)?l.slug:l.hubSlug&&publishedHubSlugs.includes(l.hubSlug)?l.hubSlug:null;
  const county=COUNTIES.find(c=>c.id===l.countyId);
  return <li key={l.id}><Link className={styles.town} href={hub?`/home-services/${hub}`:requestHref({location:l.slug})}><span><strong>{l.name}</strong><small>{county?.name} · {hub?'View local services':'Request service'}</small></span><ArrowIcon/></Link></li>;
 }
 return <section id="municipalities" className={styles.directory} aria-labelledby={`${id}-heading`}>
  <h2 id={`${id}-heading`}>{countyId?'Find your town':'Where do you need help?'}</h2>
  <label className={styles.search} htmlFor={`${id}-search`}>Search by town or county
   <input ref={search} id={`${id}-search`} type="search" autoComplete="off" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Try Florham Park or Morris County" aria-describedby={`${id}-hint`}/>
  </label>
  <div className={styles.searchMeta}><p id={`${id}-hint`} role="status" aria-live="polite">{searching?`${matches.length} ${matches.length===1?'town':'towns'} found`:'Search above, or choose a county below.'}</p>{searching&&<button type="button" onClick={()=>{setQuery('');search.current?.focus();}}>Clear search</button>}</div>
  {searching ? <div className={styles.results}>{matches.length ? <ul className={styles.towns}>{matches.map(townLink)}</ul>:<div className={styles.empty}><h3>No towns found</h3><p>Try a shorter town name or clear your search to browse counties.</p><Link href="/request-service">Can’t find your town? Send us your project and location <ArrowIcon/></Link></div>}</div>:
   <div className={styles.counties}>{counties.map(c=>{const towns=matches.filter(l=>l.countyId===c.id);return <details key={c.id} className={styles.county} open={countyId?true:undefined}><summary><span>{c.name}<small>{towns.length} towns</small></span></summary><div className={styles.countyBody}>{publishedCountySlugs.includes(c.slug)&&<Link className={styles.countyGuide} href={countyPath(c)}>Explore {c.name} services <ArrowIcon/></Link>}<ul className={styles.towns}>{towns.map(townLink)}</ul></div></details>})}</div>}
 </section>;
}
