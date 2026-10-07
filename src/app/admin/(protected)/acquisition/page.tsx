import {requireAdminAccess} from '@/lib/admin/authorize';
import {getSupabaseAdmin} from '@/lib/supabase/admin';
import styles from '@/components/admin/admin.module.css';
export const dynamic='force-dynamic';
export default async function AcquisitionPage(){
 await requireAdminAccess();
 if(process.env.ENABLE_LAUNCH_PIPELINE!=='true')return <><h1 className={styles.title}>Acquisition readiness</h1><p>Attribution and the alert queue are disabled. Apply and validate the launch migration before enabling the pipeline.</p></>;
 const db=getSupabaseAdmin();
 // This dynamic server query intentionally uses the request-time reporting window.
 // eslint-disable-next-line react-hooks/purity
 const since=new Date(Date.now()-30*86400000).toISOString();
 const [acq,queue]=await Promise.all([db.from('lead_acquisition').select('first_touch,leads(status,service_id)').gte('created_at',since).limit(1000),db.from('lead_notification_outbox').select('status,created_at').neq('status','SENT').limit(1000)]);
 if(acq.error||queue.error)return <><h1 className={styles.title}>Acquisition</h1><p>Data is unavailable. Check migration and connection status; unavailable data is not zero leads.</p></>;
 const groups=new Map<string,{leads:number;won:number}>();
 for(const row of acq.data??[]){const touch=row.first_touch as {campaign?:{utm_source?:string};referrerHost?:string};const source=touch.campaign?.utm_source||touch.referrerHost||'Direct / unknown';const count=groups.get(source)??{leads:0,won:0};count.leads++;const lead=Array.isArray(row.leads)?row.leads[0]:row.leads;if(lead?.status==='WON')count.won++;groups.set(source,count);}
 return <><h1 className={styles.title}>Acquisition</h1><p className={styles.lede}>Last 30 days · first-touch source and current won status. Client-reported attribution is not independently verified.</p><p>{queue.data?.length??0} unsent operations alerts need monitoring. Counts are capped at 1,000 rows; use an export for larger volumes.</p><section className={styles.section}><h2 className={styles.sectionTitle}>Attributed requests</h2>{groups.size?<table><thead><tr><th>First source</th><th>Requests</th><th>Currently won</th></tr></thead><tbody>{[...groups].map(([source,c])=><tr key={source}><td>{source}</td><td>{c.leads}</td><td>{c.won}</td></tr>)}</tbody></table>:<p>No attribution records in this window.</p>}</section><p>Qualified-lead cost, acquisition cost and contribution require reconciled spend and A5 income. Missing attribution is not assigned to organic search. Review the main dashboard and lead histories for operational stages.</p></>;
}
