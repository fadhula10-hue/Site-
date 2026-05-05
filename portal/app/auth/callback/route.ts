import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

/** Reçoit le code d'auth depuis le lien magique et redirige vers le bon espace. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? null;

  if (code) {
    const supabase = await supabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Détecte le rôle pour rediriger
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles").select("role").eq("id", user.id).single();
        if (next) return NextResponse.redirect(`${origin}${next}`);
        if (profile?.role === "admin") return NextResponse.redirect(`${origin}/admin`);
        // Client : redirige vers son projet le plus récent
        const { data: project } = await supabase
          .from("projects").select("id")
          .eq("client_id", user.id).eq("archived", false)
          .order("created_at", { ascending: false }).limit(1).single();
        if (project) return NextResponse.redirect(`${origin}/projet/${project.id}`);
        return NextResponse.redirect(`${origin}/projet/aucun`);
      }
    }
  }
  return NextResponse.redirect(`${origin}/login?error=invalid_link`);
}
