import { NextResponse } from "next/server";
import {
  getSpeechProviderStatuses,
  getVoiceModeStatuses
} from "@/lib/tts/providers";
import { buildVoiceLibrary } from "@/lib/tts/voice-library";

export const dynamic = "force-dynamic";

export async function GET() {
  const providers = getSpeechProviderStatuses();

  return NextResponse.json({
    modes: getVoiceModeStatuses(),
    providers,
    voices: buildVoiceLibrary(providers).map(({ providerVoiceId, ...voice }) => voice)
  });
}
