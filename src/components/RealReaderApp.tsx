"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent
} from "react";
import { requestMp3Generation } from "@/lib/reader/audio";
import {
  clearHistory,
  readHistory,
  saveDocumentToHistory
} from "@/lib/reader/history";
import {
  extractImagePage,
  extractPdfPages,
  type PageRange
} from "@/lib/reader/pdf";
import {
  combinePagesText,
  countWords,
  cleanExtractedTextForStudy,
  formatBytes,
  safeFileName
} from "@/lib/reader/text";
import {
  formatPlanRestriction,
  getClientConfiguredPlan
} from "@/lib/commercial/plans";
import { LearningWorkspace } from "@/components/LearningWorkspace";
import { trackProductEvent } from "@/lib/product/analytics";
import type {
  ExtractionMode,
  HistoryRecord,
  OcrQuality,
  ProcessingProgress,
  ReaderDocument,
  ReaderPage,
  SourceType,
  StudyBlock,
  VoiceMode
} from "@/lib/reader/types";
import {
  defaultVoiceModeStatuses,
  getVoiceModeStatus,
  voiceModeOptions,
  type VoiceModeStatus
} from "@/lib/reader/voice";
import { useSpeechReader } from "@/lib/reader/useSpeechReader";

const initialProgress: ProcessingProgress = {
  phase: "idle",
  message: "Aguardando arquivo."
};

type ActiveTab = "reader" | "split";

export function RealReaderApp() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sourceFileRef = useRef<File | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [document, setDocument] = useState<ReaderDocument | null>(null);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [progress, setProgress] = useState<ProcessingProgress>(initialProgress);
  const [isProcessing, setIsProcessing] = useState(false);
  const [canCancelProcessing, setCanCancelProcessing] = useState(false);
  const [cancelRequested, setCancelRequested] = useState(false);
  const [error, setError] = useState("");
  const [mp3Message, setMp3Message] = useState("");
  const [voiceMessage, setVoiceMessage] = useState("");
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [voiceMode, setVoiceMode] = useState<VoiceMode>("browser");
  const [voiceModeStatuses, setVoiceModeStatuses] = useState<VoiceModeStatus[]>(
    defaultVoiceModeStatuses
  );
  const [activeTab, setActiveTab] = useState<ActiveTab>("reader");
  const [ocrStartPage, setOcrStartPage] = useState(1);
  const [ocrEndPage, setOcrEndPage] = useState(20);
  const [ocrQuality, setOcrQuality] = useState<OcrQuality>("normal");
  const [blockName, setBlockName] = useState("");
  const [blockStartPage, setBlockStartPage] = useState(1);
  const [blockEndPage, setBlockEndPage] = useState(20);
  const [selectedBlockId, setSelectedBlockId] = useState("");
  const currentPlan = useMemo(() => getClientConfiguredPlan(), []);
  const isPremiumPlan = currentPlan.id === "premium";

  const pages = document?.pages ?? [];
  const studyBlocks = document?.studyBlocks ?? [];
  const sourceTotalPages = getSourceTotalPages(document);
  const selectedPage = pages[selectedPageIndex] ?? null;
  const selectedBlock =
    studyBlocks.find((block) => block.id === selectedBlockId) ?? null;
  const selectedBlockPages = selectedBlock
    ? getPagesInRange(pages, selectedBlock)
    : [];
  const speech = useSpeechReader(pages);
  const activeVoiceModeStatus = getVoiceModeStatus(voiceMode, voiceModeStatuses);
  const isLocalVoiceActive =
    voiceMode === "browser" && activeVoiceModeStatus.available;

  const ocrRange = useMemo(
    () => normalizePageRange(ocrStartPage, ocrEndPage, sourceTotalPages),
    [ocrEndPage, ocrStartPage, sourceTotalPages]
  );
  const ocrPageCount = getRangePageCount(ocrRange);
  const estimatedOcrTime = formatEstimatedOcrTime(ocrPageCount, ocrQuality);

  useEffect(() => {
    setHistory(readHistory());
  }, []);

  useEffect(() => {
    speech.setCurrentPageIndex(selectedPageIndex);
  }, [selectedPageIndex, speech.setCurrentPageIndex]);

  useEffect(() => {
    if (speech.status === "playing" || speech.status === "paused") {
      setSelectedPageIndex(speech.currentPageIndex);
    }
  }, [speech.currentPageIndex, speech.status]);

  useEffect(() => {
    if (!document) {
      return;
    }

    const totalPages = getSourceTotalPages(document);
    const defaultEndPage = Math.min(20, totalPages);
    setOcrStartPage(1);
    setOcrEndPage(defaultEndPage);
    setBlockStartPage(1);
    setBlockEndPage(defaultEndPage);
    setSelectedBlockId(document.studyBlocks?.[0]?.id ?? "");
  }, [document?.id]);

  useEffect(() => {
    let active = true;

    fetch("/api/tts/status")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Não foi possível carregar a configuração de voz.");
        }

        return (await response.json()) as { modes?: VoiceModeStatus[] };
      })
      .then((data) => {
        if (active && Array.isArray(data.modes)) {
          setVoiceModeStatuses(data.modes);
        }
      })
      .catch(() => {
        // A voz local continua disponível mesmo se a rota opcional falhar.
      });

    return () => {
      active = false;
    };
  }, []);

  const summary = useMemo(() => {
    if (!document) {
      return null;
    }

    const textPages = document.pages.filter(
      (page) => page.method === "selectable-text"
    ).length;
    const ocrPages = document.pages.filter((page) => page.method === "ocr-image")
      .length;
    const combinedPages = document.pages.filter(
      (page) => page.method === "selectable-text+ocr"
    ).length;
    const emptyPages = document.pages.filter((page) => page.method === "empty")
      .length;
    const words = countWords(combinePagesText(document.pages));

    return {
      textPages,
      ocrPages,
      combinedPages,
      emptyPages,
      words
    };
  }, [document]);

  const persistDocument = useCallback(
    (nextDocument: ReaderDocument) => {
      setDocument(nextDocument);
      setHistory(saveDocumentToHistory(nextDocument, currentPlan.historyLimit));
    },
    [currentPlan.historyLimit]
  );

  const processFile = useCallback(
    async (file: File) => {
      setError("");
      setMp3Message("");
      setVoiceMessage("");
      setIsProcessing(true);
      setCanCancelProcessing(false);
      setCancelRequested(false);
      setActiveTab("reader");
      setSelectedPageIndex(0);
      setDocument(null);
      speech.stop();

      try {
        const sourceType = getSourceType(file);

        if (!sourceType) {
          throw new Error(
            "Nesta V1.3, envie PDF ou imagem (PNG, JPG, WEBP). Documentos DOCX ficam para uma etapa futura."
          );
        }

        sourceFileRef.current = file;

        const onProgress = (nextProgress: ProcessingProgress) => {
          setProgress(nextProgress);
        };

        if (sourceType === "pdf") {
          const controller = new AbortController();
          abortControllerRef.current = controller;
          setCanCancelProcessing(true);

          const result = await extractPdfPages(file, onProgress, {
            extractionMode: "fast",
            range: {
              startPage: 1,
              endPage: currentPlan.maxPagesPerPdf
            },
            quality: "normal",
            signal: controller.signal
          });

          if (!result.pages.length && result.cancelled) {
            setProgress({
              phase: "done",
              message: "Processamento cancelado antes de concluir páginas.",
              progress: 0,
              currentPage: 0,
              totalPages: result.range.endPage - result.range.startPage + 1
            });
            return;
          }

          const processedDocument = createReaderDocument(
            file,
            sourceType,
            result.pages,
            result.cancelled ? "mixed" : "fast",
            result.totalPages
          );
          persistDocument(processedDocument);
          trackProductEvent("document_processed", {
            sourceType,
            processedPages: result.pages.length,
            totalPages: result.totalPages,
            plan: currentPlan.id
          });
          setSelectedPageIndex(0);
          setProgress({
            phase: "done",
            message: buildProcessingDoneMessage(
              result.cancelled,
              result.totalPages,
              currentPlan.maxPagesPerPdf,
              currentPlan.name
            ),
            progress: result.cancelled
              ? result.pages.length / getRangePageCount(result.range)
              : 1,
            totalPages: getRangePageCount(result.range),
            currentPage: result.pages.length
          });
          return;
        }

        const imagePages = await extractImagePage(file, onProgress);
        const processedDocument = createReaderDocument(
          file,
          sourceType,
          imagePages,
          "complete",
          imagePages.length
        );
        persistDocument(processedDocument);
        trackProductEvent("document_processed", {
          sourceType,
          processedPages: imagePages.length,
          totalPages: imagePages.length,
          plan: currentPlan.id
        });
        setSelectedPageIndex(0);
        setProgress({
          phase: "done",
          message: "Imagem pronta para leitura.",
          progress: 1,
          totalPages: imagePages.length,
          currentPage: imagePages.length
        });
      } catch (caughtError) {
        const message =
          caughtError instanceof Error
            ? caughtError.message
            : "Não foi possível processar o arquivo.";
        setError(message);
        setProgress({
          phase: "error",
          message
        });
      } finally {
        abortControllerRef.current = null;
        setCanCancelProcessing(false);
        setCancelRequested(false);
        setIsProcessing(false);
      }
    },
    [currentPlan.maxPagesPerPdf, currentPlan.name, persistDocument, speech.stop]
  );

  const processCompleteRange = useCallback(
    async (range: PageRange, label: string) => {
      if (!currentPlan.features.fullOcr) {
        setError(formatPlanRestriction(currentPlan, "OCR completo por intervalo ou bloco"));
        return;
      }

      if (!document || !sourceFileRef.current || document.sourceType !== "pdf") {
        setError(
          "Para usar OCR completo, reenvie o PDF original nesta sessão. O histórico guarda o texto, não o arquivo."
        );
        return;
      }

      const normalizedRange = normalizePageRange(
        range.startPage,
        range.endPage,
        sourceTotalPages
      );
      const rangeTotal = getRangePageCount(normalizedRange);

      setError("");
      setMp3Message("");
      setVoiceMessage("");
      setIsProcessing(true);
      setCanCancelProcessing(true);
      setCancelRequested(false);
      speech.stop();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const result = await extractPdfPages(sourceFileRef.current, setProgress, {
          extractionMode: "complete",
          range: normalizedRange,
          quality: ocrQuality,
          signal: controller.signal
        });

        if (result.pages.length) {
          const mergedPages = mergeDocumentPages(document.pages, result.pages);
          const nextDocument: ReaderDocument = {
            ...document,
            pages: mergedPages,
            sourceTotalPages: result.totalPages,
            extractionMode: "mixed",
            processedAt: new Date().toISOString(),
            totalChars: getTotalChars(mergedPages)
          };
          persistDocument(nextDocument);
          setSelectedPageIndex(
            Math.max(0, findPageIndex(mergedPages, normalizedRange.startPage))
          );
        }

        setProgress({
          phase: "done",
          message: result.cancelled
            ? `OCR completo cancelado em "${label}". Mantive o que já ficou pronto.`
            : `OCR completo concluído em "${label}".`,
          progress: result.cancelled ? result.pages.length / rangeTotal : 1,
          currentPage: result.pages.length,
          totalPages: rangeTotal
        });
      } catch (caughtError) {
        const message =
          caughtError instanceof Error
            ? caughtError.message
            : "Não foi possível concluir o OCR completo.";
        setError(message);
        setProgress({
          phase: "error",
          message
        });
      } finally {
        abortControllerRef.current = null;
        setCanCancelProcessing(false);
        setCancelRequested(false);
        setIsProcessing(false);
      }
    },
    [
      currentPlan,
      document,
      ocrQuality,
      persistDocument,
      sourceTotalPages,
      speech.stop
    ]
  );

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      void processFile(file);
      event.target.value = "";
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];

    if (file) {
      void processFile(file);
    }
  };

  const handleCancelProcessing = () => {
    setCancelRequested(true);
    abortControllerRef.current?.abort();
  };

  const handleLoadFromHistory = (record: HistoryRecord) => {
    speech.stop();
    sourceFileRef.current = null;
    setError("");
    setMp3Message("");
    setVoiceMessage("");
    setDocument(record);
    setActiveTab("reader");
    setSelectedPageIndex(0);
    setProgress({
      phase: "done",
      message: "Arquivo carregado do histórico local.",
      progress: 1,
      totalPages: record.pages.length,
      currentPage: record.pages.length
    });
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  const handleDownloadText = () => {
    if (!document) {
      return;
    }

    downloadTextFile(
      `${safeFileName(document.name)}-documento-inteiro.txt`,
      combinePagesText(document.pages)
    );
  };

  const handleDownloadSelectedBlock = () => {
    if (!currentPlan.features.txtByBlock) {
      setVoiceMessage(formatPlanRestriction(currentPlan, "Download TXT por bloco"));
      return;
    }

    if (!document || !selectedBlock || !selectedBlockPages.length) {
      return;
    }

    downloadTextFile(
      `${safeFileName(document.name)}-${safeFileName(selectedBlock.name, "bloco")}.txt`,
      combinePagesText(selectedBlockPages)
    );
  };

  const handleMp3Generation = async (
    scope: "document" | "page" | "block" = "document"
  ) => {
    if (!document) {
      return;
    }

    if (!currentPlan.features.mp3) {
      setMp3Message(formatPlanRestriction(currentPlan, "MP3 com voz neural"));
      return;
    }

    const target = getMp3Target(scope, document, selectedPage, selectedBlock, selectedBlockPages);

    if (!target.pages.length) {
      setMp3Message("Não há texto disponível para gerar MP3 nesse trecho.");
      return;
    }

    setMp3Message(`Preparando MP3 neural de ${target.label}...`);
    trackProductEvent("mp3_generation_requested", {
      scope,
      plan: currentPlan.id,
      voiceMode
    });

    try {
      await requestMp3Generation(document, voiceMode, target.pages, target.title);
      setMp3Message("MP3 gerado com sucesso.");
    } catch (caughtError) {
      setMp3Message(
        caughtError instanceof Error
          ? caughtError.message
          : "Não foi possível gerar o MP3 agora."
      );
    }
  };

  const handleCleanText = () => {
    if (!document) {
      return;
    }

    const cleanedPages = document.pages.map((page) => ({
      ...page,
      text: cleanExtractedTextForStudy(page.text),
      warning: page.warning
        ? `${page.warning} OCR pode conter erros dependendo da qualidade do PDF.`
        : "Texto limpo automaticamente. OCR pode conter erros dependendo da qualidade do PDF."
    }));
    const nextDocument: ReaderDocument = {
      ...document,
      pages: cleanedPages,
      totalChars: getTotalChars(cleanedPages),
      processedAt: new Date().toISOString()
    };

    persistDocument(nextDocument);
    trackProductEvent("text_cleaned", {
      pages: cleanedPages.length,
      plan: currentPlan.id
    });
    setVoiceMessage(
      "Texto limpo. Revise trechos importantes: OCR pode conter erros dependendo da qualidade do PDF."
    );
  };

  const handleVoiceModeChange = (nextMode: VoiceMode) => {
    speech.stop();

    if (nextMode === "neural" && !currentPlan.features.neuralVoice) {
      setVoiceMode("browser");
      setVoiceMessage(formatPlanRestriction(currentPlan, "Voz neural"));
      return;
    }

    setVoiceMode(nextMode);

    const nextStatus = getVoiceModeStatus(nextMode, voiceModeStatuses);
    setVoiceMessage(
      nextStatus.available
        ? nextMode === "browser"
          ? "Modo local ativo. Escolha abaixo uma das vozes disponíveis no seu navegador."
          : "Modo neural premium selecionado. Use os botões de MP3 para gerar áudio no servidor."
        : nextStatus.detail
    );
  };

  const ensureLocalVoice = useCallback(() => {
    if (!isLocalVoiceActive) {
      setVoiceMessage(activeVoiceModeStatus.detail);
      return false;
    }

    return true;
  }, [activeVoiceModeStatus.detail, isLocalVoiceActive]);

  const startReadingPage = useCallback(
    (pageIndex: number) => {
      if (!ensureLocalVoice()) {
        return;
      }

      speech.playPage(pageIndex);
    },
    [ensureLocalVoice, speech.playPage]
  );

  const readDocument = () => {
    if (!ensureLocalVoice()) {
      return;
    }

    speech.playDocument();
  };

  const readSelectedBlock = () => {
    if (!currentPlan.features.studyBlocks) {
      setVoiceMessage(formatPlanRestriction(currentPlan, "Leitura por bloco"));
      return;
    }

    if (!selectedBlock) {
      setVoiceMessage("Escolha um bloco na aba Dividir documento para ouvir só esse trecho.");
      return;
    }

    if (!ensureLocalVoice()) {
      return;
    }

    const indices = findPageIndexRange(pages, selectedBlock);

    if (!indices) {
      setVoiceMessage(
        "Esse bloco ainda não tem texto processado. Processe o bloco ou ajuste as páginas."
      );
      return;
    }

    speech.playRange(indices.startIndex, indices.endIndex);
  };

  const saveBookmark = () => {
    if (!currentPlan.features.bookmarks) {
      setVoiceMessage(formatPlanRestriction(currentPlan, "Salvar onde parou"));
      return;
    }

    if (!document || !pages.length) {
      return;
    }

    const activePage =
      pages[speech.status === "playing" || speech.status === "paused"
        ? speech.currentPageIndex
        : selectedPageIndex] ?? pages[0];
    const nextDocument: ReaderDocument = {
      ...document,
      lastRead: {
        pageNumber: activePage.pageNumber,
        savedAt: new Date().toISOString()
      }
    };
    persistDocument(nextDocument);
  };

  const continueFromBookmark = () => {
    if (!currentPlan.features.bookmarks) {
      setVoiceMessage(formatPlanRestriction(currentPlan, "Continuar de onde parou"));
      return;
    }

    if (!document?.lastRead) {
      setVoiceMessage("Ainda não há um ponto salvo neste documento.");
      return;
    }

    const pageIndex = findPageIndex(pages, document.lastRead.pageNumber);

    if (pageIndex < 0) {
      setVoiceMessage("O ponto salvo não está disponível nas páginas processadas.");
      return;
    }

    setSelectedPageIndex(pageIndex);

    if (!ensureLocalVoice()) {
      return;
    }

    speech.playRange(pageIndex, pages.length - 1);
  };

  const addStudyBlock = () => {
    if (!currentPlan.features.studyBlocks) {
      setVoiceMessage(formatPlanRestriction(currentPlan, "Blocos e módulos"));
      return;
    }

    if (!document) {
      return;
    }

    const range = normalizePageRange(blockStartPage, blockEndPage, sourceTotalPages);
    const nextBlock: StudyBlock = {
      id: crypto.randomUUID(),
      name: blockName.trim() || `Bloco ${studyBlocks.length + 1}`,
      startPage: range.startPage,
      endPage: range.endPage,
      createdAt: new Date().toISOString()
    };
    const nextBlocks = [...studyBlocks, nextBlock].sort(
      (a, b) => a.startPage - b.startPage || a.endPage - b.endPage
    );

    persistDocument({
      ...document,
      studyBlocks: nextBlocks,
      processedAt: new Date().toISOString()
    });
    setSelectedBlockId(nextBlock.id);
    setBlockName("");
  };

  const removeStudyBlock = (blockId: string) => {
    if (!document) {
      return;
    }

    const nextBlocks = studyBlocks.filter((block) => block.id !== blockId);
    persistDocument({
      ...document,
      studyBlocks: nextBlocks,
      processedAt: new Date().toISOString()
    });

    if (selectedBlockId === blockId) {
      setSelectedBlockId(nextBlocks[0]?.id ?? "");
    }
  };

  const selectStudyBlock = (block: StudyBlock) => {
    setSelectedBlockId(block.id);
    setOcrStartPage(block.startPage);
    setOcrEndPage(block.endPage);
    setBlockStartPage(block.startPage);
    setBlockEndPage(block.endPage);
    const pageIndex = findPageIndex(pages, block.startPage);

    if (pageIndex >= 0) {
      setSelectedPageIndex(pageIndex);
    }
  };

  const processSelectedBlock = () => {
    if (!currentPlan.features.fullOcr || !currentPlan.features.studyBlocks) {
      setError(formatPlanRestriction(currentPlan, "OCR completo por bloco"));
      return;
    }

    if (!selectedBlock) {
      setError("Crie ou selecione um bloco antes de processar.");
      return;
    }

    void processCompleteRange(
      {
        startPage: selectedBlock.startPage,
        endPage: selectedBlock.endPage
      },
      selectedBlock.name
    );
  };

  const canUseSourcePdf = Boolean(document?.sourceType === "pdf" && sourceFileRef.current);
  const progressPercent = Math.round((progress.progress ?? 0) * 100);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <section>
          <div className="mb-4 inline-flex items-center rounded-full border border-real-100 bg-white/70 px-3 py-1 text-sm font-medium text-real-700 shadow-sm backdrop-blur">
            REAL Reader · V1.3 Comercial
          </div>
          <h1 className="max-w-3xl text-4xl font-black tracking-tight text-ink sm:text-6xl">
            Estude PDFs longos com limite por plano.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-700">
            Comece grátis com voz local. Assine Premium para blocos, OCR completo,
            voz neural e MP3 real quando as chaves estiverem configuradas.
          </p>
        </section>

        <section className="rounded-3xl border border-white/80 bg-white/70 p-5 shadow-soft backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-real-600">
            Plano atual: {currentPlan.name}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-700">
            <FeaturePill label={`${currentPlan.maxPagesPerPdf} págs/PDF`} />
            <FeaturePill label={isPremiumPlan ? "Blocos" : "Sem blocos"} />
            <FeaturePill label={isPremiumPlan ? "Voz neural" : "Voz local"} />
            <FeaturePill label={isPremiumPlan ? "MP3" : "Sem MP3"} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href="/pricing"
              className="rounded-full bg-real-600 px-4 py-2 text-sm font-black text-white transition hover:bg-real-700"
            >
              Ver planos
            </a>
            <a
              href="/login"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50"
            >
              Login
            </a>
            <a
              href="/minha-voz"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50"
            >
              Minha voz
            </a>
            <a
              href="/dashboard"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50"
            >
              Dashboard
            </a>
          </div>
        </section>
      </header>

      <LearningWorkspace
        history={history}
        currentDocument={document}
        plan={currentPlan}
        onAddContent={() => fileInputRef.current?.click()}
      />

      <div className="grid flex-1 gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-6">
          <section
            className="rounded-3xl border border-dashed border-real-200 bg-white/75 p-5 shadow-soft backdrop-blur"
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,image/png,image/jpeg,image/webp,image/bmp"
              className="hidden"
              onChange={handleInputChange}
            />
            <div className="rounded-2xl bg-gradient-to-br from-real-600 to-real-900 p-5 text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-real-100">
                Enviar arquivo
              </p>
              <p className="mt-3 text-2xl font-black">
                Arraste aqui ou escolha um PDF/imagem.
              </p>
              <p className="mt-3 text-sm leading-6 text-real-50">
                O modo rápido é o padrão. OCR completo só roda por intervalo ou
                bloco, para não travar apostilas grandes.
              </p>
              <button
                type="button"
                className="mt-5 w-full rounded-2xl bg-white px-4 py-3 font-bold text-real-700 transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
              >
                {isProcessing ? "Processando..." : "Escolher arquivo"}
              </button>
            </div>

            <ProgressCard
              progress={progress}
              percent={progressPercent}
              cancelRequested={cancelRequested}
              onCancel={
                isProcessing && canCancelProcessing ? handleCancelProcessing : undefined
              }
            />

            {error ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                {error}
              </div>
            ) : null}
          </section>

          <section className="rounded-3xl border border-white/80 bg-white/75 p-5 shadow-soft backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Histórico local
                </p>
                <h2 className="mt-1 text-xl font-black">Arquivos recentes</h2>
              </div>
              {history.length ? (
                <button
                  type="button"
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                  onClick={handleClearHistory}
                >
                  Limpar
                </button>
              ) : null}
            </div>

            <div className="mt-4 space-y-3">
              {history.length ? (
                history.map((record) => (
                  <button
                    key={record.id}
                    type="button"
                    className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-real-200 hover:shadow-md"
                    onClick={() => handleLoadFromHistory(record)}
                  >
                    <p className="truncate font-bold text-ink">{record.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {record.pages.length} pág. · {formatBytes(record.size)} ·{" "}
                      {new Date(record.processedAt).toLocaleString("pt-BR")}
                    </p>
                    {record.studyBlocks?.length ? (
                      <p className="mt-1 text-xs font-bold text-real-700">
                        {record.studyBlocks.length} bloco(s) salvo(s)
                      </p>
                    ) : null}
                  </button>
                ))
              ) : (
                <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                  Os arquivos processados aparecem aqui e ficam salvos neste
                  navegador.
                </p>
              )}
            </div>
          </section>
        </aside>

        <section className="min-w-0 rounded-3xl border border-white/80 bg-white/80 p-5 shadow-soft backdrop-blur sm:p-6">
          {document ? (
            <div className="space-y-6">
              <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-real-600">
                    Documento processado · {extractionModeLabel(document.extractionMode)}
                  </p>
                  <h2 className="mt-2 break-words text-3xl font-black text-ink">
                    {document.name}
                  </h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    <Metric label="Páginas" value={document.pages.length} />
                    <Metric label="Palavras" value={summary?.words ?? 0} />
                    <Metric label="Texto direto" value={summary?.textPages ?? 0} />
                    <Metric label="OCR" value={summary?.ocrPages ?? 0} />
                    <Metric label="Direto + OCR" value={summary?.combinedPages ?? 0} />
                  </div>
                </div>

                <StudyActions
                  hasText={document.totalChars > 0}
                  hasBookmark={Boolean(document.lastRead)}
                  canUseBookmarks={currentPlan.features.bookmarks}
                  canUseBlocks={currentPlan.features.studyBlocks}
                  canUseMp3={currentPlan.features.mp3}
                  canUseBlockTxt={currentPlan.features.txtByBlock}
                  selectedBlock={selectedBlock}
                  selectedBlockPages={selectedBlockPages}
                  mp3Message={mp3Message}
                  voiceMessage={voiceMessage}
                  onReadDocument={readDocument}
                  onReadCurrentPage={() => startReadingPage(selectedPageIndex)}
                  onReadBlock={readSelectedBlock}
                  onSaveBookmark={saveBookmark}
                  onContinueBookmark={continueFromBookmark}
                  onDownloadText={handleDownloadText}
                  onDownloadBlock={handleDownloadSelectedBlock}
                  onGenerateMp3={handleMp3Generation}
                  onCleanText={handleCleanText}
                />
              </div>

              <PlanStatusCard
                planName={currentPlan.name}
                maxPages={currentPlan.maxPagesPerPdf}
                sourceTotalPages={sourceTotalPages}
                isPremium={isPremiumPlan}
              />

              <LastReadCard bookmark={document.lastRead} />

              <ReaderControls
                speech={speech}
                selectedPageIndex={selectedPageIndex}
                setSelectedPageIndex={setSelectedPageIndex}
                pages={pages}
                voiceMode={voiceMode}
                voiceModeStatuses={voiceModeStatuses}
                canUseLocalVoice={isLocalVoiceActive}
                onVoiceModeChange={handleVoiceModeChange}
                onStartReading={startReadingPage}
              />

              {summary?.emptyPages ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                  {summary.emptyPages} página(s) ficaram sem texto. Use OCR
                  completo por intervalo ou bloco para tentar recuperar melhor.
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2 rounded-3xl border border-slate-200 bg-white p-2">
                <TabButton
                  active={activeTab === "reader"}
                  label="Leitor"
                  onClick={() => setActiveTab("reader")}
                />
                <TabButton
                  active={activeTab === "split"}
                  label="Dividir documento"
                  onClick={() => setActiveTab("split")}
                />
              </div>

              {activeTab === "reader" ? (
                <>
                  <IntervalProcessingPanel
                    sourceTotalPages={sourceTotalPages}
                    range={ocrRange}
                    startPage={ocrStartPage}
                    endPage={ocrEndPage}
                    quality={ocrQuality}
                    pageCount={ocrPageCount}
                    estimatedTime={estimatedOcrTime}
                    canProcess={
                      currentPlan.features.fullOcr && canUseSourcePdf && !isProcessing
                    }
                    isPdf={document.sourceType === "pdf"}
                    hasSourceFile={Boolean(sourceFileRef.current)}
                    restrictionMessage={
                      currentPlan.features.fullOcr
                        ? undefined
                        : formatPlanRestriction(currentPlan, "OCR completo")
                    }
                    onStartPageChange={setOcrStartPage}
                    onEndPageChange={setOcrEndPage}
                    onQualityChange={setOcrQuality}
                    onProcess={() =>
                      void processCompleteRange(ocrRange, `páginas ${ocrRange.startPage}-${ocrRange.endPage}`)
                    }
                  />

                  <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)]">
                    <PageList
                      pages={pages}
                      selectedPageIndex={selectedPageIndex}
                      onSelect={(index) => {
                        speech.stop();
                        setSelectedPageIndex(index);
                      }}
                      currentPageIndex={speech.currentPageIndex}
                      isPlaying={speech.status === "playing"}
                    />

                    <PageTextPanel
                      selectedPage={selectedPage}
                      selectedPageIndex={selectedPageIndex}
                      canRead={Boolean(selectedPage?.text) && isLocalVoiceActive}
                      onRead={startReadingPage}
                    />
                  </div>
                </>
              ) : (
                currentPlan.features.studyBlocks ? (
                  <DivideDocumentTab
                    blocks={studyBlocks}
                    selectedBlock={selectedBlock}
                    blockName={blockName}
                    blockStartPage={blockStartPage}
                    blockEndPage={blockEndPage}
                    sourceTotalPages={sourceTotalPages}
                    canProcessBlock={
                      currentPlan.features.fullOcr && canUseSourcePdf && !isProcessing
                    }
                    selectedBlockPages={selectedBlockPages}
                    onBlockNameChange={setBlockName}
                    onBlockStartPageChange={setBlockStartPage}
                    onBlockEndPageChange={setBlockEndPage}
                    onAddBlock={addStudyBlock}
                    onSelectBlock={selectStudyBlock}
                    onRemoveBlock={removeStudyBlock}
                    onProcessSelectedBlock={processSelectedBlock}
                    onReadSelectedBlock={readSelectedBlock}
                    onDownloadSelectedBlock={handleDownloadSelectedBlock}
                  />
                ) : (
                  <UpgradePanel message={formatPlanRestriction(currentPlan, "Blocos e módulos")} />
                )
              )}
            </div>
          ) : (
            <EmptyState />
          )}
        </section>
      </div>
    </main>
  );
}

function FeaturePill({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 font-semibold">
      {label}
    </div>
  );
}

function ProgressCard({
  progress,
  percent,
  cancelRequested,
  onCancel
}: {
  progress: ProcessingProgress;
  percent: number;
  cancelRequested: boolean;
  onCancel?: () => void;
}) {
  const hasProgress = progress.phase !== "idle";

  return (
    <div className="mt-4 rounded-2xl bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-ink">{progress.message}</p>
          {progress.currentPage !== undefined && progress.totalPages ? (
            <p className="mt-1 text-xs text-slate-500">
              Processando página {progress.currentPage} de {progress.totalPages}
              {progress.sourcePage ? ` · página original ${progress.sourcePage}` : ""}
            </p>
          ) : null}
        </div>
        {hasProgress ? (
          <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-real-700">
            {Math.max(0, Math.min(100, percent))}%
          </span>
        ) : null}
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
        <div
          className="h-full rounded-full bg-real-500 transition-all"
          style={{
            width: hasProgress ? `${Math.max(4, Math.min(100, percent))}%` : "0%"
          }}
        />
      </div>
      {onCancel ? (
        <button
          type="button"
          className="mt-3 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={onCancel}
          disabled={cancelRequested}
        >
          {cancelRequested ? "Cancelando..." : "Cancelar processamento"}
        </button>
      ) : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-2xl font-black text-ink">{value.toLocaleString("pt-BR")}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
    </div>
  );
}

function PlanStatusCard({
  planName,
  maxPages,
  sourceTotalPages,
  isPremium
}: {
  planName: string;
  maxPages: number;
  sourceTotalPages: number;
  isPremium: boolean;
}) {
  const overLimit = sourceTotalPages > maxPages;

  return (
    <div className="rounded-2xl border border-real-100 bg-real-50 px-4 py-3 text-sm leading-6 text-real-900">
      <span className="font-black">Plano {planName}:</span> limite de {maxPages}{" "}
      páginas por PDF.
      {overLimit ? (
        <span>
          {" "}
          Este PDF tem {sourceTotalPages} páginas; nesta sessão foram processadas
          apenas as primeiras {maxPages}.{" "}
        </span>
      ) : null}
      {!isPremium ? (
        <a href="/pricing" className="ml-1 font-black underline">
          Ver Premium
        </a>
      ) : null}
    </div>
  );
}

function UpgradePanel({ message }: { message: string }) {
  return (
    <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">
        Recurso Premium
      </p>
      <h3 className="mt-2 text-2xl font-black">Upgrade necessário</h3>
      <p className="mt-2 leading-7">{message}</p>
      <a
        href="/pricing"
        className="mt-4 inline-flex rounded-2xl bg-amber-600 px-5 py-3 font-black text-white transition hover:bg-amber-700"
      >
        Ver planos
      </a>
    </section>
  );
}

function StudyActions({
  hasText,
  hasBookmark,
  canUseBookmarks,
  canUseBlocks,
  canUseMp3,
  canUseBlockTxt,
  selectedBlock,
  selectedBlockPages,
  mp3Message,
  voiceMessage,
  onReadDocument,
  onReadCurrentPage,
  onReadBlock,
  onSaveBookmark,
  onContinueBookmark,
  onDownloadText,
  onDownloadBlock,
  onGenerateMp3,
  onCleanText
}: {
  hasText: boolean;
  hasBookmark: boolean;
  canUseBookmarks: boolean;
  canUseBlocks: boolean;
  canUseMp3: boolean;
  canUseBlockTxt: boolean;
  selectedBlock: StudyBlock | null;
  selectedBlockPages: ReaderPage[];
  mp3Message: string;
  voiceMessage: string;
  onReadDocument: () => void;
  onReadCurrentPage: () => void;
  onReadBlock: () => void;
  onSaveBookmark: () => void;
  onContinueBookmark: () => void;
  onDownloadText: () => void;
  onDownloadBlock: () => void;
  onGenerateMp3: (scope?: "document" | "page" | "block") => void;
  onCleanText: () => void;
}) {
  return (
    <div className="rounded-3xl bg-ink p-4 text-white">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-real-100">
        Estudo
      </p>
      <div className="mt-4 grid gap-2">
        <button
          type="button"
          className="rounded-2xl bg-white px-4 py-3 font-bold text-ink transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onReadDocument}
          disabled={!hasText}
        >
          Ler documento inteiro
        </button>
        <button
          type="button"
          className="rounded-2xl border border-white/20 px-4 py-3 text-left font-bold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onReadCurrentPage}
          disabled={!hasText}
        >
          Ler somente página atual
        </button>
        <button
          type="button"
          className="rounded-2xl border border-white/20 px-4 py-3 text-left font-bold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onReadBlock}
          disabled={!canUseBlocks || !selectedBlock || !selectedBlockPages.length}
        >
          Ler bloco selecionado
        </button>
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            className="rounded-2xl bg-real-500 px-4 py-3 font-bold text-white transition hover:bg-real-600 disabled:opacity-50"
            onClick={onSaveBookmark}
            disabled={!hasText || !canUseBookmarks}
          >
            Salvar onde parei
          </button>
          <button
            type="button"
            className="rounded-2xl bg-real-500 px-4 py-3 font-bold text-white transition hover:bg-real-600 disabled:opacity-50"
            onClick={onContinueBookmark}
            disabled={!hasBookmark || !canUseBookmarks}
          >
            Continuar de onde parei
          </button>
        </div>
        <button
          type="button"
          className="rounded-2xl border border-white/20 px-4 py-3 font-bold text-white transition hover:bg-white/10"
          onClick={onDownloadText}
        >
          Baixar TXT do documento inteiro
        </button>
        <button
          type="button"
          className="rounded-2xl border border-white/20 px-4 py-3 font-bold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onDownloadBlock}
          disabled={!canUseBlockTxt || !selectedBlock || !selectedBlockPages.length}
        >
          Baixar TXT do bloco selecionado
        </button>
        <button
          type="button"
          className="rounded-2xl border border-white/20 px-4 py-3 font-bold text-white transition hover:bg-white/10 disabled:opacity-50"
          onClick={onCleanText}
          disabled={!hasText}
        >
          Limpar texto
        </button>
        <div className="grid gap-2 sm:grid-cols-3">
          <button
            type="button"
            className="rounded-2xl bg-white/10 px-3 py-3 text-sm font-bold text-white transition hover:bg-white/20 disabled:opacity-50"
            onClick={() => onGenerateMp3("document")}
            disabled={!hasText || !canUseMp3}
          >
            MP3 documento
          </button>
          <button
            type="button"
            className="rounded-2xl bg-white/10 px-3 py-3 text-sm font-bold text-white transition hover:bg-white/20 disabled:opacity-50"
            onClick={() => onGenerateMp3("page")}
            disabled={!hasText || !canUseMp3}
          >
            MP3 página
          </button>
          <button
            type="button"
            className="rounded-2xl bg-white/10 px-3 py-3 text-sm font-bold text-white transition hover:bg-white/20 disabled:opacity-50"
            onClick={() => onGenerateMp3("block")}
            disabled={!hasText || !canUseMp3 || !selectedBlockPages.length}
          >
            MP3 bloco
          </button>
        </div>
      </div>
      <p className="mt-4 text-xs leading-5 text-real-100">
        MP3 real usa voz neural no servidor. Se ElevenLabs ou login Premium não
        estiverem configurados, o app avisa em vez de fingir geração.
      </p>
      {voiceMessage ? (
        <p className="mt-3 rounded-2xl bg-white/10 p-3 text-sm leading-6 text-real-50">
          {voiceMessage}
        </p>
      ) : null}
      {mp3Message ? (
        <p className="mt-3 rounded-2xl bg-white/10 p-3 text-sm leading-6 text-real-50">
          {mp3Message}
        </p>
      ) : null}
    </div>
  );
}

function LastReadCard({
  bookmark
}: {
  bookmark: ReaderDocument["lastRead"];
}) {
  return (
    <div className="rounded-2xl border border-real-100 bg-real-50 px-4 py-3 text-sm text-real-900">
      <span className="font-black">Último ponto lido:</span>{" "}
      {bookmark
        ? `página ${bookmark.pageNumber} · salvo em ${new Date(
            bookmark.savedAt
          ).toLocaleString("pt-BR")}`
        : "nenhum ponto salvo ainda."}
    </div>
  );
}

function ReaderControls({
  speech,
  selectedPageIndex,
  setSelectedPageIndex,
  pages,
  voiceMode,
  voiceModeStatuses,
  canUseLocalVoice,
  onVoiceModeChange,
  onStartReading
}: {
  speech: ReturnType<typeof useSpeechReader>;
  selectedPageIndex: number;
  setSelectedPageIndex: (index: number) => void;
  pages: ReaderPage[];
  voiceMode: VoiceMode;
  voiceModeStatuses: VoiceModeStatus[];
  canUseLocalVoice: boolean;
  onVoiceModeChange: (mode: VoiceMode) => void;
  onStartReading: (pageIndex: number) => void;
}) {
  const canRead = Boolean(pages[selectedPageIndex]?.text) && canUseLocalVoice;

  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
          Modo de voz
        </p>
        <div className="mt-3 grid gap-3 lg:grid-cols-3">
          {voiceModeOptions.map((option) => {
            const status = getVoiceModeStatus(option.mode, voiceModeStatuses);
            const selected = option.mode === voiceMode;

            return (
              <button
                key={option.mode}
                type="button"
                aria-pressed={selected}
                className={[
                  "rounded-2xl border p-4 text-left transition",
                  selected
                    ? "border-real-400 bg-real-50 ring-2 ring-real-100"
                    : "border-slate-200 hover:border-real-200 hover:bg-slate-50"
                ].join(" ")}
                onClick={() => onVoiceModeChange(option.mode)}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-black text-ink">{option.label}</span>
                  <span
                    className={[
                      "rounded-full px-2 py-0.5 text-[11px] font-bold",
                      status.available
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-600"
                    ].join(" ")}
                  >
                    {status.available ? "disponível" : "em preparação"}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-5 text-slate-600">
                  {option.description}
                </p>
                <p className="mt-2 text-xs leading-5 text-slate-500">{status.detail}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 border-t border-slate-100 pt-4 lg:grid-cols-[1fr_1fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Controles de leitura
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-full bg-real-600 px-4 py-2 font-bold text-white transition hover:bg-real-700 disabled:opacity-50"
              onClick={() => onStartReading(selectedPageIndex)}
              disabled={!canRead}
            >
              Ouvir
            </button>
            <button
              type="button"
              className="rounded-full border border-slate-200 px-4 py-2 font-bold transition hover:bg-slate-50 disabled:opacity-50"
              onClick={speech.pause}
              disabled={speech.status !== "playing" || !canUseLocalVoice}
            >
              Pausar
            </button>
            <button
              type="button"
              className="rounded-full border border-slate-200 px-4 py-2 font-bold transition hover:bg-slate-50 disabled:opacity-50"
              onClick={speech.resume}
              disabled={speech.status !== "paused" || !canUseLocalVoice}
            >
              Continuar
            </button>
            <button
              type="button"
              className="rounded-full border border-slate-200 px-4 py-2 font-bold transition hover:bg-slate-50"
              onClick={speech.stop}
            >
              Parar
            </button>
            <button
              type="button"
              className="rounded-full border border-slate-200 px-4 py-2 font-bold transition hover:bg-slate-50 disabled:opacity-50"
              onClick={() => {
                speech.previousPage();
                setSelectedPageIndex(Math.max(selectedPageIndex - 1, 0));
              }}
              disabled={!canUseLocalVoice}
            >
              Voltar
            </button>
            <button
              type="button"
              className="rounded-full border border-slate-200 px-4 py-2 font-bold transition hover:bg-slate-50 disabled:opacity-50"
              onClick={() => {
                speech.nextPage();
                setSelectedPageIndex(
                  Math.min(selectedPageIndex + 1, pages.length - 1)
                );
              }}
              disabled={!canUseLocalVoice}
            >
              Avançar
            </button>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Status: <span className="font-bold">{statusLabel(speech.status)}</span>
          </p>
        </div>

        {voiceMode === "browser" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-bold text-slate-700">
                Velocidade: {speech.rate.toFixed(1)}x
              </span>
              <input
                type="range"
                min="0.6"
                max="1.8"
                step="0.1"
                value={speech.rate}
                onChange={(event) => speech.setRate(Number(event.target.value))}
                className="mt-3 w-full accent-real-600"
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-700">Voz local</span>
              <select
                value={speech.voiceURI}
                onChange={(event) => speech.setVoiceURI(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-real-200 transition focus:ring-4"
              >
                {speech.voices.length ? (
                  speech.voices.map((voice) => (
                    <option key={voice.voiceURI} value={voice.voiceURI}>
                      {voice.name} · {voice.lang}
                    </option>
                  ))
                ) : (
                  <option value="">Voz padrão do navegador</option>
                )}
              </select>
            </label>

            <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 sm:col-span-2">
              <input
                type="checkbox"
                checked={speech.autoAdvance}
                onChange={(event) => speech.setAutoAdvance(event.target.checked)}
                className="h-4 w-4 accent-real-600"
              />
              Avançar automaticamente para a próxima página
            </label>
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            Este modo não usa a voz local como substituta. Ele será ativado somente
            quando existir um provedor correspondente e autorizado.
          </div>
        )}
      </div>
    </section>
  );
}

function IntervalProcessingPanel({
  sourceTotalPages,
  range,
  startPage,
  endPage,
  quality,
  pageCount,
  estimatedTime,
  canProcess,
  isPdf,
  hasSourceFile,
  restrictionMessage,
  onStartPageChange,
  onEndPageChange,
  onQualityChange,
  onProcess
}: {
  sourceTotalPages: number;
  range: PageRange;
  startPage: number;
  endPage: number;
  quality: OcrQuality;
  pageCount: number;
  estimatedTime: string;
  canProcess: boolean;
  isPdf: boolean;
  hasSourceFile: boolean;
  restrictionMessage?: string;
  onStartPageChange: (page: number) => void;
  onEndPageChange: (page: number) => void;
  onQualityChange: (quality: OcrQuality) => void;
  onProcess: () => void;
}) {
  return (
    <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">
            OCR completo por intervalo
          </p>
          <h3 className="mt-1 text-2xl font-black text-amber-950">
            Escolha só as páginas que precisa agora.
          </h3>
          <p className="mt-2 text-sm leading-6 text-amber-900">
            OCR completo é mais lento, mas lê melhor slides, prints, tabelas e
            texto dentro de imagens. A V1.3 não roda OCR completo no documento
            inteiro automaticamente.
          </p>
        </div>
        <div className="rounded-2xl bg-white/70 p-4 text-sm text-amber-950">
          <p>
            <span className="font-black">{pageCount}</span> página(s)
            selecionada(s)
          </p>
          <p>
            Tempo estimado: <span className="font-black">{estimatedTime}</span>
          </p>
          <p className="text-xs text-amber-800">
            Intervalo normalizado: {range.startPage} a {range.endPage} de{" "}
            {sourceTotalPages}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
        <NumberField
          label="Página inicial"
          value={startPage}
          min={1}
          max={sourceTotalPages}
          onChange={onStartPageChange}
        />
        <NumberField
          label="Página final"
          value={endPage}
          min={1}
          max={sourceTotalPages}
          onChange={onEndPageChange}
        />
        <label className="block">
          <span className="text-sm font-bold text-amber-950">Qualidade</span>
          <select
            value={quality}
            onChange={(event) => onQualityChange(event.target.value as OcrQuality)}
            className="mt-2 w-full rounded-2xl border border-amber-200 bg-white px-3 py-3 text-sm font-bold outline-none ring-amber-100 transition focus:ring-4"
          >
            <option value="normal">Normal · mais rápido</option>
            <option value="high">Alta qualidade · mais lento</option>
          </select>
        </label>
        <button
          type="button"
          className="rounded-2xl bg-amber-600 px-4 py-3 font-black text-white transition hover:-translate-y-0.5 hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onProcess}
          disabled={!canProcess}
        >
          Processar intervalo com OCR completo
        </button>
      </div>

      {!isPdf ? (
        <p className="mt-3 rounded-2xl bg-white/70 p-3 text-sm text-amber-900">
          Intervalos com OCR completo são usados para PDFs. Imagens já são
          processadas como uma página única.
        </p>
      ) : restrictionMessage ? (
        <p className="mt-3 rounded-2xl bg-white/70 p-3 text-sm text-amber-900">
          {restrictionMessage}
        </p>
      ) : !hasSourceFile ? (
        <p className="mt-3 rounded-2xl bg-white/70 p-3 text-sm text-amber-900">
          Este item veio do histórico. Reenvie o PDF original para reprocessar
          intervalos com OCR completo.
        </p>
      ) : null}
    </section>
  );
}

function DivideDocumentTab({
  blocks,
  selectedBlock,
  blockName,
  blockStartPage,
  blockEndPage,
  sourceTotalPages,
  canProcessBlock,
  selectedBlockPages,
  onBlockNameChange,
  onBlockStartPageChange,
  onBlockEndPageChange,
  onAddBlock,
  onSelectBlock,
  onRemoveBlock,
  onProcessSelectedBlock,
  onReadSelectedBlock,
  onDownloadSelectedBlock
}: {
  blocks: StudyBlock[];
  selectedBlock: StudyBlock | null;
  blockName: string;
  blockStartPage: number;
  blockEndPage: number;
  sourceTotalPages: number;
  canProcessBlock: boolean;
  selectedBlockPages: ReaderPage[];
  onBlockNameChange: (value: string) => void;
  onBlockStartPageChange: (page: number) => void;
  onBlockEndPageChange: (page: number) => void;
  onAddBlock: () => void;
  onSelectBlock: (block: StudyBlock) => void;
  onRemoveBlock: (blockId: string) => void;
  onProcessSelectedBlock: () => void;
  onReadSelectedBlock: () => void;
  onDownloadSelectedBlock: () => void;
}) {
  return (
    <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <div className="rounded-3xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
          Criar bloco
        </p>
        <h3 className="mt-1 text-2xl font-black text-ink">
          Dividir documento
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Crie módulos, capítulos ou aulas. Eles ficam salvos no histórico local
          junto com o documento.
        </p>
        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Nome do bloco</span>
            <input
              value={blockName}
              onChange={(event) => onBlockNameChange(event.target.value)}
              placeholder="Ex.: Módulo 1, Capítulo 3, Aula 5"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none ring-real-100 transition focus:ring-4"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField
              label="Página inicial"
              value={blockStartPage}
              min={1}
              max={sourceTotalPages}
              onChange={onBlockStartPageChange}
            />
            <NumberField
              label="Página final"
              value={blockEndPage}
              min={1}
              max={sourceTotalPages}
              onChange={onBlockEndPageChange}
            />
          </div>
          <button
            type="button"
            className="w-full rounded-2xl bg-real-600 px-4 py-3 font-black text-white transition hover:bg-real-700"
            onClick={onAddBlock}
          >
            Salvar bloco no histórico local
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Blocos salvos
            </p>
            <h3 className="mt-1 text-2xl font-black text-ink">
              {blocks.length ? `${blocks.length} bloco(s)` : "Nenhum bloco ainda"}
            </h3>
          </div>
          {selectedBlock ? (
            <p className="rounded-full bg-real-50 px-3 py-1 text-sm font-bold text-real-700">
              Selecionado: {selectedBlock.name}
            </p>
          ) : null}
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {blocks.length ? (
            blocks.map((block) => {
              const selected = selectedBlock?.id === block.id;

              return (
                <button
                  key={block.id}
                  type="button"
                  className={[
                    "rounded-2xl border p-4 text-left transition",
                    selected
                      ? "border-real-300 bg-real-50"
                      : "border-slate-200 hover:border-real-200 hover:bg-slate-50"
                  ].join(" ")}
                  onClick={() => onSelectBlock(block)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-ink">{block.name}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Páginas {block.startPage} a {block.endPage} ·{" "}
                        {getRangePageCount(block)} pág.
                      </p>
                    </div>
                    <span
                      role="button"
                      tabIndex={0}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600 hover:bg-red-50 hover:text-red-700"
                      onClick={(event) => {
                        event.stopPropagation();
                        onRemoveBlock(block.id);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          event.stopPropagation();
                          onRemoveBlock(block.id);
                        }
                      }}
                    >
                      remover
                    </span>
                  </div>
                </button>
              );
            })
          ) : (
            <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 lg:col-span-2">
              Exemplo: crie “Módulo 1” das páginas 1 a 20 e processe apenas esse
              trecho com OCR completo.
            </p>
          )}
        </div>

        <div className="mt-5 rounded-3xl bg-slate-50 p-4">
          <p className="font-black text-ink">Ações do bloco selecionado</p>
          <p className="mt-1 text-sm text-slate-600">
            {selectedBlock
              ? `${selectedBlock.name}: páginas ${selectedBlock.startPage} a ${selectedBlock.endPage}. ${selectedBlockPages.length} página(s) com texto no documento atual.`
              : "Selecione um bloco para processar, ouvir ou baixar só esse trecho."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-full bg-real-600 px-4 py-2 font-bold text-white transition hover:bg-real-700 disabled:opacity-50"
              onClick={onProcessSelectedBlock}
              disabled={!selectedBlock || !canProcessBlock}
            >
              Processar bloco com OCR completo
            </button>
            <button
              type="button"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 font-bold transition hover:bg-slate-50 disabled:opacity-50"
              onClick={onReadSelectedBlock}
              disabled={!selectedBlock || !selectedBlockPages.length}
            >
              Ouvir somente este bloco
            </button>
            <button
              type="button"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 font-bold transition hover:bg-slate-50 disabled:opacity-50"
              onClick={onDownloadSelectedBlock}
              disabled={!selectedBlock || !selectedBlockPages.length}
            >
              Baixar TXT deste bloco
            </button>
          </div>
          {!canProcessBlock ? (
            <p className="mt-3 text-xs leading-5 text-slate-500">
              Para processar um bloco com OCR completo, o PDF original precisa
              estar carregado nesta sessão. Itens vindos só do histórico podem ser
              lidos e baixados, mas não reprocessados.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function PageList({
  pages,
  selectedPageIndex,
  currentPageIndex,
  isPlaying,
  onSelect
}: {
  pages: ReaderPage[];
  selectedPageIndex: number;
  currentPageIndex: number;
  isPlaying: boolean;
  onSelect: (index: number) => void;
}) {
  return (
    <nav className="rounded-3xl border border-slate-200 bg-white p-3">
      <p className="px-2 pb-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
        Páginas
      </p>
      <div className="max-h-[560px] space-y-2 overflow-auto pr-1">
        {pages.map((page, index) => {
          const active = selectedPageIndex === index;
          const reading = isPlaying && currentPageIndex === index;

          return (
            <button
              key={page.pageNumber}
              type="button"
              className={[
                "w-full rounded-2xl border p-3 text-left transition",
                active
                  ? "border-real-200 bg-real-50 text-real-900"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              ].join(" ")}
              onClick={() => onSelect(index)}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-black">Página {page.pageNumber}</span>
                {reading ? (
                  <span className="rounded-full bg-real-600 px-2 py-0.5 text-xs font-bold text-white">
                    lendo
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-xs text-slate-500">{methodLabel(page)}</p>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function PageTextPanel({
  selectedPage,
  selectedPageIndex,
  canRead,
  onRead
}: {
  selectedPage: ReaderPage | null;
  selectedPageIndex: number;
  canRead: boolean;
  onRead: (pageIndex: number) => void;
}) {
  return (
    <article className="min-h-[520px] rounded-3xl border border-slate-200 bg-white p-5">
      {selectedPage ? (
        <>
          <div className="mb-4 flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Página {selectedPage.pageNumber}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {methodLabel(selectedPage)}
              </p>
            </div>
            <button
              type="button"
              className="rounded-full bg-real-50 px-4 py-2 text-sm font-bold text-real-700 transition hover:bg-real-100 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => onRead(selectedPageIndex)}
              disabled={!canRead}
            >
              Ler esta página
            </button>
          </div>

          <pre className="whitespace-pre-wrap break-words font-sans text-base leading-8 text-slate-800">
            {selectedPage.text || "Nenhum texto foi encontrado nesta página."}
          </pre>
        </>
      ) : (
        <div className="flex h-full min-h-[360px] items-center justify-center text-center text-slate-500">
          Selecione uma página para ver o texto extraído.
        </div>
      )}
    </article>
  );
}

function TabButton({
  active,
  label,
  onClick
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={[
        "rounded-2xl px-4 py-3 font-black transition",
        active ? "bg-real-600 text-white" : "text-slate-600 hover:bg-slate-50"
      ].join(" ")}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  onChange
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold outline-none ring-real-100 transition focus:ring-4"
      />
    </label>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[620px] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/60 p-8 text-center">
      <div className="max-w-xl">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-real-50 text-3xl">
          PDF
        </div>
        <h2 className="mt-6 text-3xl font-black text-ink">
          Envie um arquivo para começar.
        </h2>
        <p className="mt-3 text-slate-600">
          Comece pelo modo rápido. Para apostilas grandes, crie intervalos ou
          blocos e rode OCR completo só no trecho que você precisa estudar.
        </p>
      </div>
    </div>
  );
}

function buildProcessingDoneMessage(
  cancelled: boolean,
  totalPages: number,
  maxPages: number,
  planName: string
) {
  if (cancelled) {
    return "Processamento cancelado. Mantive as páginas já concluídas.";
  }

  if (totalPages > maxPages) {
    return `Arquivo aberto no plano ${planName}. Este PDF tem ${totalPages} páginas; processei as primeiras ${maxPages} conforme o limite do plano.`;
  }

  return "Arquivo pronto para leitura no modo rápido.";
}

function getMp3Target(
  scope: "document" | "page" | "block",
  document: ReaderDocument,
  selectedPage: ReaderPage | null,
  selectedBlock: StudyBlock | null,
  selectedBlockPages: ReaderPage[]
) {
  if (scope === "page" && selectedPage) {
    return {
      label: `página ${selectedPage.pageNumber}`,
      title: `${document.name}-pagina-${selectedPage.pageNumber}`,
      pages: [selectedPage]
    };
  }

  if (scope === "block" && selectedBlock) {
    return {
      label: selectedBlock.name,
      title: `${document.name}-${selectedBlock.name}`,
      pages: selectedBlockPages
    };
  }

  return {
    label: "documento inteiro",
    title: document.name,
    pages: document.pages
  };
}

function getSourceType(file: File): SourceType | null {
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    return "pdf";
  }

  if (file.type.startsWith("image/")) {
    return "image";
  }

  return null;
}

function createReaderDocument(
  file: File,
  sourceType: SourceType,
  pages: ReaderPage[],
  extractionMode: ExtractionMode,
  sourceTotalPages: number
): ReaderDocument {
  return {
    id: crypto.randomUUID(),
    name: file.name,
    mimeType: file.type || (sourceType === "pdf" ? "application/pdf" : "image/*"),
    size: file.size,
    sourceType,
    sourceTotalPages,
    extractionMode,
    studyBlocks: [],
    processedAt: new Date().toISOString(),
    totalChars: getTotalChars(pages),
    pages
  };
}

function getSourceTotalPages(document: ReaderDocument | null) {
  return Math.max(1, document?.sourceTotalPages ?? document?.pages.length ?? 1);
}

function getTotalChars(pages: ReaderPage[]) {
  return pages.reduce((sum, page) => sum + page.text.length, 0);
}

function normalizePageRange(startPage: number, endPage: number, totalPages: number) {
  const safeTotal = Math.max(1, totalPages);
  const start = clampPage(startPage, safeTotal);
  const end = clampPage(endPage, safeTotal);

  return {
    startPage: Math.min(start, end),
    endPage: Math.max(start, end)
  };
}

function clampPage(page: number, totalPages: number) {
  const parsedPage = Number.isFinite(page) ? Math.trunc(page) : 1;
  return Math.max(1, Math.min(parsedPage || 1, totalPages));
}

function getRangePageCount(range: PageRange) {
  return Math.max(0, range.endPage - range.startPage + 1);
}

function formatEstimatedOcrTime(pageCount: number, quality: OcrQuality) {
  const secondsPerPage = quality === "high" ? 12 : 7;
  const seconds = Math.max(secondsPerPage, pageCount * secondsPerPage);

  if (seconds < 60) {
    return `~${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return remainingSeconds ? `~${minutes}min ${remainingSeconds}s` : `~${minutes}min`;
}

function mergeDocumentPages(existingPages: ReaderPage[], replacementPages: ReaderPage[]) {
  const byPageNumber = new Map<number, ReaderPage>();

  for (const page of existingPages) {
    byPageNumber.set(page.pageNumber, page);
  }

  for (const page of replacementPages) {
    byPageNumber.set(page.pageNumber, page);
  }

  return [...byPageNumber.values()].sort((a, b) => a.pageNumber - b.pageNumber);
}

function findPageIndex(pages: ReaderPage[], pageNumber: number) {
  return pages.findIndex((page) => page.pageNumber === pageNumber);
}

function findPageIndexRange(pages: ReaderPage[], range: PageRange) {
  const matchingIndexes = pages
    .map((page, index) =>
      page.pageNumber >= range.startPage && page.pageNumber <= range.endPage
        ? index
        : -1
    )
    .filter((index) => index >= 0);

  if (!matchingIndexes.length) {
    return null;
  }

  return {
    startIndex: matchingIndexes[0],
    endIndex: matchingIndexes[matchingIndexes.length - 1]
  };
}

function getPagesInRange(pages: ReaderPage[], range: PageRange) {
  return pages.filter(
    (page) => page.pageNumber >= range.startPage && page.pageNumber <= range.endPage
  );
}

function downloadTextFile(fileName: string, content: string) {
  const blob = new Blob([content], {
    type: "text/plain;charset=utf-8"
  });
  const url = URL.createObjectURL(blob);
  const anchor = window.document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function extractionModeLabel(mode?: ExtractionMode) {
  if (mode === "complete") {
    return "OCR completo";
  }

  if (mode === "mixed") {
    return "modo rápido + trechos com OCR completo";
  }

  return "modo rápido";
}

function methodLabel(page: ReaderPage) {
  if (page.method === "selectable-text") {
    return "Texto direto";
  }

  if (page.method === "selectable-text+ocr") {
    return page.confidence
      ? `Texto direto + OCR · confiança ${Math.round(page.confidence)}%`
      : "Texto direto + OCR";
  }

  if (page.method === "ocr-image") {
    return page.confidence
      ? `OCR · confiança ${Math.round(page.confidence)}%`
      : "OCR";
  }

  if (page.method === "empty") {
    return "Sem texto encontrado";
  }

  return "Erro na extração";
}

function statusLabel(status: ReturnType<typeof useSpeechReader>["status"]) {
  const labels = {
    idle: "parado",
    playing: "lendo",
    paused: "pausado",
    finished: "finalizado",
    unsupported: "não suportado neste navegador"
  };

  return labels[status];
}
