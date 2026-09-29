import { describe, expect, it } from "vitest";

import { identity } from "../support/identity";

describe("browser unit-test project", () => {
  it("provides an isolated DOM environment", () => {
    const heading = document.createElement("h1");
    heading.textContent = identity("BBW");
    document.body.append(heading);

    expect(document.querySelector("h1")?.textContent).toBe("BBW");
    expect(window.location.href).toBe("http://localhost:3000/");
  });
});
