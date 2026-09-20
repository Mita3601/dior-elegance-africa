import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

import { COUNTRIES, PRODUCTS, shippingFor, type CountryCode } from "@/lib/shop";

const createOrderSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(30),
  address: z.string().trim().min(4).max(240),
  email: z.string().trim().email().max(180),
  country: z.enum(["BF", "BJ", "CI", "CM"]),
  origin: z.string().trim().url().max(300),
  lines: z
    .array(
      z.object({
        slug: z.string().trim().min(1).max(80),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1)
    .max(20),
});

export const createOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => createOrderSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const items = data.lines.map((line) => {
      const product = PRODUCTS.find((p) => p.slug === line.slug);
      if (!product) throw new Error("Produit introuvable dans le catalogue.");
      return { product, quantity: line.quantity };
    });

    const subtotal = items.reduce((sum, i) => sum + i.product.prix * i.quantity, 0);
    const shipping = shippingFor(data.country as CountryCode);
    const total = subtotal + shipping;

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        full_name: data.fullName,
        phone: data.phone,
        email: data.email,
        address: data.address,
        country: data.country,
        subtotal,
        shipping,
        total,
        status: "pending",
        payment_status: "pending",
        payment_provider: "moneyfusion",
      })
      .select("id")
      .single();

    if (error || !order) {
      throw new Error("La commande n'a pas pu être enregistrée. Merci de réessayer.");
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      items.map((i) => ({
        order_id: order.id,
        product_slug: i.product.slug,
        product_name: i.product.nom,
        unit_price: i.product.prix,
        quantity: i.quantity,
      })),
    );
    if (itemsError) {
      throw new Error("Les articles de la commande n'ont pas pu être enregistrés.");
    }

    const origin = data.origin.replace(/\/+$/, "");
    const { createFusionPayment } = await import("@/lib/moneyfusion.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    try {
      const payment = await createFusionPayment({
        totalPrice: total,
        articles: [
          ...items.map((i) => ({
            name: `${i.product.nom} x${i.quantity}`,
            price: i.product.prix * i.quantity,
          })),
          ...(shipping > 0
            ? [
                {
                  name: `Livraison ${COUNTRIES.find((c) => c.code === data.country)?.nom ?? ""}`,
                  price: shipping,
                },
              ]
            : []),
        ],
        clientName: data.fullName,
        clientPhone: data.phone,
        clientEmail: data.email,
        orderId: order.id,
        returnUrl: `${origin}/paiement/retour?commande=${order.id}`,
        webhookUrl: `${origin}/api/public/moneyfusion/webhook`,
      });

      await supabaseAdmin
        .from("orders")
        .update({ payment_token: payment.token, updated_at: new Date().toISOString() })
        .eq("id", order.id);

      return { orderId: order.id, paymentUrl: payment.paymentUrl };
    } catch (paymentError) {
      await supabaseAdmin
        .from("orders")
        .update({
          payment_status: "failed",
          status: "failed",
          payment_message:
            paymentError instanceof Error ? paymentError.message : "Erreur de paiement",
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);
      throw paymentError instanceof Error
        ? paymentError
        : new Error("Le paiement n'a pas pu être initialisé.");
    }
  });

export const getOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ orderId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    const { data: order, error } = await supabase
      .from("orders")
      .select("id, total, country, payment_status, payment_token, payment_reference, created_at")
      .eq("id", data.orderId)
      .maybeSingle();

    if (error || !order) {
      throw new Error("Commande introuvable.");
    }

    if (order.payment_status === "pending" && order.payment_token) {
      const { fetchFusionStatus } = await import("@/lib/moneyfusion.server");
      const result = await fetchFusionStatus(order.payment_token);

      if (result.status !== "pending") {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await supabaseAdmin
          .from("orders")
          .update({
            payment_status: result.status,
            status: result.status === "paid" ? "paid" : "failed",
            payment_reference: result.reference,
            payment_message: result.message,
            updated_at: new Date().toISOString(),
          })
          .eq("id", order.id);
      }

      return {
        orderId: order.id,
        total: order.total,
        status: result.status,
        message: result.message,
        reference: result.reference,
      };
    }

    return {
      orderId: order.id,
      total: order.total,
      status: (order.payment_status ?? "pending") as "pending" | "paid" | "failed",
      message:
        order.payment_status === "paid"
          ? "Paiement confirmé."
          : order.payment_status === "pending"
            ? "Paiement en attente de confirmation."
            : "Paiement refusé ou annulé.",
      reference: order.payment_reference,
    };
  });

export const listMyOrders = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("orders")
      .select("id, created_at, total, country, payment_status, order_items(product_name, quantity)")
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) throw new Error("Impossible de charger vos commandes.");
    return data ?? [];
  });
