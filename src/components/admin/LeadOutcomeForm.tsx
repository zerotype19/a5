import type { LeadDetail } from "@/lib/admin/data";
import { recordLeadOutcome } from "@/lib/admin/actions";
import { outcomeTargets } from "@/lib/admin/outcomes";
import { formatAdminDateTime, formatStatus } from "@/lib/admin/format";
import { SubmitButton } from "./SubmitButton";
import styles from "./admin.module.css";

export function LeadOutcomeForm({lead}: {lead: LeadDetail}) {
  if (!lead.outcome) return null;
  const terminal = lead.status === "WON" || lead.status === "LOST";
  return <form action={recordLeadOutcome} className={styles.noteForm}>
    <input type="hidden" name="leadId" value={lead.id} />
    <input type="hidden" name="expectedStatus" value={lead.status} />
    <input type="hidden" name="expectedUpdatedAt" value={lead.updatedAt} />
    <p className={styles.mutedCopy}>Record confirmed progress. Contact, estimate and close dates are recorded when the status changes. Amounts are the provider’s project values, not A5 income; leave unknown amounts blank.</p>
    <div className={styles.formGrid}>
      <label className={styles.fieldLabel}>Next step<select name="toStatus" defaultValue={lead.status}>
        <option value={lead.status}>Keep {formatStatus(lead.status).toLowerCase()}</option>
        {outcomeTargets(lead.status).map(status=><option key={status} value={status}>Mark {formatStatus(status).toLowerCase()}</option>)}
      </select></label>
      {!terminal && <label className={styles.fieldLabel}>Next follow-up · UTC<input type="datetime-local" name="followUp" defaultValue={lead.outcome.followUpAt?.slice(0,16) ?? ""} /></label>}
      <label className={styles.fieldLabel}>Estimated project value · USD<input type="number" name="estimated" min="0" max="9999999999.99" step="0.01" defaultValue={lead.outcome.estimated ?? ""} /></label>
      <label className={styles.fieldLabel}>Actual project value · USD<input type="number" name="actual" min="0" max="9999999999.99" step="0.01" defaultValue={lead.outcome.actual ?? ""} /></label>
    </div>
    {lead.status !== "WON" && <label className={styles.fieldLabel}>Loss reason · required when marking lost<textarea name="reason" rows={2} maxLength={2000} defaultValue={lead.outcome.lossReason ?? ""} placeholder="Why the project did not proceed" /></label>}
    <dl className={styles.dl}><dt>Contact recorded</dt><dd>{formatAdminDateTime(lead.outcome.contactedAt)}</dd><dt>Estimate recorded</dt><dd>{formatAdminDateTime(lead.outcome.estimateAt)}</dd><dt>Closed</dt><dd>{formatAdminDateTime(lead.outcome.closedAt)}</dd></dl>
    <SubmitButton className={styles.primaryButton} pendingLabel="Saving outcome…">Save progress & outcome</SubmitButton>
  </form>;
}
