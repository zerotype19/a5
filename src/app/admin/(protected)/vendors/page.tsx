/* eslint-disable @next/next/no-html-link-for-pages -- Full navigation resets unsaved native filter controls, including when already on this URL. */
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { formatStatus } from "@/lib/admin/format";
import { VENDOR_STATUSES } from "@/lib/db/schema";
import Link from "next/link";
import { loadVendors, coverageLabels } from "@/lib/admin/vendors";
import styles from "@/components/admin/admin.module.css";

export default async function VendorsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; accepting?: string; page?:string }> }) {
  const params = await searchParams;
  const q = (typeof params.q === "string" ? params.q : "").trim().slice(0, 100);
  const status = VENDOR_STATUSES.find(value => value === params.status) ?? "";
  const all = await loadVendors();
  const vendors = all.filter(vendor => (!status || vendor.status === status) && (params.accepting !== "1" || vendor.acceptingLeads) && (!q || [vendor.businessName, vendor.contactName ?? "", coverageLabels(vendor).services, coverageLabels(vendor).locations].some(value => value.toLowerCase().includes(q.toLowerCase()))));
  const page=Math.max(1,Math.min(Math.floor(Number(params.page))||1,Math.max(1,Math.ceil(vendors.length/50))));
  const shown=vendors.slice((page-1)*50,page*50);
  const pageHref=(next:number)=>`/admin/vendors?${new URLSearchParams({q,status,accepting:params.accepting??"",page:String(next)})}`;
  return (
    <>
      <AdminPageHeader title="Vendors" description="Find a vendor by advertised service area. Active means eligible to receive leads, not confirmed participation or availability." actions={<><Link className={styles.secondaryButton} href="/admin/vendors/signups">Signups</Link><Link className={styles.secondaryButton} href="/admin/vendors/import">Import CSV</Link><Link className={styles.primaryButton} href="/admin/vendors/new">Create vendor</Link></>} />
      <form key={`${q}-${status}-${params.accepting}`} className={styles.filters} method="get" aria-label="Filter vendors">
        <label>Find a provider<input type="search" name="q" defaultValue={q} maxLength={100} placeholder="Business, contact, service or town" /></label>
        <label>Status<select name="status" defaultValue={status}><option value="">All statuses</option>{VENDOR_STATUSES.map(value => <option key={value} value={value}>{formatStatus(value)}</option>)}</select></label>
        <label className={styles.checkLabel}><input type="checkbox" name="accepting" value="1" defaultChecked={params.accepting === "1"} />Accepting leads</label>
        <button type="submit" className={styles.secondaryButton}>Apply filters</button><a href="/admin/vendors">Clear filters</a>
      </form>
      <p className={styles.mutedCopy}>{vendors.length} matching providers · page {page} of {Math.max(1,Math.ceil(vendors.length/50))}</p>
      {vendors.length === 0 ? (
        <p className={styles.empty}>No providers match this view. Clear the filters or create a vendor.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}><caption className="srOnly">Provider directory</caption>
            <thead>
              <tr>
                <th scope="col">Business</th>
                <th scope="col">Status</th>
                <th scope="col">Accepting leads</th>
                <th scope="col">Services</th>
                <th scope="col">Towns</th>
                <th scope="col">Contact</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((vendor) => {
                const labels = coverageLabels(vendor);
                return (
                  <tr key={vendor.id}>
                    <td data-label="Business">
                      <Link href={`/admin/vendors/${vendor.id}`}>
                        {vendor.businessName}
                      </Link>
                    </td>
                    <td data-label="Status">
                      <span className={styles.status} data-state={vendor.status}>
                        {formatStatus(vendor.status)}
                      </span>
                    </td>
                    <td data-label="Accepting">
                      {vendor.acceptingLeads ? "Accepting" : "Not accepting"}
                    </td>
                    <td data-label="Services">{labels.services}</td>
                    <td data-label="Towns">{vendor.locationIds.length > 4 ? <details><summary>{vendor.locationIds.length} mapped areas</summary><p>{labels.locations}</p></details> : labels.locations}</td>
                    <td data-label="Contact">
                      {vendor.phone ?? vendor.email ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <nav className={styles.pagination} aria-label="Vendor pages">{page>1&&<Link href={pageHref(page-1)}>Previous</Link>}{page*50<vendors.length&&<Link href={pageHref(page+1)}>Next</Link>}</nav>
    </>
  );
}
