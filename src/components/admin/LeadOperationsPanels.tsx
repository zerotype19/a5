import { SubmitButton } from "./SubmitButton";
import type { ReactNode } from "react";
import { SERVICES } from "@config/services";
import { LOCATIONS } from "@config/locations";
import type { LeadDetail } from "@/lib/admin/data";
import { addLeadNote, classifyLeadLocation, classifyLeadService, transitionLeadStatus } from "@/lib/admin/actions";
import { allowedTransitions } from "@/lib/admin/transitions";
import { formatAdminDateTime, formatStatus } from "@/lib/admin/format";
import styles from "./admin.module.css";

type Props = { lead: LeadDetail; notice?: string | null; error?: string | null; children?: ReactNode };
export function LeadOperationsPanels({ lead, notice, error, children }: Props) {
  const nextStatuses = allowedTransitions(lead.status);
  const canClassifyService = lead.serviceSelectionStatus === "NOT_SURE" && lead.serviceId === null;
  const canQualify = nextStatuses.includes("QUALIFIED");
  const canUnserviceable = nextStatuses.includes("UNSERVICEABLE");
  const advanceTargets = nextStatuses.filter(s => s !== "QUALIFIED" && s !== "UNSERVICEABLE");
  return <>
    {(notice || error) && <p className={error ? styles.flashError : styles.flashNotice} role={error ? "alert" : "status"}>{error ?? notice}</p>}
    <section id="qualify" className={styles.section} aria-labelledby="ops-heading">
      <h2 id="ops-heading" className={styles.sectionTitle}>2. Classify & qualify</h2>
      <div className={styles.panel}>
        <p className={styles.mutedCopy}>Confirm the service and town, then review the contact details and project before qualifying.</p>
        <div className={styles.formGrid}>
          {canClassifyService ? <form action={classifyLeadService} className={styles.inlineForm}>
            <input type="hidden" name="leadId" value={lead.id} />
            <label className={styles.fieldLabel}>Service<select name="serviceId" required defaultValue=""><option value="" disabled>Select service</option>{SERVICES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
            <SubmitButton className={styles.secondaryButton}>Classify service</SubmitButton>
          </form> : <div><h3 className={styles.actionTitle}>Service</h3><p>{lead.serviceLabel}</p></div>}
          <form action={classifyLeadLocation} className={styles.inlineForm}>
            <input type="hidden" name="leadId" value={lead.id} />
            <label className={styles.fieldLabel}>Town · ZIP {lead.postalCode ?? "not supplied"}<select name="locationId" required defaultValue={lead.locationId ?? ""}><option value="" disabled>Select location</option>{LOCATIONS.map(loc => <option key={loc.id} value={loc.id}>{loc.name}, {loc.state}</option>)}</select></label>
            <SubmitButton className={styles.secondaryButton}>{lead.locationId ? "Update location" : "Classify location"}</SubmitButton>
          </form>
        </div>
        {canQualify ? <div className={styles.actionBlock}>
          <h3 className={styles.actionTitle}>Ready for a provider?</h3>
          <ul className={styles.checklist}><li>Contact details look valid.</li><li>The request describes a real home-service need.</li><li>The service and geography are understood.</li></ul>
          <p className={styles.mutedCopy}>Use your judgment after reviewing the request. This checklist is not saved.</p>
          <form action={transitionLeadStatus} className={styles.inlineForm}><input type="hidden" name="leadId" value={lead.id} /><input type="hidden" name="expectedStatus" value={lead.status} /><input type="hidden" name="toStatus" value="QUALIFIED" /><SubmitButton className={styles.primaryButton} pendingLabel="Qualifying…">Qualify lead</SubmitButton></form>
        </div> : <p className={styles.mutedCopy}>Current status: {formatStatus(lead.status)}. Classification remains available if details need correcting.</p>}
      </div>
    </section>
    {children}
    <section id="followup" className={styles.section} aria-labelledby="followup-heading"><h2 id="followup-heading" className={styles.sectionTitle}>4. Follow up & record the outcome</h2><div className={styles.panel}>
      {advanceTargets.length > 0 ? <><p className={styles.mutedCopy}>{lead.status === "NEW" ? "If this is an invalid or repeated request, record that here instead of qualifying it." : "Update the status after confirming progress with the homeowner or provider."}</p><div className={styles.buttonRow}>{advanceTargets.map(to => <form key={to} action={transitionLeadStatus}><input type="hidden" name="leadId" value={lead.id} /><input type="hidden" name="expectedStatus" value={lead.status} /><input type="hidden" name="toStatus" value={to} /><SubmitButton className={styles.secondaryButton}>Mark {formatStatus(to).toLowerCase()}</SubmitButton></form>)}</div></> : <p className={styles.mutedCopy}>{lead.status === "NEW" ? "Review and qualify the request before assigning a provider." : lead.status === "QUALIFIED" ? "Choose a provider in the handoff step above." : lead.status === "ASSIGNED" ? "Check the vendor email and watch for an accept or pass response." : "No further status changes are available. Record any follow-up in the notes below."}</p>}
      {canUnserviceable && <details className={styles.secondaryDetails}><summary>Unable to service this request?</summary><p className={styles.mutedCopy}>Use this when A5 cannot help with the request. Add a note explaining why.</p><form action={transitionLeadStatus}><input type="hidden" name="leadId" value={lead.id} /><input type="hidden" name="expectedStatus" value={lead.status} /><input type="hidden" name="toStatus" value="UNSERVICEABLE" /><SubmitButton className={styles.dangerButton}>Mark unserviceable</SubmitButton></form></details>}
    </div></section>
    <section id="notes" className={styles.section} aria-labelledby="notes-heading"><h2 id="notes-heading" className={styles.sectionTitle}>Notes</h2><div className={styles.panel}>
      <form action={addLeadNote} className={styles.noteForm}><input type="hidden" name="leadId" value={lead.id} /><label className={styles.fieldLabel}>Add internal note<textarea name="body" rows={3} maxLength={2000} required placeholder="Contact attempts, project details or next steps" /></label><SubmitButton className={styles.primaryButton}>Add note</SubmitButton></form>
      {lead.notes.length === 0 ? <p className={styles.mutedCopy}>No notes yet.</p> : <ul className={styles.noteList}>{lead.notes.map(note => <li key={note.id} className={styles.noteItem}><div className={styles.noteMeta}>{formatAdminDateTime(note.createdAt)} · {note.createdByEmail ?? note.createdBy}</div><p className={styles.noteBody}>{note.body}</p></li>)}</ul>}
      <p className={styles.mutedCopy}>Private to A5 operations. Newest notes first.</p>
    </div></section>
    <section className={styles.section} aria-labelledby="history-heading"><h2 id="history-heading" className={styles.sectionTitle}>Activity history</h2>{lead.history.length === 0 ? <p className={styles.empty}>No lifecycle events recorded.</p> : <div className={styles.tableWrap}><table className={styles.table}><caption className="srOnly">Lead activity history</caption><thead><tr><th scope="col">When</th><th scope="col">Event</th><th scope="col">From</th><th scope="col">To</th><th scope="col">Actor</th></tr></thead><tbody>{lead.history.map(ev => <tr key={ev.id}><td data-label="When">{formatAdminDateTime(ev.occurredAt)}</td><td data-label="Event">{ev.eventType}</td><td data-label="From">{ev.fromStatus ? formatStatus(ev.fromStatus) : "—"}</td><td data-label="To">{formatStatus(ev.toStatus)}</td><td data-label="Actor">{ev.actorUserId ?? "System"}</td></tr>)}</tbody></table></div>}</section>
  </>;
}
