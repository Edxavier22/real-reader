export type ElevenLabsSpeechRequest = {
  text: string;
  voiceId?: string;
};

export type ElevenLabsSpeechResult = {
  audio: ArrayBuffer;
  contentType: string;
  voiceId: string;
  modelId: string;
  characterCount: number;
};

const DEFAULT_ELEVENLABS_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb";
const DEFAULT_ELEVENLABS_MODEL_ID = "eleven_multilingual_v2";

export function isElevenLabsConfigured() {
  return Boolean(process.env.ELEVENLABS_API_KEY);
}

export async function generateElevenLabsSpeech({
  text,
  voiceId
}: ElevenLabsSpeechRequest): Promise<ElevenLabsSpeechResult> {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY não configurada no servidor.");
  }

  const selectedVoiceId =
    voiceId || process.env.ELEVENLABS_VOICE_ID || DEFAULT_ELEVENLABS_VOICE_ID;
  const modelId = process.env.ELEVENLABS_MODEL_ID || DEFAULT_ELEVENLABS_MODEL_ID;
  const outputFormat = process.env.ELEVENLABS_OUTPUT_FORMAT || "mp3_44100_128";
  const endpoint = new URL(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(
      selectedVoiceId
    )}`
  );
  endpoint.searchParams.set("output_format", outputFormat);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
      "xi-api-key": apiKey
    },
    body: JSON.stringify({
      text,
      model_id: modelId
    })
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(
      `ElevenLabs retornou erro ${response.status}. ${
        details ? details.slice(0, 400) : "Sem detalhes."
      }`
    );
  }

  return {
    audio: await response.arrayBuffer(),
    contentType: response.headers.get("content-type") || "audio/mpeg",
    voiceId: selectedVoiceId,
    modelId,
    characterCount: text.length
  };
}
