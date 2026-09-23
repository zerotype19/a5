import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { LOCATIONS } from "../config/locations.ts";
import { SERVICES } from "../config/services.ts";
import {
  ATTRIBUTION_CONFIDENCE_VALUES,
  CORE_TABLES,
  LEAD_STATUSES,
} from "../src/lib/db/schema.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const migrationsDir = join(root, "supabase", "migrations");

function loadCoreMigration(): { fileName: string; sql: string } {
  const files = readdirSync(migrationsDir)
    .filter((name) => name.endsWith(".sql"))
    .sort();
  const fileName = files.find((name) => name.includes("a5_001_core"));
  assert.ok(fileName, "expected A5-001 core migration SQL file");
  return {
    fileName,
    sql: readFileSync(join(migrationsDir, fileName), "utf8"),
  };
}

describe("A5-001 core operational migration", () => {
  const { fileName, sql } = loadCoreMigration();

  it("ships a single dated SQL migration under supabase/migrations", () => {
    assert.match(fileName, /^\d{14}_a5_001_core_operational_schema\.sql$/);
  });

  it("creates the five approved core tables", () => {
    for (const table of CORE_TABLES) {
      assert.match(
        sql,
        new RegExp(`create table public\\.${table}\\b`, "i"),
        `missing create for ${table}`,
      );
    }
  });

  it("does not create out-of-scope vendor or assignment tables", () => {
    assert.doesNotMatch(sql, /create table public\.vendors\b/i);
    assert.doesNotMatch(sql, /create table public\.lead_assignments\b/i);
    assert.doesNotMatch(sql, /create table public\.projects\b/i);
  });

  it("enables RLS and deny-all policies on operational tables", () => {
    for (const table of CORE_TABLES) {
      assert.match(
        sql,
        new RegExp(`alter table public\\.${table} enable row level security`, "i"),
      );
      assert.match(
        sql,
        new RegExp(
          `create policy \\w+_deny_all on public\\.${table}[\\s\\S]*?to anon, authenticated[\\s\\S]*?using \\(false\\)`,
          "i",
        ),
        `missing deny-all policy for ${table}`,
      );
    }
  });

  it("defines approved lead_status enum values", () => {
    for (const status of LEAD_STATUSES) {
      assert.match(sql, new RegExp(`'${status}'`));
    }
  });

  it("defines approved attribution_confidence enum values", () => {
    for (const value of ATTRIBUTION_CONFIDENCE_VALUES) {
      assert.match(sql, new RegExp(`'${value}'`));
    }
  });

  it("seeds services aligned to the product registry", () => {
    for (const service of SERVICES) {
      assert.match(
        sql,
        new RegExp(
          `\\('${service.id}', '${service.name}', '${service.slug}'\\)`,
        ),
      );
    }
    assert.equal(SERVICES.length, 8);
  });

  it("seeds locations aligned to the product registry", () => {
    for (const location of LOCATIONS) {
      assert.match(
        sql,
        new RegExp(
          `\\('${location.id}', '${location.name}', '${location.slug}', '${location.state}'\\)`,
        ),
      );
    }
    assert.equal(LOCATIONS.length, 6);
  });
});
