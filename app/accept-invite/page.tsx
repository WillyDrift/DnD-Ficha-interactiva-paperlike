import AcceptInviteForm from "./accept-invite-form";

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; type?: string }>;
}) {
  const sp = await searchParams;
  return (
    <main className="paper min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flabel text-3xl tracking-widest">Fichas D&amp;D</div>
          <p className="mt-2 text-sm opacity-70">Activa tu cuenta y crea tu contraseña.</p>
        </div>
        <div className="frame p-6">
          <AcceptInviteForm
            tokenHash={sp.token_hash ?? null}
            otpType={sp.type ?? "recovery"}
          />
        </div>
      </div>
    </main>
  );
}
