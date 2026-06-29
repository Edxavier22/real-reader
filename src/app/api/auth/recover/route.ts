import { NextResponse } from "next/server";
import { requestPasswordRecovery } from "@/lib/commercial/supabase";

type RecoverBody = {
  email?: string;
};

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: RecoverBody;

  try {
    body = (await request.json()) as RecoverBody;
  } catch {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ error: "Informe seu e-mail." }, { status: 400 });
  }

  try {
    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    await requestPasswordRecovery(email, `${origin}/login`);

    return NextResponse.json({
      ok: true,
      message:
        "Se esse e-mail estiver cadastrado, você receberá instruções para recuperar a senha."
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível iniciar a recuperação de senha."
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
