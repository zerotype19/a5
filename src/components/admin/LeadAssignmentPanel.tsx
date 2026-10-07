import { SubmitButton } from "./SubmitButton";
import Link from "next/link";
import type { AssignmentRow, VendorCoverage } from "@/lib/admin/vendors";
import { coverageLabels } from "@/lib/admin/vendors";
import { assignLeadToVendor, sendVendorEmail } from "@/lib/admin/vendor-actions";
import { isOpenAssignmentStatus } from "@/lib/admin/eligibility";
import { formatAdminDateTime, formatStatus } from "@/lib/admin/format";
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
  void serviceId;
  void locationId;

  return (
    <section id="assignment" className={styles.section} aria-labelledby="assignment-heading">
      <h2 id="assignment-heading" className={styles.sectionTitle}>
        3. Assign & notify
      </h2>
      <p className={styles.mutedCopy}>Choose a provider, then send the handoff email. A saved assignment remains in place if email fails; the provider must still accept.</p>
      {status === "NEW" && <p className={styles.empty}>Qualify the request in step 2 to choose a provider.</p>}
      {current ? (
        <div className={styles.panel}>
          <h3>Current assignment</h3>
          <dl className={styles.dl}>
            <dt>Vendor</dt>
            <dd><Link href={`/admin/vendors/${current.vendorId}`}>{current.vendorName}</Link></dd>
            <dt>Assignment status</dt>
            <dd>{formatStatus(current.status)}</dd>
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
              <SubmitButton pendingLabel="Sending…">
                {current.notificationStatus === "FAILED" ||
                current.notificationStatus === "PENDING"
                  ? "Retry email"
                  : "Send vendor email"}
              </SubmitButton>
            </form>
          ) : null}
          {current.notificationError ? (
            <p className={styles.empty}>Last email error: {current.notificationError}</p>
          ) : null}
        </div>
      ) : null}
      {status === "QUALIFIED" && !current ? (
          eligible.length > 0 ? (
            <form className={styles.form} action={assignLeadToVendor}>
              <input type="hidden" name="leadId" value={leadId} />
              <label className={styles.fieldLabel}>
                Assign vendor
                <select name="vendorId" required defaultValue="">
                  <option value="" disabled>
                    Choose any vendor
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
              <SubmitButton pendingLabel="Assigning…">Assign vendor</SubmitButton>
            </form>
          ) : (
            <p className={styles.empty}>No vendors in the database.</p>
          )
      ) : null}
      <details className={styles.secondaryDetails}><summary>Assignment history ({assignments.length})</summary>
      {assignments.length === 0 ? (
        <p className={styles.empty}>No assignments yet.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Vendor</th>
                <th scope="col">Status</th>
                <th scope="col">Notification</th>
                <th scope="col">Assigned</th>
                <th scope="col">Email sent</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((row) => (
                <tr key={row.id}>
                  <td data-label="Vendor">{row.vendorName}</td>
                  <td data-label="Status">{formatStatus(row.status)}</td>
                  <td data-label="Notification">{row.notificationStatus ?? "Not sent"}</td>
                  <td data-label="Assigned">{formatAdminDateTime(row.assignedAt)}</td>
                  <td data-label="Email sent">{formatAdminDateTime(row.notificationSentAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}</details>
    </section>
  );
}
