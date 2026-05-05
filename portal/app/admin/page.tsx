import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { STAGE_LABELS } from "@/components/Stages";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = await supabaseServer();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, deadline, progress, current_stage, archived, profiles!projects_client_id_fkey(email, full_name)")
    .order("created_at", { ascending: false });

  const list = projects ?? [];

  return (
    <main style={{ padding: "60px var(--op-pad)" }}>
      <div className="max-w-[1500px] mx-auto">
        <div className="flex items-end justify-between gap-6 flex-wrap mb-10">
          <div>
            <p className="op-eyebrow">Tableau de bord</p>
            <h1 className="op-h2 mt-3">
              Vos <em style={{ color: "var(--op-accent)", fontStyle: "italic" }}>projets</em>
            </h1>
          </div>
          <Link href="/admin/projects/new" className="op-btn op-btn--audit op-btn--lg">
            + Nouveau projet
          </Link>
        </div>

        {list.length === 0 ? (
          <div className="op-card text-center" style={{ padding: 64 }}>
            <p style={{ color: "var(--op-mute)", fontSize: 15 }}>
              Aucun projet pour l'instant. Cliquez sur « Nouveau projet » pour commencer.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {list.map((p: any) => (
              <Link
                key={p.id}
                href={`/admin/projects/${p.id}`}
                className="op-card hover:border-[var(--op-accent)] transition-colors block"
                style={{ padding: 24 }}
              >
                <div className="flex items-start justify-between gap-6 flex-wrap">
                  <div className="flex-1 min-w-[240px]">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="op-chip">{STAGE_LABELS[p.current_stage as keyof typeof STAGE_LABELS]}</span>
                      {p.archived && <span className="op-chip op-chip--mute">Archivé</span>}
                    </div>
                    <h3 className="op-h3" style={{ marginBottom: 4 }}>{p.name}</h3>
                    <p style={{ fontSize: 13, color: "var(--op-mute)" }}>
                      {p.profiles?.email ?? "—"}
                      {p.deadline && <> · Deadline : {new Date(p.deadline).toLocaleDateString("fr-FR")}</>}
                    </p>
                  </div>
                  <div className="w-full sm:w-[300px]">
                    <ProgressBar value={p.progress} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
