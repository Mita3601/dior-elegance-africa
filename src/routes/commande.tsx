import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import { useShop } from "@/lib/shop-context";
import { COUNTRIES, countryName, formatFCFA, type CountryCode } from "@/lib/shop";
import { createOrder } from "@/lib/orders.functions";

export const Route = createFileRoute("/commande")({
  head: () => ({
    meta: [
      { title: "Paiement sécurisé — Dior_Parfumerie" },
      { name: "description", content: "Réglez votre commande de parfums par Mobile Money ou carte, en toute sécurité." },
      { property: "og:title", content: "Paiement sécurisé — Dior_Parfumerie" },
      { property: "og:description", content: "Caisse sécurisée Dior_Parfumerie : Orange Money, Wave, MTN, Moov ou carte." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CommandePage,
});

const METHODS = [
  { id: "orange", label: "Orange Money", hint: "Validation par code sur votre téléphone" },
  { id: "wave", label: "Wave", hint: "Validation dans l'application Wave" },
  { id: "mtn", label: "MTN MoMo", hint: "Validation par code sur votre téléphone" },
  { id: "moov", label: "Moov Money", hint: "Validation par code sur votre téléphone" },
  { id: "carte", label: "Carte bancaire", hint: "Visa · Mastercard" },
] as const;

function CommandePage() {
  const navigate = useNavigate();
  const { user, authReady, detailed, subtotal, shipping, total, country, setCountry, displayName } = useShop();
  const create = useServerFn(createOrder);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState<(typeof METHODS)[number]["id"]>("orange");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authReady && !user) navigate({ to: "/compte", search: { next: "/commande" } });
    if (user) {
      setEmail((v) => v || user.email || "");
      setFullName((v) => v || (displayName !== user.email ? displayName : ""));
    }
  }, [authReady, user, navigate, displayName]);

  const pay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await create({
        data: {
          fullName,
          phone,
          address,
          email,
          country,
          origin: window.location.origin,
          lines: detailed.map((l) => ({ slug: l.product.slug, quantity: l.quantity })),
        },
      });
      window.location.assign(res.paymentUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Le paiement n'a pas pu démarrer. Réessayez.");
      setBusy(false);
    }
  };

  const field = "mt-1.5 w-full rounded-xl border border-black/10 bg-ivory/60 px-4 py-3 text-sm outline-none focus:border-gold";

  if (detailed.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="font-serif text-4xl font-medium">Votre panier est vide</h1>
        <button onClick={() => navigate({ to: "/" })} className="mt-6 rounded-full bg-ink px-5 py-3 text-sm font-medium text-ivory">
          Découvrir la collection
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 lg:px-10">
      <p className="text-xs font-medium uppercase tracking-[0.28em] text-gold">Caisse sécurisée</p>
      <h1 className="mt-3 font-serif text-4xl font-medium">Paiement</h1>

      <form onSubmit={pay} className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-6 rounded-[28px] bg-white/60 p-6 ring-1 ring-black/5 backdrop-blur-md sm:p-8">
          <div>
            <h2 className="font-serif text-2xl font-medium">1. Livraison</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-xs uppercase tracking-[0.14em] text-ink-soft">Nom complet
                <input required minLength={2} value={fullName} onChange={(e) => setFullName(e.target.value)} className={field} />
              </label>
              <label className="text-xs uppercase tracking-[0.14em] text-ink-soft">Téléphone de paiement
                <input required minLength={6} type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={field} placeholder="01 23 45 67 89" />
              </label>
              <label className="text-xs uppercase tracking-[0.14em] text-ink-soft">E-mail
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
              </label>
              <label className="text-xs uppercase tracking-[0.14em] text-ink-soft">Pays
                <select value={country} onChange={(e) => setCountry(e.target.value as CountryCode)} className={field}>
                  {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.nom}</option>)}
                </select>
              </label>
              <label className="text-xs uppercase tracking-[0.14em] text-ink-soft sm:col-span-2">Adresse de livraison
                <input required minLength={4} value={address} onChange={(e) => setAddress(e.target.value)} className={field} placeholder="Ville, quartier, repère" />
              </label>
            </div>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-medium">2. Moyen de paiement</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {METHODS.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  aria-pressed={method === m.id}
                  className={`rounded-2xl border p-4 text-left transition ${method === m.id ? "border-gold bg-ivory ring-1 ring-gold" : "border-black/10 hover:border-black/30"}`}
                >
                  <span className="block font-medium">{m.label}</span>
                  <span className="mt-1 block text-xs text-ink-soft">{m.hint}</span>
                </button>
              ))}
            </div>
            <p className="mt-4 text-xs text-ink-soft">
              Après avoir cliqué sur « Payer », une fenêtre sécurisée vous demandera seulement de confirmer le paiement, puis vous reviendrez automatiquement ici.
            </p>
          </div>
        </section>

        <aside className="h-fit rounded-[28px] bg-white/60 p-6 ring-1 ring-black/5 backdrop-blur-md sm:p-8">
          <h2 className="font-serif text-2xl font-medium">Récapitulatif</h2>
          <div className="mt-5 space-y-3">
            {detailed.map(({ product, quantity }) => (
              <div key={product.slug} className="flex items-center gap-3">
                <img src={product.image} alt={product.nom} className="size-12 rounded-lg object-cover" />
                <span className="flex-1 text-sm">{product.nom} × {quantity}</span>
                <span className="text-sm">{formatFCFA(product.prix * quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-2 border-t border-black/5 pt-4 text-sm text-ink-soft">
            <div className="flex justify-between"><span>Sous-total</span><span>{formatFCFA(subtotal)}</span></div>
            <div className="flex justify-between"><span>Livraison ({countryName(country)})</span><span>{shipping === 0 ? "Offerte" : formatFCFA(shipping)}</span></div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-4">
            <span className="font-serif text-2xl font-medium">Total</span>
            <span className="font-serif text-3xl font-medium">{formatFCFA(total)}</span>
          </div>
          {error && <p role="alert" className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          <button type="submit" disabled={busy} className="mt-6 w-full rounded-full bg-ink px-5 py-3.5 text-sm font-medium text-ivory disabled:opacity-50">
            {busy ? "Connexion sécurisée…" : `Payer ${formatFCFA(total)}`}
          </button>
          <p className="mt-3 text-center text-xs text-ink-soft">🔒 Paiement chiffré et sécurisé</p>
        </aside>
      </form>
    </main>
  );
}
