import { Header } from "@/components/Header";
import { AdminLoginForm } from "./AdminLoginForm";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  return (
    <>
      <Header />
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ padding: "120px var(--op-pad) 80px" }}
      >
        <div className="op-card w-full max-w-md">
          <p className="op-eyebrow">Administrateur</p>
          <h1
            style={{
              fontFamily: "var(--op-serif)", fontWeight: 400, fontSize: 40,
              lineHeight: 1, letterSpacing: "-0.018em", margin: "12px 0 24px",
            }}
          >
            Connexion <em style={{ color: "var(--op-accent)" }}>équipe</em>
          </h1>
          {sp.error === "forbidden" && (
            <p style={{ color: "#ff8080", fontSize: 13, marginBottom: 16 }}>
              Ce compte n'a pas les droits administrateur.
            </p>
          )}
          <AdminLoginForm />
        </div>
      </main>
    </>
  );
}
