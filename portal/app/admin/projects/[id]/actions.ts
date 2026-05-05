"use server";
import { revalidatePath } from "next/cache";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase/server";
import {
  emailValidationRequest, emailProgressUpdate, emailStageChange,
  emailNewFile, emailCommentToClient, SITE,
} from "@/lib/emails/send";

type StageKind = "preprod" | "prod" | "postprod";

async function ensureAdmin() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error("not authenticated");
  const { data: p } = await sb.from("profiles").select("role").eq("id", user.id).single();
  if (p?.role !== "admin") throw new Error("forbidden");
  return { sb, user };
}

async function getProjectClient(projectId: string) {
  const admin = supabaseAdmin();
  const { data } = await admin
    .from("projects")
    .select("id, name, profiles!projects_client_id_fkey(email)")
    .eq("id", projectId).single();
  return data as any;
}

export async function updateProgress(projectId: string, progress: number) {
  await ensureAdmin();
  const admin = supabaseAdmin();
  const value = Math.max(0, Math.min(100, Math.round(progress)));
  await admin.from("projects").update({ progress: value }).eq("id", projectId);
  const proj = await getProjectClient(projectId);
  if (proj?.profiles?.email) {
    emailProgressUpdate({
      to: proj.profiles.email, projectName: proj.name, progress: value,
      url: `${SITE()}/projet/${projectId}`,
    }).catch(console.error);
  }
  revalidatePath(`/admin/projects/${projectId}`);
}

export async function setCurrentStage(projectId: string, stage: StageKind) {
  await ensureAdmin();
  const admin = supabaseAdmin();
  // Marque l'étape précédente comme validée si elle ne l'est pas, et la nouvelle comme in_progress
  await admin.from("projects").update({ current_stage: stage }).eq("id", projectId);
  await admin.from("stages").update({ status: "in_progress" })
    .eq("project_id", projectId).eq("kind", stage);
  const proj = await getProjectClient(projectId);
  if (proj?.profiles?.email) {
    emailStageChange({
      to: proj.profiles.email, projectName: proj.name, stage,
      url: `${SITE()}/projet/${projectId}`,
    }).catch(console.error);
  }
  revalidatePath(`/admin/projects/${projectId}`);
}

export async function setStageStatus(
  projectId: string,
  stageId: string,
  status: "pending" | "in_progress" | "review" | "validated"
) {
  await ensureAdmin();
  const admin = supabaseAdmin();
  await admin.from("stages").update({ status }).eq("id", stageId);
  revalidatePath(`/admin/projects/${projectId}`);
}

export async function requestValidation(projectId: string, stageId: string) {
  await ensureAdmin();
  const admin = supabaseAdmin();
  // Passe l'étape en review (le trigger SQL crée la reminder_task)
  const { data: stage } = await admin.from("stages")
    .update({ status: "review" }).eq("id", stageId)
    .select("kind").single();

  const proj = await getProjectClient(projectId);
  if (proj?.profiles?.email && stage?.kind) {
    // Récupère les fichiers liés à cette étape pour preview
    const { data: files } = await admin.from("files")
      .select("name").eq("stage_id", stageId);
    const filesPreview = files && files.length
      ? `<p style="margin:16px 0 0;font-size:13px;color:rgba(255,255,255,0.58);">Fichiers à consulter :</p>
         <ul style="margin:8px 0 0;padding-left:18px;font-size:14px;line-height:1.6;color:#fff;">
           ${files.map((f: any) => `<li>${f.name}</li>`).join("")}
         </ul>`
      : "";
    emailValidationRequest({
      to: proj.profiles.email,
      projectName: proj.name,
      stage: stage.kind as StageKind,
      url: `${SITE()}/projet/${projectId}#${stage.kind}`,
      filesPreviewHtml: filesPreview,
    }).catch(console.error);
  }
  revalidatePath(`/admin/projects/${projectId}`);
}

export async function updateDeadline(projectId: string, deadline: string | null) {
  await ensureAdmin();
  const admin = supabaseAdmin();
  await admin.from("projects").update({ deadline }).eq("id", projectId);
  revalidatePath(`/admin/projects/${projectId}`);
}

export async function archiveProject(projectId: string, archived: boolean) {
  await ensureAdmin();
  const admin = supabaseAdmin();
  await admin.from("projects").update({ archived }).eq("id", projectId);
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath("/admin");
}

export async function deleteProject(projectId: string) {
  await ensureAdmin();
  const admin = supabaseAdmin();
  await admin.from("projects").delete().eq("id", projectId);
  revalidatePath("/admin");
}

/** Upload via FormData (Server Action) */
export async function uploadProjectFile(formData: FormData) {
  await ensureAdmin();
  const projectId = formData.get("projectId") as string;
  const stageId = (formData.get("stageId") as string) || null;
  const file = formData.get("file") as File | null;
  if (!file || !projectId) return { error: "Fichier manquant" };

  const admin = supabaseAdmin();
  const cleanName = file.name.replace(/[^\w.\-]+/g, "_");
  const path = `${projectId}/${Date.now()}_${cleanName}`;

  const { error: upErr } = await admin.storage
    .from("project-files")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (upErr) return { error: upErr.message };

  await admin.from("files").insert({
    project_id: projectId,
    stage_id: stageId,
    storage_path: path,
    name: file.name,
    mime: file.type,
    size_bytes: file.size,
  });

  // Notifie le client
  const proj = await getProjectClient(projectId);
  if (proj?.profiles?.email) {
    emailNewFile({
      to: proj.profiles.email,
      projectName: proj.name,
      fileName: file.name,
      url: `${SITE()}/projet/${projectId}`,
    }).catch(console.error);
  }

  revalidatePath(`/admin/projects/${projectId}`);
  return { ok: true };
}

export async function deleteFile(projectId: string, fileId: string, storagePath: string) {
  await ensureAdmin();
  const admin = supabaseAdmin();
  await admin.storage.from("project-files").remove([storagePath]);
  await admin.from("files").delete().eq("id", fileId);
  revalidatePath(`/admin/projects/${projectId}`);
}

export async function postAdminComment(projectId: string, body: string) {
  const { user } = await ensureAdmin();
  const admin = supabaseAdmin();
  await admin.from("comments").insert({
    project_id: projectId, author_id: user.id, body,
  });
  const proj = await getProjectClient(projectId);
  if (proj?.profiles?.email) {
    emailCommentToClient({
      to: proj.profiles.email,
      projectName: proj.name,
      body,
      url: `${SITE()}/projet/${projectId}`,
    }).catch(console.error);
  }
  revalidatePath(`/admin/projects/${projectId}`);
}

export async function resendMagicLink(clientEmail: string, projectId: string) {
  await ensureAdmin();
  const admin = supabaseAdmin();
  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: clientEmail,
    options: { redirectTo: `${SITE()}/auth/callback?next=/projet/${projectId}` },
  });
  if (error) return { error: error.message };
  return { url: data?.properties?.action_link };
}
