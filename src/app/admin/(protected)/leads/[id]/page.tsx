import Link from "next/link";
import { notFound } from "next/navigation";
import { loadLeadDetail } from "@/lib/admin/data";
import {
  formatAdminDateTime,
  formatPreferredContact,
} from "@/lib/admin/format";
import styles from "@/components/admin/admin.module.css";

type Params = Promise<{ id: string }>;

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    notFound();
  }

  const lead = await loadLeadDetail(id);
  if (!lead) {
    notFound();
  }

  return (
    <>
      <Link className={styles.backLink} href="/admin/leads">
        ← All leads
      </Link>
      <h1 className={styles.title}>{lead.publicReference}</h1>
      <p className={styles.lede}>
        Status <strong>{lead.status}</strong> · read-only detail
      </p>

      <div className={styles.detailGrid}>
        <section className={styles.panel} aria-labelledby="customer-heading">
          <h2 id="customer-heading">Customer</h2>
          <dl className={styles.dl}>
            <dt>Name</dt>
            <dd>{lead.customer.fullName}</dd>
            <dt>Phone</dt>
            <dd>{lead.customer.phone ?? "—"}</dd>
            <dt>Email</dt>
            <dd>{lead.customer.email ?? "—"}</dd>
            <dt>Preferred</dt>
            <dd>{formatPreferredContact(lead.customer.preferredContact)}</dd>
          </dl>
        </section>

        <section className={styles.panel} aria-labelledby="project-heading">
          <h2 id="project-heading">Project</h2>
          <dl className={styles.dl}>
            <dt>Service</dt>
            <dd>{lead.serviceLabel}</dd>
            <dt>Selection</dt>
            <dd>{lead.serviceSelectionStatus ?? "—"}</dd>
            <dt>ZIP</dt>
            <dd>{lead.postalCode ?? "—"}</dd>
            <dt>Location</dt>
            <dd>{lead.locationId ?? "— (ZIP only)"}</dd>
            <dt>Timing</dt>
            <dd>{lead.urgency ?? "—"}</dd>
            <dt>Status</dt>
            <dd>{lead.status}</dd>
            <dt>Created</dt>
            <dd>{formatAdminDateTime(lead.createdAt)}</dd>
            <dt>Updated</dt>
            <dd>{formatAdminDateTime(lead.updatedAt)}</dd>
            <dt>Reference</dt>
            <dd>{lead.publicReference}</dd>
          </dl>
        </section>
      </div>

      <section className={styles.section} aria-labelledby="description-heading">
        <h2 id="description-heading" className={styles.sectionTitle}>
          Description
        </h2>
        <div className={styles.panel}>
          <p className={styles.description}>{lead.projectDescription}</p>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="photos-heading">
        <h2 id="photos-heading" className={styles.sectionTitle}>
          Photos
        </h2>
        {lead.photos.length === 0 ? (
          <p className={styles.empty}>No photos attached.</p>
        ) : (
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
        )}
      </section>
    </>
  );
}
