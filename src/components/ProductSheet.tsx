import { useShop } from "@/lib/shop-context";
import { COUNTRIES, countryName, formatFCFA, productBySlug } from "@/lib/shop";

export function ProductSheet() {
  const { openSlug, setOpenSlug, add, setCartOpen, country, setCountry } = useShop();
  const product = openSlug ? productBySlug(openSlug) : undefined;
  if (!product) return null;

  const livraison = COUNTRIES.find((c) => c.code === country)?.livraison ?? 0;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Fermer la fiche produit"
        onClick={() => setOpenSlug(null)}
        className="absolute inset-0 bg-ink/40"
      />
      <div className="absolute inset-y-0 right-0 w-full overflow-y-auto bg-white/70 shadow-2xl shadow-ink/10 ring-1 ring-black/5 backdrop-blur-xl sm:w-[440px]">
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-gold">Fiche produit</p>
            <button
              type="button"
              onClick={() => setOpenSlug(null)}
              className="rounded-full bg-white/50 p-2 text-ink-soft ring-1 ring-black/5 transition-colors hover:text-ink"
            >
              <svg className="size-4 shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <img
            src={product.image}
            alt={product.nom}
            loading="lazy"
            width={1024}
            height={768}
            className="mt-5 aspect-[4/3] w-full rounded-xl object-cover ring-1 ring-black/5"
          />

          <h2 className="mt-6 font-serif text-3xl font-medium leading-tight">{product.nom}</h2>
          <p className="mt-3 max-w-[42ch] text-pretty text-sm text-ink-soft">{product.description}</p>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-serif text-4xl font-medium leading-none">
              {formatFCFA(product.prix)}
            </span>
            <span className="text-sm text-ink-soft">{product.contenance}</span>
          </div>

          <div className="mt-6 rounded-2xl bg-white/45 p-4 ring-1 ring-black/5 backdrop-blur-md">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-soft">
              Destination
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {COUNTRIES.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setCountry(c.code)}
                  className={
                    country === c.code
                      ? "rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-ivory"
                      : "rounded-full bg-white/55 px-3 py-1.5 text-xs font-medium text-ink-soft ring-1 ring-black/5 transition-colors hover:text-ink"
                  }
                >
                  {c.nom}
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-3 text-sm">
              <span className="text-ink-soft">Frais de livraison · {countryName(country)}</span>
              <span className="font-medium">
                {livraison === 0 ? "Offert" : formatFCFA(livraison)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              add(product.slug);
              setOpenSlug(null);
              setCartOpen(true);
            }}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3 text-sm font-medium text-ivory ring-1 ring-ink/10"
          >
            <svg className="size-4 shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path
                d="M3 4h2l1.5 9h8L16 6H6M7 16.5h.01M13 16.5h.01"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Ajouter au panier
          </button>
          <p className="mt-3 text-center text-xs text-ink-soft">
            Un compte est requis avant de valider votre commande.
          </p>
        </div>
      </div>
    </div>
  );
}
