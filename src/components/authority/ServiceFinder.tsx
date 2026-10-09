'use client';
import {useId,useRef,useState} from 'react';
import Link from 'next/link';
import {HomeImage} from '@/components/HomeImage';
import {Button} from '@/components/Button';
import {matchesServiceSearch} from '@/lib/service-search';
import {ArrowIcon} from '@/components/ArrowIcon';
import styles from './ServiceDirectory.module.css';
export type ServiceChoice={id:string;name:string;path:string;request:string;alt:string;jobs:string[];problems:{title:string;path:string}[]};
export function ServiceFinder({services}:{services:ServiceChoice[]}){
 const [query,setQuery]=useState('');const id=useId();const input=useRef<HTMLInputElement>(null);
 const matches=services.filter(s=>matchesServiceSearch(s,query));
 return <section aria-label="Find a service">
  <label className={styles.search} htmlFor={id}>Find a service or repair<input ref={input} id={id} type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Try plumbing, a toilet or painting" aria-describedby={`${id}-status`}/></label>
  <div className={styles.searchMeta}><p id={`${id}-status`} role="status">{query.trim()?`${matches.length} matching ${matches.length===1?'service':'services'}`:`Browse all ${services.length} services`}</p>{query&&<button type="button" onClick={()=>{setQuery('');input.current?.focus();}}>Clear search</button>}</div>
  {!matches.length&&<div className={styles.empty}><h2>Not sure which service fits?</h2><p>Try a shorter search, or describe the problem in your request. We’ll help identify the next step.</p><Button href="/request-service">Describe your project</Button></div>}
  <div className={styles.grid}>{matches.map(s=><article className={styles.card} key={s.id}><Link href={s.path} className={styles.imageLink} aria-label={`Explore ${s.name.toLowerCase()}`}><HomeImage name={s.id} alt={s.alt}/></Link><div className={styles.cardBody}><h2><Link href={s.path}>{s.name} <ArrowIcon/></Link></h2><p>{s.jobs.slice(0,3).join(' · ')}</p><Link className={styles.cta} href={s.request} prefetch={false}>Request {s.name.toLowerCase()} <ArrowIcon/></Link><Link className={styles.guide} href={s.path}>Explore {s.name.toLowerCase()} services</Link>{s.problems.length>0&&<details className={styles.repairs}><summary>Common repairs &amp; advice</summary><ul className={styles.problems}>{s.problems.map(p=><li key={p.path}><Link href={p.path}>{p.title}</Link></li>)}</ul></details>}</div></article>)}</div>
 </section>;
}
