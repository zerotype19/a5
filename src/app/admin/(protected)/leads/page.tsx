import { LEAD_STATUSES, type LeadStatus } from "@/lib/db/schema";
import { loadLeadList } from "@/lib/admin/data";
import { LeadsTable } from "@/components/admin/LeadsTable";
import styles from "@/components/admin/admin.module.css";

const SERVICES = [
  "handyman",
  "masonry",
  "landscaping",
  "painting",
  "drywall",
  "tile",
  "plumbing",
  "electrical",
] as const;

type SearchParams = Promise<{
  status?: string;
  service?: string;
}>;

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const status =
    params.status && (LEAD_STATUSES as readonly string[]).includes(params.status)
      ? (params.status as LeadStatus)
      : null;
  const service =
    params.service && (SERVICES as readonly string[]).includes(params.service)
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
        Read-only project requests, newest first. Editing arrives in a later
        task.
      </p>

      <form className={styles.filters} method="get">
        <label>
          Status
          <select name="status" defaultValue={status ?? ""}>
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
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className={styles.signOut}>
          Apply
        </button>
      </form>

      <LeadsTable
        rows={rows}
        emptyMessage="No project requests match this view."
        showCustomer
        dateMode="date"
      />
    </>
  );
}
