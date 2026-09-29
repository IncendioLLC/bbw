import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <p className="eyebrow">Biotech Builders Worldwide</p>
      <h1>The Growth Infrastructure for Biotech Innovation</h1>
      <p>
        A focused platform for founders, service providers, and venture investors to navigate
        biotech company building.
      </p>
      <Link className="action" href="/sign-in">
        Sign in
      </Link>
    </>
  );
}
