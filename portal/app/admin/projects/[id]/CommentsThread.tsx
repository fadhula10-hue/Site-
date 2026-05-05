"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { postAdminComment } from "./actions";
import { postClientComment } from "@/app/projet/[id]/actions";

type Comment = {
  id: string;
  body: string;
  created_at: string;
  profiles: { email: string; role: string } | null;
};

export function CommentsThread({
  projectId, comments, isAdmin,
}: { projectId: string; comments: Comment[]; isAdmin: boolean }) {
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();

  function send() {
    if (!body.trim()) return;
    const action = isAdmin ? postAdminComment : postClientComment;
    startTransition(async () => {
      await action(projectId, body.trim());
      setBody("");
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <textarea
          className="op-textarea"
          placeholder="Écrire un message…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <div className="flex justify-end">
          <Button variant="audit" size="sm" disabled={pending || !body.trim()} onClick={send}>
            {pending ? "Envoi…" : "Envoyer"}
          </Button>
        </div>
      </div>

      {comments.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--op-mute)" }}>Aucun message pour l'instant.</p>
      ) : (
        <ul className="flex flex-col gap-3 mt-2">
          {comments.map((c) => {
            const isAdminMsg = c.profiles?.role === "admin";
            return (
              <li key={c.id}
                style={{
                  padding: "14px 16px",
                  border: "1px solid var(--op-line)",
                  borderRadius: 4,
                  background: isAdminMsg ? "rgba(241,90,36,0.06)" : "transparent",
                  borderLeft: isAdminMsg ? "3px solid var(--op-accent)" : "1px solid var(--op-line)",
                }}>
                <div className="flex items-baseline justify-between gap-3 mb-2">
                  <span className="op-eyebrow">
                    {isAdminMsg ? "Olympe Production" : c.profiles?.email ?? "Client"}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--op-mute)", fontFamily: "var(--op-mono)" }}>
                    {new Date(c.created_at).toLocaleString("fr-FR")}
                  </span>
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.55, whiteSpace: "pre-wrap", margin: 0 }}>{c.body}</p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
