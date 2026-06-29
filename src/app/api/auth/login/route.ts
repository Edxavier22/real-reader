import { NextResponse } from "next/server";
import {
  ensureCommercialUser,
  setAuthCookies
} from "@/lib/commercial/auth";
import { signInWithPassword } from "@/lib/commercial/supabase";

type LoginBody = {
  email?: string;
  password?: string;
};

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: LoginBody;

  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Informe e-mail e senha." },
      { status: 400 }
    );
  }

  try {
    const session = await signInWithPassword(email, password);
    const user = await ensureCommercialUser(session.user);
    const response = NextResponse.json({
      ok: true,
      user
    });

    setAuthCookies(response, session);

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível entrar agora."
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
