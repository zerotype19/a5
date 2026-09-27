import { SERVICES } from "@config/services";
import { LOCATIONS } from "@config/locations";
import type { LeadDetail } from "@/lib/admin/data";
import {
  addLeadNote,
  classifyLeadLocation,
  classifyLeadService,
  transitionLeadStatus,
} from "@/lib/admin/actions";
import { allowedTransitions } from "@/lib/admin/transitions";
import { formatAdminDateTime } from "@/lib/admin/format";
import styles from "./admin.module.css";

type Props = {
  lead: LeadDetail;
  notice?: string | null;
  error?: string | null;
};

export function LeadOperationsPanels({ lead, notice, error }: Props) {
  const nextStatuses = allowedTransitions(lead.status);
  const canClassifyService =
    lead.serviceSelectionStatus === "NOT_SURE" && lead.serviceId === null;
  const canQualify = nextStatuses.includes("QUALIFIED");
  const canUnserviceable = nextStatuses.includes("UNSERVICEABLE");
  const advanceTargets = nextStatuses.filter(
    (s) => s !== "QUALIFIED" && s !== "UNSERVICEABLE",
  );

  return (
    <>
      {(notice || error) && (
        <div
          className={error ? styles.flashError : styles.flashNotice}
          role="status"
        >
          {error ?? notice}
        </div>
      )}

      <section className={styles.section} aria-labelledby="ops-heading">
        <h2 id="ops-heading" className={styles.sectionTitle}>
          Operations
        </h2>
        <div className={styles.panel}>
          {canQualify ? (
            <div className={styles.actionBlock}>
              <h3 className={styles.actionTitle}>Qualify</h3>
              <ul className={styles.checklist}>
                <li>Valid contact</li>
                <li>Real home-service need</li>
                <li>Service understood</li>
                <li>Geography understood</li>
              </ul>
              <p className={styles.mutedCopy}>
                Checklist is guidance only — not stored. Qualification is
                human judgment.
              </p>
              <form action={transitionLeadStatus} className={styles.inlineForm}>
                <input type="hidden" name="leadId" value={lead.id} />
                <input
                  type="hidden"
                  name="expectedStatus"
                  value={lead.status}
                />
                <input type="hidden" name="toStatus" value="QUALIFIED" />
                <button type="submit" className={styles.primaryButton}>
                  Qualify lead
                </button>
              </form>
            </div>
          ) : null}

          {canClassifyService ? (
            <div className={styles.actionBlock}>
              <h3 className={styles.actionTitle}>Classify service</h3>
              <p className={styles.mutedCopy}>
                Homeowner selected Not sure — set A5 service without rewriting
                that fact.
              </p>
              <form action={classifyLeadService} className={styles.inlineForm}>
                <input type="hidden" name="leadId" value={lead.id} />
                <label className={styles.fieldLabel}>
                  Service
                  <select name="serviceId" required defaultValue="">
                    <option value="" disabled>
                      Select service
                    </option>
                    {SERVICES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </label>
                <button type="submit" className={styles.primaryButton}>
                  Classify service
                </button>
              </form>
            </div>
          ) : null}

          <div className={styles.actionBlock}>
            <h3 className={styles.actionTitle}>Classify location</h3>
            <p className={styles.mutedCopy}>
              Map ZIP {lead.postalCode ?? "—"} to an approved location. Raw ZIP
              is never overwritten.
            </p>
            <form action={classifyLeadLocation} className={styles.inlineForm}>
              <input type="hidden" name="leadId" value={lead.id} />
              <label className={styles.fieldLabel}>
                Location
                <select
                  name="locationId"
                  required
                  defaultValue={lead.locationId ?? ""}
                >
                  <option value="" disabled>
                    Select location
                  </option>
                  {LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}, {loc.state}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" className={styles.primaryButton}>
                {lead.locationId ? "Update location" : "Classify location"}
              </button>
            </form>
          </div>

          {canUnserviceable ? (
            <div className={styles.actionBlock}>
              <h3 className={styles.actionTitle}>Mark unserviceable</h3>
              <form action={transitionLeadStatus} className={styles.inlineForm}>
                <input type="hidden" name="leadId" value={lead.id} />
                <input
                  type="hidden"
                  name="expectedStatus"
                  value={lead.status}
                />
                <input type="hidden" name="toStatus" value="UNSERVICEABLE" />
                <button type="submit" className={styles.dangerButton}>
                  Mark unserviceable
                </button>
              </form>
            </div>
          ) : null}

          {advanceTargets.length > 0 ? (
            <div className={styles.actionBlock}>
              <h3 className={styles.actionTitle}>Advance status</h3>
              <p className={styles.mutedCopy}>
                Only transitions allowed by the A5-007 map (no vendor steps).
              </p>
              <div className={styles.buttonRow}>
                {advanceTargets.map((to) => (
                  <form key={to} action={transitionLeadStatus}>
                    <input type="hidden" name="leadId" value={lead.id} />
                    <input
                      type="hidden"
                      name="expectedStatus"
                      value={lead.status}
                    />
                    <input type="hidden" name="toStatus" value={to} />
                    <button type="submit" className={styles.secondaryButton}>
                      → {to}
                    </button>
                  </form>
                ))}
              </div>
            </div>
          ) : null}

          {nextStatuses.length === 0 && !canClassifyService ? (
            <p className={styles.mutedCopy}>
              Status transitions for this lead are complete or deferred to
              vendor assignment (A5-008). Classification and notes remain
              available.
            </p>
          ) : null}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="notes-heading">
        <h2 id="notes-heading" className={styles.sectionTitle}>
          Notes
        </h2>
        <div className={styles.panel}>
          <form action={addLeadNote} className={styles.noteForm}>
            <input type="hidden" name="leadId" value={lead.id} />
            <label className={styles.fieldLabel}>
              Add internal note
              <textarea
                name="body"
                rows={4}
                maxLength={2000}
                required
                placeholder="Private operational note (1–2,000 characters)"
              />
            </label>
            <button type="submit" className={styles.primaryButton}>
              Add note
            </button>
          </form>

          {lead.notes.length === 0 ? (
            <p className={styles.mutedCopy}>No notes yet.</p>
          ) : (
            <ul className={styles.noteList}>
              {lead.notes.map((note) => (
                <li key={note.id} className={styles.noteItem}>
                  <div className={styles.noteMeta}>
                    {formatAdminDateTime(note.createdAt)}
                    {" · "}
                    {note.createdByEmail ?? note.createdBy}
                  </div>
                  <p className={styles.noteBody}>{note.body}</p>
                </li>
              ))}
            </ul>
          )}
          <p className={styles.mutedCopy}>Notes shown newest first.</p>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="history-heading">
        <h2 id="history-heading" className={styles.sectionTitle}>
          History
        </h2>
        {lead.history.length === 0 ? (
          <p className={styles.empty}>No lifecycle events recorded.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>When</th>
                  <th>Event</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Actor</th>
                </tr>
              </thead>
              <tbody>
                {lead.history.map((ev) => (
                  <tr key={ev.id}>
                    <td>{formatAdminDateTime(ev.occurredAt)}</td>
                    <td>{ev.eventType}</td>
                    <td>{ev.fromStatus ?? "—"}</td>
                    <td>{ev.toStatus}</td>
                    <td>
                      {ev.actorUserId
                        ? ev.actorUserId.slice(0, 8) + "…"
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
