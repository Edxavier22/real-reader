import { NextResponse } from "next/server";
import {
  ensureCommercialUser,
  setAuthCookies
} from "@/lib/commercial/auth";
import {
  signUpWithPassword,
  type SupabaseAuthResponse
} from "@/lib/commercial/supabase";

type SignupBody = {
  email?: string;
  password?: string;
  fullName?: string;
};

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: SignupBody;

  try {
    body = (await request.json()) as SignupBody;
  } catch {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  const fullName = body.fullName?.trim();

  if (!email || password.length < 8) {
    return NextResponse.json(
      {
        error: "Informe e-mail e uma senha com pelo menos 8 caracteres."
      },
      { status: 400 }
    );
  }

  try {
    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";
    const auth = await signUpWithPassword({
      email,
      password,
      fullName,
      redirectTo: `${origin}/login`
    });
    const response = NextResponse.json({
      ok: true,
      requiresEmailConfirmation: !auth.access_token,
      user: auth.user
        ? {
            id: auth.user.id,
            email: auth.user.email
          }
        : null
    });

    if (auth.user) {
      await ensureCommercialUser(auth.user);
    }

    if (isCompleteSession(auth)) {
      setAuthCookies(response, auth);
    }

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível criar sua conta agora."
      },
      { status: getErrorStatus(error) }
    );
  }
}

function isCompleteSession(
  value: SupabaseAuthResponse
): value is SupabaseAuthResponse & {
  access_token: string;
  refresh_token: string;
  user: NonNullable<SupabaseAuthResponse["user"]>;
} {
  return Boolean(value.access_token && value.refresh_token && value.user);
}

function getErrorStatus(error: unknown) {
  return typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
    ? error.status
    : 500;
}
