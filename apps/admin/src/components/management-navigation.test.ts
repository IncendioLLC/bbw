import { describe, expect, it } from "vitest";

import { managementNavigation } from "./management-navigation";

describe("management navigation", () => {
  it("contains management routes only", () => {
    expect(managementNavigation.length).toBeGreaterThan(0);
    expect(managementNavigation.every(({ href }) => href.startsWith("/admin"))).toBe(true);
  });
});
