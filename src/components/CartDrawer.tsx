import { useNavigate } from "@tanstack/react-router";
import { useShop } from "@/lib/shop-context";
import { countryName, formatFCFA } from "@/lib/shop";

export function CartDrawer() {
  const {
    cartOpen,
    setCartOpen,
    detailed,
    setQuantity,
    subtotal,
    shipping,
    total,
    country,
    user,
  } = useShop();
  const navigate = useNavigate();

  if (!cartOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Fermer le panier"
        onClick={() => setCartOpen(false)}
        className="absolute inset-0 bg-ink/40"
      />
      <aside className="absolute inset-y-0 right-0 flex w-full flex-col bg-white/70 shadow-2xl shadow-ink/10 ring-1 ring-black/5 backdrop-blur-xl sm:w-[400px]">
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="font-serif text-2xl font-medium">Votre panier</h2>
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            className="rounded-full bg-white/50 p-2 text-ink-soft ring-1 ring-black/5 transition-colors hover:text-ink"
          >
            <svg className="size-4 shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6">
          {detailed.length === 0 ? (
            <p className="text-sm text-ink-soft">
              Votre panier est vide. Parcourez la collection pour choisir un flacon.
            </p>
          ) : (
            detailed.map(({ product, quantity }) => (
              <div key={product.slug} className="flex gap-4">
                <img
                  src={product.image}
                  alt={product.nom}
                  loading="lazy"
                  width={512}
                  height={512}
                  className="size-20 shrink-0 rounded-[10px] object-cover ring-1 ring-black/5"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-lg font-medium leading-tight">{product.nom}</p>
                  <p className="mt-1 text-xs text-ink-soft">{product.contenance}</p>
                  <div className="mt-2 flex items-center gap-2 text-ink-soft">
                    <button
                      type="button"
                      onClick={() => setQuantity(product.slug, quantity - 1)}
                      className="grid size-7 place-items-center rounded-full bg-white/50 ring-1 ring-black/5 transition-colors hover:text-ink"
                    >
                      <svg className="size-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M5 10h10" strokeLinecap="round" />
                      </svg>
                    </button>
                    <span className="text-sm font-medium text-ink">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(product.slug, quantity + 1)}
                      className="grid size-7 place-items-center rounded-full bg-white/50 ring-1 ring-black/5 transition-colors hover:text-ink"
                    >
                      <svg className="size-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M10 5v10M5 10h10" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                </div>
                <span className="whitespace-nowrap font-serif text-lg font-medium">
                  {formatFCFA(product.prix * quantity)}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-black/5 p-6 pt-4">
          <div className="flex items-center justify-between text-sm text-ink-soft">
            <span>Sous-total</span>
            <span>{formatFCFA(subtotal)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm text-ink-soft">
            <span>Livraison</span>
            <span>
              {shipping === 0 ? "Offerte" : formatFCFA(shipping)} · {countryName(country)}
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="font-serif text-xl font-medium">Total</span>
            <span className="font-serif text-2xl font-medium">{formatFCFA(total)}</span>
          </div>
          <button
            type="button"
            disabled={detailed.length === 0}
            onClick={() => {
              setCartOpen(false);
              navigate({ to: user ? "/commande" : "/compte", search: user ? undefined : { next: "/commande" } });
            }}
            className="mt-5 w-full rounded-full bg-ink py-3 text-sm font-medium text-ivory ring-1 ring-ink/10 disabled:opacity-40"
          >
            {user ? "Passer la commande" : "Créer un compte pour commander"}
          </button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-ink-soft">
            <svg className="size-3.5 shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 9V7a4 4 0 1 1 8 0v2M5 9h10v8H5z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Un compte est requis avant validation
          </p>
        </div>
      </aside>
    </div>
  );
}
