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
  | "electrical";

export type Service = {
  id: ServiceId;
  name: string;
  slug: string;
};

export const SERVICES: readonly Service[] = [
  { id: "handyman", name: "Handyman", slug: "handyman" },
  { id: "masonry", name: "Masonry", slug: "masonry" },
  { id: "landscaping", name: "Landscaping", slug: "landscaping" },
  { id: "painting", name: "Painting", slug: "painting" },
  { id: "drywall", name: "Drywall", slug: "drywall" },
  { id: "tile", name: "Tile", slug: "tile" },
  { id: "plumbing", name: "Plumbing", slug: "plumbing" },
  { id: "electrical", name: "Electrical", slug: "electrical" },
] as const;

export function getServiceById(id: ServiceId): Service | undefined {
  return SERVICES.find((service) => service.id === id);
}

export function getServiceBySlug(slug: string): Service | undefined {
  return SERVICES.find((service) => service.slug === slug);
}
