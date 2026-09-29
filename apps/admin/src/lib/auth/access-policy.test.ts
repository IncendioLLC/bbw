import { describe, expect, it } from "vitest";

import { decideManagementAccess } from "./access-policy";

describe("management access policy", () => {
  it("denies an unauthenticated management request", () => {
    expect(decideManagementAccess(null, "/admin")).toEqual({
      allowed: false,
      destination: "/sign-in?returnTo=%2Fadmin",
    });
  });

  it("does not reflect an untrusted non-management return path", () => {
    expect(decideManagementAccess(null, "https://example.com/member")).toEqual({
      allowed: false,
      destination: "/sign-in?returnTo=%2Fadmin",
    });
  });

  it("allows a verified management principal", () => {
    const principal = { displayName: "Platform manager", subject: "manager-1" };

    expect(decideManagementAccess(principal, "/admin")).toEqual({
      allowed: true,
      principal,
    });
  });
});
