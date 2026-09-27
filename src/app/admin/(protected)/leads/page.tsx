import { LEAD_STATUSES, type LeadStatus } from "@/lib/db/schema";
import { SERVICES } from "@config/services";
import { loadLeadList } from "@/lib/admin/data";
import { NEEDS_ATTENTION_STATUS } from "@/lib/admin/format";
import { LeadsTable } from "@/components/admin/LeadsTable";
import styles from "@/components/admin/admin.module.css";

type SearchParams = Promise<{
  status?: string;
  service?: string;
  attention?: string;
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

  const rows = await loadLeadList({
    status,
    serviceId: service,
    limit: 100,
  });

  return (
    <>
      <h1 className={styles.title}>Leads</h1>
      <p className={styles.lede}>
        Operational queue — filter, open a lead, classify, qualify, and note.
      </p>

      <form className={styles.filters} method="get">
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
                {s}
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
      </form>

      {needsAttention ? (
        <p className={styles.mutedCopy}>
          Needs attention = status {NEEDS_ATTENTION_STATUS} (deterministic; no
          stored field).
        </p>
      ) : null}

      <LeadsTable
        rows={rows}
        emptyMessage="No project requests match this view."
        showCustomer
        dateMode="date"
      />
    </>
  );
}
