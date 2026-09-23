import { buildOrganizationSchema } from "@/lib/authority/schema";

/** Truthful Organization JSON-LD only — no LocalBusiness address/reviews. */
export function organizationJsonLd() {
  return buildOrganizationSchema();
}
