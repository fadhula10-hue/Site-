"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { STAGE_LABELS, STAGE_ORDER } from "@/components/Stages";
import {
  updateProgress, setCurrentStage, requestValidation, updateDeadline,
  archiveProject, deleteProject, uploadProjectFile, deleteFile, resendMagicLink,
} from "./actions";

type Project = {
  id: string;
  name: string;
  deadline: string | null;
  progress: number;
  current_stage: "preprod" | "prod" | "postprod";
  archived: boolean;
  profiles: { id: string; email: string; full_name: string | null };
};
type Stage = { id: string; kind: "preprod"|"prod"|"postprod"; status: string };
type FileRow = { id: string; name: string; storage_path: string; stage_id: string | null; size_bytes: number | null };

export function AdminProjectControls({
  project, stages, files,
}: { project: Project; stages: Stage[]; files: FileRow[] }) {
  const [progress, setProgressVal] = useState(project.progress);
  const [deadline, setDeadline] = useState(project.deadline ?? "");
  const [pending, startTransition] = useTransition();
  const [linkInfo, setLinkInfo] = useState<string | null>(null);

  const stageById = (kind: string) => stages.find((s) => s.kind === kind);

  function onUpload(stageId: string | null) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const fd = new FormData();
      fd.set("projectId", project.id);
      if (stageId) fd.set("stageId", stageId);
      fd.set("file", file);
      startTransition(async () => {
        await uploadProjectFile(fd);
        e.target.value = "";
      });
    };
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Avancement & deadline */}
      <div className="op-card">
        <p className="op-eyebrow mb-4">Avancement</p>
        <div className="flex items-center gap-4">
          <input
            type="range" min={0} max={100} value={progress}
            onChange={(e) => setProgressVal(Number(e.target.value))}
            className="flex-1"
            style={{ accentColor: "var(--op-accent)" }}
          />
          <span style={{ fontFamily: "var(--op-mono)", fontSize: 13, color: "var(--op-accent)", letterSpacing: "0.16em", minWidth: 48 }}>
            {progress}%
          </span>
        </div>
        <div className="flex justify-end mt-3">
          <Button size="sm" variant="ghost" disabled={pending || progress === project.progress}
            onClick={() => startTransition(() => updateProgress(project.id, progress))}>
            Enregistrer
          </Button>
        </div>

        <hr style={{ border: 0, borderTop: "1px solid var(--op-line)", margin: "24px 0" }} />

        <p className="op-eyebrow mb-3">Deadline</p>
        <div className="flex gap-3 items-center">
          <input type="date" className="op-input flex-1" value={deadline}
            onChange={(e) => setDeadline(e.target.value)} />
          <Button size="sm" variant="ghost" disabled={pending}
            onClick={() => startTransition(() => updateDeadline(project.id, deadline || null))}>
            Mettre à jour
          </Button>
        </div>
      </div>

      {/* Étape en cours */}
      <div className="op-card">
        <p className="op-eyebrow mb-4">Étape en cours</p>
        <div className="flex flex-wrap gap-2">
          {STAGE_ORDER.map((k) => (
            <Button key={k}
              size="sm"
              variant={project.current_stage === k ? "primary" : "ghost"}
              disabled={pending}
              onClick={() => startTransition(() => setCurrentStage(project.id, k))}>
              {STAGE_LABELS[k]}
            </Button>
          ))}
        </div>

        <hr style={{ border: 0, borderTop: "1px solid var(--op-line)", margin: "24px 0" }} />

        <p className="op-eyebrow mb-3">Demander la validation au client</p>
        <p style={{ fontSize: 13, color: "var(--op-mute)", marginBottom: 12 }}>
          Envoie un email immédiat au client + relances quotidiennes à 9h00 (heure de La Réunion) jusqu'à validation.
        </p>
        <div className="flex flex-wrap gap-2">
          {STAGE_ORDER.map((k) => {
            const s = stageById(k);
            if (!s) return null;
            const isReview = s.status === "review";
            const isValidated = s.status === "validated";
            return (
              <Button key={k}
                size="sm"
                variant={isReview ? "audit" : "ghost"}
                disabled={pending || isValidated}
                onClick={() => startTransition(() => requestValidation(project.id, s.id))}>
                {isValidated ? `${STAGE_LABELS[k]} ✓` : isReview ? `🔔 ${STAGE_LABELS[k]}` : `Demander ${STAGE_LABELS[k]}`}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Fichiers */}
      <div className="op-card lg:col-span-2">
        <p className="op-eyebrow mb-4">Fichiers à valider</p>
        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          {STAGE_ORDER.map((k) => {
            const s = stageById(k);
            return (
              <label key={k} className="op-btn op-btn--ghost" style={{ justifyContent: "center", cursor: "pointer" }}>
                <input type="file" className="hidden" onChange={onUpload(s?.id ?? null)} />
                + Ajouter à {STAGE_LABELS[k]}
              </label>
            );
          })}
        </div>
        {files.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--op-mute)" }}>Aucun fichier pour l'instant.</p>
        ) : (
          <ul className="grid gap-2">
            {files.map((f) => {
              const stage = stages.find((s) => s.id === f.stage_id);
              return (
                <li key={f.id} className="flex items-center justify-between gap-3"
                  style={{ padding: "10px 14px", border: "1px solid var(--op-line)", borderRadius: 4 }}>
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                    <div className="op-eyebrow" style={{ fontSize: 10 }}>
                      {stage ? STAGE_LABELS[stage.kind] : "—"} · {f.size_bytes ? `${Math.round(f.size_bytes/1024)} Ko` : ""}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost"
                    onClick={() => {
                      if (confirm("Supprimer ce fichier ?")) {
                        startTransition(() => deleteFile(project.id, f.id, f.storage_path));
                      }
                    }}>
                    Supprimer
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Outils */}
      <div className="op-card lg:col-span-2">
        <p className="op-eyebrow mb-4">Outils</p>
        <div className="flex flex-wrap gap-3">
          <Button size="sm" variant="ghost"
            onClick={async () => {
              const r = await resendMagicLink(project.profiles.email, project.id);
              if ("error" in r) alert(r.error); else setLinkInfo(r.url ?? "Lien généré.");
            }}>
            🔗 Renvoyer un lien d'accès au client
          </Button>
          <Button size="sm" variant="ghost"
            onClick={() => startTransition(() => archiveProject(project.id, !project.archived))}>
            {project.archived ? "Désarchiver" : "Archiver"}
          </Button>
          <Button size="sm" variant="ghost"
            onClick={() => {
              if (confirm("Supprimer définitivement ce projet et toutes ses données ?")) {
                startTransition(async () => {
                  await deleteProject(project.id);
                  window.location.href = "/admin";
                });
              }
            }}>
            Supprimer
          </Button>
        </div>
        {linkInfo && (
          <p className="mt-3" style={{ fontSize: 12, color: "var(--op-mute)", wordBreak: "break-all" }}>
            Lien : <a href={linkInfo} style={{ color: "var(--op-accent)" }}>{linkInfo}</a>
          </p>
        )}
      </div>
    </div>
  );
}
