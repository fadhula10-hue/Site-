"use server";
import { revalidatePath } from "next/cache";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase/server";
import {
  emailAdminClientValidated, emailAdminClientRejected,
  emailAdminClientComment, SITE,
} from "@/lib/emails/send";

async function ensureClientForProject(projectId: string) {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error("not authenticated");
  const { data: project } = await sb
    .from("projects")
    .select("id, name, profiles!projects_client_id_fkey(email)")
    .eq("id", projectId).single();
  if (!project) throw new Error("not found");
  return { sb, user, project: project as any };
}

export async function validateStage(projectId: string, stageId: string) {
  const { user, project } = await ensureClientForProject(projectId);
  const admin = supabaseAdmin();
  const { data: stage } = await admin.from("stages")
    .update({ status: "validated" }).eq("id", stageId)
    .select("kind").single();

  emailAdminClientValidated({
    projectName: project.name,
    stage: stage?.kind as any,
    clientEmail: project.profiles?.email ?? user.email!,
    url: `${SITE()}/admin/projects/${projectId}`,
  }).catch(console.error);

  revalidatePath(`/projet/${projectId}`);
}

export async function rejectStage(projectId: string, stageId: string, reason: string) {
  const { user, project } = await ensureClientForProject(projectId);
  if (!reason.trim()) return { error: "Merci d'indiquer ce qui doit être ajusté." };
  const admin = supabaseAdmin();
  const { data: stage } = await admin.from("stages")
    .update({ status: "rejected", rejected_reason: reason.trim() }).eq("id", stageId)
    .select("kind").single();

  emailAdminClientRejected({
    projectName: project.name,
    stage: stage?.kind as any,
    clientEmail: project.profiles?.email ?? user.email!,
    reason: reason.trim(),
    url: `${SITE()}/admin/projects/${projectId}`,
  }).catch(console.error);

  revalidatePath(`/projet/${projectId}`);
  return { ok: true };
}

export async function postClientComment(projectId: string, body: string) {
  const { user, project } = await ensureClientForProject(projectId);
  const admin = supabaseAdmin();
  await admin.from("comments").insert({
    project_id: projectId, author_id: user.id, body,
  });
  emailAdminClientComment({
    projectName: project.name,
    clientEmail: project.profiles?.email ?? user.email!,
    body,
    url: `${SITE()}/admin/projects/${projectId}`,
  }).catch(console.error);
  revalidatePath(`/projet/${projectId}`);
}

/** Génère une URL signée temporaire pour télécharger un fichier */
export async function getSignedFileUrl(projectId: string, storagePath: string) {
  await ensureClientForProject(projectId); // vérifie que c'est bien le client du projet
  const admin = supabaseAdmin();
  const { data, error } = await admin.storage
    .from("project-files")
    .createSignedUrl(storagePath, 3600);
  if (error) return { error: error.message };
  return { url: data.signedUrl };
}
