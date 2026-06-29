export const ACCESS_TOKEN_COOKIE = "real_reader_access_token";
export const REFRESH_TOKEN_COOKIE = "real_reader_refresh_token";

const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export type SupabaseConfig = {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
};

export type SupabaseAuthUser = {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
  };
};

export type SupabaseAuthSession = {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  token_type?: string;
  user: SupabaseAuthUser;
};

export type SupabaseAuthResponse = Partial<SupabaseAuthSession> & {
  user?: SupabaseAuthUser;
  error?: string;
  error_description?: string;
  msg?: string;
};

export class SupabaseCommercialError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "SupabaseCommercialError";
    this.status = status;
  }
}

export function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey || !serviceRoleKey) {
    return null;
  }

  return { url, anonKey, serviceRoleKey };
}

export function isSupabaseConfigured() {
  return Boolean(getSupabaseConfig());
}

export function getAuthCookieMaxAge(session: SupabaseAuthSession) {
  return session.expires_in
    ? Math.min(session.expires_in, AUTH_COOKIE_MAX_AGE)
    : AUTH_COOKIE_MAX_AGE;
}

export async function supabaseAuthRequest<T>(
  path: string,
  init: RequestInit = {},
  accessToken?: string
): Promise<T> {
  const config = requireSupabaseConfig();
  const response = await fetch(`${config.url}/auth/v1${path}`, {
    ...init,
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${accessToken ?? config.anonKey}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {})
    },
    cache: "no-store"
  });

  return parseSupabaseResponse<T>(response);
}

export async function supabaseRestRequest<T>(
  path: string,
  init: RequestInit & { prefer?: string } = {}
): Promise<T> {
  const config = requireSupabaseConfig();
  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      "Content-Type": "application/json",
      ...(init.prefer ? { Prefer: init.prefer } : {}),
      ...(init.headers ?? {})
    },
    cache: "no-store"
  });

  return parseSupabaseResponse<T>(response);
}

export async function signUpWithPassword({
  email,
  password,
  fullName,
  redirectTo
}: {
  email: string;
  password: string;
  fullName?: string;
  redirectTo?: string;
}) {
  const payload: Record<string, unknown> = {
    email,
    password,
    data: {
      full_name: fullName
    }
  };

  if (redirectTo) {
    payload.redirect_to = redirectTo;
  }

  return supabaseAuthRequest<SupabaseAuthResponse>("/signup", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function signInWithPassword(email: string, password: string) {
  return supabaseAuthRequest<SupabaseAuthSession>(
    "/token?grant_type=password",
    {
      method: "POST",
      body: JSON.stringify({ email, password })
    }
  );
}

export async function refreshAuthSession(refreshToken: string) {
  return supabaseAuthRequest<SupabaseAuthSession>(
    "/token?grant_type=refresh_token",
    {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken })
    }
  );
}

export async function requestPasswordRecovery(email: string, redirectTo?: string) {
  return supabaseAuthRequest<{ message?: string }>("/recover", {
    method: "POST",
    body: JSON.stringify({
      email,
      ...(redirectTo ? { redirect_to: redirectTo } : {})
    })
  });
}

export async function getAuthUser(accessToken: string) {
  return supabaseAuthRequest<SupabaseAuthUser>("/user", {}, accessToken);
}

export function parseCookieHeader(cookieHeader: string | null | undefined) {
  const cookies = new Map<string, string>();

  if (!cookieHeader) {
    return cookies;
  }

  for (const item of cookieHeader.split(";")) {
    const [rawKey, ...rawValue] = item.trim().split("=");
    const key = rawKey?.trim();

    if (!key) {
      continue;
    }

    cookies.set(key, decodeURIComponent(rawValue.join("=")));
  }

  return cookies;
}

function requireSupabaseConfig() {
  const config = getSupabaseConfig();

  if (!config) {
    throw new SupabaseCommercialError(
      "Supabase não está configurado. Defina NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY e SUPABASE_SERVICE_ROLE_KEY.",
      503
    );
  }

  return config;
}

async function parseSupabaseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const data = text ? safeJsonParse(text) : null;

  if (!response.ok) {
    const message =
      (data as { error_description?: string; message?: string; msg?: string; error?: string } | null)
        ?.error_description ||
      (data as { message?: string; msg?: string; error?: string } | null)
        ?.message ||
      (data as { msg?: string; error?: string } | null)?.msg ||
      (data as { error?: string } | null)?.error ||
      "Falha de comunicação com Supabase.";

    throw new SupabaseCommercialError(message, response.status);
  }

  return data as T;
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}
