import { createFileRoute } from "@tanstack/react-router";

import { useShop } from "@/lib/shop-context";

export const Route = createFileRoute("/mes-commandes")({
  component: MesCommandesPage,
});

function MesCommandesPage() {
  const { user } = useShop();

  if (!user) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12 lg:px-10">
        <div className="rounded-[28px] bg-white/60 p-8 text-center ring-1 ring-black/5 backdrop-blur-md">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-gold">Compte</p>
          <h1 className="mt-4 font-serif text-4xl font-medium">Aucune commande</h1>
          <p className="mt-3 text-sm text-ink-soft">Crée un compte pour consulter tes commandes.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 lg:px-10">
      <div className="rounded-[28px] bg-white/60 p-8 ring-1 ring-black/5 backdrop-blur-md">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-gold">Mes commandes</p>
        <h1 className="mt-4 font-serif text-4xl font-medium">Historique local</h1>
        <p className="mt-3 text-sm text-ink-soft">
          Bienvenue {user.user_metadata?.full_name || user.email}. Les commandes sont enregistrées
          localement dans ce navigateur.
        </p>
      </div>
    </main>
  );
}
