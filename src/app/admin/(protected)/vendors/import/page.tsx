import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import Link from "next/link";
import { VendorImportForm } from "@/components/admin/VendorImportForm";
import styles from "@/components/admin/admin.module.css";

export default function VendorImportPage() {
  return (
    <>
      <Link className={styles.backLink} href="/admin/vendors">← All vendors</Link>
      <AdminPageHeader title="Import vendor candidates" description="Upload your research, review the validation results, then import. New records start as discovered and are not activated." />
      <VendorImportForm />
    </>
  );
}
