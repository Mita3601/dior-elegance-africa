import { createFileRoute } from "@tanstack/react-router";
import { useShop } from "@/lib/shop-context";
import { BOUTIQUE, HERO_IMAGE, PRODUCTS, formatFCFA } from "@/lib/shop";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Maison Aurelia — Parfums de luxe à Ouahigouya, Burkina Faso" },
      {
        name: "description",
        content:
          "Parfums d'exception livrés au Burkina Faso, Bénin, Côte d'Ivoire et Cameroun. Flacons de 4 000 F à 25 000 F, commande en ligne depuis Ouahigouya.",
      },
      { property: "og:title", content: "Maison Aurelia — Parfums livrés en Afrique de l'Ouest" },
      {
        property: "og:description",
        content:
          "Six compositions, de 4 000 F à 25 000 F. Livraison offerte au Burkina Faso, 5 000 F ailleurs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { add, setCartOpen, setOpenSlug } = useShop();
  const hero = PRODUCTS[3]!;

  return (
    <main className="relative z-10">
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-12 lg:px-10 lg:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="rise-in lg:col-span-5">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-gold">
              {BOUTIQUE.nom} · Ouahigouya
            </p>
            <h1 className="mt-6 max-w-[18ch] text-balance font-serif text-[3.25rem] font-medium leading-none sm:text-7xl">
              Voile d'Ambre
            </h1>
            <p className="mt-6 max-w-[46ch] text-pretty text-base text-ink-soft">
              Un sillage de santal, de vanille fumée et d'ambre doré, révélé goutte à goutte sous
              une lumière chaude. Composé à la main, en petites éditions.
            </p>
            <div className="mt-8 flex items-baseline gap-3">
              <span className="font-serif text-3xl font-medium">{formatFCFA(hero.prix)}</span>
              <span className="text-sm text-ink-soft">{hero.contenance} · eau de parfum</span>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  add(hero.slug);
                  setCartOpen(true);
                }}
                className="flex items-center gap-2 rounded-full bg-ink py-2 pl-2 pr-3 text-sm font-medium text-ivory ring-1 ring-ink/10"
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
              <button
                type="button"
                onClick={() => setOpenSlug(hero.slug)}
                className="text-sm font-medium text-ink underline decoration-gold/60 underline-offset-4 transition-colors hover:decoration-gold"
              >
                Découvrir le flacon
              </button>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="relative rounded-[28px] bg-white/40 p-4 ring-1 ring-black/5 backdrop-blur-xl sm:p-5">
              <img
                src={HERO_IMAGE}
                alt="Flacon de parfum ambré scellé à la cire, éclairé à la bougie"
                width={1280}
                height={1024}
                className="aspect-[5/4] w-full rounded-xl object-cover ring-1 ring-black/5"
              />
              <div className="mt-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-serif text-xl font-medium">Voile d'Ambre</p>
                  <p className="mt-0.5 text-xs uppercase tracking-[0.18em] text-ink-soft">
                    Notes chaudes · Ambre, santal, vanille
                  </p>
                </div>
                <span className="whitespace-nowrap font-serif text-2xl font-medium">
                  {formatFCFA(hero.prix)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="collection" className="mx-auto max-w-6xl px-6 pb-24 lg:px-10">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-gold">La collection</p>
            <h2 className="mt-3 max-w-[24ch] text-balance font-serif text-4xl font-medium leading-tight lg:text-5xl">
              Les flacons de la maison
            </h2>
          </div>
          <p className="hidden max-w-[30ch] text-pretty text-sm text-ink-soft md:block">
            Six compositions, du jasmin tendre à l'ambre profond. Prix affichés en francs CFA.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
          {PRODUCTS.map((product) => (
            <article
              key={product.slug}
              className="group rounded-[20px] bg-white/40 p-3 ring-1 ring-black/5 backdrop-blur-md sm:p-4"
            >
              <button
                type="button"
                onClick={() => setOpenSlug(product.slug)}
                className="block w-full text-left"
              >
                <img
                  src={product.image}
                  alt={`Flacon ${product.nom}`}
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="aspect-[4/5] w-full rounded-xl object-cover ring-1 ring-black/5"
                />
              </button>
              <div className="px-1 pt-4">
                {product.edition ? (
                  <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-gold">
                    {product.edition}
                  </p>
                ) : null}
                <h3 className="font-serif text-xl font-medium">{product.nom}</h3>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-ink-soft">
                  {product.notes}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-serif text-lg font-medium">{formatFCFA(product.prix)}</span>
                  <button
                    type="button"
                    onClick={() => {
                      add(product.slug);
                      setCartOpen(true);
                    }}
                    className="flex items-center gap-1.5 rounded-full bg-ink py-1.5 pl-2 pr-2.5 text-xs font-medium text-ivory opacity-0 transition-opacity duration-300 focus-visible:opacity-100 group-hover:opacity-100"
                  >
                    <svg className="size-3.5 shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M3 4h2l1.5 9h8L16 6H6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Ajouter
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
