import { Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useShop } from "@/lib/shop-context";
import { BOUTIQUE, COUNTRIES, formatFCFA } from "@/lib/shop";

export function SiteHeader() {
  const { count, setCartOpen, country, setCountry, user } = useShop();
  const navigate = useNavigate();
  const livraison = COUNTRIES.find((c) => c.code === country)?.livraison ?? 0;

  return (
    <>
      <header className="sticky top-0 z-40 bg-ivory/70 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          <div className="flex h-16 items-center justify-between lg:h-20">
            <Link to="/" className="font-serif text-2xl font-medium tracking-tight lg:text-3xl">
              {BOUTIQUE.nom}
            </Link>
            <nav className="hidden items-center gap-8 text-sm font-medium text-ink-soft md:flex">
              <Link to="/" hash="collection" className="transition-colors hover:text-ink">
                Collection
              </Link>
              <Link to="/livraison" className="transition-colors hover:text-ink">
                Livraison
              </Link>
              {user ? (
                <Link to="/mes-commandes" className="transition-colors hover:text-ink">
                  Mes commandes
                </Link>
              ) : null}
            </nav>
            <div className="flex items-center gap-3 lg:gap-5">
              {user ? (
                <button
                  type="button"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    navigate({ to: "/" });
                  }}
                  className="hidden rounded-full bg-white/45 px-4 py-2 text-sm font-medium ring-1 ring-black/5 backdrop-blur-md transition-colors hover:text-ink-soft sm:flex"
                >
                  Se déconnecter
                </button>
              ) : (
                <Link
                  to="/compte"
                  className="hidden items-center gap-2 rounded-full bg-white/45 px-4 py-2 text-sm font-medium ring-1 ring-black/5 backdrop-blur-md sm:flex"
                >
                  <span className="text-gold">
                    <svg className="size-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7ZM2 18c0-3.3 3.6-5.5 8-5.5s8 2.2 8 5.5v1H2v-1Z" />
                    </svg>
                  </span>
                  Créer un compte
                </Link>
              )}
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="flex items-center gap-2 rounded-full bg-ink py-2 pl-2 pr-3 text-sm font-medium text-ivory ring-1 ring-ink/10"
              >
                <span className="flex size-5 items-center justify-center rounded-full bg-gold text-[11px] font-semibold text-ink">
                  {count}
                </span>
                Panier
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="sticky top-16 z-30 bg-white/40 ring-1 ring-black/5 backdrop-blur-md lg:top-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 py-3 text-sm">
            <span className="font-medium text-ink-soft">Livraison</span>
            <div className="flex flex-wrap items-center gap-2">
              {COUNTRIES.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setCountry(c.code)}
                  className={
                    country === c.code
                      ? "rounded-full bg-ink px-3.5 py-1.5 text-sm font-medium text-ivory"
                      : "rounded-full bg-white/50 px-3.5 py-1.5 text-sm font-medium text-ink-soft ring-1 ring-black/5 transition-colors hover:text-ink"
                  }
                >
                  {c.nom}
                </button>
              ))}
            </div>
            <span className="ml-auto hidden text-ink-soft sm:block">
              {COUNTRIES.find((c) => c.code === country)?.nom} —{" "}
              <span className="font-medium text-ink">
                {livraison === 0 ? "livraison offerte" : `${formatFCFA(livraison)} de livraison`}
              </span>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
