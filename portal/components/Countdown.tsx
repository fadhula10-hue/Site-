"use client";
import { useEffect, useState } from "react";

/** Compte à rebours côté client jusqu'à la deadline. */
export function Countdown({ deadline }: { deadline: string }) {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  const target = new Date(deadline).getTime();
  const diff = target - now;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  let text: string;
  let tone: "ok" | "warn" | "danger" | "done" = "ok";
  if (diff <= 0) {
    text = "Deadline atteinte";
    tone = "done";
  } else if (days === 1) {
    text = "Plus qu'1 jour";
    tone = "danger";
  } else if (days <= 7) {
    text = `Plus que ${days} jours`;
    tone = "warn";
  } else {
    text = `Plus que ${days} jours`;
  }

  const color =
    tone === "danger"
      ? "#ff8080"
      : tone === "warn"
      ? "var(--op-accent)"
      : tone === "done"
      ? "var(--op-mute)"
      : "var(--op-fg)";

  return (
    <div className="flex items-center gap-2">
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: color,
          boxShadow: tone === "warn" || tone === "danger" ? `0 0 12px ${color}` : "none",
        }}
      />
      <span style={{ color, fontSize: 14 }}>{text}</span>
    </div>
  );
}
