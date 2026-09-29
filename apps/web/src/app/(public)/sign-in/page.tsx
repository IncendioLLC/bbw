import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignInPage() {
  return (
    <>
      <p className="eyebrow">Member access</p>
      <h1>Sign in to BBW</h1>
      <p>Member authentication will be connected to the approved identity service.</p>
    </>
  );
}
