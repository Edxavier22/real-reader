import { NextResponse } from "next/server";
import { getVoiceModeStatuses } from "@/lib/tts/providers";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ modes: getVoiceModeStatuses() });
}
