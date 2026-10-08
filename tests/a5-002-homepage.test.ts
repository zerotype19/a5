import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { COUNTIES } from "../config/counties.ts";
import { SERVICES } from "../config/services.ts";
import { SITE } from "../config/site.ts";
import { phoneTelHref } from "../src/lib/phone.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const homepage = readFileSync(join(root, "src/app/page.tsx"), "utf8");
const layout = readFileSync(join(root, "src/app/layout.tsx"), "utf8");
const header = readFileSync(join(root, "src/components/Header.tsx"), "utf8");
const requestService = readFileSync(
  join(root, "src/app/request-service/page.tsx"),
  "utf8",
);

describe("A5-002 public homepage", () => {
  it("renders homepage module with clear home-service positioning", () => {
    assert.match(
      homepage,
      /to get things fixed\./,
    );
    assert.match(homepage, /SITE\.phone/);
    assert.match(homepage, /A simpler way/);
    assert.match(header, /Request service/);
    assert.doesNotMatch(header, /Admin/);
  });

  it("uses canonical business name from site registry", () => {
    assert.equal(SITE.name, "A5 Home Services");
    assert.match(layout, /SITE\.name/);
  });

  it("uses canonical phone from site registry as tel link", () => {
    assert.equal(SITE.phone, "(973) 437-5517");
    assert.equal(phoneTelHref(SITE.phone), "tel:+19734375517");
    assert.match(homepage, /phoneTelHref\(SITE\.phone\)/);
    assert.match(header, /phoneTelHref\(SITE\.phone\)/);
  });

  it("presents all approved services and no extras", () => {
    assert.match(homepage, /SERVICES\.map/);
    assert.match(homepage, /SERVICE_PRESENTATION/);

    assert.equal(SERVICES.length, 16);
  });

  it("presents the approved county directory", () => {
    assert.match(homepage, /COUNTIES\.map/);
    assert.equal(COUNTIES.length, 8);
  });

  it("keeps primary CTA identifiable and linked to request intake", () => {
    assert.match(homepage, /dataCta="hero-get-help"/);
    assert.match(homepage, /href="\/request-service"/);
    assert.match(requestService, /ProjectIntakeForm/);
  });

  it("sets homepage metadata foundations", () => {
    assert.match(layout, /alternates:\s*\{[\s\S]*canonical:\s*"\/"/);
    assert.match(layout, /organizationJsonLd/);
    assert.match(layout, /openGraph/);
  });
});
