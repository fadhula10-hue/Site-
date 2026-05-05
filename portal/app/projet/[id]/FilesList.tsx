"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { STAGE_LABELS } from "@/components/Stages";
import { getSignedFileUrl } from "./actions";

type FileRow = {
  id: string;
  name: string;
  storage_path: string;
  mime: string | null;
  size_bytes: number | null;
  stage_id: string | null;
};
type Stage = { id: string; kind: "preprod"|"prod"|"postprod" };

export function FilesList({
  files,
  stages,
}: {
  files: FileRow[];
  stages?: Stage[];
}) {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (files.length === 0) {
    return <p style={{ fontSize: 13, color: "var(--op-mute)" }}>Aucun fichier pour l'instant.</p>;
  }

  async function open(file: FileRow) {
    setLoadingId(file.id);
    const r = await getSignedFileUrl(projectId, file.storage_path);
    setLoadingId(null);
    if ("error" in r) { alert(r.error); return; }
    if (file.mime?.startsWith("video/") || file.mime?.startsWith("image/") || file.mime === "application/pdf") {
      setPreviewUrl(r.url!);
    } else {
      window.open(r.url!, "_blank");
    }
  }

  return (
    <>
      <ul className="grid sm:grid-cols-2 gap-3">
        {files.map((f) => {
          const stage = stages?.find((s) => s.id === f.stage_id);
          const isVideo = f.mime?.startsWith("video/");
          const isImage = f.mime?.startsWith("image/");
          return (
            <li key={f.id}>
              <button
                onClick={() => open(f)}
                disabled={loadingId === f.id}
                className="w-full text-left flex items-center gap-3"
                style={{
                  padding: "14px 16px",
                  border: "1px solid var(--op-line-2)",
                  borderRadius: 4,
                  transition: "border-color .25s, background .25s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--op-accent)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--op-line-2)")}
              >
                <span style={{
                  width: 36, height: 36, borderRadius: 4,
                  background: "rgba(241,90,36,0.12)",
                  border: "1px solid rgba(241,90,36,0.30)",
                  display: "grid", placeItems: "center", flexShrink: 0,
                }}>
                  {isVideo ? "▶" : isImage ? "🖼" : "📎"}
                </span>
                <div className="flex-1 min-w-0">
                  <div style={{ fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {f.name}
                  </div>
                  <div className="op-eyebrow" style={{ fontSize: 10 }}>
                    {stage ? STAGE_LABELS[stage.kind] : "—"}
                    {f.size_bytes ? ` · ${(f.size_bytes/1024/1024).toFixed(1)} Mo` : ""}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {previewUrl && (
        <div
          onClick={() => setPreviewUrl(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(3,3,12,0.85)", backdropFilter: "blur(8px)",
            display: "grid", placeItems: "center", padding: 24, cursor: "pointer",
          }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{
            background: "var(--op-bg-2)",
            border: "1px solid var(--op-line-2)",
            borderRadius: 6, maxWidth: "90vw", maxHeight: "90vh", overflow: "hidden",
          }}>
            {previewUrl.includes("/video/") || previewUrl.match(/\.(mp4|mov|webm)/i) ? (
              <video src={previewUrl} controls autoPlay style={{ maxWidth: "90vw", maxHeight: "90vh", display: "block" }} />
            ) : previewUrl.match(/\.(png|jpg|jpeg|gif|webp)/i) ? (
              <img src={previewUrl} alt="" style={{ maxWidth: "90vw", maxHeight: "90vh", display: "block" }} />
            ) : (
              <iframe src={previewUrl} style={{ width: "90vw", height: "90vh", border: 0 }} />
            )}
          </div>
        </div>
      )}
    </>
  );
}
