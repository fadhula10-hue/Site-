/**
 * Relances quotidiennes — exécuté par Vercel Cron.
 *
 * Planification : voir vercel.json
 *   "0 5 * * *"  →  tous les jours à 05:00 UTC = 09:00 heure de La Réunion (UTC+4, sans DST).
 *
 * Pour changer l'heure :
 *   - 09:00 La Réunion = 05:00 UTC → "0 5 * * *"
 *   - 10:00 La Réunion = 06:00 UTC → "0 6 * * *"
 *   - 08:00 La Réunion = 04:00 UTC → "0 4 * * *"
 *   Modifier la valeur "schedule" dans vercel.json puis redéployer.
 *
 * Pour changer de fuseau, faire la conversion en UTC et mettre l'heure UTC ici.
 */
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { emailValidationRequest, SITE } from "@/lib/emails/send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Vérification du secret cron (Vercel envoie cet header automatiquement)
  const authHeader = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (process.env.CRON_SECRET && authHeader !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = supabaseAdmin();

  // Toutes les tâches actives — étape encore en review
  const { data: tasks, error } = await admin
    .from("reminder_tasks")
    .select(`
      id, send_count, last_sent_at,
      stages!inner (
        id, kind, status, project_id,
        projects!inner (
          id, name,
          profiles!projects_client_id_fkey ( email )
        )
      )
    `)
    .eq("active", true)
    .eq("stages.status", "review");

  if (error) {
    console.error("cron query error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let sent = 0;
  let skipped = 0;

  for (const t of tasks ?? []) {
    const stage = (t as any).stages;
    const project = stage?.projects;
    const email = project?.profiles?.email;
    if (!email || !stage?.kind || !project?.id) { skipped++; continue; }

    // Anti-doublon : pas plus d'1 envoi par 20h (couvre fuseaux + retries Vercel)
    if (t.last_sent_at) {
      const hours = (Date.now() - new Date(t.last_sent_at).getTime()) / 3_600_000;
      if (hours < 20) { skipped++; continue; }
    }

    try {
      await emailValidationRequest({
        to: email,
        projectName: project.name,
        stage: stage.kind,
        url: `${SITE()}/projet/${project.id}#${stage.kind}`,
        isReminder: true,
        reminderCount: (t.send_count ?? 0) + 1,
      });
      await admin.from("reminder_tasks").update({
        last_sent_at: new Date().toISOString(),
        send_count: (t.send_count ?? 0) + 1,
      }).eq("id", t.id);
      sent++;
    } catch (e) {
      console.error("reminder send failed", e);
    }
  }

  return NextResponse.json({ ok: true, sent, skipped, total: tasks?.length ?? 0 });
}
