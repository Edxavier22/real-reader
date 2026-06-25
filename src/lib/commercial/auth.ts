import { getPlan, type CommercialPlan, type PlanId } from "./plans";

export type ServerAccess = {
  isAuthenticated: boolean;
  plan: CommercialPlan;
  userId: string | null;
  reason: string;
};

export function getAuthProviderStatus() {
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  return {
    provider: "supabase-auth",
    configured: supabaseConfigured,
    detail: supabaseConfigured
      ? "Supabase Auth configurado. Conecte o cliente na UI para login real."
      : "Supabase Auth preparado por variáveis de ambiente, mas ainda não configurado."
  };
}

export function resolveServerAccess(request: Request): ServerAccess {
  const planId = resolvePlanId(request);
  const plan = getPlan(planId);
  const authenticated = plan.id === "premium";

  return {
    isAuthenticated: authenticated,
    plan,
    userId: authenticated ? "premium-token-user" : null,
    reason: authenticated
      ? "Acesso premium liberado por token de integração/staging."
      : "Visitante sem sessão premium ativa."
  };
}

function resolvePlanId(request: Request): PlanId {
  const bypassToken = process.env.REAL_READER_PREMIUM_BYPASS_TOKEN;
  const requestToken = request.headers.get("x-real-reader-premium-token");

  if (bypassToken && requestToken && requestToken === bypassToken) {
    return "premium";
  }

  if (
    process.env.REAL_READER_ALLOW_LOCAL_PREMIUM === "true" &&
    request.headers.get("cookie")?.includes("real_reader_plan=premium")
  ) {
    return "premium";
  }

  return "free";
}
