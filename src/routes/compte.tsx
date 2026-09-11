import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";

import { useShop } from "@/lib/shop-context";

export const Route = createFileRoute("/compte")({
  component: ComptePage,
});

function ComptePage() {
  const navigate = useNavigate();
  const { user, loginLocal, authReady } = useShop();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const next =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("next") || "/commande"
      : "/commande";

  useEffect(() => {
    if (authReady && user) {
      navigate({ to: next as any });
    }
  }, [authReady, navigate, next, user]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setError("Saisis une adresse e-mail valide pour créer ton compte local.");
      return;
    }

    setError("");
    loginLocal(trimmedEmail, name);
    navigate({ to: next as any });
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 lg:px-10">
      <div className="rounded-[28px] bg-white/60 p-6 ring-1 ring-black/5 backdrop-blur-md sm:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-gold">Compte</p>
        <h1 className="mt-4 font-serif text-4xl font-medium">Créer un compte pour commander</h1>
        <p className="mt-3 text-sm text-ink-soft">
          Ce mode local permet de tester le parcours boutique sans configuration Supabase.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-ink">
              Nom complet
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Marie Dupont"
              className="w-full rounded-xl border border-black/10 bg-white/80 px-4 py-3 text-sm outline-none ring-0 transition focus:border-gold"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-ink">
              Adresse e-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="bonjour@example.com"
              className="w-full rounded-xl border border-black/10 bg-white/80 px-4 py-3 text-sm outline-none ring-0 transition focus:border-gold"
              required
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            className="w-full rounded-full bg-ink px-5 py-3 text-sm font-medium text-ivory"
          >
            Créer mon compte
          </button>
        </form>
      </div>
    </main>
  );
}
