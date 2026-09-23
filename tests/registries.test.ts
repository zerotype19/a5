import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { LOCATIONS } from "../config/locations.ts";
import { SERVICES } from "../config/services.ts";
import { SITE } from "../config/site.ts";
import { featureFlags } from "../src/lib/feature-flags.ts";

describe("product registries", () => {
  it("includes exactly the eight approved MVP services", () => {
    assert.equal(SERVICES.length, 8);
    assert.deepEqual(
      SERVICES.map((service) => service.id),
      [
        "handyman",
        "masonry",
        "landscaping",
        "painting",
        "drywall",
        "tile",
        "plumbing",
        "electrical",
      ],
    );
  });

  it("includes exactly the six approved MVP locations", () => {
    assert.equal(LOCATIONS.length, 6);
    assert.deepEqual(
      LOCATIONS.map((location) => location.id),
      [
        "florham-park",
        "madison",
        "chatham",
        "morris-township",
        "morristown",
        "east-hanover",
      ],
    );
  });

  it("exposes canonical site identity", () => {
    assert.equal(SITE.name, "A5 Home Services");
    assert.equal(SITE.domain, "www.a5homeservices.com");
    assert.equal(SITE.url, "https://www.a5homeservices.com/");
  });
});

describe("feature flags", () => {
  it("defaults all flags to disabled when unset", () => {
    assert.equal(featureFlags.aiClassification, false);
    assert.equal(featureFlags.vendorScoring, false);
    assert.equal(featureFlags.sms, false);
    assert.equal(featureFlags.automaticRouting, false);
    assert.equal(featureFlags.programmaticPublishing, false);
  });
});
