import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";
import p5 from "@/assets/p5.jpg";
import p6 from "@/assets/p6.jpg";
import hero from "@/assets/hero-bottle.jpg";

export const HERO_IMAGE = hero;

export const BOUTIQUE = {
  nom: "Maison Aurelia",
  ville: "Ouahigouya, Burkina Faso",
  telephone: "+226 04 09 07 12",
  whatsapp: "22604090712",
};

export type CountryCode = "BF" | "BJ" | "CI" | "CM";

export const COUNTRIES: { code: CountryCode; nom: string; livraison: number }[] = [
  { code: "BF", nom: "Burkina Faso", livraison: 0 },
  { code: "BJ", nom: "Bénin", livraison: 5000 },
  { code: "CI", nom: "Côte d'Ivoire", livraison: 5000 },
  { code: "CM", nom: "Cameroun", livraison: 5000 },
];

export function countryName(code: CountryCode) {
  return COUNTRIES.find((c) => c.code === code)?.nom ?? code;
}

export function shippingFor(code: CountryCode) {
  return COUNTRIES.find((c) => c.code === code)?.livraison ?? 5000;
}

export type Product = {
  slug: string;
  nom: string;
  notes: string;
  prix: number;
  contenance: string;
  image: string;
  description: string;
  edition?: string;
};

export const PRODUCTS: Product[] = [
  {
    slug: "petale-de-lune",
    nom: "Petale de Lune",
    notes: "Jasmin · Mousse de chêne",
    prix: 4000,
    contenance: "30 ml",
    image: p1,
    description:
      "Un voile clair de jasmin blanc adouci par la mousse de chêne. Le premier parfum de la maison, léger et lumineux du matin au soir.",
  },
  {
    slug: "eclat-dor",
    nom: "Éclat d'Or",
    notes: "Bergamote · Cuir",
    prix: 12000,
    contenance: "50 ml",
    image: p2,
    description:
      "La bergamote éclate d'abord, puis le cuir se pose lentement sur la peau. Un sillage franc, taillé pour les longues journées.",
  },
  {
    slug: "nuit-de-santal",
    nom: "Nuit de Santal",
    notes: "Santal · Oud fumé",
    prix: 20000,
    contenance: "75 ml",
    image: p3,
    description:
      "Le geste de retirer le bouchon libère un nuage de santal et d'oud fumé. Une eau de parfum profonde qui s'attache à la peau.",
  },
  {
    slug: "brume-de-fumee",
    nom: "Brume de Fumée",
    notes: "Iris · Vétiver",
    prix: 8000,
    contenance: "50 ml",
    image: p4,
    description:
      "L'iris poudré rencontre un vétiver sec et minéral. Un parfum discret et tenace, à porter comme une seconde peau.",
  },
  {
    slug: "ombre-dambre",
    nom: "Ombre d'Ambre",
    notes: "Ambre · Musc",
    prix: 25000,
    contenance: "75 ml",
    image: p5,
    description:
      "Ambre doré et musc blanc, réunis dans un flacon lourd au bouchon ciselé. La composition la plus riche de la maison.",
  },
  {
    slug: "signature-aurelia",
    nom: "Signature Aurelia",
    notes: "Ambre · Vanille · Cèdre",
    prix: 25000,
    contenance: "100 ml",
    image: p6,
    edition: "Édition limitée",
    description:
      "Le coffret signature : ambre, vanille fumée et cèdre, assemblés à la main en très petite série à Ouahigouya.",
  },
];

export function productBySlug(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function formatFCFA(n: number) {
  return `${n.toLocaleString("fr-FR").replace(/\u202f|\u00a0/g, " ")} F`;
}
