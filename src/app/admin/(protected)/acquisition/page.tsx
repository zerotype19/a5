import { ArrowIcon } from "@/components/ArrowIcon";
import Link from "next/link";
import { requireAdminAccess } from "@/lib/admin/authorize";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import styles from "@/components/admin/admin.module.css";
export const dynamic = "force-dynamic";
export default async function AcquisitionPage() {
  await requireAdminAccess();
  const header = <AdminPageHeader title="Acquisition" description="See where requests started and how many of those leads are currently won. Reporting window: the last 30 days." />;
  if (process.env.ENABLE_LAUNCH_PIPELINE !== "true") return <>{header}<p className={styles.empty}>Acquisition reporting is not enabled in this environment. You can still manage requests in <Link href="/admin/leads">Leads</Link>.</p></>;
  const db = getSupabaseAdmin();
  // Dynamic server report: evaluated at request time.
  // eslint-disable-next-line react-hooks/purity
  const since = new Date(Date.now() - 30 * 86400000).toISOString();
  const [acq, queue] = await Promise.all([
    db.from("lead_acquisition").select("first_touch,leads(status,service_id)").gte("created_at", since).limit(1000),
    db.from("lead_notification_outbox").select("status,created_at").neq("status", "SENT").limit(1000),
  ]);
  if (acq.error || queue.error) return <>{header}<p className={styles.flashError} role="alert">Reporting is temporarily unavailable. No counts are shown because the data could not be loaded.</p><Link href="/admin/leads">Return to leads</Link></>;
  const groups = new Map<string, { leads: number; won: number }>();
  for (const row of acq.data ?? []) {
    const touch = row.first_touch as { campaign?: { utm_source?: string }; referrerHost?: string };
    const source = touch.campaign?.utm_source || touch.referrerHost || "Direct / unknown";
    const count = groups.get(source) ?? { leads: 0, won: 0 };
    count.leads++;
    const lead = Array.isArray(row.leads) ? row.leads[0] : row.leads;
    if (lead?.status === "WON") count.won++;
    groups.set(source, count);
  }
  return <>{header}
    <section className={styles.section} aria-label="Operations email queue"><div className={styles.attention}><strong>{queue.data?.length ?? 0} unsent operations alerts</strong><p>{process.env.ENABLE_OPERATIONS_ALERTS === "true" ? "Check delivery and follow up on any delayed requests." : "Automatic operations alerts are disabled. Review new leads directly in the workspace."}</p><Link href="/admin/leads?attention=1">Review new leads <ArrowIcon direction="up-right" /></Link></div></section>
    <section className={styles.section}><h2 className={styles.sectionTitle}>First source of attributed requests</h2>{groups.size ? <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th scope="col">First source</th><th scope="col">Requests</th><th scope="col">Currently won</th></tr></thead><tbody>{[...groups].sort((a,b) => b[1].leads - a[1].leads).map(([source, count]) => <tr key={source}><td data-label="Source">{source}</td><td data-label="Requests">{count.leads}</td><td data-label="Won">{count.won}</td></tr>)}</tbody></table></div> : <p className={styles.empty}>No attribution records in this window. Requests without attribution still appear in Leads.</p>}</section>
    <div className={styles.panel}><h2>How to read this report</h2><p className={styles.mutedCopy}>Sources are reported by the visitor’s browser and are not independently verified. Missing attribution is not assigned to organic search. Counts include at most 1,000 records per query.</p><p className={styles.mutedCopy}>Cost per qualified lead and acquisition cost require reconciled spend and income. Won reflects each lead’s current status, not necessarily a win during this reporting period.</p></div>
  </>;
}
