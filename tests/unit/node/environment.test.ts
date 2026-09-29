import { describe, expect, it } from "vitest";

import { identity } from "../support/identity";

describe("Node unit-test project", () => {
  it("provides Node globals without a browser DOM", () => {
    expect(identity(process.release.name)).toBe("node");
    expect(globalThis.document).toBeUndefined();
  });
});
