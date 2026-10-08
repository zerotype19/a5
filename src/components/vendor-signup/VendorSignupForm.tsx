'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { SERVICES } from '@config/services';
import { MUNICIPALITIES, matchesLocationSearch } from '@config/locations';
import { COUNTIES } from '@config/counties';
import { SIGNUP_CONSENT, setCountyCoverage, validateSignup, type SignupErrors } from '@/lib/vendor-signup/validation';
import { TurnstileWidget } from '@/components/intake/TurnstileWidget';
import styles from './signup.module.css';

const steps=['Business details','Services & towns','Review & submit'];
export function VendorSignupForm({siteKey}:{siteKey:string|null}){
  const [step,setStep]=useState(0),[data,setData]=useState({businessName:'',contactName:'',email:'',phone:'',website:'',notes:'',consent:false,serviceIds:[] as string[],locationIds:[] as string[]});
  const [query,setQuery]=useState(''),[selectedOnly,setSelectedOnly]=useState(false),[errors,setErrors]=useState<SignupErrors>({});
  const [message,setMessage]=useState(''),[busy,setBusy]=useState(false),[done,setDone]=useState(false),[token,setToken]=useState<string|null>(null),[securityAttempt,setSecurityAttempt]=useState(0);
  const previousView=useRef({step:0,done:false});
  const key=useRef(''),heading=useRef<HTMLHeadingElement>(null),fax=useRef<HTMLInputElement>(null);
  useEffect(()=>{if(previousView.current.step!==step||previousView.current.done!==done)heading.current?.focus();previousView.current={step,done};},[step,done]);
  function update(name:string,value:string|boolean){setData(old=>({...old,[name]:value}));setErrors(old=>({...old,[name]:''}));}
  function field(name:'businessName'|'contactName'|'email'|'phone'|'website',label:string,type='text',required=false){return <label className={styles.field} htmlFor={`signup-${name}`}>{label}{!required&&<span className={styles.optional}>Optional</span>}<input id={`signup-${name}`} name={name} type={type} required={required} value={data[name]} autoComplete={({businessName:'organization',contactName:'name',email:'email',phone:'tel',website:'url'})[name]} maxLength={name==='email'?200:name==='website'?300:name==='phone'?32:160} onChange={e=>update(name,e.target.value)} aria-label={label} aria-invalid={!!errors[name]} aria-describedby={errors[name]?`error-${name}`:undefined}/>{errors[name]&&<span id={`error-${name}`} className={styles.error}>{errors[name]}</span>}</label>;}
  function move(next:number){setMessage('');setErrors({});setStep(next);}
  function checkStep(){
    const result=validateSignup(data);const keys=step===0?['businessName','contactName','email','phone','website']:step===1?['serviceIds','locationIds','notes']:['consent'];
    const relevant=result.ok?{}:Object.fromEntries(Object.entries(result.errors).filter(([name])=>keys.includes(name)));
    if(Object.keys(relevant).length){setErrors(relevant);setMessage('Check the highlighted fields before continuing.');return false;}
    return true;
  }
  async function submit(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();if(busy)return;
    if(!checkStep())return;
    if(step<2){move(step+1);return;}
    const result=validateSignup(data);if(!result.ok){setErrors(result.errors);setMessage('Review the highlighted fields.');return;}
    if(siteKey&&!token){setMessage('Complete the security check before submitting.');return;}
    if(!key.current)key.current=crypto.randomUUID();
    setBusy(true);setMessage('');
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),25000);
    try{
      const response=await fetch('/api/vendor-signup',{method:'POST',headers:{'content-type':'application/json','idempotency-key':key.current},body:JSON.stringify({...result.data,turnstileToken:token,companyFax:fax.current?.value??''}),signal:controller.signal});
      const body=await response.json();
      if(response.ok&&body.success){setDone(true);return;}
      setErrors(body.errors??{});setMessage(body.message??'We could not confirm receipt. Please try again.');
      if(body.errors){setStep(Object.keys(body.errors).some(k=>['businessName','contactName','email','phone','website'].includes(k))?0:1);}
    }catch{setMessage('We could not confirm receipt. Your entries are still here. Please retry; duplicate clicks will not create duplicate submissions.');}
    finally{clearTimeout(timeout);setBusy(false);setToken(null);setSecurityAttempt(n=>n+1);}
  }
  if(done)return <section className={styles.receipt}><p className={styles.eyebrow}>Signup received</p><h2 ref={heading} tabIndex={-1}>You’re on our list to review.</h2><p>We received the details for <strong>{data.businessName}</strong>, including {data.serviceIds.length} {data.serviceIds.length===1?'service':'services'} and {data.locationIds.length} {data.locationIds.length===1?'town':'towns'}.</p><p>A5 will review your information and add it to our vendor records or connect it to an existing record. Project requests are sent to the business email you provided. Signup does not guarantee assignments.</p><p>Need to make a change? Email <a href="mailto:hello@a5homeservices.com">hello@a5homeservices.com</a>.</p><Link href="/">Back to A5 Home Services</Link></section>;
  return <form className={styles.form} onSubmit={submit} noValidate>
    <ol className={styles.steps} aria-label="Signup progress">{steps.map((label,index)=><li key={label} aria-current={step===index?'step':undefined}><span>{index+1}</span>{label}</li>)}</ol>
    <h2 ref={heading} tabIndex={-1}>{steps[step]}</h2>
    <p className={styles.helper}>Step {step+1} of 3. Fields are required unless marked optional.</p>
    {message&&<p role="alert" className={styles.alert}>{message}</p>}
    <fieldset disabled={busy} className={styles.panel}>
      <legend className="srOnly">{steps[step]}</legend>
      {step===0&&<><div className={styles.fields}>{field('businessName','Business name','text',true)}{field('contactName','Your name','text',true)}{field('email','Email for project requests','email',true)}{field('phone','Business phone','tel')}{field('website','Business website')}</div><p className={styles.helper}>Use an inbox your team checks. A5 forwards project requests by email. No account or password is needed.</p></>}
      {step===1&&<>
        <fieldset><legend className={styles.legend}>Which services do you provide?</legend><div className={styles.checkGrid}>{SERVICES.map(s=><label className={styles.check} key={s.id}><input type="checkbox" checked={data.serviceIds.includes(s.id)} onChange={e=>setData(old=>({...old,serviceIds:e.target.checked?[...old.serviceIds,s.id]:old.serviceIds.filter(id=>id!==s.id)}))}/>{s.name}</label>)}</div>{errors.serviceIds&&<p className={styles.error} role="alert">{errors.serviceIds}</p>}</fieldset>
        <fieldset><legend className={styles.legend}>Where do you work?</legend><p className={styles.helper}>Select whole counties, or open a county to choose individual towns. Your selected services apply to all selected towns. Add any exceptions in the notes below.</p>
          <div className={styles.tools}><label className={styles.field}>Find a town<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Town or county"/></label><label className={styles.check}><input type="checkbox" checked={selectedOnly} onChange={e=>setSelectedOnly(e.target.checked)}/>Show selected towns only</label></div>
          <p className={styles.count} aria-live="polite">{data.locationIds.length} of {MUNICIPALITIES.length} towns selected</p>
          <div className={styles.tools}><button type="button" onClick={()=>setData(old=>({...old,locationIds:MUNICIPALITIES.map(t=>t.id)}))}>Select all Northern NJ towns</button><button type="button" disabled={!data.locationIds.length} onClick={()=>setData(old=>({...old,locationIds:[]}))}>Clear all towns</button></div>
          <div className={styles.counties}>{COUNTIES.map(c=>{
            const all=MUNICIPALITIES.filter(t=>t.countyId===c.id),count=all.filter(t=>data.locationIds.includes(t.id)).length;
            const visible=all.filter(t=>matchesLocationSearch(t,query)&&(!selectedOnly||data.locationIds.includes(t.id))).sort((a,b)=>a.name.localeCompare(b.name));
            if((query||selectedOnly)&&!visible.length)return null;
            return <details key={`${c.id}-${!!query}-${selectedOnly}`} open={query||selectedOnly?true:undefined} className={styles.county}><summary>{c.name}<span>{count} / {all.length} towns</span></summary><div className={styles.countyBody}><div className={styles.tools}><button type="button" onClick={()=>setData(old=>({...old,locationIds:setCountyCoverage(old.locationIds,c.id,true)}))}>Select all {c.name} towns</button><button type="button" disabled={!count} onClick={()=>setData(old=>({...old,locationIds:setCountyCoverage(old.locationIds,c.id,false)}))}>Clear {c.name}</button></div><div className={styles.checkGrid}>{visible.map(t=><label key={t.id} className={styles.check}><input type="checkbox" checked={data.locationIds.includes(t.id)} onChange={e=>setData(old=>({...old,locationIds:e.target.checked?[...old.locationIds,t.id]:old.locationIds.filter(id=>id!==t.id)}))}/>{t.name}</label>)}</div></div></details>;
          })}</div>
          {!MUNICIPALITIES.some(t=>matchesLocationSearch(t,query)&&(!selectedOnly||data.locationIds.includes(t.id)))&&<p className={styles.helper}>No towns match this view. Clear the search or turn off “selected towns only.”</p>}
          {errors.locationIds&&<p className={styles.error} role="alert">{errors.locationIds}</p>}
        </fieldset>
        <label className={styles.field}>Project preferences or service-area exceptions <span className={styles.optional}>Optional</span><textarea rows={4} maxLength={2000} value={data.notes} onChange={e=>update('notes',e.target.value)} placeholder="For example: interior painting only; tile projects in Bergen County only. No customer information, please."/><span className={styles.helper}>These are notes for A5’s manual review, not automatic routing rules. {data.notes.length}/2000</span>{errors.notes&&<span className={styles.error}>{errors.notes}</span>}</label>
      </>}
      {step===2&&<>
        <section className={styles.review}><div className={styles.reviewHeading}><h3>Business & contact</h3><button type="button" onClick={()=>move(0)}>Edit details</button></div><p><strong>{data.businessName}</strong><br/>{data.contactName}<br/>{data.email}{data.phone&&<><br/>{data.phone}</>}{data.website&&<><br/>{data.website}</>}</p></section>
        <section className={styles.review}><div className={styles.reviewHeading}><h3>Services & coverage</h3><button type="button" onClick={()=>move(1)}>Edit coverage</button></div><p>{SERVICES.filter(s=>data.serviceIds.includes(s.id)).map(s=>s.name).join(', ')}</p><p><strong>{data.locationIds.length} towns</strong> · The services above apply across these towns.</p>{COUNTIES.map(c=>{const towns=MUNICIPALITIES.filter(t=>t.countyId===c.id&&data.locationIds.includes(t.id));return towns.length>0&&<details key={c.id}><summary>{c.name} · {towns.length} towns</summary><p>{towns.map(t=>t.name).sort().join(', ')}</p></details>;})}{data.notes&&<p className={styles.notes}>{data.notes}</p>}</section>
        <label className={styles.check}><input type="checkbox" checked={data.consent} onChange={e=>update('consent',e.target.checked)} aria-invalid={!!errors.consent} aria-describedby={errors.consent?"signup-consent-error":undefined}/>{SIGNUP_CONSENT}</label>{errors.consent&&<p id="signup-consent-error" className={styles.error}>{errors.consent}</p>}
        <p className={styles.helper}>We keep your signup in our private operations database. See <Link href="/privacy">Privacy</Link>. Contact A5 to update your details or stop receiving requests.</p>
        {siteKey&&<TurnstileWidget key={securityAttempt} siteKey={siteKey} onToken={setToken}/>}
      </>}
      <div className={styles.trap} aria-hidden="true"><label>Company fax<input ref={fax} name="companyFax" tabIndex={-1} autoComplete="off"/></label></div>
      <div className={styles.actions}>{step>0&&<button type="button" className={styles.back} onClick={()=>move(step-1)}>Back</button>}<button type="submit" className={styles.submit} disabled={busy}>{busy?'Submitting…':step===2?'Submit vendor signup':'Continue'}</button></div>
    </fieldset>
  </form>;
}
