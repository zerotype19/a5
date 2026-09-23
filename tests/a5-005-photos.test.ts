import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  isAllowedPhotoMime,
  isExplicitlyBlockedFilename,
  MAX_PROJECT_PHOTOS,
  validatePhotoMetas,
} from "../src/lib/photos/constants.ts";
import {
  issuePhotoUploadGrant,
  verifyPhotoUploadGrant,
} from "../src/lib/photos/upload-grant.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel: string): string {
  return readFileSync(join(root, rel), "utf8");
}

describe("A5-005 photo validation", () => {
  it("allows 0–5 valid JPEG/PNG/WEBP metas and rejects a 6th", () => {
    const five = Array.from({ length: 5 }, (_, i) => ({
      originalFilename: `p${i}.jpg`,
      mimeType: "image/jpeg",
      fileSize: 1024,
    }));
    assert.deepEqual(validatePhotoMetas(five), []);
    assert.ok(validatePhotoMetas([...five, five[0]!]).some((i) => i.code === "too_many_photos"));
    assert.equal(MAX_PROJECT_PHOTOS, 5);
  });

  it("rejects oversized and unsupported MIME including SVG/HEIC", () => {
    assert.ok(
      validatePhotoMetas([
        { originalFilename: "big.jpg", mimeType: "image/jpeg", fileSize: 11 * 1024 * 1024 },
      ]).some((i) => i.code === "file_too_large"),
    );
    assert.equal(isAllowedPhotoMime("image/svg+xml"), false);
    assert.equal(isAllowedPhotoMime("image/heic"), false);
    assert.ok(isExplicitlyBlockedFilename("diagram.svg"));
    assert.ok(isExplicitlyBlockedFilename("img.HEIC"));
  });
});

describe("A5-005 upload grant", () => {
  it("issues and verifies a grant; rejects mismatch and bare lead credentials in API", () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY =
      process.env.SUPABASE_SERVICE_ROLE_KEY || "test-service-role-material";
    const token = issuePhotoUploadGrant({
      leadId: "11111111-1111-4111-8111-111111111111",
      submissionKey: "22222222-2222-4222-8222-222222222222",
      paths: ["11111111-1111-4111-8111-111111111111/a.jpg"],
    });
    const ok = verifyPhotoUploadGrant(token, {
      submissionKey: "22222222-2222-4222-8222-222222222222",
    });
    assert.equal(ok.ok, true);

    const bad = verifyPhotoUploadGrant(token, {
      submissionKey: "33333333-3333-4333-8333-333333333333",
    });
    assert.equal(bad.ok, false);

    const prepare = read("src/lib/photos/prepare-uploads.ts");
    assert.match(prepare, /claimedLeadId/);
    assert.match(prepare, /claimedPublicReference/);
    assert.match(prepare, /submission_key/);
    assert.match(prepare, /createSignedUploadUrl/);
  });
});

describe("A5-005 migration + UI wiring", () => {
  const migration = read(
    "supabase/migrations/20260923170000_a5_005_project_photos_storage.sql",
  );
  const details = read("src/components/intake/steps/StepDetails.tsx");
  const form = read("src/components/intake/ProjectIntakeForm.tsx");
  const picker = read("src/components/intake/PhotoPicker.tsx");

  it("creates project_photos with RLS deny-all and private lead-uploads bucket", () => {
    assert.match(migration, /create table public\.project_photos/i);
    assert.match(migration, /enable row level security/i);
    assert.match(migration, /project_photos_deny_all/i);
    assert.match(migration, /lead-uploads/);
    assert.match(migration, /insert into storage\.buckets/i);
    assert.match(migration, /'lead-uploads',\s*'lead-uploads',\s*false/i);
    assert.match(migration, /image\/jpeg/);
    assert.match(migration, /image\/webp/);
  });

  it("replaces photo placeholder with picker and post-lead upload flow", () => {
    assert.match(details, /PhotoPicker/);
    assert.doesNotMatch(details, /Coming in next step/);
    assert.match(picker, /Add photos/);
    assert.match(form, /photo-uploads\/prepare/);
    assert.match(form, /photo-uploads\/complete/);
    assert.match(form, /attachPhotosForSubmission/);
    assert.match(form, /Retry photo upload|onRetryPhotos/);
  });

  it("does not add image-processing or HEIC dependencies", () => {
    const pkg = JSON.parse(read("package.json")) as {
      dependencies: Record<string, string>;
    };
    assert.equal(pkg.dependencies["sharp"], undefined);
    assert.equal(pkg.dependencies["heic-convert"], undefined);
    assert.equal(pkg.dependencies["@supabase/supabase-js"] !== undefined, true);
    assert.equal(existsSync(join(root, "docs/migrations/A5-005-project-photos-storage.md")), true);
  });

  it("keeps service-role out of browser photo helper", () => {
    const browser = read("src/lib/photos/browser-upload.ts");
    assert.match(browser, /NEXT_PUBLIC_SUPABASE_ANON_KEY/);
    assert.doesNotMatch(browser, /SERVICE_ROLE/);
    assert.match(browser, /uploadToSignedUrl/);
  });
});
