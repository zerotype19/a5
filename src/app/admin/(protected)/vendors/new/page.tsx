import { ArrowIcon } from "@/components/ArrowIcon";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { VendorEditor } from "@/components/admin/VendorEditor";
import styles from "@/components/admin/admin.module.css";

type SearchParams = Promise<{ error?: string }>;

export default async function NewVendorPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const query = await searchParams;
  return (
    <>
      <Link className={styles.backLink} href="/admin/vendors"><ArrowIcon direction="left" /> All vendors</Link>
      <AdminPageHeader title="Create vendor" description="Start with contact details, add coverage and credentials, then confirm the working relationship." />
      <VendorEditor error={query.error ?? null} />
    </>
  );
}
