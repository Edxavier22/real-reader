import type { VoiceMode } from "./types";

export type VoiceModeStatus = {
  mode: VoiceMode;
  available: boolean;
  detail: string;
};

export const voiceModeOptions: Array<{
  mode: VoiceMode;
  label: string;
  description: string;
}> = [
  {
    mode: "browser",
    label: "Gratuita/local",
    description: "Usa as vozes instaladas no seu navegador ou sistema."
  },
  {
    mode: "neural",
    label: "Neural premium",
    description: "Gera áudio com provider neural no servidor quando o Premium estiver ativo."
  },
  {
    mode: "authorized-clone",
    label: "Minha voz autorizada",
    description: "Futuro modo pessoal, disponível somente com autorização do dono da voz."
  }
];

export const defaultVoiceModeStatuses: VoiceModeStatus[] = [
  {
    mode: "browser",
    available: true,
    detail: "Disponível neste navegador."
  },
  {
    mode: "neural",
    available: false,
    detail: "Ainda não há um provedor neural conectado."
  },
  {
    mode: "authorized-clone",
    available: false,
    detail: "Este modo ainda não foi implementado."
  }
];

export function getVoiceModeStatus(
  mode: VoiceMode,
  statuses: VoiceModeStatus[]
) {
  return (
    statuses.find((status) => status.mode === mode) ??
    defaultVoiceModeStatuses.find((status) => status.mode === mode)!
  );
}
