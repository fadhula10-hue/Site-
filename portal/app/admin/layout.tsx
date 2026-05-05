import { Header } from "@/components/Header";
import { supabaseServer } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <>
      <Header
        logoHref="/admin"
        rightSlot={
          user ? (
            <>
              <span className="op-eyebrow hidden sm:inline">{user.email}</span>
              <form action="/auth/signout" method="post">
                <button className="op-btn op-btn--ghost op-btn--sm" type="submit">
                  Déconnexion
                </button>
              </form>
            </>
          ) : null
        }
      />
      {children}
    </>
  );
}
