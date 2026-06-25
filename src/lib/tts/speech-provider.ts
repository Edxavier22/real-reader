import { generateElevenLabsSpeech } from "./elevenlabs";

export type SpeechProviderId =
  | "browser"
  | "elevenlabs"
  | "openai"
  | "azure"
  | "google"
  | "polly";

export type SpeechSynthesisRequest = {
  text: string;
  voiceId?: string;
};

export type SpeechSynthesisResult = {
  audio: ArrayBuffer;
  contentType: string;
  providerId: SpeechProviderId;
  voiceId: string;
  modelId?: string;
  characterCount: number;
};

export type SpeechProviderStatus = {
  id: SpeechProviderId;
  label: string;
  configured: boolean;
  implemented: boolean;
  supportsMp3: boolean;
  supportsStreaming: boolean;
  detail: string;
};

export type SpeechProvider = SpeechProviderStatus & {
  synthesize?: (
    request: SpeechSynthesisRequest
  ) => Promise<SpeechSynthesisResult>;
};

const providers: Record<SpeechProviderId, SpeechProvider> = {
  browser: {
    id: "browser",
    label: "Voz local do navegador",
    configured: true,
    implemented: true,
    supportsMp3: false,
    supportsStreaming: true,
    detail:
      "Disponível para leitura em tempo real, mas o navegador não exporta MP3."
  },
  elevenlabs: {
    id: "elevenlabs",
    label: "ElevenLabs",
    configured: Boolean(process.env.ELEVENLABS_API_KEY),
    implemented: true,
    supportsMp3: true,
    supportsStreaming: false,
    detail: process.env.ELEVENLABS_API_KEY
      ? "Configurado para geração neural Premium no servidor."
      : "Configure ELEVENLABS_API_KEY para ativar geração neural."
  },
  openai: {
    id: "openai",
    label: "OpenAI TTS",
    configured: Boolean(process.env.OPENAI_API_KEY),
    implemented: false,
    supportsMp3: true,
    supportsStreaming: false,
    detail:
      "Provider preparado. Adapter será conectado quando entrar na Sprint de expansão de fornecedores."
  },
  azure: {
    id: "azure",
    label: "Azure Speech",
    configured: Boolean(process.env.AZURE_SPEECH_KEY),
    implemented: false,
    supportsMp3: true,
    supportsStreaming: false,
    detail: "Provider preparado para reduzir dependência de fornecedor único."
  },
  google: {
    id: "google",
    label: "Google Cloud Speech",
    configured: Boolean(process.env.GOOGLE_TTS_API_KEY),
    implemented: false,
    supportsMp3: true,
    supportsStreaming: false,
    detail: "Provider preparado para arquitetura multi-cloud."
  },
  polly: {
    id: "polly",
    label: "Amazon Polly",
    configured: Boolean(
      process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ),
    implemented: false,
    supportsMp3: true,
    supportsStreaming: false,
    detail: "Provider preparado para futura estratégia AWS."
  }
};

providers.elevenlabs.synthesize = async ({ text, voiceId }) => {
  const result = await generateElevenLabsSpeech({ text, voiceId });

  return {
    ...result,
    providerId: "elevenlabs"
  };
};

export function getSpeechProvider(providerId: SpeechProviderId) {
  return providers[providerId];
}

export function getSpeechProviderStatuses(): SpeechProviderStatus[] {
  return Object.values(providers).map(
    ({
      id,
      label,
      configured,
      implemented,
      supportsMp3,
      supportsStreaming,
      detail
    }) => ({
      id,
      label,
      configured,
      implemented,
      supportsMp3,
      supportsStreaming,
      detail
    })
  );
}

export function resolvePrimaryNeuralProviderId(): SpeechProviderId {
  const configuredProvider = process.env.SPEECH_PROVIDER || process.env.TTS_PROVIDER;

  if (configuredProvider === "elevenlabs") {
    return "elevenlabs";
  }

  if (configuredProvider === "openai") {
    return "openai";
  }

  if (configuredProvider === "azure") {
    return "azure";
  }

  if (configuredProvider === "google") {
    return "google";
  }

  if (configuredProvider === "polly") {
    return "polly";
  }

  return "elevenlabs";
}

export async function synthesizeSpeech(
  providerId: SpeechProviderId,
  request: SpeechSynthesisRequest
) {
  const provider = getSpeechProvider(providerId);

  if (!provider.configured) {
    throw new Error(`${provider.label} ainda não está configurado.`);
  }

  if (!provider.implemented || !provider.synthesize) {
    throw new Error(
      `${provider.label} está preparado na arquitetura, mas o adapter ainda não foi implementado.`
    );
  }

  return provider.synthesize(request);
}
