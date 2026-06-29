import { NextResponse } from "next/server";
import { requireAuthenticatedAccess } from "@/lib/commercial/auth";
import { stripeApiRequest } from "@/lib/commercial/stripe";

type PortalResponse = {
  id: string;
  url?: string;
};

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { access, response } = await requireAuthenticatedAccess(request);

  if (response) {
    return response;
  }

  const customerId = access.subscription?.stripe_customer_id;

  if (!customerId) {
    return NextResponse.json(
      {
        error: "Assinatura Stripe não encontrada.",
        details:
          "Assine o Premium primeiro ou aguarde o webhook vincular sua assinatura."
      },
      { status: 404 }
    );
  }

  const origin =
    request.headers.get("origin") ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";
  const params = new URLSearchParams();
  params.set("customer", customerId);
  params.set("return_url", `${origin}/pricing`);

  try {
    const data = await stripeApiRequest<PortalResponse>(
      "billing_portal/sessions",
      {
        method: "POST",
        body: params.toString()
      }
    );

    if (!data.url) {
      throw new Error("Stripe não retornou a URL do portal.");
    }

    return NextResponse.json({ url: data.url });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Não foi possível abrir o portal de cobrança.",
        details:
          error instanceof Error
            ? error.message
            : "Verifique a configuração do Stripe Billing Portal."
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
