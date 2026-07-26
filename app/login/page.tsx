import LoginForm from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const sp = await searchParams;
  return (
    <main className="paper min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flabel text-3xl tracking-widest">Fichas D&amp;D</div>
          <p className="mt-2 text-sm opacity-70">
            Tus personajes, con alma de papel.
          </p>
        </div>
        <div className="frame p-6">
          <LoginForm redirect={sp.redirect ?? "/"} error={sp.error} />
        </div>
      </div>
    </main>
  );
}
