import { describe, expect, it } from "vitest";
import {
  parseActor,
  parseIsoTimestamp,
  parseMoney,
  parseOrganizationId,
  parsePageRequest,
  parseTenantContext,
} from "../src/index.js";

describe("shared domain primitives", () => {
  it("parses identifiers and timestamps", () => {
    expect(parseOrganizationId("org_acme")).toBe("org_acme");
    expect(parseIsoTimestamp("2026-09-27T12:00:00.000Z")).toBe("2026-09-27T12:00:00.000Z");
  });

  it("rejects malformed identifiers and timestamps", () => {
    expect(() => parseOrganizationId("Not Valid")).toThrow();
    expect(() => parseIsoTimestamp("tomorrow")).toThrow();
  });

  it("parses pagination and money with bounded values", () => {
    expect(parsePageRequest({ limit: 25, cursor: "next" })).toEqual({ limit: 25, cursor: "next" });
    expect(parseMoney({ amountMinor: 1250, currency: "USD" })).toEqual({
      amountMinor: 1250,
      currency: "USD",
    });
    expect(() => parsePageRequest({ limit: 101 })).toThrow();
    expect(() => parseMoney({ amountMinor: -1, currency: "USD" })).toThrow();
  });

  it("parses actors and tenant context", () => {
    expect(parseActor({ type: "management", id: "admin_1" })).toEqual({
      type: "management",
      id: "admin_1",
    });
    expect(
      parseTenantContext({ tenantId: "org_acme", actor: { type: "member", id: "user_1" } }),
    ).toEqual({
      tenantId: "org_acme",
      actor: { type: "member", id: "user_1" },
    });
  });
});
