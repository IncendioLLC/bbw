import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <>
      <p className="eyebrow">Member workspace</p>
      <h1>Your dashboard</h1>
    </>
  );
}
