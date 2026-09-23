/**
 * Canonical MVP location registry (Northern New Jersey cluster).
 * Approved locations only — do not add towns without owner approval.
 */

export type LocationId =
  | "florham-park"
  | "madison"
  | "chatham"
  | "morris-township"
  | "morristown"
  | "east-hanover";

export type Location = {
  id: LocationId;
  name: string;
  slug: string;
  state: "NJ";
};

export const LOCATIONS: readonly Location[] = [
  {
    id: "florham-park",
    name: "Florham Park",
    slug: "florham-park",
    state: "NJ",
  },
  { id: "madison", name: "Madison", slug: "madison", state: "NJ" },
  { id: "chatham", name: "Chatham", slug: "chatham", state: "NJ" },
  {
    id: "morris-township",
    name: "Morris Township",
    slug: "morris-township",
    state: "NJ",
  },
  { id: "morristown", name: "Morristown", slug: "morristown", state: "NJ" },
  {
    id: "east-hanover",
    name: "East Hanover",
    slug: "east-hanover",
    state: "NJ",
  },
] as const;

export function getLocationById(id: LocationId): Location | undefined {
  return LOCATIONS.find((location) => location.id === id);
}

export function getLocationBySlug(slug: string): Location | undefined {
  return LOCATIONS.find((location) => location.slug === slug);
}
