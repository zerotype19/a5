/** Development-only visual fixture. Staged temporarily by scripts/preview-foundation.mjs. */
import { notFound } from "next/navigation";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LeadsTable } from "@/components/admin/LeadsTable";
import { LeadOperationsPanels } from "@/components/admin/LeadOperationsPanels";
import { LeadAssignmentPanel } from "@/components/admin/LeadAssignmentPanel";
import { VendorEditor } from "@/components/admin/VendorEditor";
import type { LeadDetail, LeadListRow } from "@/lib/admin/data";
import type { VendorCoverage } from "@/lib/admin/vendors";
import styles from "@/components/admin/admin.module.css";
const vendor: VendorCoverage = { id: "00000000-0000-4000-8000-000000000001", businessName: "Example Neighborhood Masonry & Exterior Restoration", contactName: "Sample Provider", phone: "9735550100", email: "sample@example.invalid", website: null, source: "Visual fixture", sourceUrl: null, discoveryNotes: null, status: "DISCOVERED", acceptingLeads: false, registrationNumber: null, licenseNumber: null, insuranceVerified: false, credentialsNotes: null, serviceIds: ["masonry"], locationIds: ["madison", "chatham"] };
const lead: LeadDetail = { id: "00000000-0000-4000-8000-000000000002", publicReference: "A5-PREVIEW", status: "NEW", createdAt: "2026-10-07T12:00:00Z", updatedAt: "2026-10-07T12:00:00Z", projectDescription: "Fictional layout sample: loose mortar along the front steps and a paver that rocks when stepped on.", urgency: "WITHIN_30_DAYS", serviceId: null, serviceSelectionStatus: "NOT_SURE", serviceLabel: "Not sure", postalCode: "07932", locationId: null, firstLandingPage: "/services/masonry", customer: { id: "00000000-0000-4000-8000-000000000003", fullName: "Sample Homeowner With A Longer Name", phone: "9735550100", email: "sample.homeowner@example.invalid", preferredContact: "email" }, photos: [], history: [], notes: [] };
export default async function Preview({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  if (process.env.NODE_ENV !== "development") notFound();
  const { view } = await searchParams;
  const rows: LeadListRow[] = ["NEW", "QUALIFIED", "ASSIGNED", "WON"].map((status, i) => ({ id: `${lead.id}-${i}`, publicReference: `A5-SAMPLE${i}`, createdAt: lead.createdAt, customerName: lead.customer.fullName, serviceLabel: "Masonry and exterior repair assessment", postalCode: "07932", locationId: "florham-park", urgency: "WITHIN_30_DAYS", status: status as LeadListRow["status"] }));
  return <AdminShell email="preview@example.invalid"><p className={styles.flashNotice}>Visual fixture only. Fictional records; do not submit these forms.</p><nav className={styles.workflowNav} aria-label="Preview pages"><Link href="?view=queue">Lead queue</Link><Link href="?view=lead">Lead workflow</Link><Link href="?view=vendor">Vendor editor</Link></nav>
    {view === "vendor" ? <><AdminPageHeader title={vendor.businessName} description="Review contact details, coverage and credentials, then save the relationship settings." /><VendorEditor vendor={vendor} /></> : view === "lead" ? <><AdminPageHeader title={lead.publicReference} description="Review the request, classify and qualify it, then hand off to a provider." /><section className={styles.panel}><h2>1. Review the request</h2><p>{lead.projectDescription}</p></section><LeadOperationsPanels lead={lead}><LeadAssignmentPanel leadId={lead.id} status={lead.status} serviceId={lead.serviceId} locationId={lead.locationId} eligible={[vendor]} assignments={[]} /></LeadOperationsPanels></> : <><AdminPageHeader title="Leads" description="Review homeowner requests and move each project forward." /><LeadsTable rows={rows} emptyMessage="No requests" /></>}
  </AdminShell>;
}
