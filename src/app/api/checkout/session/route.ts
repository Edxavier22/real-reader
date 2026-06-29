import { NextResponse } from "next/server";
import { requireAuthenticatedAccess } from "@/lib/commercial/auth";
import {
  checkRateLimit,
  getRequestIdentity
} from "@/lib/commercial/rate-limit";
import { stripeApiRequest } from "@/lib/commercial/stripe";

type CheckoutResponse = {
  id: string;
  url?: string;
};

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const rate = checkRateLimit({
    key: `checkout:${getRequestIdentity(request)}`,
    limit: 10,
    windowMs: 60_000
  });

  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde um minuto e tente novamente." },
      { status: 429 }
    );
  }

  const { access, response } = await requireAuthenticatedAccess(request);

  if (response) {
    return response;
  }

  const priceId = process.env.STRIPE_PRICE_ID;

  if (!priceId) {
    return NextResponse.json(
      {
        error: "Stripe Checkout ainda não configurado.",
        details: "Configure STRIPE_PRICE_ID no servidor/Vercel."
      },
      { status: 503 }
    );
  }

  const origin =
    request.headers.get("origin") ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";
  const params = new URLSearchParams();
  params.set("mode", "subscription");
  params.set("line_items[0][price]", priceId);
  params.set("line_items[0][quantity]", "1");
  params.set("allow_promotion_codes", "true");
  params.set("client_reference_id", access.userId ?? "");
  params.set("customer_email", access.user?.email ?? "");
  params.set("metadata[userId]", access.userId ?? "");
  params.set("subscription_data[metadata][userId]", access.userId ?? "");
  params.set(
    "success_url",
    `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`
  );
  params.set("cancel_url", `${origin}/checkout/cancel`);

  try {
    const data = await stripeApiRequest<CheckoutResponse>("checkout/sessions", {
      method: "POST",
      body: params.toString()
    });

    if (!data.url) {
      throw new Error("Stripe não retornou a URL de checkout.");
    }

    return NextResponse.json({ url: data.url });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Não foi possível criar a sessão do Stripe.",
        details:
          error instanceof Error
            ? error.message
            : "Sem detalhes retornados pelo Stripe."
      },
      { status: getErrorStatus(error) }
    );
  }
}

function getErrorStatus(error: unknown) {
  return typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
    ? error.status
    : 500;
}
