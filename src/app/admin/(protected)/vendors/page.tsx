import Link from "next/link";
import { loadVendors, coverageLabels } from "@/lib/admin/vendors";
import styles from "@/components/admin/admin.module.css";

export default async function VendorsPage() {
  const vendors = await loadVendors();
  return (
    <>
      <header className={styles.leadHeader}>
        <h1 className={styles.title}>Vendors</h1>
        <p className={styles.lede}>
          Manual fulfillment partners. No vendor login and no public directory.
        </p>
      </header>
      <p>
        <Link href="/admin/vendors/import">Import CSV</Link>
        {" · "}
        <Link href="/admin/vendors/new">Create vendor</Link>
      </p>
      {vendors.length === 0 ? (
        <p className={styles.empty}>No vendors yet.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Business</th>
                <th>Status</th>
                <th>Accepting leads</th>
                <th>Services</th>
                <th>Towns</th>
                <th>Contact</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => {
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
                        {vendor.status}
                      </span>
                    </td>
                    <td data-label="Accepting">
                      {vendor.acceptingLeads ? "Accepting" : "Not accepting"}
                    </td>
                    <td data-label="Services">{labels.services}</td>
                    <td data-label="Towns">{labels.locations}</td>
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
    </>
  );
}
