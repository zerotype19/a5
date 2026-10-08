/**
 * Canonical MVP service registry.
 * Approved services only — do not add entries without owner approval.
 */

export type ServiceId =
  | "handyman"
  | "masonry"
  | "landscaping"
  | "painting"
  | "drywall"
  | "tile"
  | "plumbing"
  | "electrical"
  | "hvac"
  | "roofing"
  | "house-cleaning"
  | "gutters"
  | "pest-control"
  | "junk-removal"
  | "tree-services"
  | "appliance-repair";


export type Service = {
  id: ServiceId;
  name: string;
  slug: string;
};

export const INITIAL_SERVICES: readonly Service[] = [
  { id: "handyman", name: "Handyman", slug: "handyman" },
  { id: "masonry", name: "Masonry", slug: "masonry" },
  { id: "landscaping", name: "Landscaping", slug: "landscaping" },
  { id: "painting", name: "Painting", slug: "painting" },
  { id: "drywall", name: "Drywall", slug: "drywall" },
  { id: "tile", name: "Tile", slug: "tile" },
  { id: "plumbing", name: "Plumbing", slug: "plumbing" },
  { id: "electrical", name: "Electrical", slug: "electrical" },
] as const;

export const EXPANSION_SERVICES: readonly Service[] = [
  {
    "id": "hvac",
    "name": "Heating & Cooling",
    "slug": "hvac"
  },
  {
    "id": "roofing",
    "name": "Roofing",
    "slug": "roofing"
  },
  {
    "id": "house-cleaning",
    "name": "House Cleaning",
    "slug": "house-cleaning"
  },
  {
    "id": "gutters",
    "name": "Gutter Services",
    "slug": "gutters"
  },
  {
    "id": "pest-control",
    "name": "Pest Control",
    "slug": "pest-control"
  },
  {
    "id": "junk-removal",
    "name": "Junk Removal",
    "slug": "junk-removal"
  },
  {
    "id": "tree-services",
    "name": "Tree Services",
    "slug": "tree-services"
  },
  {
    "id": "appliance-repair",
    "name": "Appliance Repair",
    "slug": "appliance-repair"
  }
];
export const SERVICES: readonly Service[] = [...INITIAL_SERVICES, ...EXPANSION_SERVICES];

export function getServiceById(id: ServiceId): Service | undefined {
  return SERVICES.find((service) => service.id === id);
}

export function getServiceBySlug(slug: string): Service | undefined {
  return SERVICES.find((service) => service.slug === slug);
}
