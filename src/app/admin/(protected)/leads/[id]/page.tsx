import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocationById, type LocationId } from "@config/locations";
import { loadLeadDetail } from "@/lib/admin/data";
import {
  formatAdminDateTime,
  formatPreferredContact,
} from "@/lib/admin/format";
import { LeadOperationsPanels } from "@/components/admin/LeadOperationsPanels";
import { LeadAssignmentPanel } from "@/components/admin/LeadAssignmentPanel";
import { loadEligibleVendors, loadLeadAssignments } from "@/lib/admin/vendors";
import styles from "@/components/admin/admin.module.css";

function nextAction(status: string): string {
  switch (status) {
    case "NEW":
      return "Next: qualify this lead.";
    case "QUALIFIED":
      return "Next: assign a vendor.";
    case "ASSIGNED":
      return "Next: follow up with the assigned vendor.";
    case "ACCEPTED":
      return "Vendor accepted. Confirm the homeowner has been contacted.";
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
    loadEligibleVendors({
      serviceId: lead.serviceId,
      locationId: lead.locationId,
    }),
    loadLeadAssignments(id),
  ]);

  const locationLabel = lead.locationId
    ? (getLocationById(lead.locationId as LocationId)?.name ?? lead.locationId)
    : null;

  return (
    <>
      <Link className={styles.backLink} href="/admin/leads">
        ← All leads
      </Link>

      <header className={styles.leadHeader}>
        <h1 className={styles.title}>{lead.publicReference}</h1>
        <p className={styles.lede}>
          <span className={styles.status} data-state={lead.status}>
            {lead.status}
          </span>
          {" · "}
          Created {formatAdminDateTime(lead.createdAt)}
        </p>
        <p className={styles.nextAction}>{nextAction(lead.status)}</p>
      </header>

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

      <section className={styles.section} aria-labelledby="class-heading">
        <h2 id="class-heading" className={styles.sectionTitle}>
          Classification
        </h2>
        <div className={styles.panel}>
          <dl className={styles.dl}>
            <dt>Service</dt>
            <dd>{lead.serviceLabel}</dd>
            <dt>Homeowner</dt>
            <dd>{lead.serviceSelectionStatus ?? "—"}</dd>
            <dt>Location</dt>
            <dd>
              {locationLabel
                ? `${locationLabel} (${lead.locationId})`
                : "— (ZIP only)"}
            </dd>
            <dt>Raw ZIP</dt>
            <dd>{lead.postalCode ?? "—"}</dd>
          </dl>
        </div>
      </section>

      <LeadAssignmentPanel
        leadId={lead.id}
        status={lead.status}
        serviceId={lead.serviceId}
        locationId={lead.locationId}
        eligible={eligibleVendors}
        assignments={assignments}
      />

      <LeadOperationsPanels
        lead={lead}
        notice={query.notice ?? null}
        error={query.error ?? null}
      />
    </>
  );
}
