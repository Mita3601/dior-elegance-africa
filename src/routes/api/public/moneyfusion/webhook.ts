import { createFileRoute } from "@tanstack/react-router";

type FusionWebhookBody = {
  tokenPay?: string;
  token?: string;
  event?: string;
  personal_Info?: { orderId?: string }[];
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export const Route = createFileRoute("/api/public/moneyfusion/webhook")({
  server: {
    handlers: {
      GET: async () =>
        jsonResponse({ received: true, provider: "moneyfusion", status: "endpoint_ready" }),
      POST: async ({ request }) => {
        let body: FusionWebhookBody | null = null;
        try {
          body = (await request.json()) as FusionWebhookBody;
        } catch {
          body = null;
        }

        const token = body?.tokenPay ?? body?.token ?? null;
        if (!token) {
          // On répond 200 pour éviter les relances infinies de l'agrégateur.
          return jsonResponse({ received: true, processed: false, reason: "missing_token" });
        }

        try {
          const { fetchFusionStatus } = await import("@/lib/moneyfusion.server");
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

          // Vérification côté serveur auprès de MoneyFusion : le corps du webhook
          // n'est jamais considéré comme une source de vérité.
          const result = await fetchFusionStatus(token);

          const { error } = await supabaseAdmin
            .from("orders")
            .update({
              payment_status: result.status,
              status:
                result.status === "paid"
                  ? "paid"
                  : result.status === "failed"
                    ? "failed"
                    : "pending",
              payment_reference: result.reference,
              payment_message: result.message,
              updated_at: new Date().toISOString(),
            })
            .eq("payment_token", token);

          if (error) {
            console.error("[moneyfusion webhook]", error.message);
            return jsonResponse({ received: true, processed: false, reason: "update_failed" });
          }

          return jsonResponse({ received: true, processed: true, status: result.status });
        } catch (error) {
          console.error("[moneyfusion webhook]", error);
          return jsonResponse({ received: true, processed: false, reason: "verification_failed" });
        }
      },
    },
  },
});
