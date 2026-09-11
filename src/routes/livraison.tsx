import { createFileRoute } from "@tanstack/react-router";
import { BOUTIQUE, COUNTRIES, formatFCFA } from "@/lib/shop";

export const Route = createFileRoute("/livraison")({
  head: () => ({
    meta: [
      { title: "Livraison et contact — Maison Aurelia" },
      {
        name: "description",
        content:
          "Expédition depuis Ouahigouya vers le Burkina Faso, le Bénin, la Côte d'Ivoire et le Cameroun. Livraison offerte au Burkina, 5 000 F ailleurs.",
      },
      { property: "og:title", content: "Livraison et contact — Maison Aurelia" },
      {
        property: "og:description",
        content: "Nos délais, nos pays desservis et nos frais de livraison en francs CFA.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Livraison,
});

function Livraison() {
  return (
    <main className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-12 lg:px-10">
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-gold">Livraison</p>
      <h1 className="mt-4 max-w-[20ch] text-balance font-serif text-5xl font-medium leading-tight">
        De Ouahigouya à votre porte
      </h1>
      <p className="mt-5 max-w-[52ch] text-pretty text-ink-soft">
        Chaque commande part de notre boutique de {BOUTIQUE.ville}. Les flacons voyagent emballés à
        la main, protégés par un étui rigide.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {COUNTRIES.map((c) => (
          <div
            key={c.code}
            className="rounded-[20px] bg-white/40 p-5 ring-1 ring-black/5 backdrop-blur-md"
          >
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink-soft">{c.nom}</p>
            <p className="mt-3 font-serif text-3xl font-medium">
              {c.livraison === 0 ? "Offerte" : formatFCFA(c.livraison)}
            </p>
            <p className="mt-1 text-xs text-ink-soft">
              {c.livraison === 0 ? "Livraison incluse" : "Frais ajoutés au total"}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-[20px] bg-white/40 p-6 ring-1 ring-black/5 backdrop-blur-md sm:p-8">
        <h2 className="font-serif text-2xl font-medium">Nous joindre</h2>
        <p className="mt-3 text-sm text-ink-soft">
          Pour toute question sur une commande, appelez ou écrivez à la boutique.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href="tel:+22604090712"
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-ivory"
          >
            {BOUTIQUE.telephone}
          </a>
          <a
            href={`https://wa.me/${BOUTIQUE.whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-white/55 px-5 py-2.5 text-sm font-medium text-ink-soft ring-1 ring-black/5 transition-colors hover:text-ink"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}
