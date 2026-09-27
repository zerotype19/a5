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
      <h1 className={styles.title}>Create vendor</h1>
      <VendorEditor error={query.error ?? null} />
    </>
  );
}
