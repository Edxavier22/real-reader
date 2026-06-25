import type { SpeechProviderId, SpeechProviderStatus } from "./speech-provider";

export type VoiceGender = "male" | "female" | "neutral" | "personal";

export type VoiceCategory =
  | "teacher"
  | "narration"
  | "podcast"
  | "focus"
  | "energy"
  | "news"
  | "story"
  | "kids"
  | "personal";

export type VoiceTier = "free" | "premium";

export type VoiceQuality = "local" | "neural" | "studio" | "personal";

export type VoiceAvailability =
  | "available"
  | "provider_missing"
  | "voice_missing"
  | "consent_required";

export type VoiceLibraryItem = {
  id: string;
  name: string;
  description: string;
  language: string;
  gender: VoiceGender;
  category: VoiceCategory;
  provider: SpeechProviderId;
  premium: boolean;
  quality: VoiceQuality;
  availability: VoiceAvailability;
  availabilityLabel: string;
  providerVoiceId?: string;
  voiceIdEnv?: string;
};

export const baseVoiceLibrary: VoiceLibraryItem[] = [
  {
    id: "local-browser",
    name: "Voz local",
    description: "Grátis, imediata e sem envio para provider externo.",
    language: "pt-BR",
    gender: "neutral",
    category: "narration",
    provider: "browser",
    premium: false,
    quality: "local",
    availability: "available",
    availabilityLabel: "Disponível agora"
  },
  {
    id: "professor",
    name: "Professor",
    description: "Didático, claro e com energia de aula particular.",
    language: "pt-BR",
    gender: "male",
    category: "teacher",
    provider: "elevenlabs",
    premium: true,
    quality: "neural",
    voiceIdEnv: "ELEVENLABS_VOICE_PROFESSOR_ID",
    availability: "provider_missing",
    availabilityLabel: "Exige provider neural"
  },
  {
    id: "professora",
    name: "Professora",
    description: "Acolhedora, objetiva e ótima para revisão guiada.",
    language: "pt-BR",
    gender: "female",
    category: "teacher",
    provider: "elevenlabs",
    premium: true,
    quality: "neural",
    voiceIdEnv: "ELEVENLABS_VOICE_PROFESSORA_ID",
    availability: "provider_missing",
    availabilityLabel: "Exige provider neural"
  },
  {
    id: "narrador",
    name: "Narrador",
    description: "Transforma apostilas longas em uma experiência tipo audiobook.",
    language: "pt-BR",
    gender: "neutral",
    category: "narration",
    provider: "elevenlabs",
    premium: true,
    quality: "neural",
    voiceIdEnv: "ELEVENLABS_VOICE_ID",
    availability: "provider_missing",
    availabilityLabel: "Exige provider neural"
  },
  {
    id: "podcast",
    name: "Podcast",
    description: "Ritmo natural para ouvir por mais tempo sem cansar.",
    language: "pt-BR",
    gender: "neutral",
    category: "podcast",
    provider: "elevenlabs",
    premium: true,
    quality: "neural",
    voiceIdEnv: "ELEVENLABS_VOICE_PODCAST_ID",
    availability: "provider_missing",
    availabilityLabel: "Exige provider neural"
  },
  {
    id: "calmo",
    name: "Calmo",
    description: "Ideal para caminhada, revisão leve e estudo à noite.",
    language: "pt-BR",
    gender: "neutral",
    category: "focus",
    provider: "elevenlabs",
    premium: true,
    quality: "neural",
    voiceIdEnv: "ELEVENLABS_VOICE_CALMO_ID",
    availability: "provider_missing",
    availabilityLabel: "Exige provider neural"
  },
  {
    id: "motivador",
    name: "Motivador",
    description: "Mais energia para estudar em rotina pesada.",
    language: "pt-BR",
    gender: "neutral",
    category: "energy",
    provider: "elevenlabs",
    premium: true,
    quality: "neural",
    voiceIdEnv: "ELEVENLABS_VOICE_MOTIVADOR_ID",
    availability: "provider_missing",
    availabilityLabel: "Exige provider neural"
  },
  {
    id: "jornalista",
    name: "Jornalista",
    description: "Preciso e direto para relatórios, normas e atualidades.",
    language: "pt-BR",
    gender: "neutral",
    category: "news",
    provider: "elevenlabs",
    premium: true,
    quality: "neural",
    voiceIdEnv: "ELEVENLABS_VOICE_JORNALISTA_ID",
    availability: "provider_missing",
    availabilityLabel: "Exige provider neural"
  },
  {
    id: "storytelling",
    name: "Storytelling",
    description: "Mais expressiva para livros, histórias e conteúdos narrativos.",
    language: "pt-BR",
    gender: "neutral",
    category: "story",
    provider: "elevenlabs",
    premium: true,
    quality: "studio",
    voiceIdEnv: "ELEVENLABS_VOICE_STORYTELLING_ID",
    availability: "provider_missing",
    availabilityLabel: "Exige provider neural"
  },
  {
    id: "infantil",
    name: "Infantil",
    description: "Leve e educativa para conteúdos de aprendizagem infantil.",
    language: "pt-BR",
    gender: "neutral",
    category: "kids",
    provider: "elevenlabs",
    premium: true,
    quality: "neural",
    voiceIdEnv: "ELEVENLABS_VOICE_INFANTIL_ID",
    availability: "provider_missing",
    availabilityLabel: "Exige provider neural"
  },
  {
    id: "minha-voz",
    name: "Minha Voz",
    description: "Uso pessoal autorizado, com consentimento, remoção e LGPD.",
    language: "pt-BR",
    gender: "personal",
    category: "personal",
    provider: "elevenlabs",
    premium: true,
    quality: "personal",
    voiceIdEnv: "AUTHORIZED_VOICE_ID",
    availability: "consent_required",
    availabilityLabel: "Aguardando consentimento"
  }
];

export function buildVoiceLibrary(providerStatuses: SpeechProviderStatus[]) {
  const providerMap = new Map(
    providerStatuses.map((provider) => [provider.id, provider])
  );

  return baseVoiceLibrary.map((voice) => {
    if (voice.provider === "browser") {
      return voice;
    }

    if (voice.id === "minha-voz") {
      return {
        ...voice,
        providerVoiceId: process.env.AUTHORIZED_VOICE_ID,
        availability: process.env.AUTHORIZED_VOICE_ID
          ? ("available" as const)
          : ("consent_required" as const),
        availabilityLabel: process.env.AUTHORIZED_VOICE_ID
          ? "Voice ID autorizado"
          : "Aguardando consentimento"
      };
    }

    const provider = providerMap.get(voice.provider);
    const providerVoiceId = voice.voiceIdEnv
      ? process.env[voice.voiceIdEnv]
      : undefined;

    if (!provider?.configured || !provider.implemented) {
      return {
        ...voice,
        availability: "provider_missing" as const,
        availabilityLabel: provider?.detail ?? "Provider não configurado"
      };
    }

    if (voice.id === "narrador") {
      return {
        ...voice,
        providerVoiceId,
        availability: "available" as const,
        availabilityLabel: providerVoiceId
          ? "Disponível no Premium"
          : "Disponível com voz padrão do provider"
      };
    }

    if (!providerVoiceId) {
      return {
        ...voice,
        availability: "voice_missing" as const,
        availabilityLabel: `Configure ${voice.voiceIdEnv}`
      };
    }

    return {
      ...voice,
      providerVoiceId,
      availability: "available" as const,
      availabilityLabel: "Disponível no Premium"
    };
  });
}

export function resolveVoiceForSynthesis(voiceProfileId?: string) {
  const voice = baseVoiceLibrary.find(
    (item) => item.id === (voiceProfileId || "narrador")
  );

  if (!voice || voice.provider === "browser") {
    return {
      provider: "elevenlabs" as SpeechProviderId,
      voiceId: process.env.ELEVENLABS_VOICE_ID,
      profileName: "Narrador"
    };
  }

  if (voice.id === "minha-voz") {
    return {
      provider: voice.provider,
      voiceId: process.env.AUTHORIZED_VOICE_ID,
      profileName: voice.name,
      missingEnv: process.env.AUTHORIZED_VOICE_ID
        ? undefined
        : "AUTHORIZED_VOICE_ID"
    };
  }

  const voiceId = voice.voiceIdEnv ? process.env[voice.voiceIdEnv] : undefined;

  return {
    provider: voice.provider,
    voiceId,
    profileName: voice.name,
    missingEnv: voiceId || voice.id === "narrador" ? undefined : voice.voiceIdEnv
  };
}
