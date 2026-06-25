import type { VoiceMode } from "@/lib/reader/types";
import type { VoiceModeStatus } from "@/lib/reader/voice";
import {
  getSpeechProvider,
  getSpeechProviderStatuses,
  resolvePrimaryNeuralProviderId
} from "./speech-provider";

export function getVoiceModeStatuses(): VoiceModeStatus[] {
  const primaryNeuralProvider = getSpeechProvider(resolvePrimaryNeuralProviderId());
  const neuralAvailable =
    primaryNeuralProvider.configured && primaryNeuralProvider.implemented;

  return [
    {
      mode: "browser",
      available: true,
      detail: "Disponível neste navegador."
    },
    {
      mode: "neural",
      available: neuralAvailable,
      detail: neuralAvailable
        ? `${primaryNeuralProvider.label} configurado no servidor para áudio neural Premium.`
        : `${primaryNeuralProvider.label}: ${primaryNeuralProvider.detail}`
    },
    {
      mode: "authorized-clone",
      available: Boolean(process.env.AUTHORIZED_VOICE_ID),
      detail: process.env.AUTHORIZED_VOICE_ID
        ? "Voice ID autorizado configurado. Use somente com consentimento registrado."
        : "Preparado para Minha Voz, mas bloqueado até consentimento, validação e Voice ID."
    }
  ];
}

export function getVoiceModeStatus(mode: VoiceMode) {
  return getVoiceModeStatuses().find((status) => status.mode === mode)!;
}

export { getSpeechProviderStatuses };
