import { Link } from "@tanstack/react-router";
import { BOUTIQUE } from "@/lib/shop";

export function SiteFooter() {
  return (
    <footer className="relative z-10 bg-ivory-deep/60 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-6 py-14 lg:px-10">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <Link to="/" className="font-serif text-2xl font-medium">
              {BOUTIQUE.nom}
            </Link>
            <p className="mt-4 max-w-[34ch] text-pretty text-sm text-ink-soft">
              Maison de parfums composée à la main en petites éditions. Éditions limitées, sillage
              durable.
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-ink-soft">Boutique</p>
            <ul className="mt-4 space-y-2 text-sm text-ink-soft">
              <li>{BOUTIQUE.ville}</li>
              <li>
                <a href={`tel:+22604090712`} className="transition-colors hover:text-ink">
                  {BOUTIQUE.telephone}
                </a>
              </li>
              <li>Livraison : Burkina Faso, Bénin, Côte d'Ivoire, Cameroun</li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-ink-soft">
              Livraison
            </p>
            <p className="mt-4 max-w-[36ch] text-pretty text-sm text-ink-soft">
              Offerte au Burkina Faso. 5 000 F de frais de livraison pour le Bénin, la Côte d'Ivoire
              et le Cameroun.
            </p>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-black/5 pt-6 text-xs text-ink-soft sm:flex-row sm:items-center">
          <span>© 2026 {BOUTIQUE.nom} — Tous droits réservés</span>
          <span>Prix affichés en francs CFA</span>
        </div>
      </div>
    </footer>
  );
}
