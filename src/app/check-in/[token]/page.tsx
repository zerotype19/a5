import type {Metadata} from 'next';
import {loadCheckin} from '@/lib/network/checkin';
import {stopCheckins} from '@/lib/network/actions';
import {CheckinForm} from '@/components/network/CheckinForm';
import {SubmitButton} from '@/components/admin/SubmitButton';
import styles from '@/components/vendor-signup/signup.module.css';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Your A5 connection',robots:{index:false,follow:false,noarchive:true},referrer:'no-referrer'};
export default async function CheckinPage({params,searchParams}:{params:Promise<{token:string}>;searchParams:Promise<{error?:string;stopped?:string}>}){
 const {token}=await params,p=await searchParams,view=await loadCheckin(token);
 return <main className={styles.page}><div style={{maxWidth:'42rem',margin:'auto'}}><p className={styles.eyebrow}>A5 Home Services Network</p><h1>How did the connection go?</h1>{!view?<section className={styles.receipt}><h2>This check-in link is unavailable.</h2><p>It may have expired or been replaced. Email <a href="mailto:hello@a5homeservices.com">hello@a5homeservices.com</a> for help.</p></section>:<section className={styles.receipt}><p>{view.service} · {view.town} · {view.vendorName}</p>{p.error&&<p role="alert" className={styles.alert}>{p.error}</p>}{view.stopped&&view.party==='HOMEOWNER'&&<p role="status">Further check-in emails for this request are stopped. You can still leave an update here.</p>}{view.submitted?<><h2>Thank you. Your update is recorded.</h2><p>A5 can use this feedback to follow up on the connection. Contact and completion reports are recorded separately; a report does not guarantee further work or an immediate response.</p></>:<CheckinForm token={token} party={view.party} accepted={view.accepted}/>}{view.party==='HOMEOWNER'&&!view.stopped&&<form action={stopCheckins} style={{marginTop:'2rem'}}><input type="hidden" name="token" value={token}/><SubmitButton className={styles.back}>Stop check-in emails for this request</SubmitButton></form>}</section>}</div></main>;
}
