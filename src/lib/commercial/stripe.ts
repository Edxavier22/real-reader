import crypto from "crypto";

export type StripeCheckoutSession = {
  id: string;
  object: "checkout.session";
  customer?: string | null;
  customer_email?: string | null;
  client_reference_id?: string | null;
  subscription?: string | null;
  metadata?: Record<string, string | undefined>;
};

export type StripeSubscription = {
  id: string;
  customer: string;
  status: string;
  current_period_start?: number;
  current_period_end?: number;
  metadata?: Record<string, string | undefined>;
};

export type StripeEvent<T = unknown> = {
  id: string;
  type: string;
  data: {
    object: T;
  };
};

export class StripeCommercialError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "StripeCommercialError";
    this.status = status;
  }
}

export function verifyStripeSignature({
  payload,
  signatureHeader,
  secret
}: {
  payload: string;
  signatureHeader: string | null;
  secret: string;
}) {
  if (!signatureHeader) {
    return false;
  }

  const parts = new Map(
    signatureHeader.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key, value] as const;
    })
  );
  const timestamp = parts.get("t");
  const signature = parts.get("v1");

  if (!timestamp || !signature) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`)
    .digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  const signatureBuffer = Buffer.from(signature, "hex");

  return (
    expectedBuffer.length === signatureBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
  );
}

export async function stripeApiRequest<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new StripeCommercialError(
      "Stripe não está configurado. Defina STRIPE_SECRET_KEY no servidor.",
      503
    );
  }

  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      ...(init.body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
      ...(init.headers ?? {})
    },
    cache: "no-store"
  });
  const data = (await response.json().catch(() => null)) as
    | { error?: { message?: string } }
    | T
    | null;

  if (!response.ok) {
    throw new StripeCommercialError(
      (data as { error?: { message?: string } } | null)?.error?.message ||
        "Falha de comunicação com Stripe.",
      response.status
    );
  }

  return data as T;
}

export async function getStripeSubscription(subscriptionId: string) {
  return stripeApiRequest<StripeSubscription>(
    `subscriptions/${encodeURIComponent(subscriptionId)}`
  );
}

export function stripeTimestampToIso(timestamp?: number) {
  return timestamp ? new Date(timestamp * 1000).toISOString() : null;
}
