import { ArrowIcon } from '@/components/ArrowIcon';
import Link from 'next/link';
import { requireAdminAccess } from '@/lib/admin/authorize';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { readAllRows } from '@/lib/admin/read-all';
import { buildAcquisitionReport,type AcquisitionLead } from '@/lib/marketing/acquisition-report';
import { SERVICES } from '@config/services';
import { LOCATIONS } from '@config/locations';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import styles from '@/components/admin/admin.module.css';
export const dynamic = 'force-dynamic';
export default async function AcquisitionPage() {
 await requireAdminAccess();
 const header=<AdminPageHeader title="Acquisition" description="See which channels, landing pages and service areas produce requests. Cohort: requests created in the last 30 days; archived tests are excluded."/>;
 if(process.env.ENABLE_LAUNCH_PIPELINE!=='true')return <>{header}<p className={styles.empty}>Acquisition reporting is not enabled in this environment.</p></>;
 const db=getSupabaseAdmin();
 // eslint-disable-next-line react-hooks/purity
 const since=new Date(Date.now()-30*86400000).toISOString();
 let leads:AcquisitionLead[];let unsent:number;
 try{
  const results=await Promise.all([
   readAllRows<AcquisitionLead>((a,b)=>db.from('leads').select('id,status,service_id,location_id,first_landing_page,lead_acquisition(first_touch)').is('archived_at',null).gte('created_at',since).order('id').range(a,b),'acquisition'),
   db.from('lead_notification_outbox').select('id,leads!inner(id)',{count:'exact',head:true}).is('leads.archived_at',null).eq('kind','operations_new_lead').neq('status','SENT'),
  ]);
  if(results[1].error)throw results[1].error;leads=results[0];unsent=results[1].count??0;
 }catch{return <>{header}<p className={styles.flashError} role="alert">Reporting is temporarily unavailable. No counts are shown because the data could not be loaded.</p><Link href="/admin/leads">Return to leads</Link></>;}
 const groups=buildAcquisitionReport(leads);
 return <>{header}
  <section className={styles.section} aria-label="Operations email queue"><div className={styles.attention}><strong>{unsent} unsent operations alerts</strong><p>Check delivery and follow up on delayed requests.</p><Link href="/admin/queue">Open work queue <ArrowIcon direction="up-right"/></Link></div></section>
  <section className={styles.section}><h2 className={styles.sectionTitle}>Landing pages and lead quality</h2><p className={styles.mutedCopy}>{leads.length} persisted requests, including those with unknown attribution. Form starts are not counted as requests.</p>
   {groups.length?<div className={styles.tableWrap}><table className={styles.table}><thead><tr><th scope="col">First channel / landing page</th><th scope="col">Service / town</th><th scope="col">Requests</th><th scope="col">Reviewed eligible</th><th scope="col">Excluded</th><th scope="col">Currently won</th></tr></thead><tbody>{groups.map((g,i)=><tr key={i}><td data-label="First touch"><strong>{g.channel}</strong><br/>{g.path.startsWith('/')?<Link href={g.path}>{g.path}</Link>:g.path}</td><td data-label="Service / town">{SERVICES.find(s=>s.id===g.service)?.name??g.service}<br/>{LOCATIONS.find(t=>t.id===g.town)?.name??g.town}</td><td data-label="Requests">{g.requests}</td><td data-label="Eligible">{g.reviewed}</td><td data-label="Excluded">{g.excluded}</td><td data-label="Won">{g.won}</td></tr>)}</tbody></table></div>:<p className={styles.empty}>No requests in this reporting window.</p>}
  </section>
  <div className={styles.panel}><h2>How to read this report</h2><p className={styles.mutedCopy}>Organic search is inferred from a recognized search referrer or reported by an organic campaign tag. Paid click IDs take precedence. Browser evidence is not independently verified; missing evidence stays unknown. All matching records are paginated rather than capped at 1,000.</p><p className={styles.mutedCopy}>Reviewed eligible means the current status is Qualified, Assigned, Accepted, Contacted, Estimate, Won or Lost. New requests await review. Excluded means Invalid, Duplicate or Unserviceable. These are current operator-recorded statuses for this cohort, not proof of fulfilled work or a historical stage funnel.</p><p className={styles.mutedCopy}>Use Search Console for impressions, clicks and queries, and consented GA4 reports for sessions and form starts. Those totals cannot be joined to individual homeowners. Review vendor responses and progress in Leads. No customer details are sent to GA4 by this report.</p></div>
 </>;
}
