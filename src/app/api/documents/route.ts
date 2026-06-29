import { NextResponse } from "next/server";
import {
  recordUsage,
  requireAuthenticatedAccess
} from "@/lib/commercial/auth";
import { supabaseRestRequest } from "@/lib/commercial/supabase";
import type { ReaderDocument, StudyBlock } from "@/lib/reader/types";

type DocumentSyncBody = {
  document?: ReaderDocument;
  favorite?: boolean;
};

type StoredDocumentRow = {
  id: string;
  user_id: string;
  name: string;
  mime_type: string;
  size_bytes: number;
  source_total_pages: number;
  processed_pages: number;
  extraction_mode: string;
  total_chars: number;
  favorite: boolean;
  last_read_page: number | null;
  last_read_at: string | null;
  content_json: ReaderDocument | null;
  created_at: string;
  updated_at: string;
};

const MAX_SYNC_BYTES_FREE = 3_000_000;
const MAX_SYNC_BYTES_PREMIUM = 20_000_000;

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { access, response } = await requireAuthenticatedAccess(request);

  if (response) {
    return response;
  }

  const rows = await supabaseRestRequest<StoredDocumentRow[]>(
    `documents?user_id=eq.${encodeURIComponent(
      access.userId ?? ""
    )}&order=updated_at.desc&limit=${access.plan.historyLimit}`
  );

  return NextResponse.json({
    documents: rows
      .map((row) => row.content_json)
      .filter((document): document is ReaderDocument => Boolean(document)),
    favorites: rows.filter((row) => row.favorite).map((row) => row.id)
  });
}

export async function POST(request: Request) {
  const { access, response } = await requireAuthenticatedAccess(request);

  if (response) {
    return response;
  }

  let body: DocumentSyncBody;

  try {
    body = (await request.json()) as DocumentSyncBody;
  } catch {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const document = body.document;

  if (!isValidDocument(document)) {
    return NextResponse.json(
      { error: "Documento inválido para sincronização." },
      { status: 400 }
    );
  }

  const sourceTotalPages = Math.max(
    document.sourceTotalPages ?? document.pages.length,
    document.pages.length
  );

  if (sourceTotalPages > access.plan.maxPagesPerPdf) {
    return NextResponse.json(
      {
        error: "Documento acima do limite do plano.",
        details: `Seu plano permite até ${access.plan.maxPagesPerPdf} páginas por PDF.`
      },
      { status: 403 }
    );
  }

  const payloadBytes = new TextEncoder().encode(JSON.stringify(document)).length;
  const maxBytes =
    access.plan.id === "premium" ? MAX_SYNC_BYTES_PREMIUM : MAX_SYNC_BYTES_FREE;

  if (payloadBytes > maxBytes) {
    return NextResponse.json(
      {
        error: "Documento grande demais para sincronização.",
        details:
          "A leitura continua localmente. Para sincronizar, reduza o trecho processado."
      },
      { status: 413 }
    );
  }

  const existing = await getExistingDocument(document.id);

  if (existing && existing.user_id !== access.userId) {
    return NextResponse.json(
      { error: "Você não tem permissão para alterar este documento." },
      { status: 403 }
    );
  }

  const rows = await supabaseRestRequest<StoredDocumentRow[]>(
    "documents?on_conflict=id",
    {
      method: "POST",
      prefer: "resolution=merge-duplicates,return=representation",
      body: JSON.stringify({
        id: document.id,
        user_id: access.userId,
        name: document.name,
        mime_type: document.mimeType,
        size_bytes: document.size,
        source_total_pages: sourceTotalPages,
        processed_pages: document.pages.length,
        extraction_mode: document.extractionMode ?? "fast",
        total_chars: document.totalChars,
        favorite: Boolean(body.favorite),
        last_read_page: document.lastRead?.pageNumber ?? null,
        last_read_at: document.lastRead?.savedAt ?? null,
        content_json: document,
        updated_at: new Date().toISOString()
      })
    }
  );

  await syncStudyBlocks(document.id, access.userId ?? "", document.studyBlocks ?? []);
  await syncBookmark(document, access.userId ?? "");

  if (!existing) {
    await recordUsage(access.userId ?? "", {
      pages_processed: document.pages.length,
      ocr_pages: document.pages.filter((page) => page.method.includes("ocr")).length
    });
  }

  return NextResponse.json({ ok: true, document: rows[0]?.content_json ?? document });
}

async function getExistingDocument(documentId: string) {
  const rows = await supabaseRestRequest<StoredDocumentRow[]>(
    `documents?id=eq.${encodeURIComponent(documentId)}&limit=1`
  );

  return rows[0] ?? null;
}

async function syncStudyBlocks(
  documentId: string,
  userId: string,
  studyBlocks: StudyBlock[]
) {
  await supabaseRestRequest(
    `study_blocks?document_id=eq.${encodeURIComponent(
      documentId
    )}&user_id=eq.${encodeURIComponent(userId)}`,
    {
      method: "DELETE",
      prefer: "return=minimal"
    }
  );

  if (!studyBlocks.length) {
    return;
  }

  await supabaseRestRequest("study_blocks", {
    method: "POST",
    prefer: "return=minimal",
    body: JSON.stringify(
      studyBlocks.map((block) => ({
        id: block.id,
        document_id: documentId,
        user_id: userId,
        name: block.name,
        start_page: block.startPage,
        end_page: block.endPage,
        created_at: block.createdAt
      }))
    )
  });
}

async function syncBookmark(document: ReaderDocument, userId: string) {
  await supabaseRestRequest(
    `reading_bookmarks?document_id=eq.${encodeURIComponent(
      document.id
    )}&user_id=eq.${encodeURIComponent(userId)}`,
    {
      method: "DELETE",
      prefer: "return=minimal"
    }
  );

  if (!document.lastRead) {
    return;
  }

  await supabaseRestRequest("reading_bookmarks", {
    method: "POST",
    prefer: "return=minimal",
    body: JSON.stringify({
      document_id: document.id,
      user_id: userId,
      page_number: document.lastRead.pageNumber,
      saved_at: document.lastRead.savedAt
    })
  });
}

function isValidDocument(value: unknown): value is ReaderDocument {
  if (!value || typeof value !== "object") {
    return false;
  }

  const document = value as ReaderDocument;

  return Boolean(
    document.id &&
      document.name &&
      document.mimeType &&
      Array.isArray(document.pages) &&
      typeof document.totalChars === "number"
  );
}
