import { SubmitButton } from "./SubmitButton";
import Link from "next/link";
import {VendorLocationPicker} from "./VendorLocationPicker";
import { SERVICES } from "@config/services";
import { VENDOR_STATUSES } from "@/lib/db/schema";
import type { VendorCoverage } from "@/lib/admin/vendors";
import { saveVendor } from "@/lib/admin/vendor-actions";
import { formatStatus } from "@/lib/admin/format";
import styles from "./admin.module.css";
export function VendorEditor({ vendor, error }: { vendor?: VendorCoverage | null; error?: string | null }) {
  return <form className={`${styles.form} ${styles.editor}`} action={saveVendor}>
    <input type="hidden" name="vendorId" value={vendor?.id ?? ""} />
    {error && <p className={styles.flashError} role="alert">{error}</p>}
    <fieldset className={styles.panel}><legend>1. Business & contact</legend><div className={styles.formGrid}>
      <label className={styles.fieldLabel}>Business name<input name="businessName" required defaultValue={vendor?.businessName ?? ""} /></label>
      <label className={styles.fieldLabel}>Contact name<input name="contactName" defaultValue={vendor?.contactName ?? ""} /></label>
      <label className={styles.fieldLabel}>Phone<input name="phone" type="tel" defaultValue={vendor?.phone ?? ""} /></label>
      <label className={styles.fieldLabel}>Email<input name="email" type="email" defaultValue={vendor?.email ?? ""} /></label>
      <label className={styles.fieldLabel}>Website<input name="website" defaultValue={vendor?.website ?? ""} /></label>
    </div></fieldset>
    <fieldset className={styles.panel}><legend>2. Service coverage</legend><p className={styles.mutedCopy}>Record the work and towns this provider covers.</p><div className={styles.formGrid}>
      <fieldset><legend>Services</legend><div className={styles.checkboxGrid}>{SERVICES.map(service => <label key={service.id} className={styles.checkLabel}><input type="checkbox" name="serviceIds" value={service.id} defaultChecked={vendor?.serviceIds.includes(service.id) ?? false} />{service.name}</label>)}</div></fieldset>
      <VendorLocationPicker initialIds={vendor?.locationIds}/>
    </div></fieldset>
    <fieldset className={styles.panel}><legend>3. Credentials & background</legend><div className={styles.formGrid}>
      <label className={styles.fieldLabel}>Registration number<input name="registrationNumber" defaultValue={vendor?.registrationNumber ?? ""} /></label>
      <label className={styles.fieldLabel}>License number<input name="licenseNumber" defaultValue={vendor?.licenseNumber ?? ""} /></label>
      <label className={styles.checkLabel}><input type="checkbox" name="insuranceVerified" defaultChecked={vendor?.insuranceVerified ?? false} />Insurance verified</label>
      <label className={styles.fieldLabel}>Credential notes<textarea name="credentialsNotes" rows={3} defaultValue={vendor?.credentialsNotes ?? ""} /></label>
    </div><details className={styles.secondaryDetails}><summary>Discovery source & notes</summary><div className={styles.formGrid}>
      <label className={styles.fieldLabel}>Source<input name="source" defaultValue={vendor?.source ?? ""} /></label>
      <label className={styles.fieldLabel}>Source URL<input name="sourceUrl" defaultValue={vendor?.sourceUrl ?? ""} /></label>
      <label className={styles.fieldLabel}>Discovery notes<textarea name="discoveryNotes" rows={3} defaultValue={vendor?.discoveryNotes ?? ""} /></label>
    </div></details></fieldset>
    <fieldset className={styles.panel}><legend>4. Working relationship</legend><p className={styles.mutedCopy}>Confirm the current relationship and availability before changing these settings.</p><div className={styles.formGrid}>
      <label className={styles.fieldLabel}>Status<select name="status" defaultValue={vendor?.status ?? "DISCOVERED"}>{VENDOR_STATUSES.map(status => <option key={status} value={status}>{formatStatus(status)}</option>)}</select></label>
      <label className={styles.checkLabel}><input type="checkbox" name="acceptingLeads" defaultChecked={vendor?.acceptingLeads ?? false} />Accepting leads</label>
    </div></fieldset>
    <div className={styles.saveBar}><SubmitButton className={styles.primaryButton}>{vendor ? "Save vendor" : "Create vendor"}</SubmitButton><Link href="/admin/vendors">Back to vendors</Link></div>
  </form>;
}
