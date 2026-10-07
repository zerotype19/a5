import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isInternalContentHref,
  renderableContentLinks,
} from "../src/lib/authority/links.ts";

describe("authority content links", () => {
  it("accepts internal site paths", () => {
    assert.equal(isInternalContentHref("/request-service"), true);
    assert.equal(isInternalContentHref("/services/masonry/loose-mortar"), true);
  });

  it("rejects external, protocol-relative, and script hrefs", () => {
    for (const href of [
      "https://example.com",
      "//example.com",
      "/\\example.com",
      "javascript:alert(1)",
      "services/masonry",
      "",
      null,
      42,
    ]) {
      assert.equal(isInternalContentHref(href), false, String(href));
    }
  });

  it("drops links without a label or with an unsafe href", () => {
    const links = renderableContentLinks([
      { label: "Masonry help", href: "/services/masonry" },
      { label: " ", href: "/services/tile" },
      { label: "Elsewhere", href: "https://example.com" },
    ]);
    assert.deepEqual(links, [{ label: "Masonry help", href: "/services/masonry" }]);
  });

  it("returns nothing when links are absent", () => {
    assert.deepEqual(renderableContentLinks(undefined), []);
  });
});
