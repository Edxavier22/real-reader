import type { VoiceMode } from "@/lib/reader/types";
import type { VoiceModeStatus } from "@/lib/reader/voice";
import { isElevenLabsConfigured } from "./elevenlabs";

export type TtsProvider = {
  name: VoiceMode;
  supportsRealtimeReading: boolean;
  supportsMp3: boolean;
  isConfigured: () => boolean;
};

const browserProvider: TtsProvider = {
  name: "browser",
  supportsRealtimeReading: true,
  supportsMp3: false,
  isConfigured: () => true
};

const neuralProvider: TtsProvider = {
  name: "neural",
  supportsRealtimeReading: false,
  supportsMp3: true,
  isConfigured: () =>
    process.env.TTS_PROVIDER === "elevenlabs" && isElevenLabsConfigured()
};

const authorizedCloneProvider: TtsProvider = {
  name: "authorized-clone",
  supportsRealtimeReading: false,
  supportsMp3: false,
  isConfigured: () => false
};

export const ttsProviders: Record<VoiceMode, TtsProvider> = {
  browser: browserProvider,
  neural: neuralProvider,
  "authorized-clone": authorizedCloneProvider
};

export function getVoiceModeStatuses(): VoiceModeStatus[] {
  const neuralProviderReady = ttsProviders.neural.isConfigured();

  return [
    {
      mode: "browser",
      available: ttsProviders.browser.isConfigured(),
      detail: "Disponível neste navegador."
    },
    {
      mode: "neural",
      available: neuralProviderReady,
      detail: neuralProviderReady
        ? "ElevenLabs configurado no servidor. Disponível para geração Premium de MP3/áudio neural."
        : "Configure TTS_PROVIDER=elevenlabs e ELEVENLABS_API_KEY no servidor para ativar voz neural."
    },
    {
      mode: "authorized-clone",
      available: false,
      detail:
        "Em planejamento. Só poderá ser usado com consentimento explícito do dono da voz."
    }
  ];
}

export function getVoiceModeStatus(mode: VoiceMode) {
  return getVoiceModeStatuses().find((status) => status.mode === mode)!;
}
