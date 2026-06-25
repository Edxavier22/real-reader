import { NextResponse } from "next/server";
import { resolveServerAccess } from "@/lib/commercial/auth";
import { generateElevenLabsSpeech, isElevenLabsConfigured } from "@/lib/tts/elevenlabs";

type NeuralRequestBody = {
  text?: string;
  voiceId?: string;
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

  if (!isElevenLabsConfigured()) {
    return NextResponse.json(
      {
        error: "ElevenLabs ainda não configurado.",
        details: "Configure ELEVENLABS_API_KEY no servidor/Vercel."
      },
      { status: 503 }
    );
  }

  try {
    const result = await generateElevenLabsSpeech({
      text,
      voiceId: body.voiceId
    });

    return new Response(result.audio, {
      status: 200,
      headers: {
        "Content-Type": result.contentType,
        "Content-Disposition": 'attachment; filename="real-reader-neural.mp3"',
        "X-REAL-Reader-Characters": String(result.characterCount),
        "X-REAL-Reader-Voice-Id": result.voiceId,
        "X-REAL-Reader-Model-Id": result.modelId
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
