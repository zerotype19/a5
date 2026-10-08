import Link from 'next/link';
import {loadNetworkData} from '@/lib/network/data';
import {vendorEvidence} from '@/lib/network/evidence';
import {connectionState} from '@/lib/network/policy';
import {formatAdminDateTime,publicReferenceFromLeadId} from '@/lib/admin/format';
import styles from '@/components/admin/admin.module.css';
export async function VendorEvidencePanel({vendorId}:{vendorId:string}){
 if(process.env.ENABLE_NETWORK_FOLLOWUP!=='true')return null;
 const {assignments,reports}=await loadNetworkData();
 const own=assignments.filter(a=>a.vendor_id===vendorId),e=vendorEvidence(vendorId,assignments,reports);
 return <section id="network-evidence" className={styles.section}><h2 className={styles.sectionTitle}>Connection evidence</h2><p className={styles.mutedCopy}>Private to A5 operations. These are reports about individual introductions, not verified performance across every service. Follow each request for its service, town, original feedback and review decisions.</p><p>{e.accepted}/{e.offered} sent offers accepted · {e.contacted}/{e.contactResponses} answered homeowner check-ins confirm contact · {e.unknownContact} unknown</p><p>{e.completed} homeowner-reported completions · {e.reviewCount} completed-work ratings{e.averageStars!==null&&` · average ${e.averageStars.toFixed(1)}/5`}. Disputed and excluded evidence is omitted from these metrics.</p><div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Request</th><th>Assignment</th><th>Connection / outcome</th></tr></thead><tbody>{own.sort((a,b)=>b.assigned_at.localeCompare(a.assigned_at)).map(a=><tr key={a.id}><td data-label="Request"><Link href={`/admin/leads/${a.lead_id}#network`}>{publicReferenceFromLeadId(a.lead_id)}</Link></td><td data-label="Assignment">{a.status}<p>{formatAdminDateTime(a.assigned_at)}</p></td><td data-label="Connection / outcome">{connectionState(reports.filter(r=>r.assignment_id===a.id),!!a.accepted_at)}</td></tr>)}</tbody></table></div>{!own.length&&<p>No recorded introductions yet. Missing history does not count as a failure.</p>}</section>;
}
