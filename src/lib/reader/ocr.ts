import type { ProcessingProgress } from "./types";
import { normalizeExtractedText } from "./text";

type OcrProgressHandler = (progress: ProcessingProgress) => void;

type TesseractLoggerMessage = {
  status?: string;
  progress?: number;
};

export async function recognizeCanvasText(
  canvas: HTMLCanvasElement,
  onProgress?: OcrProgressHandler,
  pageNumber = 1,
  totalPages = 1,
  signal?: AbortSignal
) {
  throwIfAborted(signal);

  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("por+eng", 1, {
    logger: (message: TesseractLoggerMessage) => {
      if (!onProgress || typeof message.progress !== "number") {
        return;
      }

      onProgress({
        phase: "ocr",
        message: readableOcrStatus(message.status),
        currentPage: pageNumber,
        totalPages,
        progress: message.progress
      });
    }
  });

  let aborted = false;
  const abortWorker = () => {
    aborted = true;
    void worker.terminate().catch(() => undefined);
  };

  signal?.addEventListener("abort", abortWorker, { once: true });

  try {
    throwIfAborted(signal);
    const result = await worker.recognize(canvas);
    throwIfAborted(signal);

    return {
      text: normalizeExtractedText(result.data.text ?? ""),
      confidence: result.data.confidence
    };
  } catch (error) {
    if (aborted || signal?.aborted) {
      throw new OcrCancelledError();
    }

    throw error;
  } finally {
    signal?.removeEventListener("abort", abortWorker);
    await worker.terminate().catch(() => undefined);
  }
}

export class OcrCancelledError extends Error {
  constructor() {
    super("Processamento cancelado.");
    this.name = "OcrCancelledError";
  }
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new OcrCancelledError();
  }
}

function readableOcrStatus(status?: string) {
  if (!status) {
    return "Lendo imagem com OCR...";
  }

  const labels: Record<string, string> = {
    "loading tesseract core": "Carregando motor OCR...",
    "initializing tesseract": "Iniciando OCR...",
    "loading language traineddata": "Carregando idioma do OCR...",
    "initializing api": "Preparando leitura da imagem...",
    "recognizing text": "Reconhecendo texto da página..."
  };

  return labels[status] ?? status;
}
