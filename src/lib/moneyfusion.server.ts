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

function getApiUrl(): string {
  const apiUrl = process.env["MONEYFUSION_API_URL"];
  if (!apiUrl) {
    throw new Error(
      "Le service de paiement n'est pas encore configuré. Merci de réessayer plus tard.",
    );
  }
  return apiUrl.replace(/\/+$/, "/");
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

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const payload = (await response.json().catch(() => null)) as
    | { statut?: boolean; token?: string; url?: string; message?: string }
    | null;

  if (!response.ok || !payload?.statut || !payload.url || !payload.token) {
    throw new Error(
      payload?.message ?? "Le paiement n'a pas pu être initialisé. Merci de réessayer.",
    );
  }

  return { paymentUrl: payload.url, token: payload.token };
}

export async function fetchFusionStatus(
  token: string,
): Promise<{ status: FusionStatus; message: string; reference: string | null }> {
  const response = await fetch(`https://www.pay.moneyfusion.net/paiementNotif/${token}`, {
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
