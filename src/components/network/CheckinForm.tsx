'use client';
import {useState} from 'react';
import {SubmitButton} from '@/components/admin/SubmitButton';
import {submitCheckin} from '@/lib/network/actions';
import styles from '@/components/vendor-signup/signup.module.css';
export function CheckinForm({token,party,accepted}:{token:string;party:'HOMEOWNER'|'VENDOR';accepted:boolean}){
 const [contact,setContact]=useState(''),[outcome,setOutcome]=useState('');
 const home=party==='HOMEOWNER';
 return <form action={submitCheckin} className={styles.panel}><input type="hidden" name="token" value={token}/>
 <fieldset><legend className={styles.legend}>{home?'Did the service professional get in touch?':'Were you able to reach the homeowner?'}</legend>{[['YES','Yes'],['NO','No'],['UNKNOWN','Not sure yet']].map(([value,label])=><label className={styles.check} key={value}><input type="radio" name="contact" value={value} required checked={contact===value} onChange={()=>{setContact(value);setOutcome('');}}/>{label}</label>)}</fieldset>
 <label className={styles.field}>What happened with this project?<select name="outcome" required value={outcome} onChange={e=>setOutcome(e.target.value)}><option value="">Choose an update</option><option value="PENDING">Still pending / I don’t know yet</option><option value="DISCUSSING">Discussing the project</option>{contact==='YES'&&<><option value="ESTIMATE">Estimate provided</option><option value="SCHEDULED">Work scheduled</option>{accepted&&<option value="COMPLETED">This provider completed the work</option>}</>}<option value="DID_NOT_PROCEED">Did not proceed with this provider</option></select></label>
 {home&&accepted&&contact==='YES'&&outcome==='COMPLETED'&&<label className={styles.field}>How would you rate the completed work? <span className={styles.optional}>Optional · private feedback for A5</span><select name="rating" defaultValue=""><option value="">Prefer not to rate</option>{[5,4,3,2,1].map(n=><option key={n} value={n}>{n} {n===1?'star':'stars'}</option>)}</select></label>}
 <label className={styles.field}>{home?'Anything else A5 should know?':'Lead feedback for A5'}<span className={styles.optional}>Optional</span><textarea name="note" rows={4} maxLength={2000} placeholder={home?'Tell us about the connection or the completed work.':'For example: scope mismatch, unable to reach homeowner, project postponed, or a useful introduction.'}/></label>
 {home&&<label className={styles.check}><input type="checkbox" name="helpRequested"/>I would like A5 to contact me about another introduction. This does not automatically share my request with another provider.</label>}
 <p className={styles.helper}>This update is private to A5 operations. It does not publish a review or automatically mark the job complete in A5’s records. To correct an update after submitting, contact hello@a5homeservices.com.</p>
 <SubmitButton className={styles.submit} pendingLabel="Saving…">Send update</SubmitButton></form>;
}
