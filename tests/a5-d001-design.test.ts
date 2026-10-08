import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(path: string): string {
  return readFileSync(join(root, path), "utf8");
}

const PUBLISHED_PROBLEMS = [
  "/services/masonry/brick-step-repair",
  "/services/drywall/water-damaged-ceiling",
  "/services/electrical/dead-outlet",
  "/services/handyman/sticking-interior-door",
  "/services/plumbing/running-toilet",
  "/services/painting/peeling-exterior-paint",
  "/services/masonry/sunken-pavers",
  "/services/landscaping/yard-surface-grading",
];

describe("A5-D001 design system", () => {
  it("defines one type scale and an editorial width", () => {
    const tokens = read("src/styles/tokens.css");
    for (const name of [
      "--text-display",
      "--text-h1",
      "--text-h2",
      "--text-h3",
      "--text-body-lg",
      "--text-body",
      "--text-small",
      "--text-control",
    ]) {
      assert.match(tokens, new RegExp(name));
    }
    assert.match(tokens, /--width-editorial:\s*42rem/);
  });

  it("links the homepage to published problems and county hubs", () => {
    const homepage = read("src/app/page.tsx");
    const footer = read("src/components/Footer.tsx");
    for (const path of PUBLISHED_PROBLEMS) {
      assert.match(homepage, new RegExp(path.replaceAll("/", "\\/")));
    }
    assert.match(homepage, /countyPath\(l\)/);
    assert.match(footer, /countyPath\(location\)/);
    assert.doesNotMatch(homepage, /instant matching/i);
    assert.doesNotMatch(homepage, /fully vetted/i);
    assert.doesNotMatch(homepage, /borrowed reviews/i);
    assert.doesNotMatch(homepage, /does not publish ratings/i);
    assert.match(homepage, /Start with what you see\./);
  });

  it("keeps public navigation free of admin and uses one primary header CTA", () => {
    const header = read("src/components/Header.tsx");
    assert.match(header, /Request service/);
    assert.doesNotMatch(header, /\/admin/);
    assert.match(header, /label: "Services"/);
    assert.match(header, /label: "Areas"/);
    assert.match(header, /label: "How It Works"/);
  });

  it("does not add a package dependency for the redesign", () => {
    const pkg = JSON.parse(read("package.json")) as {
      dependencies: Record<string, string>;
      devDependencies: Record<string, string>;
    };
    const names = [
      ...Object.keys(pkg.dependencies),
      ...Object.keys(pkg.devDependencies),
    ];
    assert.equal(
      names.some((name) => /icon|fontawesome|heroicons/i.test(name)),
      false,
    );
  });
});
