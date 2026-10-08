import { ArrowIcon } from "@/components/ArrowIcon";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import Link from "next/link";
import { VendorImportForm } from "@/components/admin/VendorImportForm";
import styles from "@/components/admin/admin.module.css";

export default function VendorImportPage() {
  return (
    <>
      <Link className={styles.backLink} href="/admin/vendors"><ArrowIcon direction="left" /> All vendors</Link>
      <AdminPageHeader title="Import vendor candidates" description="Upload your research, review the validation results, then import. Rows with email start as discovered; rows without email are inactive until an address is added." />
      <VendorImportForm />
    </>
  );
}
