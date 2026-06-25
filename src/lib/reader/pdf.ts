import type {
  ExtractionMode,
  OcrQuality,
  ProcessingProgress,
  ReaderPage
} from "./types";
import { OcrCancelledError, recognizeCanvasText } from "./ocr";
import {
  countWords,
  mergeDirectAndOcrText,
  normalizeExtractedText
} from "./text";

type ProgressHandler = (progress: ProcessingProgress) => void;

export type PageRange = {
  startPage: number;
  endPage: number;
};

export type PdfExtractionOptions = {
  extractionMode?: ExtractionMode;
  range?: PageRange;
  quality?: OcrQuality;
  signal?: AbortSignal;
};

export type PdfExtractionResult = {
  pages: ReaderPage[];
  totalPages: number;
  range: PageRange;
  cancelled: boolean;
};

let pdfWorkerConfigured = false;

export async function extractPdfPages(
  file: File,
  onProgress?: ProgressHandler,
  options: PdfExtractionOptions = {}
): Promise<PdfExtractionResult> {
  const extractionMode = options.extractionMode ?? "fast";
  const quality = options.quality ?? "normal";
  const pdfjs = await loadPdfJs();
  const bytes = new Uint8Array(await file.arrayBuffer());

  onProgress?.({
    phase: "loading",
    message: "Abrindo PDF..."
  });

  const pdf = await pdfjs.getDocument({ data: bytes }).promise;
  const range = normalizePageRange(options.range, pdf.numPages);
  const rangeTotal = range.endPage - range.startPage + 1;
  const pages: ReaderPage[] = [];
  let cancelled = false;

  for (let pageNumber = range.startPage; pageNumber <= range.endPage; pageNumber += 1) {
    const position = pageNumber - range.startPage + 1;

    if (options.signal?.aborted) {
      cancelled = true;
      break;
    }

    try {
      const page = await pdf.getPage(pageNumber);

      onProgress?.({
        phase: "extracting",
        message: `Processando página ${position} de ${rangeTotal}...`,
        currentPage: position,
        totalPages: rangeTotal,
        sourcePage: pageNumber,
        progress: (position - 1) / rangeTotal
      });

      const selectableText = await extractSelectableText(page);
      const needsOcr =
        extractionMode === "complete" || !hasUsefulText(selectableText);

      if (!needsOcr) {
        pages.push({
          pageNumber,
          text: selectableText,
          method: "selectable-text"
        });
        continue;
      }

      onProgress?.({
        phase: "ocr",
        message:
          extractionMode === "complete"
            ? `OCR completo em andamento · página ${position} de ${rangeTotal}`
            : `OCR em andamento · página ${position} de ${rangeTotal}`,
        currentPage: position,
        totalPages: rangeTotal,
        sourcePage: pageNumber,
        progress: (position - 1) / rangeTotal
      });

      const canvas = await renderPageToCanvas(page, quality);
      const ocrResult = await recognizeCanvasText(
        canvas,
        (ocrProgress) => {
          onProgress?.({
            phase: "ocr",
            message:
              extractionMode === "complete"
                ? `OCR completo em andamento · página ${position} de ${rangeTotal}`
                : `OCR em andamento · página ${position} de ${rangeTotal}`,
            currentPage: position,
            totalPages: rangeTotal,
            sourcePage: pageNumber,
            progress:
              ((position - 1) + (ocrProgress.progress ?? 0)) / rangeTotal
          });
        },
        position,
        rangeTotal,
        options.signal
      );

      pages.push(toReaderPage(pageNumber, selectableText, ocrResult));
    } catch (error) {
      if (error instanceof OcrCancelledError || options.signal?.aborted) {
        cancelled = true;
        break;
      }

      throw error;
    }
  }

  onProgress?.({
    phase: "done",
    message: cancelled
      ? "Processamento cancelado. As páginas já concluídas foram mantidas."
      : "PDF processado.",
    currentPage: pages.length,
    totalPages: rangeTotal,
    progress: cancelled ? pages.length / rangeTotal : 1
  });

  return {
    pages,
    totalPages: pdf.numPages,
    range,
    cancelled
  };
}

export async function extractImagePage(
  file: File,
  onProgress?: ProgressHandler
): Promise<ReaderPage[]> {
  onProgress?.({
    phase: "loading",
    message: "Abrindo imagem..."
  });

  const canvas = await fileToCanvas(file);

  onProgress?.({
    phase: "ocr",
    message: "Reconhecendo texto da imagem...",
    currentPage: 1,
    totalPages: 1,
    progress: 0
  });

  const result = await recognizeCanvasText(canvas, onProgress, 1, 1);

  onProgress?.({
    phase: "done",
    message: "Imagem processada.",
    currentPage: 1,
    totalPages: 1,
    progress: 1
  });

  return [
    {
      pageNumber: 1,
      text: result.text,
      method: result.text ? "ocr-image" : "empty",
      confidence: result.confidence,
      warning: result.text
        ? undefined
        : "Não foi possível encontrar texto na imagem."
    }
  ];
}

function toReaderPage(
  pageNumber: number,
  selectableText: string,
  ocrResult: { text: string; confidence: number }
): ReaderPage {
  if (selectableText && ocrResult.text) {
    return {
      pageNumber,
      text: mergeDirectAndOcrText(selectableText, ocrResult.text),
      method: "selectable-text+ocr",
      confidence: ocrResult.confidence
    };
  }

  if (selectableText) {
    return {
      pageNumber,
      text: selectableText,
      method: "selectable-text"
    };
  }

  return {
    pageNumber,
    text: ocrResult.text,
    method: ocrResult.text ? "ocr-image" : "empty",
    confidence: ocrResult.confidence,
    warning: ocrResult.text
      ? undefined
      : "Não foi possível encontrar texto nesta página."
  };
}

function normalizePageRange(range: PageRange | undefined, totalPages: number): PageRange {
  const startPage = clampPage(range?.startPage ?? 1, totalPages);
  const endPage = Math.max(
    startPage,
    clampPage(range?.endPage ?? totalPages, totalPages)
  );

  return { startPage, endPage };
}

function clampPage(page: number, totalPages: number) {
  return Math.max(1, Math.min(Math.trunc(page) || 1, totalPages));
}

async function loadPdfJs() {
  const pdfjs = await import("pdfjs-dist");

  if (!pdfWorkerConfigured && typeof window !== "undefined") {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.mjs",
      import.meta.url
    ).toString();
    pdfWorkerConfigured = true;
  }

  return pdfjs;
}

async function extractSelectableText(page: {
  getTextContent: () => Promise<{ items: unknown[] }>;
}) {
  const content = await page.getTextContent();
  const text = content.items
    .map((item) => {
      if (typeof item === "object" && item && "str" in item) {
        return String((item as { str?: string }).str ?? "");
      }

      return "";
    })
    .join(" ");

  return normalizeExtractedText(text);
}

function hasUsefulText(text: string) {
  return text.length >= 40 && countWords(text) >= 8;
}

async function renderPageToCanvas(page: any, quality: OcrQuality) {
  const scale = quality === "high" ? 2.25 : 1.45;
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { alpha: false });

  if (!context) {
    throw new Error("Não foi possível criar o canvas para OCR.");
  }

  canvas.width = Math.ceil((viewport as { width: number }).width);
  canvas.height = Math.ceil((viewport as { height: number }).height);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({
    canvasContext: context,
    viewport
  }).promise;

  return canvas;
}

async function fileToCanvas(file: File) {
  const url = URL.createObjectURL(file);

  try {
    const image = await loadImage(url);
    const maxSide = 2600;
    const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { alpha: false });

    if (!context) {
      throw new Error("Não foi possível criar o canvas para OCR.");
    }

    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Não foi possível abrir a imagem."));
    image.src = url;
  });
}
