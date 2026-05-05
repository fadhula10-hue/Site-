type Props = { value: number; label?: string };

/** Barre de progression horizontale animée, dans les couleurs de la charte. */
export function ProgressBar({ value, label }: Props) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between mb-3">
        <span className="op-eyebrow">{label ?? "Avancement"}</span>
        <span
          className="font-mono"
          style={{
            color: "var(--op-accent)",
            fontFamily: "var(--op-mono)",
            fontSize: 13,
            letterSpacing: "0.16em",
          }}
        >
          {v}%
        </span>
      </div>
      <div
        className="w-full overflow-hidden"
        style={{
          height: 6,
          background: "var(--op-line)",
          borderRadius: 999,
        }}
      >
        <div
          style={{
            width: `${v}%`,
            height: "100%",
            background:
              "linear-gradient(90deg, var(--op-accent) 0%, #ff8a5b 100%)",
            transition: "width .8s cubic-bezier(.2,.7,.2,1)",
            boxShadow: "0 0 12px rgba(241,90,36,0.5)",
          }}
        />
      </div>
    </div>
  );
}
