import Link from "next/link";
import type { LeadListRow } from "@/lib/admin/data";
import { formatAdminDate, formatAdminDateTime } from "@/lib/admin/format";
import styles from "./admin.module.css";

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
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Reference</th>
            <th>{dateMode === "date" ? "Date" : "Created"}</th>
            {showCustomer ? <th>Customer</th> : null}
            <th>Service</th>
            <th>ZIP</th>
            <th>Timing</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>
                <Link href={`/admin/leads/${row.id}`}>{row.publicReference}</Link>
              </td>
              <td>
                {dateMode === "date"
                  ? formatAdminDate(row.createdAt)
                  : formatAdminDateTime(row.createdAt)}
              </td>
              {showCustomer ? <td>{row.customerName}</td> : null}
              <td>{row.serviceLabel}</td>
              <td>{row.postalCode ?? "—"}</td>
              <td>{row.urgency ?? "—"}</td>
              <td>{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
