type SignInPageProperties = Readonly<{
  searchParams: Promise<{ returnTo?: string }>;
}>;

export default async function SignInPage({ searchParams }: SignInPageProperties) {
  const { returnTo } = await searchParams;

  return (
    <main className="sign-in-page">
      <section className="sign-in-card" aria-labelledby="sign-in-title">
        <p className="management-eyebrow">Restricted system</p>
        <h1 id="sign-in-title">BBW Management</h1>
        <p>Administrator authentication is required to continue.</p>
        {returnTo ? <p>Your requested management page is protected.</p> : null}
      </section>
    </main>
  );
}
