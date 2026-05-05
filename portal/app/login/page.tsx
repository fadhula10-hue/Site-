import { Header } from "@/components/Header";
import { ClientLoginForm } from "./ClientLoginForm";

export default function LoginPage() {
  return (
    <>
      <Header />
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ padding: "120px var(--op-pad) 80px" }}
      >
        <div className="op-card w-full max-w-md">
          <p className="op-eyebrow">Espace client</p>
          <h1
            style={{
              fontFamily: "var(--op-serif)",
              fontWeight: 400,
              fontSize: 40,
              lineHeight: 1,
              letterSpacing: "-0.018em",
              margin: "12px 0 12px",
            }}
          >
            Connexion par <em style={{ color: "var(--op-accent)" }}>lien magique</em>
          </h1>
          <p style={{ color: "var(--op-mute)", fontSize: 14, lineHeight: 1.55, margin: "0 0 24px" }}>
            Entrez votre adresse email. Vous recevrez un lien pour accéder à votre projet —
            pas de mot de passe à retenir.
          </p>
          <ClientLoginForm />
        </div>
      </main>
    </>
  );
}
