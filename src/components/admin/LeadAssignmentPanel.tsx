import type { AssignmentRow, VendorCoverage } from "@/lib/admin/vendors";
import { coverageLabels } from "@/lib/admin/vendors";
import { assignLeadToVendor, sendVendorEmail } from "@/lib/admin/vendor-actions";
import { isOpenAssignmentStatus } from "@/lib/admin/eligibility";
import { formatAdminDateTime } from "@/lib/admin/format";
import styles from "./admin.module.css";

type Props = {
  leadId: string;
  status: string;
  serviceId: string | null;
  locationId: string | null;
  eligible: VendorCoverage[];
  assignments: AssignmentRow[];
};

export function LeadAssignmentPanel({
  leadId,
  status,
  serviceId,
  locationId,
  eligible,
  assignments,
}: Props) {
  const current = assignments.find((row) => isOpenAssignmentStatus(row.status));
  const classified = Boolean(serviceId && locationId);

  return (
    <section className={styles.section} aria-labelledby="assignment-heading">
      <h2 id="assignment-heading" className={styles.sectionTitle}>
        Assignment
      </h2>
      <p className={styles.empty}>
        Assignment is saved even if the vendor email fails. Notification does
        not mean the vendor has accepted.
      </p>
      {current ? (
        <div className={styles.panel}>
          <h3>Current assignment</h3>
          <dl className={styles.dl}>
            <dt>Vendor</dt>
            <dd>{current.vendorName}</dd>
            <dt>Assignment status</dt>
            <dd>{current.status}</dd>
            <dt>Notification</dt>
            <dd>{current.notificationStatus ?? "Not sent"}</dd>
            <dt>Assigned</dt>
            <dd>{formatAdminDateTime(current.assignedAt)}</dd>
            <dt>Email sent</dt>
            <dd>{formatAdminDateTime(current.notificationSentAt)}</dd>
            <dt>Accepted</dt>
            <dd>{formatAdminDateTime(current.acceptedAt)}</dd>
            <dt>Passed</dt>
            <dd>{formatAdminDateTime(current.passedAt)}</dd>
          </dl>
          {current.status === "ASSIGNED" && !current.vendorEmail ? (
            <p className={styles.empty}>
              Vendor email required before notification can be sent.
            </p>
          ) : null}
          {current.status === "ASSIGNED" &&
          current.vendorEmail &&
          current.notificationStatus !== "SENT" ? (
            <form className={styles.form} action={sendVendorEmail}>
              <input type="hidden" name="leadId" value={leadId} />
              <input type="hidden" name="assignmentId" value={current.id} />
              <button type="submit">
                {current.notificationStatus === "FAILED" ||
                current.notificationStatus === "PENDING"
                  ? "Retry email"
                  : "Send vendor email"}
              </button>
            </form>
          ) : null}
          {current.notificationError ? (
            <p className={styles.empty}>Last email error: {current.notificationError}</p>
          ) : null}
        </div>
      ) : null}
      {status === "QUALIFIED" && !current ? (
        classified ? (
          eligible.length > 0 ? (
            <form className={styles.form} action={assignLeadToVendor}>
              <input type="hidden" name="leadId" value={leadId} />
              <label className={styles.fieldLabel}>
                Assign vendor
                <select name="vendorId" required defaultValue="">
                  <option value="" disabled>
                    Choose an eligible vendor
                  </option>
                  {eligible.map((vendor) => {
                    const labels = coverageLabels(vendor);
                    return (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.businessName} — {labels.services} — {labels.locations} — {vendor.status}
                        {vendor.acceptingLeads ? " — accepting" : ""}
                      </option>
                    );
                  })}
                </select>
              </label>
              <button type="submit">Assign vendor</button>
            </form>
          ) : (
            <p className={styles.empty}>No eligible vendors for this service and location.</p>
          )
        ) : (
          <p className={styles.empty}>
            Classify service and location before assignment. A missing location is not matched from ZIP.
          </p>
        )
      ) : null}
      <h3 className={styles.sectionTitle}>Assignment history</h3>
      {assignments.length === 0 ? (
        <p className={styles.empty}>No assignments yet.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Status</th>
                <th>Notification</th>
                <th>Assigned</th>
                <th>Email sent</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((row) => (
                <tr key={row.id}>
                  <td>{row.vendorName}</td>
                  <td>{row.status}</td>
                  <td>{row.notificationStatus ?? "Not sent"}</td>
                  <td>{formatAdminDateTime(row.assignedAt)}</td>
                  <td>{formatAdminDateTime(row.notificationSentAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
