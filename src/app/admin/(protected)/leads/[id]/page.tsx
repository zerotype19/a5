import Link from "next/link";
import { notFound } from "next/navigation";
import { loadLeadDetail } from "@/lib/admin/data";
import {
  formatAdminDateTime,
  formatStatus,
  formatPreferredContact,
} from "@/lib/admin/format";
import { LeadOperationsPanels } from "@/components/admin/LeadOperationsPanels";
import { LeadAssignmentPanel } from "@/components/admin/LeadAssignmentPanel";
import { isOpenAssignmentStatus } from "@/lib/admin/eligibility";
import {
  loadEligibleVendors,
  loadLeadAssignments,
  type AssignmentRow,
} from "@/lib/admin/vendors";
import styles from "@/components/admin/admin.module.css";

function nextAction(status: string, assignments: AssignmentRow[]): string {
  const open = assignments.find((row) => isOpenAssignmentStatus(row.status));
  switch (status) {
    case "NEW":
      return "Next: review the request, classify the service and town, then qualify.";
    case "QUALIFIED":
      return "Next: assign a vendor.";
    case "ASSIGNED":
      if (!open?.vendorEmail) {
        return "Next: this vendor has no email, so notification cannot be sent.";
      }
      if (open.notificationStatus === "SENT") {
        return "Next: the vendor email was sent. Wait for accept or pass.";
      }
      if (
        open.notificationStatus === "FAILED" ||
        open.notificationStatus === "PENDING"
      ) {
        return "Next: retry the vendor email.";
      }
      return "Next: send the vendor email.";
    case "ACCEPTED":
      return "Vendor accepted. Record homeowner contact and the next follow-up in step 4.";
    case "CONTACTED": return "Record an estimate once the provider has confirmed it with the homeowner.";
    case "ESTIMATE": return "Follow up on the estimate, then record whether the project was won or lost.";
    case "WON": return "Project won. Keep the confirmed project value and internal notes up to date.";
    case "LOST": return "Project closed as lost. Review the recorded reason and history.";
    default:
      return "Review the history before changing status.";
  }
}

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ notice?: string; error?: string }>;

export default async function AdminLeadDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const query = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    notFound();
  }

  const lead = await loadLeadDetail(id);
  if (!lead) {
    notFound();
  }
  const [eligibleVendors, assignments] = await Promise.all([
    loadEligibleVendors(
      {
        serviceId: lead.serviceId,
        locationId: lead.locationId,
      },
      lead.id,
    ),
    loadLeadAssignments(id),
  ]);

  return (
    <>
      {(query.notice || query.error) && <p className={query.error ? styles.flashError : styles.flashNotice} role={query.error ? "alert" : "status"}>{query.error ?? query.notice}</p>}
      <Link className={styles.backLink} href="/admin/leads">
        ← All leads
      </Link>

      <header className={styles.leadHeader}>
        <h1 className={styles.title}>{lead.publicReference}</h1>
        <p className={styles.lede}>
          <span className={styles.status} data-state={lead.status}>
            {formatStatus(lead.status)}
          </span>
          {" · "}
          Created {formatAdminDateTime(lead.createdAt)}
        </p>
        <p className={styles.nextAction}>
          {nextAction(lead.status, assignments)}
        </p>
      </header>

      <nav className={styles.workflowNav} aria-label="Lead workflow"><a href="#review">1. Review</a><a href="#qualify">2. Qualify</a><a href="#assignment">3. Handoff</a><a href="#followup">4. Outcome</a><a href="#notes">Notes</a></nav>
      <h2 id="review" className={styles.sectionTitle}>1. Review the request</h2>
      <div className={styles.detailGrid}>
        <section className={styles.panel} aria-labelledby="customer-heading">
          <h2 id="customer-heading">Customer</h2>
          <dl className={styles.dl}>
            <dt>Name</dt>
            <dd>{lead.customer.fullName}</dd>
            <dt>Phone</dt>
            <dd>
              {lead.customer.phone ? (
                <a href={`tel:${lead.customer.phone}`}>{lead.customer.phone}</a>
              ) : (
                "—"
              )}
            </dd>
            <dt>Email</dt>
            <dd>
              {lead.customer.email ? (
                <a href={`mailto:${lead.customer.email}`}>
                  {lead.customer.email}
                </a>
              ) : (
                "—"
              )}
            </dd>
            <dt>Preferred</dt>
            <dd>{formatPreferredContact(lead.customer.preferredContact)}</dd>
          </dl>
        </section>

        <section className={styles.panel} aria-labelledby="project-heading">
          <h2 id="project-heading">Project</h2>
          <dl className={styles.dl}>
            <dt>Description</dt>
            <dd className={styles.description}>{lead.projectDescription}</dd>
            <dt>Timing</dt>
            <dd>{lead.urgency ?? "—"}</dd>
            <dt>ZIP</dt>
            <dd>{lead.postalCode ?? "—"}</dd>
            <dt>Landing page</dt>
            <dd>{lead.firstLandingPage ?? "—"}</dd>
          </dl>
        </section>
      </div>

      {lead.photos.length > 0 ? (
        <section className={styles.section} aria-labelledby="photos-heading">
          <h2 id="photos-heading" className={styles.sectionTitle}>
            Photos
          </h2>
          <div className={styles.photos}>
            {lead.photos.map((photo) => (
              <div key={photo.id} className={styles.photo}>
                {photo.signedUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo.signedUrl}
                    alt={photo.originalFilename ?? "Project photo"}
                  />
                ) : (
                  <div className={styles.photoMeta}>Unavailable</div>
                )}
                <div className={styles.photoMeta}>
                  {photo.originalFilename ?? photo.storagePath}
                  <br />
                  {formatAdminDateTime(photo.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className={styles.section} aria-labelledby="photos-heading">
          <h2 id="photos-heading" className={styles.sectionTitle}>
            Photos
          </h2>
          <p className={styles.empty}>No photos attached.</p>
        </section>
      )}

      <LeadOperationsPanels lead={lead}>
        <LeadAssignmentPanel
        leadId={lead.id}
        status={lead.status}
        serviceId={lead.serviceId}
        locationId={lead.locationId}
        eligible={eligibleVendors}
        assignments={assignments}
      />
      </LeadOperationsPanels>
    </>
  );
}
