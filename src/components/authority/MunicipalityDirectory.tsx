'use client';
import {useId,useState} from 'react';
import Link from 'next/link';
import {COUNTIES,type CountyId} from '@config/counties';
import {MUNICIPALITIES,matchesLocationSearch} from '@config/locations';
import {requestHref} from '@/lib/intake/context';
import styles from './MunicipalityDirectory.module.css';
export function MunicipalityDirectory({countyId,publishedHubSlugs=[]}:{countyId?:CountyId;publishedHubSlugs?:string[]}){
 const [query,setQuery]=useState('');const id=useId();
 const counties=COUNTIES.filter(c=>!countyId||c.id===countyId);
 const matches=MUNICIPALITIES.filter(l=>(!countyId||l.countyId===countyId)&&matchesLocationSearch(l,query));
 return <section id="municipalities" className={styles.directory} aria-labelledby={`${id}-heading`}>
  <h2 id={`${id}-heading`}>{countyId?'Find your municipality':'Find your town in North Jersey'}</h2>
  <p>Choose your municipality to start a request. A5 checks the location, project and provider availability before confirming next steps.</p>
  <label className={styles.search} htmlFor={`${id}-search`}>Search town or county<input id={`${id}-search`} type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="For example, Montclair or Bergen"/></label>
  <p className={styles.count} role="status">{matches.length} {matches.length===1?'municipality':'municipalities'}{query?' matching your search':''}</p>
  {matches.length===0&&<p>No matching municipality. Try the township or borough name, or <Link href="/request-service">send your ZIP code for review</Link>.</p>}
  {counties.map(c=>{const towns=matches.filter(l=>l.countyId===c.id).sort((a,b)=>a.name.localeCompare(b.name));return towns.length>0&&<div key={c.id} className={styles.county}><h3>{c.name}</h3><ul className={styles.towns}>{towns.map(l=><li key={l.id}><Link className={styles.request} href={requestHref({location:l.slug})} aria-label={`Request service in ${l.name}, ${c.name}`}>{l.name}<span>Request service</span></Link>{l.hubSlug&&publishedHubSlugs.includes(l.hubSlug)&&<Link className={styles.guide} href={`/home-services/${l.hubSlug}`}>{l.hubSlug==='chatham'?'Chatham area guide':'Local project guide'}</Link>}</li>)}</ul></div>})}
 </section>;
}
