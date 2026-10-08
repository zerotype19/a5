'use client';
import {useId,useState} from 'react';
import {LOCATIONS,matchesLocationSearch} from '@config/locations';
import {COUNTIES} from '@config/counties';
import styles from './admin.module.css';
export function VendorLocationPicker({initialIds=[]}:{initialIds?:string[]}){
 const [selected,setSelected]=useState(initialIds);const [query,setQuery]=useState('');const [county,setCounty]=useState('');const id=useId();
 return <fieldset><legend>Towns</legend><p className={styles.mutedCopy}>{selected.length} selected. Only select confirmed provider coverage. Filtering preserves your selections.</p>
 {selected.map(value=><input key={value} type="hidden" name="locationIds" value={value}/>)}
 <div className={styles.formGrid}><label className={styles.fieldLabel} htmlFor={`${id}-search`}>Find a town<input id={`${id}-search`} type="search" value={query} onChange={e=>setQuery(e.target.value)}/></label><label className={styles.fieldLabel}>County<select value={county} onChange={e=>setCounty(e.target.value)}><option value="">All counties</option>{COUNTIES.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label></div>
 <div style={{maxHeight:'22rem',overflowY:'auto',padding:'.5rem'}}>{COUNTIES.filter(c=>!county||c.id===county).map(c=>{const towns=LOCATIONS.filter(l=>l.countyId===c.id&&matchesLocationSearch(l,query)&&(!l.legacyArea||initialIds.includes(l.id))).sort((a,b)=>a.name.localeCompare(b.name));return towns.length>0&&<fieldset key={c.id}><legend>{c.name}</legend><div className={styles.checkboxGrid}>{towns.map(l=><label key={l.id} className={styles.checkLabel}><input type="checkbox" checked={selected.includes(l.id)} onChange={e=>setSelected(old=>e.target.checked?[...old,l.id]:old.filter(v=>v!==l.id))}/>{l.name}{l.legacyArea?' (historical combined area)':''}</label>)}</div></fieldset>})}</div>
 </fieldset>;
}
