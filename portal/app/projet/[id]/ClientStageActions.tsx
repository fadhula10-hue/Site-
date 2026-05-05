"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { STAGE_LABELS } from "@/components/Stages";
import { validateStage, rejectStage } from "./actions";
import { FilesList } from "./FilesList";

type Stage = { id: string; kind: "preprod"|"prod"|"postprod"; status: string; rejected_reason: string | null };
type FileRow = { id: string; name: string; storage_path: string; stage_id: string | null; mime: string | null; size_bytes: number | null };

export function ClientStageActions({
  projectId, stages, files,
}: { projectId: string; stages: Stage[]; files: FileRow[] }) {
  const reviewStages = stages.filter((s) => s.status === "review");

  if (reviewStages.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      {reviewStages.map((s) => (
        <ReviewStageCard
          key={s.id}
          projectId={projectId}
          stage={s}
          files={files.filter((f) => f.stage_id === s.id)}
        />
      ))}
    </div>
  );
}

function ReviewStageCard({
  projectId, stage, files,
}: { projectId: string; stage: Stage; files: FileRow[] }) {
  const [reason, setReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div
      id={stage.kind}
      className="op-card"
      style={{
        borderColor: "var(--op-accent)",
        boxShadow: "0 0 32px -8px rgba(241,90,36,0.4)",
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="op-chip">À valider</span>
        <p className="op-eyebrow" style={{ margin: 0 }}>Action requise</p>
      </div>
      <h2
        style={{
          fontFamily: "var(--op-serif)", fontWeight: 400,
          fontSize: 36, lineHeight: 1.05, letterSpacing: "-0.018em",
          margin: "0 0 12px",
        }}
      >
        L'étape <em style={{ color: "var(--op-accent)", fontStyle: "italic" }}>{STAGE_LABELS[stage.kind]}</em> est prête
      </h2>
      <p style={{ color: "var(--op-mute)", fontSize: 15, lineHeight: 1.55, margin: "0 0 20px" }}>
        Prenez le temps de consulter les éléments ci-dessous et indiquez-nous votre retour.
      </p>

      {files.length > 0 && (
        <div className="mb-6">
          <FilesList files={files} />
        </div>
      )}

      {!showReject ? (
        <div className="flex gap-3 flex-wrap">
          <Button variant="audit" size="lg" disabled={pending}
            onClick={() => startTransition(() => validateStage(projectId, stage.id))}>
            ✓ Valider cette étape
          </Button>
          <Button variant="ghost" size="lg" onClick={() => setShowReject(true)}>
            Demander des modifications
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <textarea className="op-textarea"
            placeholder="Décrivez ce qui doit être ajusté…"
            value={reason}
            onChange={(e) => setReason(e.target.value)} />
          {error && <p style={{ color: "#ff8080", fontSize: 13 }}>{error}</p>}
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => { setShowReject(false); setReason(""); }}>
              Annuler
            </Button>
            <Button variant="audit" size="sm" disabled={pending || !reason.trim()}
              onClick={() => {
                startTransition(async () => {
                  const r = await rejectStage(projectId, stage.id, reason);
                  if (r?.error) setError(r.error);
                });
              }}>
              {pending ? "Envoi…" : "Envoyer la demande"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
