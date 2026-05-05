import { Header } from "@/components/Header";

export default function NoProjectPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen grid place-items-center" style={{ padding: "120px var(--op-pad)" }}>
        <div className="text-center max-w-md">
          <p className="op-eyebrow">Aucun projet</p>
          <h1 className="op-h2 mt-3">Pas de projet en cours</h1>
          <p style={{ color: "var(--op-mute)", marginTop: 16 }}>
            Aucun projet n'est associé à votre compte pour l'instant. Si c'est une erreur,
            contactez l'équipe Olympe à <a href="mailto:contact@olympeproduction.com" style={{ color: "var(--op-accent)" }}>contact@olympeproduction.com</a>.
          </p>
        </div>
      </main>
    </>
  );
}
