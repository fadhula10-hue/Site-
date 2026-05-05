import Link from "next/link";
import { Logo } from "./Logo";

type Props = {
  rightSlot?: React.ReactNode;
  /** Lien du logo : "/" pour public, "/admin" pour l'admin connecté */
  logoHref?: string;
};

export function Header({ rightSlot, logoHref = "/" }: Props) {
  return (
    <header
      className="sticky top-0 z-50 border-b border-[var(--op-line)]"
      style={{
        background: "rgba(5,5,26,0.78)",
        backdropFilter: "blur(14px) saturate(140%)",
      }}
    >
      <div
        className="mx-auto flex items-center justify-between gap-6"
        style={{ padding: "16px var(--op-pad)", maxWidth: 1700 }}
      >
        <Link href={logoHref} className="hover:opacity-90 transition-opacity">
          <Logo size={13} />
        </Link>
        <div className="flex items-center gap-3">{rightSlot}</div>
      </div>
    </header>
  );
}
