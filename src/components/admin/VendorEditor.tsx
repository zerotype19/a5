import { LOCATIONS } from "@config/locations";
import { SERVICES } from "@config/services";
import { VENDOR_STATUSES } from "@/lib/db/schema";
import type { VendorCoverage } from "@/lib/admin/vendors";
import { saveVendor } from "@/lib/admin/vendor-actions";
import styles from "./admin.module.css";

type Props = {
  vendor?: VendorCoverage | null;
  error?: string | null;
};

export function VendorEditor({ vendor, error }: Props) {
  return (
    <form className={styles.form} action={saveVendor}>
      <input type="hidden" name="vendorId" value={vendor?.id ?? ""} />
      {error ? <p className={styles.formError}>{error}</p> : null}
      <label className={styles.fieldLabel}>
        Business name
        <input name="businessName" required defaultValue={vendor?.businessName ?? ""} />
      </label>
      <label className={styles.fieldLabel}>
        Contact name
        <input name="contactName" defaultValue={vendor?.contactName ?? ""} />
      </label>
      <label className={styles.fieldLabel}>
        Phone
        <input name="phone" defaultValue={vendor?.phone ?? ""} />
      </label>
      <label className={styles.fieldLabel}>
        Email
        <input name="email" type="email" defaultValue={vendor?.email ?? ""} />
      </label>
      <label className={styles.fieldLabel}>
        Status
        <select name="status" defaultValue={vendor?.status ?? "PROSPECT"}>
          {VENDOR_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>
      <label className={styles.fieldLabel}>
        <input
          type="checkbox"
          name="acceptingLeads"
          defaultChecked={vendor?.acceptingLeads ?? false}
        />{" "}
        Accepting leads
      </label>
      <fieldset className={styles.panel}>
        <legend>Services</legend>
        {SERVICES.map((service) => (
          <label key={service.id} className={styles.fieldLabel}>
            <input
              type="checkbox"
              name="serviceIds"
              value={service.id}
              defaultChecked={vendor?.serviceIds.includes(service.id) ?? false}
            />{" "}
            {service.name}
          </label>
        ))}
      </fieldset>
      <fieldset className={styles.panel}>
        <legend>Locations</legend>
        {LOCATIONS.map((location) => (
          <label key={location.id} className={styles.fieldLabel}>
            <input
              type="checkbox"
              name="locationIds"
              value={location.id}
              defaultChecked={vendor?.locationIds.includes(location.id) ?? false}
            />{" "}
            {location.name}
          </label>
        ))}
      </fieldset>
      <label className={styles.fieldLabel}>
        Registration number
        <input
          name="registrationNumber"
          defaultValue={vendor?.registrationNumber ?? ""}
        />
      </label>
      <label className={styles.fieldLabel}>
        License number
        <input name="licenseNumber" defaultValue={vendor?.licenseNumber ?? ""} />
      </label>
      <label className={styles.fieldLabel}>
        <input
          type="checkbox"
          name="insuranceVerified"
          defaultChecked={vendor?.insuranceVerified ?? false}
        />{" "}
        Insurance verified
      </label>
      <label className={styles.fieldLabel}>
        Credential notes
        <textarea
          name="credentialsNotes"
          rows={4}
          defaultValue={vendor?.credentialsNotes ?? ""}
        />
      </label>
      <button type="submit">{vendor ? "Save vendor" : "Create vendor"}</button>
    </form>
  );
}
