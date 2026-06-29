import { NextResponse } from "next/server";
import { requireAuthenticatedAccess } from "@/lib/commercial/auth";
import { supabaseRestRequest } from "@/lib/commercial/supabase";

type PatchBody = {
  favorite?: boolean;
};

type StoredDocumentRow = {
  id: string;
  user_id: string;
};

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { access, response } = await requireAuthenticatedAccess(request);

  if (response) {
    return response;
  }

  const { id } = await context.params;
  const existing = await getExistingDocument(id);

  if (!existing || existing.user_id !== access.userId) {
    return NextResponse.json(
      { error: "Documento não encontrado para este usuário." },
      { status: 404 }
    );
  }

  let body: PatchBody;

  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  await supabaseRestRequest(`documents?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    prefer: "return=minimal",
    body: JSON.stringify({
      ...(typeof body.favorite === "boolean" ? { favorite: body.favorite } : {}),
      updated_at: new Date().toISOString()
    })
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { access, response } = await requireAuthenticatedAccess(request);

  if (response) {
    return response;
  }

  const { id } = await context.params;
  const existing = await getExistingDocument(id);

  if (!existing || existing.user_id !== access.userId) {
    return NextResponse.json(
      { error: "Documento não encontrado para este usuário." },
      { status: 404 }
    );
  }

  await supabaseRestRequest(`documents?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    prefer: "return=minimal"
  });

  return NextResponse.json({ ok: true });
}

async function getExistingDocument(documentId: string) {
  const rows = await supabaseRestRequest<StoredDocumentRow[]>(
    `documents?id=eq.${encodeURIComponent(documentId)}&limit=1`
  );

  return rows[0] ?? null;
}
