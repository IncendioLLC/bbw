import { describe, expect, it } from "vitest";

import { identity } from "../support/identity";

describe("shared-package unit-test project", () => {
  it("supports runtime-neutral shared utilities", () => {
    const contract = identity({ kind: "shared", version: 1 } as const);

    expect(contract).toEqual({ kind: "shared", version: 1 });
  });
});
