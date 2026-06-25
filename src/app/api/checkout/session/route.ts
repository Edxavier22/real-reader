import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_ID;

  if (!secretKey || !priceId) {
    return NextResponse.json(
      {
        error: "Stripe Checkout ainda não configurado.",
        details:
          "Configure STRIPE_SECRET_KEY e STRIPE_PRICE_ID no servidor/Vercel."
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
  params.set("success_url", `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${origin}/checkout/cancel`);

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params.toString()
  });

  const data = (await response.json().catch(() => null)) as
    | { url?: string; error?: { message?: string } }
    | null;

  if (!response.ok || !data?.url) {
    return NextResponse.json(
      {
        error: "Não foi possível criar a sessão do Stripe.",
        details: data?.error?.message ?? "Sem detalhes retornados pelo Stripe."
      },
      { status: response.status || 500 }
    );
  }

  return NextResponse.json({ url: data.url });
}
