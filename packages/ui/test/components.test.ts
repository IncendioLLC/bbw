import { describe, expect, it } from "vitest";
import {
  AdminNavigation,
  Alert,
  Breadcrumbs,
  Button,
  Dialog,
  PublicFooter,
  PublicHeader,
  ResponsiveDrawer,
  Select,
  Skeleton,
  TextInput,
} from "../src/components.js";

describe("foundational UI components", () => {
  it("provides accessible control defaults", () => {
    expect(Button({ children: "Save" })).toMatchObject({
      type: "button",
      props: { children: "Save" },
    });
    expect(TextInput({ "aria-label": "Company name" })).toMatchObject({
      type: "input",
      props: { "aria-label": "Company name" },
    });
    expect(Select({ "aria-label": "Role" })).toMatchObject({
      type: "select",
      props: { "aria-label": "Role" },
    });
  });

  it("provides feedback, dialog, and loading semantics", () => {
    expect(Alert({ children: "Saved" })).toMatchObject({ type: "div", props: { role: "status" } });
    expect(Dialog({ children: "Details", open: true })).toMatchObject({
      type: "dialog",
      props: { open: true },
    });
    expect(Skeleton({})).toMatchObject({
      type: "div",
      props: { role: "status", "aria-busy": "true" },
    });
  });

  it("keeps public, member, management, and responsive shell boundaries explicit", () => {
    const items = [
      { href: "/admin", label: "Overview" },
      { href: "/dashboard", label: "Dashboard" },
    ];
    expect(PublicHeader({ items })).toMatchObject({ type: "header" });
    expect(PublicFooter()).toMatchObject({ type: "footer" });
    expect(AdminNavigation({ items })).toMatchObject({
      props: { "aria-label": "Management navigation" },
    });
    expect(Breadcrumbs({ items })).toMatchObject({ props: { "aria-label": "Breadcrumb" } });
    expect(ResponsiveDrawer({ open: false, children: "Menu" })).toMatchObject({
      props: { hidden: true },
    });
  });
});
