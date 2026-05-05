import { NewProjectForm } from "./NewProjectForm";

export default function NewProjectPage() {
  return (
    <main style={{ padding: "60px var(--op-pad)" }}>
      <div className="max-w-2xl mx-auto">
        <p className="op-eyebrow">Nouveau projet</p>
        <h1 className="op-h2 mt-3 mb-8">
          Créer un <em style={{ color: "var(--op-accent)", fontStyle: "italic" }}>projet client</em>
        </h1>
        <div className="op-card">
          <NewProjectForm />
        </div>
      </div>
    </main>
  );
}
