"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { createProject } from "./actions";

export function NewProjectForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientName, setClientName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const res = await createProject({ name, clientEmail, clientName, deadline, description });
    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.replace(`/admin/projects/${res.id}`);
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div className="op-field">
        <label className="op-field-label">Nom du projet</label>
        <input className="op-input" required value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="op-field">
          <label className="op-field-label">Email du client</label>
          <input type="email" className="op-input" required value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)} />
        </div>
        <div className="op-field">
          <label className="op-field-label">Nom du client (optionnel)</label>
          <input className="op-input" value={clientName}
            onChange={(e) => setClientName(e.target.value)} />
        </div>
      </div>
      <div className="op-field">
        <label className="op-field-label">Deadline</label>
        <input type="date" className="op-input" value={deadline}
          onChange={(e) => setDeadline(e.target.value)} />
      </div>
      <div className="op-field">
        <label className="op-field-label">Description (optionnel)</label>
        <textarea className="op-textarea" value={description}
          onChange={(e) => setDescription(e.target.value)} />
      </div>
      {error && <p style={{ color: "#ff8080", fontSize: 13 }}>{error}</p>}
      <div className="flex gap-3 justify-end">
        <Button type="submit" variant="audit" size="lg" disabled={loading}>
          {loading ? "Création…" : "Créer le projet"}
        </Button>
      </div>
    </form>
  );
}
