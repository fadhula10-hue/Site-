import Link from "next/link";
import { Header } from "@/components/Header";
import { Logo } from "@/components/Logo";

export default function Home() {
  return (
    <>
      <Header />
      <main
        className="min-h-screen flex flex-col items-center justify-center text-center"
        style={{ padding: "120px var(--op-pad) 80px" }}
      >
        <Logo size={28} />
        <p className="op-eyebrow mt-10">Espace client</p>
        <h1 className="op-h1 mt-4 max-w-3xl">
          Suivez votre projet en <em style={{ color: "var(--op-accent)", fontStyle: "italic" }}>temps réel</em>
        </h1>
        <p
          className="mt-8 max-w-xl"
          style={{ color: "var(--op-mute)", fontSize: 16, lineHeight: 1.55 }}
        >
          Bienvenue sur l'espace client d'Olympe Production. Connectez-vous avec votre email pour
          accéder à votre projet, valider les étapes et échanger avec l'équipe.
        </p>
        <div className="flex gap-3 mt-10 flex-wrap justify-center">
          <Link href="/login" className="op-btn op-btn--primary op-btn--lg">
            Accéder à mon projet
          </Link>
          <Link href="/admin/login" className="op-btn op-btn--ghost op-btn--lg">
            Espace administrateur
          </Link>
        </div>
      </main>
    </>
  );
}
