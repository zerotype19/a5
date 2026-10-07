import { ArrowIcon } from "@/components/ArrowIcon";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { notFound } from "next/navigation";
import { VendorEditor } from "@/components/admin/VendorEditor";
import { loadVendor } from "@/lib/admin/vendors";
import styles from "@/components/admin/admin.module.css";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ notice?: string; error?: string }>;

export default async function VendorDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const query = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const vendor = await loadVendor(id);
  if (!vendor) notFound();
  return (
    <>
      <Link className={styles.backLink} href="/admin/vendors"><ArrowIcon direction="left" /> All vendors</Link>
      <AdminPageHeader title={vendor.businessName} description="Work through the contact details, coverage and credentials, then save the relationship settings." />
      {query.notice ? (
        <p className={styles.flashNotice} role="status">
          {query.notice}
        </p>
      ) : null}
      <VendorEditor vendor={vendor} error={query.error ?? null} />
    </>
  );
}
