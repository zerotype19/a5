import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { canonicalRedirectTarget } from "../src/lib/host/canonical-redirect.ts";

describe("canonical host redirect", () => {
  it("sends the apex to https www and keeps the path and query", () => {
    assert.equal(
      canonicalRedirectTarget({
        host: "a5homeservices.com",
        protocol: "https",
        pathname: "/privacy",
        search: "?fresh=1",
      }),
      "https://www.a5homeservices.com/privacy?fresh=1",
    );
  });

  it("sends http www to https www", () => {
    assert.equal(
      canonicalRedirectTarget({
        host: "www.a5homeservices.com",
        protocol: "http",
        pathname: "/",
        search: "",
      }),
      "https://www.a5homeservices.com/",
    );
  });

  it("leaves the canonical https host and other hosts alone", () => {
    assert.equal(
      canonicalRedirectTarget({
        host: "www.a5homeservices.com",
        protocol: "https",
        pathname: "/request-service",
        search: "",
      }),
      null,
    );
    assert.equal(
      canonicalRedirectTarget({
        host: "a5-home-services.kevin-mcgovern.workers.dev",
        protocol: "https",
        pathname: "/",
        search: "",
      }),
      null,
    );
  });
});
