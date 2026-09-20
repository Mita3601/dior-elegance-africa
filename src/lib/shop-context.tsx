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
  displayName: string;
  signOut: () => Promise<void>;
};

const ShopContext = createContext<ShopState | null>(null);

const STORAGE_KEYS = {
  cart: "dior-parfumerie.cart",
  country: "dior-parfumerie.country",
};

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
    } catch {
      /* stockage indisponible */
    }
  }, []);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event: string, next: Session | null) => {
      setSession(next);
      setUser(next?.user ?? null);
      setAuthReady(true);
    });

    supabase.auth
      .getSession()
      .then(({ data: got }: { data: { session: Session | null } }) => {
        setSession(got.session);
        setUser(got.session?.user ?? null);
      })
      .catch(() => {
        /* session indisponible */
      })
      .finally(() => setAuthReady(true));

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

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
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
    const metadataName = user?.user_metadata?.["full_name"];

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
      displayName: (typeof metadataName === "string" && metadataName) || user?.email || "Client",
      signOut,
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
    signOut,
  ]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop doit être utilisé dans ShopProvider");
  return ctx;
}
