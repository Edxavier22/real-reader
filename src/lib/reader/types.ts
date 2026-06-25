export type SourceType = "pdf" | "image";

export type ExtractionMethod =
  | "selectable-text"
  | "ocr-image"
  | "selectable-text+ocr"
  | "empty"
  | "error";

export type ExtractionMode = "fast" | "complete" | "mixed";

export type OcrQuality = "normal" | "high";

export type VoiceMode = "browser" | "neural" | "authorized-clone";

export type ReaderPage = {
  pageNumber: number;
  text: string;
  method: ExtractionMethod;
  confidence?: number;
  warning?: string;
};

export type StudyBlock = {
  id: string;
  name: string;
  startPage: number;
  endPage: number;
  createdAt: string;
};

export type ReadingBookmark = {
  pageNumber: number;
  savedAt: string;
};

export type ReaderDocument = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  sourceType: SourceType;
  sourceTotalPages?: number;
  extractionMode?: ExtractionMode;
  studyBlocks?: StudyBlock[];
  lastRead?: ReadingBookmark;
  processedAt: string;
  totalChars: number;
  pages: ReaderPage[];
};

export type ProcessingPhase =
  | "idle"
  | "loading"
  | "extracting"
  | "ocr"
  | "done"
  | "error";

export type ProcessingProgress = {
  phase: ProcessingPhase;
  message: string;
  currentPage?: number;
  totalPages?: number;
  sourcePage?: number;
  progress?: number;
};

export type HistoryRecord = ReaderDocument;
