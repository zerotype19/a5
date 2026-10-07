import { ArrowIcon } from "@/components/ArrowIcon";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/db/schema";
import { SERVICES } from "@config/services";
import { loadLeadList } from "@/lib/admin/data";
import { NEEDS_ATTENTION_STATUS, formatStatus } from "@/lib/admin/format";
import { LeadsTable } from "@/components/admin/LeadsTable";
import styles from "@/components/admin/admin.module.css";

type SearchParams = Promise<{
  status?: string;
  service?: string;
  attention?: string;
  page?: string;
}>;

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const needsAttention = params.attention === "1";
  const statusFromQuery =
    params.status && (LEAD_STATUSES as readonly string[]).includes(params.status)
      ? (params.status as LeadStatus)
      : null;
  const status = needsAttention ? NEEDS_ATTENTION_STATUS : statusFromQuery;
  const service =
    params.service && SERVICES.some((s) => s.id === params.service)
      ? params.service
      : null;

  const page = typeof params.page === "string" && /^[1-9]\d{0,3}$/.test(params.page) ? Number(params.page) : 1;
  const pageSize = 50;
  const loaded = await loadLeadList({
    status,
    serviceId: service,
    limit: pageSize + 1,
    offset: (page - 1) * pageSize,
  });
  const rows = loaded.slice(0, pageSize);
  const pageHref = (next: number) => {
    const query = new URLSearchParams();
    if (status) query.set("status", status);
    if (service) query.set("service", service);
    if (needsAttention) query.set("attention", "1");
    query.set("page", String(next));
    return `/admin/leads?${query}`;
  };

  return (
    <>
      <AdminPageHeader title="Leads" description="Start with a request, review the details, then work through qualification, handoff and follow-up." />
      <form key={`${status}-${service}-${needsAttention}`} className={styles.filters} method="get" aria-label="Filter leads">
        <label>
          Status
          <select
            name="status"
            defaultValue={
              needsAttention ? NEEDS_ATTENTION_STATUS : (status ?? "")
            }
          >
            <option value="">All</option>
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {formatStatus(s)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Service
          <select name="service" defaultValue={service ?? ""}>
            <option value="">All</option>
            {SERVICES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.checkLabel}>
          <input
            type="checkbox"
            name="attention"
            value="1"
            defaultChecked={needsAttention}
          />
          Needs attention
        </label>
        <button type="submit" className={styles.signOut}>
          Apply
        </button>
        <Link href="/admin/leads">Clear filters</Link>
      </form>

      {needsAttention ? (
        <p className={styles.mutedCopy}>
          Showing new requests waiting for review.
        </p>
      ) : null}

      <p className={styles.mutedCopy}>{rows.length} request{rows.length === 1 ? "" : "s"} shown · page {page} · newest first.</p>
      <LeadsTable
        rows={rows}
        emptyMessage="No project requests match this view."
        showCustomer
        dateMode="date"
      />
      <nav className={styles.pagination} aria-label="Lead pages">
        {page > 1 && <Link href={pageHref(page - 1)} className={styles.secondaryButton}><ArrowIcon direction="left" /> Previous</Link>}
        {loaded.length > pageSize && <Link href={pageHref(page + 1)} className={styles.secondaryButton}>Next <ArrowIcon /></Link>}
      </nav>
    </>
  );
}
