import { NextResponse } from "next/server";
import { getPlan, type CommercialPlan, type PlanId } from "./plans";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  getAuthCookieMaxAge,
  getAuthUser,
  isSupabaseConfigured,
  parseCookieHeader,
  refreshAuthSession,
  supabaseRestRequest,
  type SupabaseAuthSession,
  type SupabaseAuthUser
} from "./supabase";

export type CommercialUser = {
  id: string;
  email: string;
  fullName: string | null;
};

export type SubscriptionRecord = {
  id: string;
  user_id: string;
  plan: PlanId;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at?: string;
  updated_at?: string;
};

export type UsageRecord = {
  id?: string;
  user_id: string;
  month_key: string;
  pages_processed: number;
  ocr_pages: number;
  voice_characters: number;
  mp3_generations: number;
};

export type UserPreferences = {
  user_id: string;
  voice_mode: "browser" | "neural" | "authorized-clone";
  voice_profile_id: string;
  speech_rate: number;
  updated_at?: string;
};

export type ServerAccess = {
  isAuthenticated: boolean;
  plan: CommercialPlan;
  userId: string | null;
  user: CommercialUser | null;
  subscription: SubscriptionRecord | null;
  usage: UsageRecord | null;
  preferences: UserPreferences | null;
  reason: string;
};

type AuthCookieSource = Request | { get(name: string): { value: string } | undefined };

export function getAuthProviderStatus() {
  const supabaseConfigured = isSupabaseConfigured();

  return {
    provider: "supabase-auth",
    configured: supabaseConfigured,
    detail: supabaseConfigured
      ? "Supabase Auth configurado para cadastro, login, sessão e persistência comercial."
      : "Configure Supabase para ativar cadastro, login, sessão e persistência comercial."
  };
}

export async function resolveServerAccess(source: AuthCookieSource): Promise<ServerAccess> {
  if (!isSupabaseConfigured()) {
    return freeAccess("Supabase não configurado.");
  }

  const accessToken = readAuthCookie(source, ACCESS_TOKEN_COOKIE);

  if (!accessToken) {
    return freeAccess("Visitante sem sessão ativa.");
  }

  try {
    const authUser = await getAuthUser(accessToken);
    const user = await ensureCommercialUser(authUser);
    await markLastAccess(user.id);
    const [subscription, usage, preferences] = await Promise.all([
      getActiveSubscription(user.id),
      getCurrentUsage(user.id),
      getUserPreferences(user.id)
    ]);
    const plan = getPlan(resolvePlanIdFromSubscription(subscription));

    return {
      isAuthenticated: true,
      plan,
      userId: user.id,
      user,
      subscription,
      usage,
      preferences,
      reason:
        plan.id === "premium"
          ? "Conta Premium validada por assinatura ativa no banco."
          : "Conta autenticada no plano gratuito."
    };
  } catch {
    return freeAccess("Sessão ausente, expirada ou inválida.");
  }
}

export async function requireAuthenticatedAccess(source: AuthCookieSource) {
  const access = await resolveServerAccess(source);

  if (!access.isAuthenticated || !access.userId) {
    return {
      access,
      response: NextResponse.json(
        {
          error: "Login necessário.",
          details: "Entre na sua conta REAL Reader para continuar."
        },
        { status: 401 }
      )
    };
  }

  return { access, response: null };
}

export async function ensureCommercialUser(authUser: SupabaseAuthUser) {
  const email = authUser.email?.toLowerCase();

  if (!authUser.id || !email) {
    throw new Error("Usuário Supabase sem e-mail válido.");
  }

  const fullName =
    authUser.user_metadata?.full_name ?? authUser.user_metadata?.name ?? null;

  const users = await supabaseRestRequest<CommercialUser[]>(
    "users?on_conflict=id",
    {
      method: "POST",
      prefer: "resolution=merge-duplicates,return=representation",
      body: JSON.stringify({
        id: authUser.id,
        email,
        full_name: fullName,
        last_accessed_at: new Date().toISOString()
      })
    }
  );

  return users[0];
}

export async function getActiveSubscription(userId: string) {
  const subscriptions = await supabaseRestRequest<SubscriptionRecord[]>(
    `subscriptions?user_id=eq.${encodeURIComponent(
      userId
    )}&order=updated_at.desc&limit=1`
  );

  return subscriptions[0] ?? null;
}

export async function getSubscriptionByStripeReference({
  customerId,
  subscriptionId
}: {
  customerId?: string | null;
  subscriptionId?: string | null;
}) {
  if (subscriptionId) {
    const rows = await supabaseRestRequest<SubscriptionRecord[]>(
      `subscriptions?stripe_subscription_id=eq.${encodeURIComponent(
        subscriptionId
      )}&limit=1`
    );

    if (rows[0]) {
      return rows[0];
    }
  }

  if (customerId) {
    const rows = await supabaseRestRequest<SubscriptionRecord[]>(
      `subscriptions?stripe_customer_id=eq.${encodeURIComponent(
        customerId
      )}&order=updated_at.desc&limit=1`
    );

    return rows[0] ?? null;
  }

  return null;
}

export async function upsertSubscription(
  subscription: Omit<SubscriptionRecord, "id"> & { id?: string }
) {
  const path = subscription.id
    ? "subscriptions?on_conflict=id"
    : "subscriptions?on_conflict=stripe_subscription_id";

  const rows = await supabaseRestRequest<SubscriptionRecord[]>(path, {
    method: "POST",
    prefer: "resolution=merge-duplicates,return=representation",
    body: JSON.stringify({
      ...subscription,
      updated_at: new Date().toISOString()
    })
  });

  return rows[0] ?? null;
}

export async function getCurrentUsage(userId: string) {
  const monthKey = getCurrentMonthKey();
  const rows = await supabaseRestRequest<UsageRecord[]>(
    `usage_limits?user_id=eq.${encodeURIComponent(
      userId
    )}&month_key=eq.${monthKey}&limit=1`
  );

  return (
    rows[0] ?? {
      user_id: userId,
      month_key: monthKey,
      pages_processed: 0,
      ocr_pages: 0,
      voice_characters: 0,
      mp3_generations: 0
    }
  );
}

export async function recordUsage(
  userId: string,
  usage: Partial<
    Pick<UsageRecord, "pages_processed" | "ocr_pages" | "voice_characters" | "mp3_generations">
  >
) {
  const current = await getCurrentUsage(userId);
  const next: UsageRecord = {
    user_id: userId,
    month_key: current.month_key,
    pages_processed: current.pages_processed + (usage.pages_processed ?? 0),
    ocr_pages: current.ocr_pages + (usage.ocr_pages ?? 0),
    voice_characters: current.voice_characters + (usage.voice_characters ?? 0),
    mp3_generations: current.mp3_generations + (usage.mp3_generations ?? 0)
  };

  const rows = await supabaseRestRequest<UsageRecord[]>(
    "usage_limits?on_conflict=user_id,month_key",
    {
      method: "POST",
      prefer: "resolution=merge-duplicates,return=representation",
      body: JSON.stringify(next)
    }
  );

  return rows[0] ?? next;
}

export async function getUserPreferences(userId: string) {
  const rows = await supabaseRestRequest<UserPreferences[]>(
    `user_preferences?user_id=eq.${encodeURIComponent(userId)}&limit=1`
  );

  return rows[0] ?? null;
}

export async function upsertUserPreferences(preferences: UserPreferences) {
  const rows = await supabaseRestRequest<UserPreferences[]>(
    "user_preferences?on_conflict=user_id",
    {
      method: "POST",
      prefer: "resolution=merge-duplicates,return=representation",
      body: JSON.stringify({
        ...preferences,
        updated_at: new Date().toISOString()
      })
    }
  );

  return rows[0] ?? preferences;
}

export function setAuthCookies(response: NextResponse, session: SupabaseAuthSession) {
  const maxAge = getAuthCookieMaxAge(session);
  const secure = process.env.NODE_ENV === "production";

  response.cookies.set(ACCESS_TOKEN_COOKIE, session.access_token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE, session.refresh_token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0
  });
}

export async function refreshSessionFromRequest(request: Request) {
  const refreshToken = readAuthCookie(request, REFRESH_TOKEN_COOKIE);

  if (!refreshToken) {
    return null;
  }

  return refreshAuthSession(refreshToken);
}

export function readAuthCookie(source: AuthCookieSource, name: string) {
  if ("headers" in source) {
    return parseCookieHeader(source.headers.get("cookie")).get(name) ?? null;
  }

  return source.get(name)?.value ?? null;
}

export function getCurrentMonthKey(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(
    2,
    "0"
  )}`;
}

function freeAccess(reason: string): ServerAccess {
  return {
    isAuthenticated: false,
    plan: getPlan("free"),
    userId: null,
    user: null,
    subscription: null,
    usage: null,
    preferences: null,
    reason
  };
}

function resolvePlanIdFromSubscription(subscription: SubscriptionRecord | null): PlanId {
  if (!subscription) {
    return "free";
  }

  return subscription.plan === "premium" && isPremiumSubscriptionStatus(subscription.status)
    ? "premium"
    : "free";
}

function isPremiumSubscriptionStatus(status: string) {
  return status === "active" || status === "trialing";
}

async function markLastAccess(userId: string) {
  await supabaseRestRequest(
    `users?id=eq.${encodeURIComponent(userId)}`,
    {
      method: "PATCH",
      prefer: "return=minimal",
      body: JSON.stringify({
        last_accessed_at: new Date().toISOString()
      })
    }
  ).catch(() => null);
}
