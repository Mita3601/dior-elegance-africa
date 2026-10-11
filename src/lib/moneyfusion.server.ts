// Intégration MoneyFusion (agrégateur de paiement mobile money / carte en zone FCFA).
// Documentation : https://docs.moneyfusion.net

export type FusionStatus = "pending" | "paid" | "failed";

type CreatePaymentInput = {
  totalPrice: number;
  articles: { name: string; price: number }[];
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  orderId: string;
  returnUrl: string;
  webhookUrl: string;
};

export type CreatePaymentResult = {
  paymentUrl: string;
  token: string;
};

// Le sous-domaine « www.pay.moneyfusion.net » n'a pas de certificat TLS valide
// (échec de la négociation sécurisée) : on utilise toujours « pay.moneyfusion.net ».
const FUSION_HOST = "https://pay.moneyfusion.net";

function normalizeFusionUrl(url: string): string {
  return url.trim().replace(/^https?:\/\/(www\.)?pay\.moneyfusion\.net/i, FUSION_HOST);
}

function getApiUrl(): string {
  const apiUrl = process.env["MONEYFUSION_API_URL"];
  if (!apiUrl) {
    throw new Error(
      "Le service de paiement n'est pas encore configuré. Merci de réessayer plus tard.",
    );
  }
  return normalizeFusionUrl(apiUrl).replace(/\/*$/, "/");
}

export async function createFusionPayment(
  input: CreatePaymentInput,
): Promise<CreatePaymentResult> {
  const apiUrl = getApiUrl();

  const body = {
    totalPrice: input.totalPrice,
    article: [
      input.articles.reduce<Record<string, number>>((acc, a) => {
        acc[a.name] = a.price;
        return acc;
      }, {}),
    ],
    personal_Info: [
      {
        orderId: input.orderId,
        email: input.clientEmail,
        besoin: "Commande de parfums",
      },
    ],
    numeroSend: input.clientPhone,
    nomclient: input.clientName,
    return_url: input.returnUrl,
    webhook_url: input.webhookUrl,
  };

  let response: Response;
  try {
    response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
  } catch (error) {
    console.error("[moneyfusion] connexion impossible", error);
    throw new Error("Le service de paiement est momentanément injoignable. Merci de réessayer.");
  }

  const rawText = await response.text().catch(() => "");
  let payload: { statut?: boolean; token?: string; url?: string; message?: string } | null = null;
  try {
    payload = rawText ? JSON.parse(rawText) : null;
  } catch {
    payload = null;
  }

  if (!response.ok || !payload?.statut || !payload.url || !payload.token) {
    console.error(
      "[moneyfusion] réponse inattendue",
      response.status,
      rawText.slice(0, 500),
    );
    throw new Error(
      payload?.message ?? "Le paiement n'a pas pu être initialisé. Merci de réessayer.",
    );
  }

  return { paymentUrl: payload.url, token: payload.token };
}

export async function fetchFusionStatus(
  token: string,
): Promise<{ status: FusionStatus; message: string; reference: string | null }> {
  const response = await fetch(`${FUSION_HOST}/paiementNotif/${encodeURIComponent(token)}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    return { status: "pending", message: "Vérification du paiement en cours.", reference: null };
  }

  const payload = (await response.json().catch(() => null)) as
    | {
        statut?: boolean;
        data?: { statut?: string; numeroTransaction?: string; Montant?: number };
        message?: string;
      }
    | null;

  const raw = (payload?.data?.statut ?? "").toLowerCase();
  const reference = payload?.data?.numeroTransaction ?? null;

  if (raw === "paid" || raw === "success" || raw === "successful") {
    return { status: "paid", message: "Paiement confirmé.", reference };
  }
  if (raw === "failure" || raw === "failed" || raw === "no paid" || raw === "cancel") {
    return { status: "failed", message: "Paiement refusé ou annulé.", reference };
  }
  return { status: "pending", message: "Paiement en attente de confirmation.", reference };
}
