"use client";

import { useActionState } from "react";
import { importVendorCandidates } from "@/lib/admin/vendor-import-action";
import { VENDOR_IMPORT_COLUMNS } from "@/lib/admin/vendor-import";
import styles from "./admin.module.css";

export function VendorImportForm() {
  const [result, action, pending] = useActionState(importVendorCandidates, null);

  return (
    <form className={styles.form} action={action}>
      <p className={styles.mutedCopy}>
        Columns: {VENDOR_IMPORT_COLUMNS.join(", ")}. Separate several services
        or towns with semicolons. Rows with email start as DISCOVERED. Rows without email are
        INACTIVE until an address is added.
      </p>
      <label className={styles.fieldLabel}>
        CSV file
        <input name="csvFile" type="file" accept=".csv,text/csv" />
      </label>
      <label className={styles.fieldLabel}>
        Or paste CSV
        <textarea name="csvText" rows={8} placeholder="business_name,contact_name,..." />
      </label>
      <button type="submit" disabled={pending}>
        {pending ? "Importing…" : "Import candidates"}
      </button>
      {result?.fileError ? (
        <p className={styles.formError}>{result.fileError}</p>
      ) : null}
      {result && !result.fileError ? (
        <div>
          <p>
            Imported {result.imported} vendor records. Rejected{" "}
            {result.rejected.length}.
          </p>
          {result.rejected.length > 0 ? (
            <ul>
              {result.rejected.map((item) => (
                <li key={`${item.row}-${item.reason}`}>
                  Row {item.row} ({item.businessName}): {item.reason}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
