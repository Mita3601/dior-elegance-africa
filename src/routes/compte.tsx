import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";

import { useShop } from "@/lib/shop-context";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/compte")({
  head: () => ({ meta: [
    { title: "Mon compte — Dior_Parfumerie" },
    { name: "description", content: "Votre compte client Dior_Parfumerie à Bouaflé, Côte d'Ivoire." },
    { property: "og:title", content: "Mon compte — Dior_Parfumerie" },
    { property: "og:description", content: "Accédez à votre compte client Dior_Parfumerie." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ComptePage,
});

function ComptePage() {
  const navigate = useNavigate();
  const { user, authReady } = useShop();
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");

  const next =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("next") || "/commande"
      : "/commande";

  useEffect(() => {
    if (authReady && user) {
      navigate({ to: next as any });
    }
  }, [authReady, navigate, next, user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setError("Saisis une adresse e-mail valide pour créer ton compte.");
      return;
    }

    setError("");
    const { data, error: signupError } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: { data: { full_name: name } },
    });
    if (signupError) { setError(signupError.message); return; }
    if (data.session) navigate({ to: next as any });
    else setNotice("Consultez votre e-mail pour confirmer votre compte.");
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 lg:px-10">
      <div className="rounded-[28px] bg-white/60 p-6 ring-1 ring-black/5 backdrop-blur-md sm:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-gold">Compte</p>
        <h1 className="mt-4 font-serif text-4xl font-medium">Créer un compte pour commander</h1>
        <p className="mt-3 text-sm text-ink-soft">
          Votre compte client Dior_Parfumerie.
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

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-ink">Mot de passe</label>
            <input id="password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-black/10 bg-white/80 px-4 py-3 text-sm outline-none ring-0 transition focus:border-gold" />
          </div>
          {notice ? <p className="text-sm text-ink-soft">{notice}</p> : null}
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
