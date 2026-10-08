import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { z } from "zod";

import { getOrderStatus } from "@/lib/orders.functions";
import { useShop } from "@/lib/shop-context";
import { formatFCFA } from "@/lib/shop";

export const Route = createFileRoute("/paiement/retour")({
  validateSearch: z.object({ commande: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Statut du paiement — Dior_Parfumerie" },
      { name: "description", content: "Confirmation du paiement de votre commande Dior_Parfumerie." },
      { property: "og:title", content: "Statut du paiement — Dior_Parfumerie" },
      { property: "og:description", content: "Suivez la confirmation de votre paiement." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RetourPage,
});

type Status = { status: "paid" | "failed" | "pending"; total: number; message: string; reference: string | null };

function RetourPage() {
  const { commande } = Route.useSearch();
  const { user, authReady, clear } = useShop();
  const check = useServerFn(getOrderStatus);
  const [s, setS] = useState<Status | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!authReady || !user || !commande) return;
    let stop = false;
    let tries = 0;
    const run = async () => {
      try {
        const r = await check({ data: { orderId: commande } });
        if (stop) return;
        setS(r as Status);
        if (r.status === "paid") clear();
        if (r.status === "pending" && tries++ < 20) setTimeout(run, 4000);
      } catch {
        if (!stop) setErr("Commande introuvable.");
      }
    };
    run();
    return () => { stop = true; };
  }, [authReady, user, commande, check, clear]);

  const view = err || !commande
    ? { t: "Commande introuvable", d: "Nous n'avons pas retrouvé cette commande.", c: "text-destructive" }
    : !s || s.status === "pending"
      ? { t: "Paiement en attente", d: "Nous attendons la confirmation de votre paiement. Cette page se met à jour automatiquement.", c: "text-gold" }
      : s.status === "paid"
        ? { t: "Paiement réussi", d: "Merci ! Votre commande est confirmée et sera préparée très vite.", c: "text-gold" }
        : { t: "Paiement échoué", d: "Le paiement a été refusé ou annulé. Aucun montant n'a été débité.", c: "text-destructive" };

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <div className="rounded-[28px] bg-white/60 p-8 text-center ring-1 ring-black/5 backdrop-blur-md">
        <p className={`text-xs font-medium uppercase tracking-[0.28em] ${view.c}`}>Paiement</p>
        <h1 className="mt-4 font-serif text-4xl font-medium">{view.t}</h1>
        <p className="mt-3 text-sm text-ink-soft">{view.d}</p>
        {s && <p className="mt-4 font-serif text-2xl">{formatFCFA(s.total)}</p>}
        {s?.reference && <p className="mt-1 text-xs text-ink-soft">Référence : {s.reference}</p>}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {s?.status === "failed" && (
            <Link to="/commande" className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-ivory">Réessayer</Link>
          )}
          <Link to="/mes-commandes" className="rounded-full border border-black/15 px-5 py-3 text-sm font-medium">Mes commandes</Link>
          <Link to="/" className="rounded-full border border-black/15 px-5 py-3 text-sm font-medium">Boutique</Link>
        </div>
      </div>
    </main>
  );
}
