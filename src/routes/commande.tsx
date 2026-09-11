import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { useShop } from "@/lib/shop-context";
import { BOUTIQUE, COUNTRIES, countryName, formatFCFA } from "@/lib/shop";

export const Route = createFileRoute("/commande")({
  component: CommandePage,
});

function CommandePage() {
  const navigate = useNavigate();
  const { user, detailed, subtotal, shipping, total, country, clear } = useShop();
  const [submitted, setSubmitted] = useState(false);

  const customerName = useMemo(
    () => user?.user_metadata?.full_name || user?.email || "Client",
    [user],
  );

  useEffect(() => {
    if (!user) {
      navigate({ to: "/compte", search: { next: "/commande" } });
    }
  }, [navigate, user]);

  const handleConfirm = () => {
    setSubmitted(true);
    clear();
  };

  if (submitted) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12 lg:px-10">
        <div className="rounded-[28px] bg-white/60 p-8 text-center ring-1 ring-black/5 backdrop-blur-md">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-gold">Commande</p>
          <h1 className="mt-4 font-serif text-4xl font-medium">Commande confirmée</h1>
          <p className="mt-3 text-sm text-ink-soft">
            Merci {customerName}. Votre commande a bien été enregistrée localement pour cette
            session.
          </p>
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            className="mt-6 rounded-full bg-ink px-5 py-3 text-sm font-medium text-ivory"
          >
            Retour à la boutique
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 lg:px-10">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[28px] bg-white/60 p-6 ring-1 ring-black/5 backdrop-blur-md sm:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-gold">Commande</p>
          <h1 className="mt-4 font-serif text-4xl font-medium">Finaliser la commande</h1>

          <div className="mt-8 space-y-4">
            {detailed.length === 0 ? (
              <p className="text-sm text-ink-soft">Votre panier est vide.</p>
            ) : (
              detailed.map(({ product, quantity }) => (
                <div
                  key={product.slug}
                  className="flex items-center justify-between gap-4 border-b border-black/5 pb-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={product.image}
                      alt={product.nom}
                      className="size-16 rounded-xl object-cover"
                    />
                    <div>
                      <p className="font-serif text-xl font-medium">{product.nom}</p>
                      <p className="text-xs uppercase tracking-[0.16em] text-ink-soft">
                        {quantity} article(s)
                      </p>
                    </div>
                  </div>
                  <span className="font-serif text-xl font-medium">
                    {formatFCFA(product.prix * quantity)}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <aside className="rounded-[28px] bg-white/60 p-6 ring-1 ring-black/5 backdrop-blur-md sm:p-8">
          <h2 className="font-serif text-2xl font-medium">Résumé</h2>

          <div className="mt-6 space-y-3 text-sm text-ink-soft">
            <div className="flex items-center justify-between">
              <span>Client</span>
              <span className="font-medium text-ink">{customerName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Pays</span>
              <span className="font-medium text-ink">{countryName(country)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Adresse</span>
              <span className="font-medium text-ink">{BOUTIQUE.ville}</span>
            </div>
          </div>

          <div className="mt-8 space-y-2 border-t border-black/5 pt-4 text-sm text-ink-soft">
            <div className="flex items-center justify-between">
              <span>Sous-total</span>
              <span>{formatFCFA(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Livraison</span>
              <span>{shipping === 0 ? "Offerte" : formatFCFA(shipping)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Pays de livraison</span>
              <span>
                {COUNTRIES.find((item) => item.code === country)?.nom ?? countryName(country)}
              </span>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-black/5 pt-4">
            <span className="font-serif text-2xl font-medium">Total</span>
            <span className="font-serif text-3xl font-medium">{formatFCFA(total)}</span>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={detailed.length === 0}
            className="mt-8 w-full rounded-full bg-ink px-5 py-3 text-sm font-medium text-ivory disabled:opacity-40"
          >
            Confirmer la commande
          </button>
        </aside>
      </div>
    </main>
  );
}
