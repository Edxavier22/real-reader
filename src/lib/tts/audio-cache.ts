import { createHash } from "node:crypto";
import type { SpeechProviderId } from "./speech-provider";

type CachedAudio = {
  audio: ArrayBuffer;
  contentType: string;
  createdAt: number;
  providerId: SpeechProviderId;
  voiceId: string;
};

type RealReaderGlobal = typeof globalThis & {
  __realReaderAudioCache?: Map<string, CachedAudio>;
};

const CACHE_TTL_MS = 1000 * 60 * 60 * 12;
const MAX_CACHE_ITEMS = 100;

function getCacheStore() {
  const globalStore = globalThis as RealReaderGlobal;
  globalStore.__realReaderAudioCache ??= new Map<string, CachedAudio>();
  return globalStore.__realReaderAudioCache;
}

export function createAudioCacheKey({
  providerId,
  voiceId,
  text
}: {
  providerId: SpeechProviderId;
  voiceId: string;
  text: string;
}) {
  return createHash("sha256")
    .update(providerId)
    .update(":")
    .update(voiceId)
    .update(":")
    .update(text)
    .digest("hex");
}

export function getCachedAudio(cacheKey: string) {
  const cache = getCacheStore();
  const cached = cache.get(cacheKey);

  if (!cached) {
    return null;
  }

  if (Date.now() - cached.createdAt > CACHE_TTL_MS) {
    cache.delete(cacheKey);
    return null;
  }

  return cached;
}

export function setCachedAudio(cacheKey: string, audio: CachedAudio) {
  const cache = getCacheStore();
  cache.set(cacheKey, audio);

  if (cache.size > MAX_CACHE_ITEMS) {
    const oldestKey = cache.keys().next().value as string | undefined;

    if (oldestKey) {
      cache.delete(oldestKey);
    }
  }
}
