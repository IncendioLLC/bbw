export const colors = {
  ink: "#172033",
  muted: "#667085",
  canvas: "#f4f7fb",
  surface: "#ffffff",
  accent: "#275dc5",
  accentStrong: "#17459f",
  success: "#156f49",
  warning: "#8a4b00",
  danger: "#b42318",
  border: "#dce3ec",
} as const;

export const typography = {
  family: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
  sizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.125rem",
    xl: "1.5rem",
    display: "2.5rem",
  },
  weights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
  lineHeights: { tight: 1.2, normal: 1.5, relaxed: 1.7 },
} as const;

export const spacing = {
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  6: "1.5rem",
  8: "2rem",
  12: "3rem",
  16: "4rem",
} as const;
export const radii = { sm: "0.375rem", md: "0.625rem", lg: "0.875rem", pill: "999px" } as const;
export const elevation = {
  low: "0 1px 2px rgb(16 24 40 / 8%)",
  medium: "0 8px 24px rgb(16 24 40 / 12%)",
} as const;
export const breakpoints = {
  mobile: "0px",
  tablet: "768px",
  desktop: "1024px",
  wide: "1280px",
} as const;
export const motion = {
  fast: "120ms",
  normal: "180ms",
  slow: "280ms",
  easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
} as const;

export const semanticColorPairs = [
  { name: "body text", foreground: colors.ink, background: colors.canvas },
  { name: "muted text", foreground: colors.muted, background: colors.surface },
  { name: "primary action", foreground: colors.surface, background: colors.accentStrong },
  { name: "success action", foreground: colors.surface, background: colors.success },
  { name: "danger action", foreground: colors.surface, background: colors.danger },
] as const;
