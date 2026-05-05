"use server";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase/server";
import { emailWelcomeClient, SITE } from "@/lib/emails/send";

type Args = {
  name: string;
  clientEmail: string;
  clientName?: string;
  deadline?: string;
  description?: string;
};

export async function createProject(args: Args): Promise<{ id?: string; error?: string }> {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { error: "Non authentifié" };

  // Vérifie le rôle admin
  const { data: me } = await sb.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") return { error: "Accès refusé" };

  const admin = supabaseAdmin();

  // Trouve ou crée le compte client (sans envoyer le magic link auto — on enverra notre propre email)
  let clientId: string | null = null;
  const { data: existing } = await admin
    .from("profiles").select("id").eq("email", args.clientEmail).maybeSingle();

  if (existing) {
    clientId = existing.id;
  } else {
    // Crée le user via Supabase Auth admin API — sans mot de passe
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: args.clientEmail,
      email_confirm: true,
      user_metadata: { full_name: args.clientName ?? null, role: "client" },
    });
    if (createErr || !created.user) {
      return { error: `Impossible de créer le client : ${createErr?.message ?? "inconnu"}` };
    }
    clientId = created.user.id;
    // Met à jour le full_name si fourni
    if (args.clientName) {
      await admin.from("profiles").update({ full_name: args.clientName }).eq("id", clientId);
    }
  }

  // Crée le projet (les 3 étapes sont créées via trigger SQL)
  const { data: project, error: insErr } = await admin
    .from("projects")
    .insert({
      name: args.name,
      description: args.description ?? null,
      client_id: clientId!,
      deadline: args.deadline || null,
    })
    .select("id, name")
    .single();
  if (insErr || !project) return { error: insErr?.message ?? "Erreur création projet" };

  // Génère un magic link et envoie un email de bienvenue stylé Olympe
  try {
    const { data: linkData } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: args.clientEmail,
      options: { redirectTo: `${SITE()}/auth/callback?next=/projet/${project.id}` },
    });
    const loginUrl = linkData?.properties?.action_link ?? `${SITE()}/login`;
    await emailWelcomeClient({ to: args.clientEmail, projectName: project.name, loginUrl });
  } catch (e) {
    console.error("welcome email failed", e);
  }

  return { id: project.id };
}
