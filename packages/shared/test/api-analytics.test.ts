import { describe, expect, it } from "vitest";
import { createAnalyticsEvent, failure, isApiFailure, success } from "../src/index.js";

describe("API envelopes", () => {
  it("serializes success and field-level failures", () => {
    expect(success({ id: "org_acme" }, "corr_1")).toEqual({
      ok: true,
      data: { id: "org_acme" },
      correlationId: "corr_1",
    });
    const response = failure("BAD_REQUEST", "Invalid input", "corr_2", [
      { field: "name", message: "Required" },
    ]);
    expect(isApiFailure(response)).toBe(true);
    expect(response).toEqual({
      ok: false,
      error: {
        code: "BAD_REQUEST",
        message: "Invalid input",
        correlationId: "corr_2",
        fields: [{ field: "name", message: "Required" }],
      },
    });
  });
});

describe("analytics events", () => {
  it("creates allowed events and rejects unsafe payloads", () => {
    expect(
      createAnalyticsEvent("acquisition.landing_viewed", {}, "2026-09-27T12:00:00Z"),
    ).toMatchObject({ name: "acquisition.landing_viewed" });
    expect(() =>
      createAnalyticsEvent(
        "reliability.client_error",
        { message: "x".repeat(501), route: "/" },
        "2026-09-27T12:00:00Z",
      ),
    ).toThrow();
    expect(() => createAnalyticsEvent("acquisition.landing_viewed", {}, "not-a-date")).toThrow();
  });
});
