import { describe, expect, it } from "vitest";
import { colors, semanticColorPairs, spacing } from "../src/tokens.js";

function channel(hex: string, offset: number): number {
  return Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;
}

function luminance(hex: string): number {
  return [1, 3, 5]
    .map((offset) => channel(hex, offset))
    .reduce((sum, value, index) => {
      const linear = value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      return sum + linear * ([0.2126, 0.7152, 0.0722][index] ?? 0);
    }, 0);
}

describe("design tokens", () => {
  it("exports the required extensible token groups", () => {
    expect(colors.accent).toMatch(/^#[0-9a-f]{6}$/);
    expect(spacing[4]).toBe("1rem");
    expect(semanticColorPairs).toHaveLength(5);
  });

  it("keeps semantic pairs at WCAG AA contrast", () => {
    for (const pair of semanticColorPairs) {
      const light = Math.max(luminance(pair.foreground), luminance(pair.background));
      const dark = Math.min(luminance(pair.foreground), luminance(pair.background));
      expect((light + 0.05) / (dark + 0.05), pair.name).toBeGreaterThanOrEqual(4.5);
    }
  });
});
