import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { Header } from "@/components/Header";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Stages, STAGE_LABELS } from "@/components/Stages";
import { Countdown } from "@/components/Countdown";
import { ClientStageActions } from "./ClientStageActions";
import { CommentsThread } from "@/app/admin/projects/[id]/CommentsThread";
import { FilesList } from "./FilesList";

export const dynamic = "force-dynamic";

export default async function ClientProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sb = await supabaseServer();

  const { data: { user } } = await sb.auth.getUser();
  if (!user) notFound();

  const { data: project } = await sb
    .from("projects")
    .select("id, name, description, deadline, progress, current_stage, archived")
    .eq("id", id).single();
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
    <>
      <Header
        rightSlot={
          <form action="/auth/signout" method="post">
            <button className="op-btn op-btn--ghost op-btn--sm" type="submit">
              Déconnexion
            </button>
          </form>
        }
      />
      <main style={{ padding: "60px var(--op-pad)" }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <p className="op-eyebrow">Votre projet</p>
            <h1 className="op-h1 mt-4">{project.name}</h1>
            <div className="flex justify-center gap-4 mt-6 flex-wrap">
              {project.deadline && <Countdown deadline={project.deadline} />}
            </div>
          </div>

          <div className="op-card mb-10">
            <ProgressBar value={project.progress} />
          </div>

          <div className="op-card mb-10">
            <Stages stages={(stages ?? []) as any} />
          </div>

          {/* Étape actuelle à valider */}
          <ClientStageActions
            projectId={id}
            stages={(stages ?? []) as any}
            files={(files ?? []) as any}
          />

          <div className="op-card mt-10">
            <p className="op-eyebrow mb-4">Tous les fichiers du projet</p>
            <FilesList files={(files ?? []) as any} stages={(stages ?? []) as any} />
          </div>

          <div className="op-card mt-10">
            <p className="op-eyebrow mb-4">Échanges avec l'équipe</p>
            <CommentsThread
              projectId={id}
              comments={(comments ?? []) as any}
              isAdmin={false}
            />
          </div>
        </div>
      </main>
    </>
  );
}
