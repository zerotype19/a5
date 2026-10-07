import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import Link from "next/link";
import { loadDashboard } from "@/lib/admin/data";
import { DASHBOARD_STATUS_COUNTS, formatStatus } from "@/lib/admin/format";
import { LeadsTable } from "@/components/admin/LeadsTable";
import styles from "@/components/admin/admin.module.css";

export default async function AdminDashboardPage() {
  const { counts, needsAttention, recent, totalLeads } = await loadDashboard();

  return (
    <>
      <AdminPageHeader title="Overview" description="Review new requests, move active projects forward, and keep provider handoffs on track." actions={<Link className={styles.primaryButton} href="/admin/leads?attention=1">Review new leads ↗</Link>} />
      <section className={styles.section} aria-labelledby="needs-attention">
        <h2 id="needs-attention" className={styles.sectionTitle}>
          Needs attention
        </h2>
        <div className={styles.attention}>
          <Link href="/admin/leads?attention=1" className={styles.attentionLink}>
            <strong>{needsAttention}</strong> new lead
            {needsAttention === 1 ? "" : "s"} waiting for review.
          </Link>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="status-counts">
        <h2 id="status-counts" className={styles.sectionTitle}>
          By status
        </h2>
        {totalLeads === 0 ? (
          <p className={styles.empty}>No leads yet.</p>
        ) : (
          <div className={styles.counts}>
            {DASHBOARD_STATUS_COUNTS.map((status) => (
              <Link key={status} href={`/admin/leads?status=${status}`} className={styles.count}>
                <span className={styles.countValue}>{counts[status]}</span>
                <span className={styles.countLabel}>{formatStatus(status)}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section} aria-labelledby="recent-leads">
        <h2 id="recent-leads" className={styles.sectionTitle}>
          Recent leads
        </h2>
        <LeadsTable
          rows={recent}
          emptyMessage="No leads yet."
          showCustomer
          dateMode="datetime"
        />
      </section>
    </>
  );
}
