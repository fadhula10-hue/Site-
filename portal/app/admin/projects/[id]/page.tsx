import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Stages, STAGE_LABELS } from "@/components/Stages";
import { Countdown } from "@/components/Countdown";
import { AdminProjectControls } from "./AdminProjectControls";
import { CommentsThread } from "./CommentsThread";

export const dynamic = "force-dynamic";

export default async function AdminProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sb = await supabaseServer();

  const { data: project } = await sb
    .from("projects")
    .select(`
      id, name, description, deadline, progress, current_stage, archived, created_at,
      profiles!projects_client_id_fkey(id, email, full_name)
    `)
    .eq("id", id)
    .single();

  if (!project) notFound();

  const { data: stages } = await sb.from("stages")
    .select("id, kind, status, validated_at, rejected_reason")
    .eq("project_id", id);

  const { data: files } = await sb.from("files")
    .select("id, name, storage_path, mime, size_bytes, stage_id, created_at")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const { data: comments } = await sb.from("comments")
    .select("id, body, created_at, author_id, profiles(email, role)")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  return (
    <main style={{ padding: "60px var(--op-pad)" }}>
      <div className="max-w-[1500px] mx-auto">
        <Link href="/admin" className="op-eyebrow hover:text-white transition-colors">
          ← Retour aux projets
        </Link>

        <div className="flex items-end justify-between gap-6 flex-wrap mt-4 mb-10">
          <div className="flex-1 min-w-[280px]">
            <p className="op-eyebrow">{(project as any).profiles?.email}</p>
            <h1 className="op-h2 mt-3">{project.name}</h1>
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              {project.deadline && <Countdown deadline={project.deadline} />}
              <span className="op-chip">{STAGE_LABELS[project.current_stage as keyof typeof STAGE_LABELS]}</span>
              {project.archived && <span className="op-chip op-chip--mute">Archivé</span>}
            </div>
          </div>
          <div className="w-full sm:w-[360px]">
            <ProgressBar value={project.progress} />
          </div>
        </div>

        <div className="op-card mb-10">
          <Stages stages={(stages ?? []) as any} />
        </div>

        <AdminProjectControls
          project={project as any}
          stages={(stages ?? []) as any}
          files={(files ?? []) as any}
        />

        <div className="op-card mt-10">
          <p className="op-eyebrow mb-4">Commentaires</p>
          <CommentsThread
            projectId={id}
            comments={(comments ?? []) as any}
            isAdmin
          />
        </div>
      </div>
    </main>
  );
}
