import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { LOCATIONS } from "../config/locations.ts";
import { SERVICES } from "../config/services.ts";
import {
  CLAIM_EPA_RRP,
  CLAIM_NJ_811,
  CLAIM_NJ_CLIMATE,
  CLAIM_NJ_ELECTRICAL_LICENSE,
  CLAIM_NJ_PLUMBING_LICENSE,
} from "../src/lib/authority/drafts/claims.ts";
import {
  PROBLEM_HEADINGS,
  PROBLEM_PAGE_DRAFTS,
} from "../src/lib/authority/drafts/problems.ts";
import { SERVICE_HUB_DRAFTS } from "../src/lib/authority/drafts/service-hubs.ts";
import {
  G001_BRICK_STEP_PAGE_ID,
  G002_PROBLEM_SERVICE_LINKS,
  PHOTO_SHOT_LIMIT,
  hubDraftFields,
  problemDraftFields,
  type ClaimToVerify,
  type ProblemPageDraft,
  type ServiceHubDraft,
} from "../src/lib/authority/drafts/types.ts";
import { CORE_SITEMAP_ROUTES } from "../src/lib/authority/sitemap.ts";
import type { ContentSection } from "../src/lib/authority/types.ts";
import { validateForPublication } from "../src/lib/authority/validate.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const FORBIDDEN = [
  /\bbest\b/i,
  /top-rated/i,
  /#1/,
  /thousands served/i,
  /same-day/i,
  /\b24\/7\b/i,
  /guarantee/i,
  /fully vetted/i,
  /background[- ]checked/i,
  /licensed and insured/i,
  /\$/,
  /\bA5 (has )?(completed|installed|repaired|rebuilt|built|fixed)\b/i,
  /\bour (crews?|team|technicians)\b/i,
  /\bin-house\b/i,
  /testimonial/i,
  /\b\d(\.\d)? stars?\b/i,
  /customers? (say|love|rave)/i,
  /\bwe\b/i,
];

type AnyDraft = ServiceHubDraft | ProblemPageDraft;

function draftText(draft: AnyDraft): string {
  return JSON.stringify({
    title: draft.title,
    metaTitle: draft.metaTitle,
    metaDescription: draft.metaDescription,
    h1: draft.h1,
    primaryQuestion: draft.primaryQuestion,
    directAnswer: draft.directAnswer,
    sections: draft.sections,
    visuals: "typicalProjectVisuals" in draft ? draft.typicalProjectVisuals : [],
  });
}

function headings(sections: ContentSection[]): string[] {
  return sections.flatMap((section) =>
    "heading" in section && section.heading ? [section.heading] : [],
  );
}

function richText(sections: ContentSection[], pattern: RegExp) {
  return sections.find(
    (section) =>
      section.type === "RICH_TEXT" && pattern.test(section.heading ?? ""),
  ) as Extract<ContentSection, { type: "RICH_TEXT" }> | undefined;
}

function hasClaim(draft: AnyDraft, claim: ClaimToVerify): boolean {
  return draft.claimsToVerify.some((item) => item.claim === claim.claim);
}

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx|mjs|sql)$/.test(name) ? [path] : [];
  });
}

const ALL_DRAFTS: AnyDraft[] = [...SERVICE_HUB_DRAFTS, ...PROBLEM_PAGE_DRAFTS];

describe("authority drafts — publication boundary", () => {
  it("keeps every draft at DRAFT and not indexable", () => {
    for (const hub of SERVICE_HUB_DRAFTS) {
      const fields = hubDraftFields(hub);
      assert.equal(fields.status, "DRAFT");
      assert.equal(fields.indexable, false);
    }
    for (const problem of PROBLEM_PAGE_DRAFTS) {
      const fields = problemDraftFields(problem);
      assert.equal(fields.status, "DRAFT");
      assert.equal(fields.indexable, false);
    }
  });

  it("is not imported by any route, component, library, script, or seed", () => {
    const draftsDir = join(root, "src/lib/authority/drafts");
    const scanned = [
      ...sourceFiles(join(root, "src")),
      ...sourceFiles(join(root, "scripts")),
      ...sourceFiles(join(root, "supabase")),
      join(root, "config/services.ts"),
      join(root, "config/locations.ts"),
      join(root, "config/site.ts"),
    ].filter((path) => !path.startsWith(draftsDir));
    for (const path of scanned) {
      const text = readFileSync(path, "utf8");
      assert.doesNotMatch(
        text,
        /authority\/drafts|\.\/drafts\//,
        `${relative(root, path)} must not import the draft corpus`,
      );
    }
  });

  it("would pass structural publication checks only after an owner publishes", () => {
    const hubSlugs = SERVICE_HUB_DRAFTS.map((hub) => hub.serviceId);
    for (const hub of SERVICE_HUB_DRAFTS) {
      const page = hubDraftFields(hub);
      const others = hubSlugs.filter((slug) => slug !== page.slug);
      assert.equal(validateForPublication({ page, otherSlugsForType: others }).valid, true);
      assert.equal(
        validateForPublication({ page: { ...page, indexable: true } }).valid,
        false,
      );
    }
    const problemSlugs = PROBLEM_PAGE_DRAFTS.map((draft) => draft.problemSlug);
    for (const draft of PROBLEM_PAGE_DRAFTS) {
      const page = problemDraftFields(draft);
      const result = validateForPublication({
        page,
        relatedServiceIds: [...draft.relatedServiceIds],
        otherSlugsForType: problemSlugs.filter((slug) => slug !== page.slug),
      });
      assert.equal(result.valid, true, JSON.stringify(result));
    }
  });
});

describe("authority drafts — service hubs", () => {
  it("covers exactly the eight registry services", () => {
    assert.deepEqual(
      SERVICE_HUB_DRAFTS.map((hub) => hub.serviceId),
      SERVICES.map((service) => service.id),
    );
  });

  it("gives each hub its own structure, not a shared template", () => {
    const seen = new Map<string, string>();
    for (const hub of SERVICE_HUB_DRAFTS) {
      for (const heading of headings(hub.sections)) {
        const owner = seen.get(heading);
        assert.equal(owner, undefined, `"${heading}" is used by ${owner} and ${hub.serviceId}`);
        seen.set(heading, hub.serviceId);
      }
    }
    for (const field of ["primaryQuestion", "directAnswer", "h1", "metaDescription"] as const) {
      assert.equal(new Set(SERVICE_HUB_DRAFTS.map((hub) => hub[field])).size, 8, field);
    }
    for (const hub of SERVICE_HUB_DRAFTS) {
      assert.equal(hub.primaryQuestion.startsWith("What can A5 help with for "), false);
    }
    const shapes = new Set(
      SERVICE_HUB_DRAFTS.map((hub) => hub.sections.map((s) => s.type).join(",")),
    );
    assert.ok(shapes.size >= 6, `only ${shapes.size} distinct section orders`);
  });

  it("includes the required editorial elements in every hub", () => {
    const townNames = LOCATIONS.map((location) => location.name);
    for (const hub of SERVICE_HUB_DRAFTS) {
      const types = hub.sections.map((section) => section.type);
      const hubHeadings = headings(hub.sections).join(" | ");
      const text = draftText(hub);
      assert.ok(types.includes("COST_FACTORS"), `${hub.serviceId}: cost factors`);
      assert.ok(types.includes("QUESTION_ANSWER"), `${hub.serviceId}: direct answers`);
      assert.ok(types.includes("RELATED_CONTENT"), `${hub.serviceId}: related slot`);
      assert.equal(types.at(-1), "CTA", `${hub.serviceId}: request path last`);
      assert.match(hubHeadings, /photo/i, `${hub.serviceId}: what to photograph`);
      assert.match(hubHeadings, /related/i, `${hub.serviceId}: related problems`);
      assert.ok(
        headings(hub.sections).some((heading) => /^Typical [a-z]+ projects$/.test(heading)),
        `${hub.serviceId}: typical projects`,
      );
      assert.ok(
        types.includes("COMPARISON_TABLE") ||
          /replace|rebuild|patch/i.test(hubHeadings),
        `${hub.serviceId}: repair-vs-replace guidance`,
      );
      assert.ok(
        townNames.some((town) => text.includes(town)),
        `${hub.serviceId}: names at least one registry town`,
      );
      assert.ok(hub.typicalProjectVisuals.length > 0);
      for (const visual of hub.typicalProjectVisuals) {
        assert.match(visual, /^Typical projects: /);
      }
    }
  });
});

describe("authority drafts — problem corpus", () => {
  it("targets only A5-G002 problem entities and their service links", () => {
    const slugs = PROBLEM_PAGE_DRAFTS.map((draft) => draft.problemSlug);
    assert.equal(new Set(slugs).size, slugs.length);
    for (const draft of PROBLEM_PAGE_DRAFTS) {
      const links = G002_PROBLEM_SERVICE_LINKS[draft.problemSlug];
      assert.ok(links, `${draft.problemSlug} is not a G002 problem entity`);
      assert.deepEqual([...draft.relatedServiceIds].sort(), [...links].sort());
      assert.ok(links.includes(draft.primaryServiceId));
    }
    for (const draft of ALL_DRAFTS) {
      for (const related of draft.relatedProblemSlugs) {
        assert.ok(G002_PROBLEM_SERVICE_LINKS[related], `unknown related slug ${related}`);
      }
    }
  });

  it("covers every service and the problems named in the brief", () => {
    const primaries = new Set(PROBLEM_PAGE_DRAFTS.map((draft) => draft.primaryServiceId));
    assert.equal(primaries.size, SERVICES.length);
    for (const slug of [
      "brick-step-repair",
      "visible-pipe-leak",
      "hole-in-drywall",
      "failed-light-fixture",
    ]) {
      assert.ok(PROBLEM_PAGE_DRAFTS.some((draft) => draft.problemSlug === slug), slug);
    }
  });

  it("gives every problem page symptom, causes, photos, repair vs replace, who, related, and a request path", () => {
    const required = [
      PROBLEM_HEADINGS.seeing,
      PROBLEM_HEADINGS.causes,
      PROBLEM_HEADINGS.photograph,
      PROBLEM_HEADINGS.repairOrReplace,
      PROBLEM_HEADINGS.whoYouNeed,
      PROBLEM_HEADINGS.related,
    ];
    for (const draft of PROBLEM_PAGE_DRAFTS) {
      const found = headings(draft.sections);
      for (const heading of required) {
        assert.ok(found.includes(heading), `${draft.problemSlug}: ${heading}`);
      }
      assert.equal(draft.sections.at(-1)?.type, "CTA", draft.problemSlug);
    }
  });
});

describe("authority drafts — claims and rendering safety", () => {
  it("avoids fabricated claims, prices, and first-person job history", () => {
    for (const draft of ALL_DRAFTS) {
      const text = draftText(draft);
      for (const pattern of FORBIDDEN) {
        assert.doesNotMatch(text, pattern, `${draft.title}: ${pattern}`);
      }
    }
  });

  it("flags every legal, regulatory, or climate statement for source verification", () => {
    for (const draft of ALL_DRAFTS) {
      const text = draftText(draft);
      if (/\b811\b/.test(text)) assert.ok(hasClaim(draft, CLAIM_NJ_811), draft.title);
      if (/1978/.test(text)) assert.ok(hasClaim(draft, CLAIM_EPA_RRP), draft.title);
      if (/Plumbing contracting is a licensed trade/.test(text)) {
        assert.ok(hasClaim(draft, CLAIM_NJ_PLUMBING_LICENSE), draft.title);
      }
      if (/Electrical contracting is a licensed trade/.test(text)) {
        assert.ok(hasClaim(draft, CLAIM_NJ_ELECTRICAL_LICENSE), draft.title);
      }
      if (
        /freeze-thaw|freezing and thawing|humid summers|summers are humid|humid months|heating season/i.test(
          text,
        )
      ) {
        assert.ok(hasClaim(draft, CLAIM_NJ_CLIMATE), draft.title);
      }
    }
  });

  it("keeps photo guidance within the request form's photo limit", () => {
    for (const draft of ALL_DRAFTS) {
      const photos = richText(draft.sections, /photo/i);
      assert.ok(photos, `${draft.title}: photo section`);
      assert.ok(photos.paragraphs.length <= PHOTO_SHOT_LIMIT, draft.title);
    }
  });

  it("keeps list items unique where the renderer uses them as React keys", () => {
    for (const draft of ALL_DRAFTS) {
      for (const section of draft.sections) {
        const keys =
          section.type === "RICH_TEXT"
            ? section.paragraphs.map((p) => p.slice(0, 48))
            : section.type === "COST_FACTORS"
              ? section.factors
              : section.type === "QUESTION_ANSWER"
                ? section.items.map((item) => item.question)
                : section.type === "COMPARISON_TABLE"
                  ? section.rows.map((row) => row.criterion)
                  : [];
        assert.equal(new Set(keys).size, keys.length, `${draft.title}: duplicate key`);
      }
    }
  });

  it("keeps metadata within search-snippet lengths", () => {
    for (const draft of ALL_DRAFTS) {
      assert.ok(draft.metaTitle.length <= 62, `${draft.metaTitle} (${draft.metaTitle.length})`);
      assert.ok(
        draft.metaDescription.length <= 170,
        `${draft.title} description (${draft.metaDescription.length})`,
      );
    }
  });
});

describe("authority drafts — sources and canonical URLs", () => {
  it("attaches a primary URL and the exact supported claim to every flagged statement", () => {
    const claims = ALL_DRAFTS.flatMap((draft) => draft.claimsToVerify);
    assert.ok(claims.length > 0);
    for (const claim of claims) {
      assert.match(claim.sourceUrl, /^https:\/\//);
      assert.ok(claim.sourceTitle.length > 8);
      assert.ok(claim.exactSupportedClaim.length > 40);
      assert.ok(claim.claim.length > 20);
    }
  });

  it("does not claim the six towns are a measured plaster-to-drywall mix", () => {
    for (const draft of ALL_DRAFTS) {
      assert.doesNotMatch(draftText(draft), /original plaster/);
      assert.doesNotMatch(draftText(draft), /newer construction and additions finished in drywall/);
    }
  });

  it("updates brick-step-repair in place and does not insert problem entities", () => {
    const brick = PROBLEM_PAGE_DRAFTS.find((draft) => draft.problemSlug === "brick-step-repair");
    assert.ok(brick);
    assert.equal(brick.disposition.action, "update-in-place");
    assert.equal(brick.disposition.canonicalPath, "/services/masonry/brick-step-repair");
    assert.equal(brick.disposition.existingContentPageId, G001_BRICK_STEP_PAGE_ID);
    assert.equal(brick.primaryServiceId, "masonry");
    const paths = PROBLEM_PAGE_DRAFTS.map((draft) => draft.disposition.canonicalPath);
    assert.equal(new Set(paths).size, paths.length);
    for (const draft of PROBLEM_PAGE_DRAFTS) {
      if (draft.problemSlug === "brick-step-repair") continue;
      assert.equal(draft.disposition.action, "create-page-for-existing-problem");
      assert.equal(draft.disposition.existingContentPageId, null);
      assert.equal(draft.disposition.problemEntityId, draft.problemSlug);
      assert.equal(
        draft.disposition.canonicalPath,
        `/services/${draft.primaryServiceId}/${draft.problemSlug}`,
      );
    }
    const draftsDir = join(root, "src/lib/authority/drafts");
    for (const path of sourceFiles(draftsDir)) {
      assert.doesNotMatch(readFileSync(path, "utf8"), /insert into public\.problems/i);
    }
  });
});

describe("authority drafts — indexable URL budget (ADR-010 ~40–50)", () => {
  it("fits tranche 1 inside the budget and shows the full G002 corpus would not", () => {
    const core = CORE_SITEMAP_ROUTES.length;
    const hubs = SERVICES.length;
    const locationHubs = LOCATIONS.length;
    const tranche = PROBLEM_PAGE_DRAFTS.length;
    const fullCorpus = Object.keys(G002_PROBLEM_SERVICE_LINKS).length;

    assert.equal(core, 2);
    assert.equal(tranche, 14);
    assert.equal(fullCorpus, 42);

    assert.equal(core + hubs + tranche, 24);
    assert.equal(core + hubs + locationHubs + tranche, 30);
    assert.ok(core + hubs + locationHubs + tranche <= 40);

    assert.equal(core + hubs + fullCorpus, 52);
    assert.ok(core + hubs + fullCorpus > 50);
  });
});
