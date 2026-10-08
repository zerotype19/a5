import {getCountyBySlug} from "../../../config/counties.ts";
import {getLocationById,type LocationId} from "../../../config/locations.ts";
import type { ContentPageRecord } from "./types.ts";
import { buildContentPathFromRecord } from "./urls.ts";

export type DiscoveryLink = { path: string; title: string; description: string | null };
export type DiscoveryGroup = { title: string; links: DiscoveryLink[] };

/** Navigation derives only from explicitly published, indexable content records. */
export function buildDiscoveryGroups(page: ContentPageRecord, candidates: ContentPageRecord[]): DiscoveryGroup[] {
  const eligible = candidates.filter(p => p.id !== page.id && p.status === "PUBLISHED" && p.indexable);
  const service = page.primary_service_id;
  const town = page.primary_location_id;
  const sameService = (p: ContentPageRecord) => Boolean(service && p.primary_service_id === service);
  const county=page.page_type === "CORE" ? getCountyBySlug(page.slug) : town ? getCountyBySlug(`${getLocationById(town as LocationId)?.countyId}-county`) : undefined;
  const groups = [
    {title:"Explore this county",pages:eligible.filter(p=>p.page_type === "CORE" && county && p.slug===county.slug)},
    {title:"Local project guides",pages:eligible.filter(p=>page.page_type === "CORE" && county && p.page_type === "LOCATION" && p.primary_location_id && getLocationById(p.primary_location_id as LocationId)?.countyId===county.id)},
    { title: "Explore the service", pages: eligible.filter(p => p.page_type === "SERVICE" && sameService(p)) },
    { title: town ? "Services in this town" : "Find this service near you", pages: eligible.filter(p => p.page_type === "SERVICE_LOCATION" && (town ? p.primary_location_id === town : sameService(p))) },
    { title: "Explore the area", pages: eligible.filter(p => p.page_type === "LOCATION" && town && p.primary_location_id === town) },
    { title: "Common problems and repairs", pages: eligible.filter(p => p.page_type === "PROBLEM" && sameService(p)) },
    { title: "Plan your project", pages: eligible.filter(p => ["GUIDE", "COMPARISON", "COST_GUIDE"].includes(p.page_type) && sameService(p)) },
  ];
  return groups.map(group => ({ title: group.title, links: group.pages.flatMap(p => {
    const path = buildContentPathFromRecord(p);
    return path ? [{path, title:p.h1, description:p.meta_description}] : [];
  }).sort((a,b) => a.title.localeCompare(b.title)) })).filter(group => group.links.length);
}
