"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReaderPage } from "./types";
import { splitIntoSpeechChunks } from "./text";

type ReaderStatus = "idle" | "playing" | "paused" | "finished" | "unsupported";

type PlayPage = (
  pageIndex: number,
  endPageIndex?: number,
  forceAdvance?: boolean,
  startChunkIndex?: number
) => void;

export function useSpeechReader(pages: ReaderPage[]) {
  const [status, setStatus] = useState<ReaderStatus>("idle");
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [rate, setRateState] = useState(1);
  const [voiceURI, setVoiceURI] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [autoAdvance, setAutoAdvanceState] = useState(true);

  const pagesRef = useRef(pages);
  const rateRef = useRef(rate);
  const voiceURIRef = useRef(voiceURI);
  const autoAdvanceRef = useRef(autoAdvance);
  const runIdRef = useRef(0);
  const playPageRef = useRef<PlayPage>(() => undefined);

  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);

  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);

  useEffect(() => {
    voiceURIRef.current = voiceURI;
  }, [voiceURI]);

  useEffect(() => {
    autoAdvanceRef.current = autoAdvance;
  }, [autoAdvance]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setStatus("unsupported");
      return;
    }

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);

      if (!voiceURIRef.current) {
        const portugueseVoice =
          availableVoices.find((voice) => voice.lang?.toLowerCase() === "pt-br") ??
          availableVoices.find((voice) =>
            voice.lang?.toLowerCase().startsWith("pt")
          ) ??
          availableVoices[0];

        if (portugueseVoice) {
          setVoiceURI(portugueseVoice.voiceURI);
        }
      }
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      window.speechSynthesis.cancel();
    };
  }, []);

  const selectedVoice = useMemo(
    () => voices.find((voice) => voice.voiceURI === voiceURI),
    [voiceURI, voices]
  );

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    runIdRef.current += 1;
    window.speechSynthesis.cancel();
    setStatus("idle");
    setCurrentChunkIndex(0);
  }, []);

  const pause = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.pause();
    setStatus("paused");
  }, []);

  const resume = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.resume();
    setStatus("playing");
  }, []);

  useEffect(() => {
    playPageRef.current = (
      requestedPageIndex: number,
      requestedEndPageIndex = pagesRef.current.length - 1,
      forceAdvance = false,
      requestedChunkIndex = 0
    ) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        setStatus("unsupported");
        return;
      }

      const pageIndex = clampIndex(requestedPageIndex, pagesRef.current.length);
      const endPageIndex = Math.max(
        pageIndex,
        clampIndex(requestedEndPageIndex, pagesRef.current.length)
      );
      const page = pagesRef.current[pageIndex];

      if (!page?.text.trim()) {
        const shouldAdvance = forceAdvance || autoAdvanceRef.current;
        const nextReadablePageIndex = shouldAdvance
          ? findNextReadablePageIndex(
              pagesRef.current,
              pageIndex + 1,
              endPageIndex
            )
          : -1;

        if (nextReadablePageIndex >= 0) {
          playPageRef.current(nextReadablePageIndex, endPageIndex, forceAdvance);
          return;
        }

        setStatus("finished");
        return;
      }

      window.speechSynthesis.cancel();
      const runId = runIdRef.current + 1;
      runIdRef.current = runId;
      const chunks = splitIntoSpeechChunks(page.text);
      let chunkIndex = clampIndex(requestedChunkIndex, chunks.length);

      setCurrentPageIndex(pageIndex);
      setCurrentChunkIndex(chunkIndex);

      const speakNextChunk = () => {
        if (runIdRef.current !== runId) {
          return;
        }

        const chunk = chunks[chunkIndex];

        if (!chunk) {
          const nextPageIndex = pageIndex + 1;
          const shouldAdvance = forceAdvance || autoAdvanceRef.current;

          if (shouldAdvance && nextPageIndex <= endPageIndex) {
            const nextReadablePageIndex = findNextReadablePageIndex(
              pagesRef.current,
              nextPageIndex,
              endPageIndex
            );

            if (nextReadablePageIndex >= 0) {
              playPageRef.current(nextReadablePageIndex, endPageIndex, forceAdvance);
              return;
            }
          }

          setStatus("finished");
          return;
        }

        const utterance = new SpeechSynthesisUtterance(chunk);
        const voice =
          window.speechSynthesis
            .getVoices()
            .find((item) => item.voiceURI === voiceURIRef.current) ?? null;

        utterance.lang = voice?.lang ?? "pt-BR";
        utterance.voice = voice;
        utterance.rate = rateRef.current;
        utterance.pitch = 1;
        utterance.onend = () => {
          chunkIndex += 1;
          setCurrentChunkIndex(chunkIndex);
          window.setTimeout(speakNextChunk, 80);
        };
        utterance.onerror = (event) => {
          if (event.error === "interrupted" || event.error === "canceled") {
            return;
          }

          setStatus("idle");
        };

        setStatus("playing");
        window.speechSynthesis.speak(utterance);
      };

      speakNextChunk();
    };
  }, []);

  const playPage = useCallback(
    (pageIndex = currentPageIndex) => {
      playPageRef.current(pageIndex);
    },
    [currentPageIndex]
  );

  const playRange = useCallback((startPageIndex: number, endPageIndex: number) => {
    playPageRef.current(startPageIndex, endPageIndex, true);
  }, []);

  const playDocument = useCallback(() => {
    playPageRef.current(0, pagesRef.current.length - 1, true);
  }, []);

  const nextPage = useCallback(() => {
    if (!pagesRef.current.length) {
      return;
    }

    const next = Math.min(currentPageIndex + 1, pagesRef.current.length - 1);
    setCurrentPageIndex(next);

    if (status === "playing" || status === "paused") {
      playPageRef.current(next);
    }
  }, [currentPageIndex, status]);

  const previousPage = useCallback(() => {
    if (!pagesRef.current.length) {
      return;
    }

    const previous = Math.max(currentPageIndex - 1, 0);
    setCurrentPageIndex(previous);

    if (status === "playing" || status === "paused") {
      playPageRef.current(previous);
    }
  }, [currentPageIndex, status]);

  const rewind15 = useCallback(() => {
    if (!pagesRef.current.length) {
      return;
    }

    playPageRef.current(
      currentPageIndex,
      currentPageIndex,
      false,
      Math.max(currentChunkIndex - 1, 0)
    );
  }, [currentChunkIndex, currentPageIndex]);

  const forward15 = useCallback(() => {
    if (!pagesRef.current.length) {
      return;
    }

    playPageRef.current(
      currentPageIndex,
      currentPageIndex,
      false,
      currentChunkIndex + 1
    );
  }, [currentChunkIndex, currentPageIndex]);

  const setRate = useCallback((nextRate: number) => {
    setRateState(nextRate);
    rateRef.current = nextRate;
  }, []);

  const setAutoAdvance = useCallback((nextAutoAdvance: boolean) => {
    setAutoAdvanceState(nextAutoAdvance);
    autoAdvanceRef.current = nextAutoAdvance;
  }, []);

  return {
    status,
    voices,
    selectedVoice,
    voiceURI,
    setVoiceURI,
    currentPageIndex,
    setCurrentPageIndex,
    currentChunkIndex,
    rate,
    setRate,
    autoAdvance,
    setAutoAdvance,
    playPage,
    playRange,
    playDocument,
    pause,
    resume,
    stop,
    nextPage,
    previousPage,
    rewind15,
    forward15
  };
}

function clampIndex(index: number, length: number) {
  if (!length) {
    return 0;
  }

  return Math.max(0, Math.min(index, length - 1));
}

function findNextReadablePageIndex(
  pages: ReaderPage[],
  startIndex: number,
  endIndex: number
) {
  for (let index = startIndex; index <= endIndex; index += 1) {
    if (pages[index]?.text.trim()) {
      return index;
    }
  }

  return -1;
}
