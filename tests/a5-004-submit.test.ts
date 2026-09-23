import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it, beforeEach } from "node:test";
import { fileURLToPath } from "node:url";
import {
  clearIdempotencyStoreForTests,
  getIdempotentResult,
  rememberIdempotentResult,
} from "../src/lib/intake/idempotency.ts";
import { validateSubmissionPayload } from "../src/lib/intake/validate-submission.ts";
import {
  turnstileConfigured,
  verifyTurnstileToken,
} from "../src/lib/turnstile/verify.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel: string): string {
  return readFileSync(join(root, rel), "utf8");
}

function validPayload(overrides: Record<string, unknown> = {}) {
  return {
    serviceId: "handyman",
    serviceSelectionStatus: "SELECTED",
    zip: "07940",
    description: "The front porch railing is loose and needs repair.",
    timing: "WITHIN_30_DAYS",
    firstName: "Alex",
    lastName: "Lee",
    phone: "(973) 555-1212",
    email: "alex@example.com",
    preferredContact: "PHONE",
    turnstileToken: null,
    ...overrides,
  };
}

describe("A5-004 server validation", () => {
  it("rejects malformed ZIP", () => {
    const result = validateSubmissionPayload(validPayload({ zip: "0794" }));
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.stepHint, "location");
      assert.ok(result.issues.some((i) => i.code === "invalid_zip"));
    }
  });

  it("rejects invalid email and phone", () => {
    const emailBad = validateSubmissionPayload(
      validPayload({ email: "not-an-email" }),
    );
    assert.equal(emailBad.ok, false);

    const phoneBad = validateSubmissionPayload(
      validPayload({ phone: "123" }),
    );
    assert.equal(phoneBad.ok, false);
  });

  it("rejects invalid timing and preferred contact", () => {
    assert.equal(
      validateSubmissionPayload(validPayload({ timing: "EMERGENCY" })).ok,
      false,
    );
    assert.equal(
      validateSubmissionPayload(
        validPayload({ preferredContact: "FAX" }),
      ).ok,
      false,
    );
  });

  it("rejects SELECTED without service_id and NOT_SURE with service_id", () => {
    const selectedMissing = validateSubmissionPayload(
      validPayload({ serviceId: null, serviceSelectionStatus: "SELECTED" }),
    );
    assert.equal(selectedMissing.ok, false);

    const notSureWithService = validateSubmissionPayload(
      validPayload({
        serviceId: "handyman",
        serviceSelectionStatus: "NOT_SURE",
      }),
    );
    assert.equal(notSureWithService.ok, false);
  });

  it("rejects unknown service IDs", () => {
    const result = validateSubmissionPayload(
      validPayload({ serviceId: "hvac" }),
    );
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.ok(
        result.issues.some((i) => i.code === "unknown_or_missing_service"),
      );
    }
  });

  it("accepts valid SELECTED and maps preferred contact / urgency", () => {
    const result = validateSubmissionPayload(validPayload());
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.value.serviceId, "handyman");
      assert.equal(result.value.serviceSelectionStatus, "SELECTED");
      assert.equal(result.value.postalCode, "07940");
      assert.equal(result.value.preferredContact, "phone");
      assert.equal(result.value.urgency, "WITHIN_30_DAYS");
      assert.equal(result.value.fullName, "Alex Lee");
      assert.equal(result.value.phone, "9735551212");
    }
  });

  it("accepts valid NOT_SURE with null service_id", () => {
    const result = validateSubmissionPayload(
      validPayload({
        serviceId: null,
        serviceSelectionStatus: "NOT_SURE",
      }),
    );
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.value.serviceId, null);
      assert.equal(result.value.serviceSelectionStatus, "NOT_SURE");
    }
  });
});

describe("A5-004 idempotency (app boundary)", () => {
  beforeEach(() => {
    clearIdempotencyStoreForTests();
  });

  it("remembers and returns a prior public reference for the same key", () => {
    assert.equal(getIdempotentResult("abc12345-key"), null);
    rememberIdempotentResult("abc12345-key", "A5-DEADBEEF");
    assert.equal(getIdempotentResult("abc12345-key"), "A5-DEADBEEF");
  });

  it("ignores short or missing keys", () => {
    rememberIdempotentResult("short", "A5-X");
    assert.equal(getIdempotentResult("short"), null);
    assert.equal(getIdempotentResult(null), null);
  });
});

function setEnv(key: string, value: string | undefined) {
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
}

describe("A5-004 Turnstile (native)", () => {
  it("skips verification in non-production when keys are unset", async () => {
    const prevSite = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    const prevSecret = process.env.TURNSTILE_SECRET_KEY;
    try {
      // NODE_ENV is already non-production under the test runner.
      delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
      delete process.env.TURNSTILE_SECRET_KEY;
      assert.equal(turnstileConfigured().required, false);
      const result = await verifyTurnstileToken(null);
      assert.deepEqual(result, { ok: true });
    } finally {
      setEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", prevSite);
      setEnv("TURNSTILE_SECRET_KEY", prevSecret);
    }
  });

  it("requires a token when secret is configured", async () => {
    const prevSite = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    const prevSecret = process.env.TURNSTILE_SECRET_KEY;
    try {
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "site-test";
      process.env.TURNSTILE_SECRET_KEY = "secret-test";
      const result = await verifyTurnstileToken(null);
      assert.equal(result.ok, false);
      if (!result.ok) assert.equal(result.reason, "missing_token");
    } finally {
      setEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", prevSite);
      setEnv("TURNSTILE_SECRET_KEY", prevSecret);
    }
  });

  it("calls native siteverify and treats success=true as ok", async () => {
    const prevSite = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    const prevSecret = process.env.TURNSTILE_SECRET_KEY;
    const originalFetch = globalThis.fetch;
    let fetchCalls = 0;
    try {
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "site-test";
      process.env.TURNSTILE_SECRET_KEY = "secret-test";
      globalThis.fetch = (async () => {
        fetchCalls += 1;
        return Response.json({ success: true });
      }) as typeof fetch;
      const result = await verifyTurnstileToken("token-abc");
      assert.deepEqual(result, { ok: true });
      assert.equal(fetchCalls, 1);
    } finally {
      globalThis.fetch = originalFetch;
      setEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", prevSite);
      setEnv("TURNSTILE_SECRET_KEY", prevSecret);
    }
  });
});

describe("A5-004 RPC migration + security", () => {
  const migration = read(
    "supabase/migrations/20260923160000_a5_004_submit_project_request_rpc.sql",
  );

  it("creates submit_project_request with SECURITY DEFINER and fixed search_path", () => {
    assert.match(migration, /create or replace function public\.submit_project_request/i);
    assert.match(migration, /security definer/i);
    assert.match(migration, /set search_path = pg_catalog, public/i);
  });

  it("revokes EXECUTE from public/anon/authenticated and grants service_role only", () => {
    assert.match(migration, /revoke all on function public\.submit_project_request[\s\S]*from public/i);
    assert.match(migration, /revoke all on function public\.submit_project_request[\s\S]*from anon/i);
    assert.match(
      migration,
      /revoke all on function public\.submit_project_request[\s\S]*from authenticated/i,
    );
    assert.match(
      migration,
      /grant execute on function public\.submit_project_request[\s\S]*to service_role/i,
    );
  });

  it("writes Customer + Lead NEW + LeadCreated and null location_id", () => {
    assert.match(migration, /insert into public\.customers/i);
    assert.match(migration, /insert into public\.leads/i);
    assert.match(migration, /'NEW'/);
    assert.match(migration, /'LeadCreated'/);
    assert.match(migration, /location_id,\s*\n\s*project_description/);
    assert.match(migration, /null,\s*\n\s*trim\(p_project_description\)/);
  });
});

describe("A5-004 UI + secrets boundary", () => {
  const form = read("src/components/intake/ProjectIntakeForm.tsx");
  const review = read("src/components/intake/steps/StepReview.tsx");
  const admin = read("src/lib/supabase/admin.ts");
  const route = read("src/app/api/submit-project-request/route.ts");
  const pkg = JSON.parse(read("package.json")) as {
    dependencies: Record<string, string>;
  };

  it("activates Send Project Request without fake pre-commit success", () => {
    assert.match(review, /Send Project Request/);
    assert.match(review, /Sending…/);
    assert.match(form, /\/api\/submit-project-request/);
    assert.match(form, /SubmissionSuccess/);
    assert.doesNotMatch(review, /not enabled yet/i);
  });

  it("prevents repeat submit while sending (UI boundary)", () => {
    assert.match(form, /phase === "sending"/);
    assert.match(review, /sending/);
    assert.match(form, /idempotency-key/i);
  });

  it("preserves intake state on failure", () => {
    assert.match(form, /SubmissionFailureBanner/);
    assert.match(form, /setPhase\("failure"\)/);
    assert.doesNotMatch(form, /setState\(INITIAL_INTAKE_STATE\)/);
  });

  it("uses native Turnstile CDN, not an npm SDK", () => {
    const turnstileUi = read("src/components/intake/TurnstileWidget.tsx");
    assert.match(
      turnstileUi,
      /challenges\.cloudflare\.com\/turnstile\/v0\/api\.js/,
    );
    assert.equal(pkg.dependencies["@marsidev/react-turnstile"], undefined);
    assert.equal(pkg.dependencies["@supabase/supabase-js"] !== undefined, true);
    assert.equal(pkg.dependencies.pg, undefined);
  });

  it("keeps service-role client server-only", () => {
    assert.match(admin, /SUPABASE_SERVICE_ROLE_KEY/);
    assert.match(route, /submitProjectRequest/);
    const intakeFiles = readdirSync(join(root, "src/components/intake"), {
      recursive: true,
    }).map(String);
    for (const file of intakeFiles) {
      if (!file.endsWith(".tsx") && !file.endsWith(".ts")) continue;
      const source = read(join("src/components/intake", file));
      assert.doesNotMatch(source, /supabase\/admin/);
      assert.doesNotMatch(source, /SUPABASE_SERVICE_ROLE_KEY/);
      assert.doesNotMatch(source, /createClient/);
    }
  });

  it("documents approved supabase-js dependency", () => {
    const deps = read("docs/DEPENDENCIES.md");
    assert.match(deps, /@supabase\/supabase-js/);
    assert.match(deps, /server-only|service-role/i);
  });
});
