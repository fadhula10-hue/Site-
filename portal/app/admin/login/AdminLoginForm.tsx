"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.replace("/admin");
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="op-field">
        <label className="op-field-label">Email</label>
        <input type="email" className="op-input" required
          value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="op-field">
        <label className="op-field-label">Mot de passe</label>
        <input type="password" className="op-input" required
          value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {error && <p style={{ color: "#ff8080", fontSize: 13 }}>{error}</p>}
      <Button type="submit" variant="audit" size="lg" disabled={loading}>
        {loading ? "Connexion…" : "Se connecter"}
      </Button>
    </form>
  );
}
