import { NextResponse } from "next/server";
import { resolveServerAccess } from "@/lib/commercial/auth";
import {
  createAudioCacheKey,
  getCachedAudio,
  setCachedAudio
} from "@/lib/tts/audio-cache";
import { synthesizeSpeech } from "@/lib/tts/speech-provider";
import { resolveVoiceForSynthesis } from "@/lib/tts/voice-library";

type NeuralRequestBody = {
  text?: string;
  voiceProfileId?: string;
};

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: NeuralRequestBody;

  try {
    body = (await request.json()) as NeuralRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Corpo da requisição inválido." },
      { status: 400 }
    );
  }

  const text = body.text?.trim();

  if (!text) {
    return NextResponse.json(
      { error: "Envie texto para gerar voz neural." },
      { status: 400 }
    );
  }

  const access = resolveServerAccess(request);

  if (!access.plan.features.neuralVoice) {
    return NextResponse.json(
      {
        error: "Voz neural é um recurso Premium.",
        details: "Faça login em uma conta Premium para gerar áudio neural."
      },
      { status: 402 }
    );
  }

  if (text.length > access.plan.maxNeuralCharsPerRequest) {
    return NextResponse.json(
      {
        error: "Texto acima do limite por requisição.",
        details: `Seu plano permite até ${access.plan.maxNeuralCharsPerRequest.toLocaleString(
          "pt-BR"
        )} caracteres por geração.`
      },
      { status: 413 }
    );
  }

  const voice = resolveVoiceForSynthesis(body.voiceProfileId);

  if (voice.missingEnv) {
    return NextResponse.json(
      {
        error: `${voice.profileName} ainda não está disponível.`,
        details: `Configure ${voice.missingEnv} para liberar esta voz.`
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
    return new Response(cached.audio, {
      status: 200,
      headers: {
        "Content-Type": cached.contentType,
        "Content-Disposition": 'attachment; filename="real-reader-neural.mp3"',
        "X-REAL-Reader-Cache": "HIT",
        "X-REAL-Reader-Voice": voice.profileName
      }
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

    return new Response(result.audio, {
      status: 200,
      headers: {
        "Content-Type": result.contentType,
        "Content-Disposition": 'attachment; filename="real-reader-neural.mp3"',
        "X-REAL-Reader-Characters": String(result.characterCount),
        "X-REAL-Reader-Voice-Id": result.voiceId,
        "X-REAL-Reader-Provider": result.providerId,
        "X-REAL-Reader-Cache": "MISS"
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Falha ao gerar áudio neural.",
        details: error instanceof Error ? error.message : "Erro desconhecido."
      },
      { status: 502 }
    );
  }
}
