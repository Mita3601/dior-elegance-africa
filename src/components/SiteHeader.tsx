import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingBag, UserRound } from "lucide-react";
import { useShop } from "@/lib/shop-context";
import { BOUTIQUE, COUNTRIES, formatFCFA } from "@/lib/shop";

export function SiteHeader() {
  const { count, setCartOpen, country, setCountry, user, signOut } = useShop();
  const navigate = useNavigate();
  const livraison = COUNTRIES.find((c) => c.code === country)?.livraison ?? 0;

  const navItems = [
    { label: "Collection", to: "/", hash: "collection" },
    { label: "Livraison", to: "/livraison" },
    { label: "Contact", to: "/contact" },
    { label: "CGV", to: "/cgv" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#d9c8ae]/70 bg-[linear-gradient(180deg,rgba(248,243,236,0.94),rgba(244,237,229,0.85))] shadow-[0_10px_40px_rgba(47,36,19,0.06)] backdrop-blur-2xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-24 items-center justify-between gap-4">
            <Link to="/" className="group flex items-center gap-3" aria-label="Accueil">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#d8c7aa] bg-[linear-gradient(135deg,#fefaf5,#efe5d3)] text-[10px] font-semibold tracking-[0.32em] text-[#241d17] shadow-[0_8px_18px_rgba(82,64,38,0.12)] transition-all duration-300 group-hover:-translate-y-0.5">
                {BOUTIQUE.nom.slice(0, 2).toUpperCase()}
              </div>
              <div className="leading-none">
                <div className="font-serif text-[2rem] tracking-[0.08em] text-[#1d1713] lg:text-[2.35rem]">
                  {BOUTIQUE.nom}
                </div>
              </div>
            </Link>

            <nav className="hidden items-center gap-1.5 rounded-full border border-[#d9c8ae]/80 bg-white/45 p-1.5 shadow-[0_8px_28px_rgba(62,45,25,0.08)] md:flex">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  hash={item.hash}
                  className="rounded-full px-4 py-2 text-[0.78rem] font-medium uppercase tracking-[0.12em] text-[#554a3d] transition-all duration-200 hover:bg-[#1d1713] hover:text-[#f9f4ee]"
                >
                  {item.label}
                </Link>
              ))}
              {user ? (
                <Link
                  to="/mes-commandes"
                  className="rounded-full px-4 py-2 text-[0.78rem] font-medium uppercase tracking-[0.12em] text-[#554a3d] transition-all duration-200 hover:bg-[#1d1713] hover:text-[#f9f4ee]"
                >
                  Mes commandes
                </Link>
              ) : null}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              {user ? (
                <button
                  type="button"
                  onClick={async () => {
                    await signOut();
                    navigate({ to: "/" });
                  }}
                  className="hidden items-center gap-2 rounded-full border border-[#d9c8ae] bg-[#fdfaf6] px-4 py-2 text-[0.72rem] font-medium uppercase tracking-[0.12em] text-[#2b241f] transition-all duration-200 hover:border-[#c9b18d] hover:bg-white sm:flex"
                >
                  <UserRound className="h-4 w-4 text-[#b58c45]" />
                  Déconnexion
                </button>
              ) : (
                <Link
                  to="/compte"
                  className="hidden items-center gap-2 rounded-full border border-[#d9c8ae] bg-[#fdfaf6] px-4 py-2 text-[0.72rem] font-medium uppercase tracking-[0.12em] text-[#2b241f] transition-all duration-200 hover:border-[#c9b18d] hover:bg-white sm:flex"
                >
                  <UserRound className="h-4 w-4 text-[#b58c45]" />
                  Compte
                </Link>
              )}

              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="flex items-center gap-2 rounded-full bg-[#1d1713] px-3.5 py-2.5 text-[0.72rem] font-medium uppercase tracking-[0.12em] text-[#f6efe6] shadow-[0_18px_34px_rgba(29,23,19,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#2b241f]"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#d7b06d] text-[10px] font-semibold text-[#1d1713]">
                  {count}
                </span>
                <span className="hidden sm:inline">Panier</span>
                <ShoppingBag className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="sticky top-[96px] z-40 border-b border-[#ddcdb5]/70 bg-[rgba(255,255,255,0.7)] backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3 py-3 text-sm">
            <span className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#73675f]">
              Livraison
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {COUNTRIES.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setCountry(c.code)}
                  className={
                    country === c.code
                      ? "rounded-full bg-[#1d1713] px-3.5 py-1.5 text-[0.72rem] font-medium uppercase tracking-[0.12em] text-[#f9f4ee] shadow-sm"
                      : "rounded-full border border-[#dcc9ae] bg-[#fdfaf7] px-3.5 py-1.5 text-[0.72rem] font-medium uppercase tracking-[0.12em] text-[#584e47] transition-colors hover:border-[#c7ae82] hover:text-[#1d1713]"
                  }
                >
                  {c.nom}
                </button>
              ))}
            </div>
            <span className="ml-auto hidden text-[#5f554f] sm:block">
              {COUNTRIES.find((c) => c.code === country)?.nom} —{" "}
              <span className="font-semibold text-[#1d1713]">
                {livraison === 0 ? "livraison offerte" : `${formatFCFA(livraison)} de livraison`}
              </span>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
