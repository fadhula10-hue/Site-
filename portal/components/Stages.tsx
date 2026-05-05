export type StageKind = "preprod" | "prod" | "postprod";
export type StageStatus = "pending" | "in_progress" | "review" | "validated" | "rejected";

export const STAGE_LABELS: Record<StageKind, string> = {
  preprod: "Pré-production",
  prod: "Production",
  postprod: "Post-production",
};

export const STAGE_ORDER: StageKind[] = ["preprod", "prod", "postprod"];

const STAGE_ICONS: Record<StageKind, string> = {
  preprod: "✏️",
  prod: "🎥",
  postprod: "✂️",
};

type Stage = { kind: StageKind; status: StageStatus };

export function Stages({ stages }: { stages: Stage[] }) {
  const byKind = new Map(stages.map((s) => [s.kind, s.status]));

  return (
    <ol className="grid grid-cols-3 gap-3 sm:gap-6 w-full">
      {STAGE_ORDER.map((kind, i) => {
        const status = byKind.get(kind) ?? "pending";
        const isDone = status === "validated";
        const isActive = status === "in_progress" || status === "review";
        const isRejected = status === "rejected";

        return (
          <li key={kind} className="flex flex-col items-center text-center">
            <div
              className="grid place-items-center mb-3"
              style={{
                width: 56,
                height: 56,
                borderRadius: 999,
                background: isDone
                  ? "var(--op-accent)"
                  : isActive
                  ? "rgba(241,90,36,0.12)"
                  : "transparent",
                border: `1px solid ${
                  isDone
                    ? "var(--op-accent)"
                    : isActive
                    ? "var(--op-accent)"
                    : "var(--op-line-2)"
                }`,
                color: isDone ? "#fff" : isActive ? "var(--op-accent)" : "var(--op-mute)",
                fontSize: 22,
                transition: "all .35s",
                boxShadow: isActive
                  ? "0 0 24px -4px rgba(241,90,36,0.5)"
                  : isDone
                  ? "0 0 16px -4px rgba(241,90,36,0.4)"
                  : "none",
                animation: isActive ? "op-pop .6s cubic-bezier(.2,.7,.2,1.4)" : undefined,
              }}
            >
              {isDone ? "✓" : STAGE_ICONS[kind]}
            </div>
            <div
              className="font-mono"
              style={{
                fontSize: 10,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--op-mute)",
              }}
            >
              Étape {i + 1}
            </div>
            <div
              className="mt-1"
              style={{
                fontFamily: "var(--op-serif)",
                fontSize: 18,
                lineHeight: 1.2,
                color: isActive || isDone ? "var(--op-fg)" : "var(--op-mute)",
              }}
            >
              {STAGE_LABELS[kind]}
            </div>
            <div className="mt-2">
              {status === "review" && (
                <span className="op-chip">À valider</span>
              )}
              {status === "validated" && (
                <span className="op-chip op-chip--ok">Validée</span>
              )}
              {status === "in_progress" && (
                <span className="op-chip">En cours</span>
              )}
              {isRejected && (
                <span className="op-chip" style={{ background: "rgba(255,80,80,0.10)", borderColor: "rgba(255,80,80,0.30)", color: "#ff8080" }}>
                  Modifications demandées
                </span>
              )}
              {status === "pending" && (
                <span className="op-chip op-chip--mute">À venir</span>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
