import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { PRODUCTS, shippingFor, type CountryCode, type Product } from "@/lib/shop";

export type CartLine = { slug: string; quantity: number };

type ShopState = {
  country: CountryCode;
  setCountry: (c: CountryCode) => void;
  lines: CartLine[];
  add: (slug: string, quantity?: number) => void;
  setQuantity: (slug: string, quantity: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  shipping: number;
  total: number;
  detailed: { product: Product; quantity: number }[];
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  openSlug: string | null;
  setOpenSlug: (v: string | null) => void;
  user: User | null;
  session: Session | null;
  authReady: boolean;
  loginLocal: (email: string, name?: string) => void;
  logoutLocal: () => void;
};

const ShopContext = createContext<ShopState | null>(null);

const STORAGE_KEYS = {
  cart: "aurelia.cart",
  country: "aurelia.country",
  account: "aurelia.account",
};

function createLocalUser(email: string, name?: string): User {
  const displayName = name?.trim() || "Client local";
  return {
    id: crypto.randomUUID(),
    email,
    role: "authenticated",
    aud: "authenticated",
    app_metadata: { provider: "local" },
    user_metadata: { full_name: displayName },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    phone: null,
    confirmation_sent_at: null,
    confirmed_at: new Date().toISOString(),
    email_confirmed_at: new Date().toISOString(),
    factors: [],
    identities: [],
    is_anonymous: false,
    banned_until: null,
  } as User;
}

function createLocalSession(user: User): Session {
  return {
    access_token: "local-dev-token",
    token_type: "bearer",
    expires_in: 3600,
    expires_at: Math.floor((Date.now() + 3600 * 1000) / 1000),
    refresh_token: "local-dev-refresh",
    user,
  } as Session;
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const [country, setCountryState] = useState<CountryCode>("BF");
  const [lines, setLines] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const rawCart = localStorage.getItem(STORAGE_KEYS.cart);
      if (rawCart) setLines(JSON.parse(rawCart) as CartLine[]);
      const rawCountry = localStorage.getItem(STORAGE_KEYS.country) as CountryCode | null;
      if (rawCountry) setCountryState(rawCountry);

      const rawAccount = localStorage.getItem(STORAGE_KEYS.account);
      if (rawAccount) {
        const parsed = JSON.parse(rawAccount) as { email?: string; name?: string };
        if (parsed.email) {
          const localUser = createLocalUser(parsed.email, parsed.name);
          setUser(localUser);
          setSession(createLocalSession(localUser));
        }
      }
    } catch {
      /* stockage indisponible */
    } finally {
      setAuthReady(true);
    }
  }, []);

  useEffect(() => {
    const hasSupabaseConfig =
      typeof import.meta !== "undefined" &&
      !!(import.meta.env?.VITE_SUPABASE_URL || import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY);

    if (!hasSupabaseConfig) {
      return;
    }

    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setUser(next?.user ?? null);
      setAuthReady(true);
    });

    supabase.auth.getSession().then(({ data: got }) => {
      setSession(got.session);
      setUser(got.session?.user ?? null);
      setAuthReady(true);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const persist = useCallback((next: CartLine[]) => {
    setLines(next);
    try {
      localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(next));
    } catch {
      /* stockage indisponible */
    }
  }, []);

  const setCountry = useCallback((c: CountryCode) => {
    setCountryState(c);
    try {
      localStorage.setItem(STORAGE_KEYS.country, c);
    } catch {
      /* stockage indisponible */
    }
  }, []);

  const loginLocal = useCallback((email: string, name?: string) => {
    const normalizedEmail = email.trim();
    if (!normalizedEmail) return;

    const localUser = createLocalUser(normalizedEmail, name);
    const localSession = createLocalSession(localUser);
    setUser(localUser);
    setSession(localSession);
    setAuthReady(true);

    try {
      localStorage.setItem(
        STORAGE_KEYS.account,
        JSON.stringify({
          email: normalizedEmail,
          name: name?.trim() || localUser.user_metadata.full_name,
        }),
      );
    } catch {
      /* stockage indisponible */
    }
  }, []);

  const logoutLocal = useCallback(() => {
    setUser(null);
    setSession(null);
    setAuthReady(true);

    try {
      localStorage.removeItem(STORAGE_KEYS.account);
    } catch {
      /* stockage indisponible */
    }
  }, []);

  const add = useCallback(
    (slug: string, quantity = 1) => {
      const existing = lines.find((l) => l.slug === slug);
      persist(
        existing
          ? lines.map((l) => (l.slug === slug ? { ...l, quantity: l.quantity + quantity } : l))
          : [...lines, { slug, quantity }],
      );
    },
    [lines, persist],
  );

  const setQuantity = useCallback(
    (slug: string, quantity: number) => {
      persist(
        quantity <= 0
          ? lines.filter((l) => l.slug !== slug)
          : lines.map((l) => (l.slug === slug ? { ...l, quantity } : l)),
      );
    },
    [lines, persist],
  );

  const clear = useCallback(() => persist([]), [persist]);

  const value = useMemo<ShopState>(() => {
    const detailed = lines
      .map((l) => {
        const product = PRODUCTS.find((p) => p.slug === l.slug);
        return product ? { product, quantity: l.quantity } : null;
      })
      .filter((v): v is { product: Product; quantity: number } => v !== null);

    const subtotal = detailed.reduce((sum, l) => sum + l.product.prix * l.quantity, 0);
    const shipping = detailed.length > 0 ? shippingFor(country) : 0;

    return {
      country,
      setCountry,
      lines,
      add,
      setQuantity,
      clear,
      count: detailed.reduce((sum, l) => sum + l.quantity, 0),
      subtotal,
      shipping,
      total: subtotal + shipping,
      detailed,
      cartOpen,
      setCartOpen,
      openSlug,
      setOpenSlug,
      user,
      session,
      authReady,
      loginLocal,
      logoutLocal,
    };
  }, [
    country,
    setCountry,
    lines,
    add,
    setQuantity,
    clear,
    cartOpen,
    openSlug,
    user,
    session,
    authReady,
    loginLocal,
    logoutLocal,
  ]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop doit être utilisé dans ShopProvider");
  return ctx;
}
