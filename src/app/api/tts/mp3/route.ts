import { NextResponse } from "next/server";
import { recordUsage, resolveServerAccess } from "@/lib/commercial/auth";
import {
  checkRateLimit,
  getRequestIdentity
} from "@/lib/commercial/rate-limit";
import type { VoiceMode } from "@/lib/reader/types";
import {
  createAudioCacheKey,
  getCachedAudio,
  setCachedAudio
} from "@/lib/tts/audio-cache";
import { synthesizeSpeech } from "@/lib/tts/speech-provider";
import { getVoiceModeStatus } from "@/lib/tts/providers";
import { resolveVoiceForSynthesis } from "@/lib/tts/voice-library";

type Mp3RequestBody = {
  text?: string;
  title?: string;
  voiceProfileId?: string;
  rate?: number;
  voiceMode?: VoiceMode;
};

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const rate = checkRateLimit({
    key: `tts-mp3:${getRequestIdentity(request)}`,
    limit: 15,
    windowMs: 60_000
  });

  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Muitas gerações em sequência. Aguarde um minuto." },
      { status: 429 }
    );
  }

  let body: Mp3RequestBody;

  try {
    body = (await request.json()) as Mp3RequestBody;
  } catch {
    return NextResponse.json(
      { error: "Corpo da requisição inválido." },
      { status: 400 }
    );
  }

  const text = body.text?.trim();
  const voiceMode = isVoiceMode(body.voiceMode) ? body.voiceMode : "browser";

  if (!text) {
    return NextResponse.json(
      { error: "Envie um texto extraído para gerar áudio." },
      { status: 400 }
    );
  }

  if (voiceMode === "neural") {
    return generateNeuralMp3(request, text, body.title, body.voiceProfileId);
  }

  const modeStatus = getVoiceModeStatus(voiceMode);

  if (voiceMode !== "browser") {
    return NextResponse.json(
      {
        error: "O modo de voz selecionado ainda não está disponível.",
        details: modeStatus.detail
      },
      { status: 501 }
    );
  }

  return NextResponse.json(
    {
      error: "Gerador de MP3 local não configurado.",
      details:
        "A voz local do navegador funciona para ouvir em tempo real, mas navegadores não permitem exportá-la como MP3. Para MP3 real, use voz neural Premium."
    },
    { status: 501 }
  );
}

async function generateNeuralMp3(
  request: Request,
  text: string,
  title?: string,
  voiceProfileId?: string
) {
  const access = await resolveServerAccess(request);

  if (
    !access.isAuthenticated ||
    !access.plan.features.mp3 ||
    !access.plan.features.neuralVoice
  ) {
    return NextResponse.json(
      {
        error: "MP3 com voz neural é um recurso Premium.",
        details: "Faça login em uma conta Premium para gerar áudio neural."
      },
      { status: 402 }
    );
  }

  if (text.length > access.plan.maxNeuralCharsPerRequest) {
    return NextResponse.json(
      {
        error: "Texto acima do limite por geração.",
        details: `Seu plano permite até ${access.plan.maxNeuralCharsPerRequest.toLocaleString(
          "pt-BR"
        )} caracteres por geração.`
      },
      { status: 413 }
    );
  }

  if (
    access.usage &&
    access.usage.voice_characters + text.length > access.plan.monthlyNeuralChars
  ) {
    return NextResponse.json(
      {
        error: "Limite mensal de voz neural atingido.",
        details:
          "Seu limite mensal de caracteres foi consumido. Aguarde a renovação do ciclo."
      },
      { status: 402 }
    );
  }

  const voice = resolveVoiceForSynthesis(voiceProfileId);

  if (voice.missingEnv) {
    return NextResponse.json(
      {
        error: `${voice.profileName} ainda não está disponível.`,
        details: `Configure ${voice.missingEnv} para liberar esta voz sem fingir outra voz no lugar.`
      },
      { status: 503 }
    );
  }

  const cacheKey = createAudioCacheKey({
    providerId: voice.provider,
    voiceId: voice.voiceId || "default",
    text
  });
  const cached = getCachedAudio(cacheKey);

  if (cached) {
    return audioResponse(cached.audio, {
      title,
      contentType: cached.contentType,
      cacheStatus: "HIT",
      voiceProfile: voice.profileName
    });
  }

  try {
    const result = await synthesizeSpeech(voice.provider, {
      text,
      voiceId: voice.voiceId
    });

    setCachedAudio(cacheKey, {
      audio: result.audio,
      contentType: result.contentType,
      createdAt: Date.now(),
      providerId: result.providerId,
      voiceId: result.voiceId
    });

    if (access.userId) {
      await recordUsage(access.userId, {
        voice_characters: result.characterCount,
        mp3_generations: 1
      });
    }

    return audioResponse(result.audio, {
      title,
      contentType: result.contentType,
      cacheStatus: "MISS",
      characters: result.characterCount,
      voiceProfile: voice.profileName
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Falha ao gerar MP3 neural.",
        details: error instanceof Error ? error.message : "Erro desconhecido.",
        fallbackVoiceMode: "browser"
      },
      { status: 502 }
    );
  }
}

function audioResponse(
  audio: ArrayBuffer,
  {
    title,
    contentType,
    cacheStatus,
    characters,
    voiceProfile
  }: {
    title?: string;
    contentType: string;
    cacheStatus: "HIT" | "MISS";
    characters?: number;
    voiceProfile: string;
  }
) {
  return new Response(audio, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${sanitizeFileName(
        title || "real-reader"
      )}.mp3"`,
      "X-REAL-Reader-Cache": cacheStatus,
      "X-REAL-Reader-Voice": voiceProfile,
      ...(characters ? { "X-REAL-Reader-Characters": String(characters) } : {})
    }
  });
}

function isVoiceMode(value: unknown): value is VoiceMode {
  return (
    value === "browser" ||
    value === "neural" ||
    value === "authorized-clone"
  );
}

function sanitizeFileName(input: string) {
  return (
    input
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9-_]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase()
      .slice(0, 80) || "real-reader"
  );
}
