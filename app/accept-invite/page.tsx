import AcceptInviteForm from "./accept-invite-form";

export default function AcceptInvitePage() {
  return (
    <main className="paper min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flabel text-3xl tracking-widest">Fichas D&amp;D</div>
          <p className="mt-2 text-sm opacity-70">Crea tu contraseña para entrar.</p>
        </div>
        <div className="frame p-6">
          <AcceptInviteForm />
        </div>
      </div>
    </main>
  );
}
