import Link from "next/link";
import { getLocationById, type LocationId } from "@config/locations";
import type { LeadListRow } from "@/lib/admin/data";
import { formatAdminDate, formatAdminDateTime, formatStatus } from "@/lib/admin/format";
import styles from "./admin.module.css";

function ageLabel(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return "—";
  const hours = Math.floor(ms / 3_600_000);
  if (hours < 1) return "Under 1 hour";
  if (hours < 48) return `${hours} hour${hours === 1 ? "" : "s"}`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"}`;
}

function townLabel(locationId: string | null): string {
  if (!locationId) return "—";
  return getLocationById(locationId as LocationId)?.name ?? "—";
}

export function LeadsTable({
  rows,
  emptyMessage,
  showCustomer = true,
  dateMode = "datetime",
}: {
  rows: LeadListRow[];
  emptyMessage: string;
  showCustomer?: boolean;
  dateMode?: "date" | "datetime";
}) {
  if (rows.length === 0) {
    return <p className={styles.empty}>{emptyMessage}</p>;
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}><caption className="srOnly">Homeowner requests</caption>
        <thead>
          <tr>
            <th scope="col">Reference</th>
            <th scope="col">Service</th>
            <th scope="col">Town</th>
            <th scope="col">Status</th>
            <th scope="col">Age</th>
            {showCustomer ? <th scope="col">Customer</th> : null}
            <th scope="col">{dateMode === "date" ? "Date" : "Created"}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td data-label="Reference">
                <Link href={`/admin/leads/${row.id}`}>{row.publicReference}</Link>
              </td>
              <td data-label="Service">{row.serviceLabel}</td>
              <td data-label="Town">{townLabel(row.locationId)}</td>
              <td data-label="Status">
                <span className={styles.status} data-state={row.status}>
                  {formatStatus(row.status)}
                </span>
              </td>
              <td data-label="Age">{ageLabel(row.createdAt)}</td>
              {showCustomer ? (
                <td data-label="Customer">{row.customerName}</td>
              ) : null}
              <td data-label={dateMode === "date" ? "Date" : "Created"}>
                {dateMode === "date"
                  ? formatAdminDate(row.createdAt)
                  : formatAdminDateTime(row.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
