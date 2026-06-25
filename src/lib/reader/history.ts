import type { HistoryRecord, ReaderDocument } from "./types";

const HISTORY_KEY = "real-reader:history:v1";
const MAX_RECORDS = 8;
const MAX_PAGE_TEXT_CHARS = 120_000;

export function readHistory(): HistoryRecord[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as HistoryRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveDocumentToHistory(document: ReaderDocument, maxRecords = MAX_RECORDS) {
  if (typeof window === "undefined") {
    return [];
  }

  const compactDocument = shrinkDocumentForStorage(document);
  const current = readHistory().filter((item) => item.id !== document.id);
  const next = [compactDocument, ...current].slice(0, maxRecords);

  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    return next;
  } catch {
    const extraCompact = next.slice(0, 4).map(shrinkDocumentForStorage);
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(extraCompact));
    return extraCompact;
  }
}

export function clearHistory() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(HISTORY_KEY);
}

function shrinkDocumentForStorage(document: ReaderDocument): ReaderDocument {
  return {
    ...document,
    pages: document.pages.map((page) => ({
      ...page,
      text:
        page.text.length > MAX_PAGE_TEXT_CHARS
          ? `${page.text.slice(0, MAX_PAGE_TEXT_CHARS)}\n\n[Texto cortado no histórico local para caber no navegador.]`
          : page.text
    }))
  };
}
