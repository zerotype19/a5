/**
 * A5-008 vendor candidate CSV.
 * Import creates DISCOVERED rows only. It never sets ACTIVE or accepting_leads.
 * Unknown services and locations reject the row. They are not invented.
 */

import { LOCATIONS, type LocationId } from "../../../config/locations.ts";
import { SERVICES, type ServiceId } from "../../../config/services.ts";
import { isValidUsPhone } from "../../components/intake/validation.ts";

export const VENDOR_IMPORT_COLUMNS = [
  "business_name",
  "contact_name",
  "phone",
  "email",
  "website",
  "services",
  "locations",
  "source",
  "source_url",
  "discovery_notes",
] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HTTP_RE = /^https?:\/\/\S+$/i;

export type VendorImportRow = {
  row: number;
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
  website: string;
  serviceIds: ServiceId[];
  locationIds: LocationId[];
  source: string;
  sourceUrl: string;
  discoveryNotes: string;
};

export type VendorImportRejection = {
  row: number;
  businessName: string;
  reason: string;
};

export type VendorImportParse = {
  rows: VendorImportRow[];
  rejected: VendorImportRejection[];
  fileError: string | null;
};

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const source = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    if (quoted) {
      if (char === '"') {
        if (source[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        cell += char;
      }
      continue;
    }
    if (char === '"') {
      quoted = true;
      continue;
    }
    if (char === ",") {
      row.push(cell);
      cell = "";
      continue;
    }
    if (char === "\n" || char === "\r") {
      if (char === "\r" && source[i + 1] === "\n") i += 1;
      row.push(cell);
      cell = "";
      if (row.some((value) => value.trim().length > 0)) rows.push(row);
      row = [];
      continue;
    }
    cell += char;
  }
  row.push(cell);
  if (row.some((value) => value.trim().length > 0)) rows.push(row);
  return rows;
}

function splitList(value: string): string[] {
  const raw = value.trim();
  if (!raw) return [];
  const separator = raw.includes(";") ? ";" : raw.includes("|") ? "|" : ",";
  return raw
    .split(separator)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function matchService(token: string): ServiceId | null {
  const key = token.trim().toLowerCase();
  const found = SERVICES.find(
    (service) =>
      service.id === key ||
      service.slug === key ||
      service.name.toLowerCase() === key,
  );
  return found?.id ?? null;
}

function matchLocation(token: string): LocationId | null {
  const key = token.trim().toLowerCase().replace(/,?\s*nj$/, "");
  const found = LOCATIONS.find(
    (location) =>
      location.id === key ||
      location.slug === key ||
      location.name.toLowerCase() === key,
  );
  return found?.id ?? null;
}

export function parseVendorCandidateCsv(
  text: string,
  existingNames: readonly string[] = [],
): VendorImportParse {
  const table = parseCsv(text);
  if (table.length === 0) {
    return { rows: [], rejected: [], fileError: "The CSV is empty." };
  }
  const header = table[0].map((column) => column.trim().toLowerCase());
  const expected = [...VENDOR_IMPORT_COLUMNS];
  const missing = expected.filter((column) => !header.includes(column));
  const extra = header.filter(
    (column) =>
      column.length > 0 &&
      !expected.includes(column as (typeof VENDOR_IMPORT_COLUMNS)[number]),
  );
  if (missing.length > 0 || extra.length > 0) {
    const parts = [];
    if (missing.length > 0) parts.push(`missing ${missing.join(", ")}`);
    if (extra.length > 0) parts.push(`unexpected ${extra.join(", ")}`);
    return {
      rows: [],
      rejected: [],
      fileError: `CSV headers must be exactly ${expected.join(", ")}. ${parts.join("; ")}.`,
    };
  }

  const index = new Map(header.map((column, position) => [column, position]));
  const seen = new Set(
    existingNames.map((name) => name.trim().toLowerCase()).filter(Boolean),
  );
  const rows: VendorImportRow[] = [];
  const rejected: VendorImportRejection[] = [];

  for (let i = 1; i < table.length; i += 1) {
    const cells = table[i];
    const rowNumber = i + 1;
    const value = (column: string) =>
      (cells[index.get(column) ?? -1] ?? "").trim();
    const businessName = value("business_name");
    const fail = (reason: string) => {
      rejected.push({
        row: rowNumber,
        businessName: businessName || "(blank)",
        reason,
      });
    };

    if (businessName.length < 1 || businessName.length > 160) {
      fail("Business name is required and must be 160 characters or fewer.");
      continue;
    }
    const key = businessName.toLowerCase();
    if (seen.has(key)) {
      fail("A vendor with this business name is already in the file or the database. Existing vendors were not changed.");
      continue;
    }

    const phone = value("phone");
    if (phone && !isValidUsPhone(phone)) {
      fail("Phone must be a valid US number or be left blank.");
      continue;
    }
    const email = value("email");
    if (email && !EMAIL_RE.test(email)) {
      fail("Email must be valid or be left blank.");
      continue;
    }
    const website = value("website");
    if (website && !HTTP_RE.test(website)) {
      fail("Website must start with http:// or https://, or be left blank.");
      continue;
    }
    const sourceUrl = value("source_url");
    if (sourceUrl && !HTTP_RE.test(sourceUrl)) {
      fail("Source URL must start with http:// or https://, or be left blank.");
      continue;
    }
    const source = value("source");
    if (source.length > 80) {
      fail("Source must be 80 characters or fewer.");
      continue;
    }
    const discoveryNotes = value("discovery_notes");
    if (discoveryNotes.length > 2000) {
      fail("Discovery notes must be 2000 characters or fewer.");
      continue;
    }

    const serviceTokens = splitList(value("services"));
    const locationTokens = splitList(value("locations"));
    if (serviceTokens.length === 0) {
      fail("At least one service is required.");
      continue;
    }
    if (locationTokens.length === 0) {
      fail("At least one location is required.");
      continue;
    }
    const unknownService = serviceTokens.find((token) => !matchService(token));
    if (unknownService) {
      fail(`Unknown service "${unknownService}". Use a registry id or name.`);
      continue;
    }
    const unknownLocation = locationTokens.find((token) => !matchLocation(token));
    if (unknownLocation) {
      fail(`Unknown location "${unknownLocation}". Use a registry id or name.`);
      continue;
    }

    seen.add(key);
    rows.push({
      row: rowNumber,
      businessName,
      contactName: value("contact_name"),
      phone,
      email,
      website,
      serviceIds: [...new Set(serviceTokens.map((token) => matchService(token)!))],
      locationIds: [
        ...new Set(locationTokens.map((token) => matchLocation(token)!)),
      ],
      source,
      sourceUrl,
      discoveryNotes,
    });
  }

  return { rows, rejected, fileError: null };
}
