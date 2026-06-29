import { NextResponse } from "next/server";
import {
  getSubscriptionByStripeReference,
  upsertSubscription
} from "@/lib/commercial/auth";
import {
  getStripeSubscription,
  stripeTimestampToIso,
  verifyStripeSignature,
  type StripeCheckoutSession,
  type StripeEvent,
  type StripeSubscription
} from "@/lib/commercial/stripe";

type StripeInvoice = {
  customer?: string | null;
  subscription?: string | null;
};

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const payload = await request.text();

  if (!webhookSecret) {
    return NextResponse.json(
      {
        error: "Webhook Stripe não configurado.",
        details: "Defina STRIPE_WEBHOOK_SECRET no servidor."
      },
      { status: 503 }
    );
  }

  if (
    !verifyStripeSignature({
      payload,
      signatureHeader: request.headers.get("stripe-signature"),
      secret: webhookSecret
    })
  ) {
    return NextResponse.json(
      { error: "Assinatura do webhook inválida." },
      { status: 400 }
    );
  }

  let event: StripeEvent;

  try {
    event = JSON.parse(payload) as StripeEvent;
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as StripeCheckoutSession
        );
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await handleSubscriptionChange(event.data.object as StripeSubscription);
        break;
      case "invoice.payment_succeeded":
      case "invoice.payment_failed":
        await handleInvoiceChange(event.data.object as StripeInvoice);
        break;
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Webhook recebido, mas não foi possível atualizar assinatura.",
        details: error instanceof Error ? error.message : "Erro desconhecido."
      },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: StripeCheckoutSession) {
  const userId = session.metadata?.userId || session.client_reference_id;
  const subscriptionId = session.subscription;

  if (!userId || !subscriptionId) {
    return;
  }

  const subscription = await getStripeSubscription(subscriptionId);
  await persistStripeSubscription(subscription, userId);
}

async function handleSubscriptionChange(subscription: StripeSubscription) {
  const existing = await getSubscriptionByStripeReference({
    customerId: subscription.customer,
    subscriptionId: subscription.id
  });
  const userId = subscription.metadata?.userId || existing?.user_id;

  if (!userId) {
    return;
  }

  await persistStripeSubscription(subscription, userId);
}

async function handleInvoiceChange(invoice: StripeInvoice) {
  if (!invoice.subscription) {
    return;
  }

  const subscription = await getStripeSubscription(invoice.subscription);
  await handleSubscriptionChange(subscription);
}

async function persistStripeSubscription(
  subscription: StripeSubscription,
  userId: string
) {
  await upsertSubscription({
    user_id: userId,
    plan: "premium",
    stripe_customer_id: subscription.customer,
    stripe_subscription_id: subscription.id,
    status: subscription.status,
    current_period_start: stripeTimestampToIso(subscription.current_period_start),
    current_period_end: stripeTimestampToIso(subscription.current_period_end)
  });
}
