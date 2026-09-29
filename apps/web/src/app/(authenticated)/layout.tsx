import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

const memberSessionCookie = "bbw_member_session";

export default async function AuthenticatedLayout({ children }: Readonly<{ children: ReactNode }>) {
  const cookieStore = await cookies();

  if (!cookieStore.has(memberSessionCookie)) {
    redirect("/sign-in?returnTo=%2Fdashboard");
  }

  return <main className="content">{children}</main>;
}
