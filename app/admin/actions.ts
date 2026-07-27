"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOrigin } from "@/lib/get-origin";

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role = (user?.app_metadata as { role?: string } | undefined)?.role;
  if (!user || role !== "admin") {
    throw new Error("No autorizado");
  }
  return user;
}

export type InviteResult =
  | { ok: true; link: string; alreadyExisted: boolean }
  | { ok: false; error: string };

// Crea (si hace falta) la cuenta invitada y devuelve un enlace para que la
// persona fije su contraseña. El admin lo comparte como quiera.
export async function inviteUser(emailRaw: string): Promise<InviteResult> {
  try {
    await assertAdmin();
  } catch {
    return { ok: false, error: "No autorizado." };
  }

  const email = emailRaw.trim().toLowerCase();
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, error: "Email no válido." };
  }

  const admin = createAdminClient();
  const origin = await getOrigin();
  const redirectTo = `${origin}/accept-invite`;

  // ¿Ya existe?
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
  });
  const alreadyExisted = !!createErr && !created?.user;

  // Enlace de invitación con confirmación por botón: el token solo se consume
  // al pulsar "Continuar" en /accept-invite, no al abrir la URL. Así los
  // escáneres de enlaces (email/mensajería) no invalidan la invitación.
  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo },
  });

  if (linkErr || !linkData?.properties?.hashed_token) {
    return {
      ok: false,
      error: "No se pudo generar el enlace de invitación. Inténtalo de nuevo.",
    };
  }

  const tokenHash = linkData.properties.hashed_token;
  const link = `${origin}/accept-invite?token_hash=${tokenHash}&type=recovery`;

  return { ok: true, link, alreadyExisted };
}
