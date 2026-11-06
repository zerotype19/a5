import {SERVICES} from "../../../config/services.ts";
import type {ContentPageRecord} from "./types.ts";

/** Keep category references first; never let another guide hide behind find(). */
export function buildCostLibraryGroups(pages: ContentPageRecord[]) {
  const eligible = pages.filter(p => p.status === "PUBLISHED" && p.indexable && p.page_type === "COST_GUIDE");
  return SERVICES.map(service => ({service, pages: eligible.filter(p => p.primary_service_id === service.id).sort((a,b) => {
    const primary = `${service.slug}-cost`;
    return Number(b.slug === primary) - Number(a.slug === primary) || a.h1.localeCompare(b.h1);
  })})).filter(group => group.pages.length > 0);
}
