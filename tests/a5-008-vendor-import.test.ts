import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  parseVendorCandidateCsv,
  VENDOR_IMPORT_COLUMNS,
} from "../src/lib/admin/vendor-import.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const header = VENDOR_IMPORT_COLUMNS.join(",");

function csv(lines: string[]): string {
  return [header, ...lines].join("\n");
}

describe("A5-008 vendor CSV import", () => {
  it("accepts registry services and locations and keeps the row inactive", () => {
    const parsed = parseVendorCandidateCsv(
      csv([
        'Cecala Landscape & Masonry,,973-270-4370,cecalalm@gmail.com,https://cecalalandscapeandmasonry.com/,masonry;landscaping,"Madison; Chatham",public-website,https://cecalalandscapeandmasonry.com/contact,Madison masonry and landscape',
      ]),
    );
    assert.equal(parsed.fileError, null);
    assert.equal(parsed.rejected.length, 0);
    assert.equal(parsed.rows.length, 1);
    assert.deepEqual(parsed.rows[0]?.serviceIds, ["masonry", "landscaping"]);
    assert.deepEqual(parsed.rows[0]?.locationIds, ["madison", "chatham"]);
    const action = readFileSync(
      join(root, "src/lib/admin/vendor-import-action.ts"),
      "utf8",
    );
    assert.match(action, /p_status: vendorContactState\(row.email,"DISCOVERED",false\).status/);
    assert.match(action, /p_accepting_leads: false/);
    assert.doesNotMatch(action, /p_status: "ACTIVE"/);
  });

  it("rejects unknown services and locations instead of inventing them", () => {
    const parsed = parseVendorCandidateCsv(
      csv([
        "Nope Co,,,,,pool-building,madison,public-website,https://example.com,",
        "Town Miss,,,,,handyman,unapproved-town,public-website,https://example.com,",
      ]),
    );
    assert.equal(parsed.rows.length, 0);
    assert.match(parsed.rejected[0]?.reason ?? "", /Unknown service "pool-building"/);
    assert.match(parsed.rejected[1]?.reason ?? "", /Unknown location "unapproved-town"/);
  });

  it("does not change an existing vendor with the same name", () => {
    const parsed = parseVendorCandidateCsv(
      csv(["Cecala Landscape & Masonry,,,,,,masonry,madison,public-website,,"]),
      ["Cecala Landscape & Masonry"],
    );
    assert.equal(parsed.rows.length, 0);
    assert.match(parsed.rejected[0]?.reason ?? "", /not changed/);
  });

  it("parses the Northern NJ candidate file without inventing coverage", () => {
    const file = readFileSync(
      join(root, "data/vendors/northern-nj-candidates.csv"),
      "utf8",
    );
    const parsed = parseVendorCandidateCsv(file);
    assert.equal(parsed.fileError, null);
    assert.deepEqual(parsed.rejected, []);
    assert.ok(parsed.rows.length >= 8);
    for (const row of parsed.rows) {
      assert.ok(row.serviceIds.length > 0);
      assert.ok(row.locationIds.length > 0);
    }
  });

  it("rejects a file whose headers are not the frozen format", () => {
    const parsed = parseVendorCandidateCsv("business_name,status\nAcme,ACTIVE\n");
    assert.match(parsed.fileError ?? "", /headers must be exactly/);
    assert.equal(parsed.rows.length, 0);
  });
});
