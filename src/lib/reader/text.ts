import type { ReaderPage } from "./types";

export function normalizeExtractedText(input: string) {
  return input
    .replace(/\u0000/g, "")
    .replace(/[^\S\r\n]+/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function cleanExtractedTextForStudy(input: string) {
  const normalized = normalizeExtractedText(input)
    .replace(/(\p{L})-\n(\p{L})/gu, "$1$2")
    .replace(/[|]{2,}/g, " ")
    .replace(/[·•]{2,}/g, " ")
    .replace(/[^\S\r\n]{2,}/g, " ");

  const lines = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => {
      if (!line) {
        return true;
      }

      if (/^[^\p{L}\p{N}]{1,5}$/u.test(line)) {
        return false;
      }

      if (/^[\d\s._|/-]{1,4}$/u.test(line)) {
        return false;
      }

      return true;
    });

  return normalizeExtractedText(lines.join("\n"));
}

export function compactInlineText(input: string) {
  return normalizeExtractedText(input).replace(/\s+/g, " ").trim();
}

/**
 * Joins direct PDF text and OCR without repeating lines already present in the
 * selectable text. The filter is conservative to retain text from screenshots
 * and slide images when there is any uncertainty.
 */
export function mergeDirectAndOcrText(directText: string, ocrText: string) {
  const direct = normalizeExtractedText(directText);
  const ocr = normalizeExtractedText(ocrText);

  if (!direct) {
    return ocr;
  }

  if (!ocr) {
    return direct;
  }

  const directComparable = comparableText(direct);
  const ocrComparable = comparableText(ocr);

  if (
    directComparable.includes(ocrComparable) ||
    ocrComparable.includes(directComparable)
  ) {
    return direct.length >= ocr.length ? direct : ocr;
  }

  const directWords = new Set(tokenizeComparableText(direct));
  const acceptedOcrParts: string[] = [];
  const seenOcrParts = new Set<string>();

  for (const part of splitOcrParts(ocr)) {
    const comparable = comparableText(part);

    if (!comparable || seenOcrParts.has(comparable)) {
      continue;
    }

    seenOcrParts.add(comparable);

    if (isLikelyAlreadyInDirectText(comparable, directComparable, directWords)) {
      continue;
    }

    acceptedOcrParts.push(part);
  }

  if (!acceptedOcrParts.length) {
    return direct;
  }

  return normalizeExtractedText(`${direct}\n\n${acceptedOcrParts.join("\n")}`);
}

function splitOcrParts(ocrText: string) {
  const lines = ocrText
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length > 1) {
    return lines;
  }

  return ocrText
    .split(/(?<=[.!?;:])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function isLikelyAlreadyInDirectText(
  candidate: string,
  directComparable: string,
  directWords: Set<string>
) {
  if (candidate.length >= 18 && directComparable.includes(candidate)) {
    return true;
  }

  const words = tokenizeComparableText(candidate);

  if (words.length < 6) {
    return false;
  }

  const matchingWords = words.filter((word) => directWords.has(word)).length;
  return matchingWords / words.length >= 0.88;
}

function comparableText(input: string) {
  return compactInlineText(input)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokenizeComparableText(input: string) {
  return comparableText(input).split(/\s+/).filter(Boolean);
}

export function countWords(input: string) {
  const words = input.trim().match(/\S+/g);
  return words?.length ?? 0;
}

export function combinePagesText(pages: ReaderPage[]) {
  return pages
    .map((page) => `Página ${page.pageNumber}\n\n${page.text}`.trim())
    .filter(Boolean)
    .join("\n\n---\n\n");
}

export function splitIntoSpeechChunks(input: string, maxLength = 260) {
  const normalized = compactInlineText(input);

  if (!normalized) {
    return [];
  }

  const sentences = normalized.match(/[^.!?;:]+[.!?;:]*/g) ?? [normalized];
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences.map((part) => part.trim()).filter(Boolean)) {
    if (!current) {
      current = sentence;
      continue;
    }

    if (`${current} ${sentence}`.length <= maxLength) {
      current = `${current} ${sentence}`;
      continue;
    }

    chunks.push(current);
    current = sentence;
  }

  if (current) {
    chunks.push(current);
  }

  return chunks.flatMap((chunk) => splitLongChunk(chunk, maxLength));
}

function splitLongChunk(chunk: string, maxLength: number) {
  if (chunk.length <= maxLength) {
    return [chunk];
  }

  const words = chunk.split(/\s+/);
  const pieces: string[] = [];
  let current = "";

  for (const word of words) {
    if (!current) {
      current = word;
      continue;
    }

    if (`${current} ${word}`.length <= maxLength) {
      current = `${current} ${word}`;
      continue;
    }

    pieces.push(current);
    current = word;
  }

  if (current) {
    pieces.push(current);
  }

  return pieces;
}

export function formatBytes(bytes: number) {
  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / 1024 ** exponent;

  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

export function safeFileName(input: string, fallback = "real-reader") {
  const cleaned = input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return cleaned || fallback;
}
