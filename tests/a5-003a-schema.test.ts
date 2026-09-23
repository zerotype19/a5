import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { LOCATIONS } from "../config/locations.ts";
import { SERVICES } from "../config/services.ts";
import {
  PREFERRED_CONTACT_METHODS,
  SERVICE_SELECTION_STATUSES,
} from "../src/lib/db/schema.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const migrationsDir = join(root, "supabase", "migrations");

function loadMigration(fragment: string): { fileName: string; sql: string } {
  const files = readdirSync(migrationsDir)
    .filter((name) => name.endsWith(".sql"))
    .sort();
  const fileName = files.find((name) => name.includes(fragment));
  assert.ok(fileName, `expected migration matching ${fragment}`);
  return {
    fileName,
    sql: readFileSync(join(migrationsDir, fileName), "utf8"),
  };
}

describe("A5-003A intake schema compatibility", () => {
  const { fileName, sql } = loadMigration("a5_003a_intake");
  const foundation = loadMigration("a5_001_core");

  it("ships a dated additive migration without rewriting A5-001", () => {
    assert.match(fileName, /^\d{14}_a5_003a_intake_schema_compat\.sql$/);
    assert.notEqual(fileName, foundation.fileName);
    assert.doesNotMatch(sql, /drop table/i);
    assert.doesNotMatch(sql, /create table public\.services/i);
  });

  it("extends preferred_contact_method with text while keeping phone and email", () => {
    assert.deepEqual([...PREFERRED_CONTACT_METHODS], ["phone", "email", "text"]);
    assert.match(sql, /alter type public\.preferred_contact_method add value 'text'/i);
    assert.match(foundation.sql, /'phone'/);
    assert.match(foundation.sql, /'email'/);
  });

  it("makes service_id and location_id nullable without inventing UNKNOWN service", () => {
    assert.match(
      sql,
      /alter table public\.leads\s+alter column service_id drop not null/i,
    );
    assert.match(
      sql,
      /alter table public\.leads\s+alter column location_id drop not null/i,
    );
    assert.doesNotMatch(sql, /insert into public\.services[\s\S]*unknown/i);
    assert.equal(
      SERVICES.some((service) => String(service.id) === "unknown"),
      false,
    );  });

  it("adds postal_code as text on leads", () => {
    assert.match(
      sql,
      /add column postal_code text/i,
    );
  });

  it("adds service_selection_status SELECTED | NOT_SURE with consistency check", () => {
    assert.deepEqual([...SERVICE_SELECTION_STATUSES], ["SELECTED", "NOT_SURE"]);
    assert.match(sql, /create type public\.service_selection_status as enum/i);
    assert.match(sql, /'SELECTED'/);
    assert.match(sql, /'NOT_SURE'/);
    assert.match(sql, /leads_service_selection_consistency/);
  });

  it("preserves approved service and location FK targets", () => {
    for (const service of SERVICES) {
      assert.match(
        foundation.sql,
        new RegExp(`\\('${service.id}', '${service.name}', '${service.slug}'\\)`),
      );
    }
    for (const location of LOCATIONS) {
      assert.match(
        foundation.sql,
        new RegExp(
          `\\('${location.id}', '${location.name}', '${location.slug}', '${location.state}'\\)`,
        ),
      );
    }
  });

  it("does not alter lead lifecycle enum", () => {
    assert.doesNotMatch(sql, /alter type public\.lead_status/i);
    assert.doesNotMatch(sql, /create type public\.lead_status/i);
  });
});
