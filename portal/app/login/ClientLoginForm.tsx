"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export function ClientLoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false, // Les clients sont créés par l'admin uniquement
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  if (status === "sent") {
    return (
      <div className="text-center py-4">
        <div
          className="mx-auto mb-4 grid place-items-center"
          style={{
            width: 56, height: 56, borderRadius: 999,
            background: "var(--op-accent)", color: "#fff",
            boxShadow: "0 0 0 6px rgba(241,90,36,0.18)",
          }}
        >
          ✓
        </div>
        <p style={{ fontSize: 15, lineHeight: 1.55 }}>
          Lien envoyé à <b>{email}</b>.<br/>
          Vérifiez votre boîte mail (et vos spams) puis cliquez sur le lien pour vous connecter.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="op-field">
        <label className="op-field-label">Email</label>
        <input
          type="email"
          className="op-input"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vous@exemple.com"
        />
      </div>
      {error && (
        <p style={{ color: "#ff8080", fontSize: 13 }}>
          {error}. Si vous êtes client, vérifiez que votre email est bien celui transmis à l'équipe.
        </p>
      )}
      <Button type="submit" variant="audit" size="lg" disabled={status === "loading"}>
        {status === "loading" ? "Envoi…" : "Recevoir mon lien d'accès"}
      </Button>
    </form>
  );
}
