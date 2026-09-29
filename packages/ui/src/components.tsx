import { createElement } from "react";
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from "react";

export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>): ReactNode {
  return createElement("button", { type: "button", ...props });
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>): ReactNode {
  return createElement("input", props);
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>): ReactNode {
  return createElement("select", props);
}

export function Alert({
  children,
  role = "status",
}: Readonly<{ children: ReactNode; role?: "status" | "alert" }>): ReactNode {
  return createElement("div", { role }, children);
}

export function Card({ children }: Readonly<{ children: ReactNode }>): ReactNode {
  return createElement("section", null, children);
}

export function Dialog({
  children,
  open = false,
}: Readonly<{ children: ReactNode; open?: boolean }>): ReactNode {
  return createElement("dialog", { open }, children);
}

export function Skeleton({ label = "Loading" }: Readonly<{ label?: string }>): ReactNode {
  return createElement("div", { "aria-label": label, "aria-busy": "true", role: "status" });
}

export interface NavigationItem {
  readonly href: string;
  readonly label: string;
}

export function PublicHeader({ items }: Readonly<{ items: readonly NavigationItem[] }>): ReactNode {
  return createElement(
    "header",
    null,
    createElement("a", { href: "/", "aria-label": "BBW home" }, "BBW Platform"),
    createElement(
      "nav",
      { "aria-label": "Primary navigation" },
      items.map((item) => createElement("a", { href: item.href, key: item.href }, item.label)),
    ),
  );
}

export function PublicFooter(): ReactNode {
  return createElement("footer", null, "BBW Platform");
}

export function MemberNavigation({
  items,
}: Readonly<{ items: readonly NavigationItem[] }>): ReactNode {
  return createElement(
    "nav",
    { "aria-label": "Member navigation" },
    items.map((item) => createElement("a", { href: item.href, key: item.href }, item.label)),
  );
}

export function AdminNavigation({
  items,
}: Readonly<{ items: readonly NavigationItem[] }>): ReactNode {
  return createElement(
    "nav",
    { "aria-label": "Management navigation" },
    items
      .filter((item) => item.href.startsWith("/admin"))
      .map((item) => createElement("a", { href: item.href, key: item.href }, item.label)),
  );
}

export function Breadcrumbs({ items }: Readonly<{ items: readonly NavigationItem[] }>): ReactNode {
  return createElement(
    "nav",
    { "aria-label": "Breadcrumb" },
    items.map((item, index) =>
      createElement(
        "a",
        {
          href: item.href,
          key: item.href,
          "aria-current": index === items.length - 1 ? "page" : undefined,
        },
        item.label,
      ),
    ),
  );
}

export function ResponsiveDrawer({
  open,
  children,
}: Readonly<{ open: boolean; children: ReactNode }>): ReactNode {
  return createElement(
    "aside",
    { "aria-label": "Navigation drawer", "aria-hidden": !open, hidden: !open },
    children,
  );
}
