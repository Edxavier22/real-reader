import { NextResponse } from "next/server";
import {
  clearAuthCookies,
  resolveServerAccess,
  setAuthCookies,
  refreshSessionFromRequest,
  upsertUserPreferences
} from "@/lib/commercial/auth";
import type { VoiceMode } from "@/lib/reader/types";

type PreferencesBody = {
  voiceMode?: VoiceMode;
  voiceProfileId?: string;
  speechRate?: number;
};

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const access = await resolveServerAccessWithRefresh(request);
  const response = NextResponse.json({
    authenticated: access.authenticated,
    user: access.user,
    plan: access.plan,
    subscription: access.subscription,
    usage: access.usage,
    preferences: access.preferences,
    reason: access.reason
  });

  if (access.sessionToSet) {
    setAuthCookies(response, access.sessionToSet);
  }

  if (!access.authenticated) {
    clearAuthCookies(response);
  }

  return response;
}

export async function PATCH(request: Request) {
  const access = await resolveServerAccessWithRefresh(request);

  if (!access.authenticated || !access.user?.id) {
    return NextResponse.json(
      {
        error: "Login necessário.",
        details: "Entre na sua conta para salvar preferências."
      },
      { status: 401 }
    );
  }

  let body: PreferencesBody;

  try {
    body = (await request.json()) as PreferencesBody;
  } catch {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const voiceMode = isVoiceMode(body.voiceMode) ? body.voiceMode : "browser";
  const voiceProfileId =
    typeof body.voiceProfileId === "string" && body.voiceProfileId.trim()
      ? body.voiceProfileId.trim().slice(0, 80)
      : "narrador";
  const speechRate =
    typeof body.speechRate === "number"
      ? Math.min(2, Math.max(0.5, body.speechRate))
      : 1;

  const preferences = await upsertUserPreferences({
    user_id: access.user.id,
    voice_mode: voiceMode,
    voice_profile_id: voiceProfileId,
    speech_rate: speechRate
  });
  const response = NextResponse.json({ ok: true, preferences });

  if (access.sessionToSet) {
    setAuthCookies(response, access.sessionToSet);
  }

  return response;
}

async function resolveServerAccessWithRefresh(request: Request) {
  let access = await resolveServerAccess(request);
  const result = {
    authenticated: access.isAuthenticated,
    user: access.user,
    plan: access.plan,
    subscription: access.subscription,
    usage: access.usage,
    preferences: access.preferences,
    reason: access.reason,
    sessionToSet: null as Awaited<ReturnType<typeof refreshSessionFromRequest>>
  };

  if (access.isAuthenticated) {
    return result;
  }

  const refreshed = await refreshSessionFromRequest(request).catch(() => null);

  if (!refreshed) {
    return result;
  }

  access = await resolveServerAccess(
    new Request(request.url, {
      headers: {
        cookie: `real_reader_access_token=${encodeURIComponent(
          refreshed.access_token
        )}`
      }
    })
  );

  return {
    authenticated: access.isAuthenticated,
    user: access.user,
    plan: access.plan,
    subscription: access.subscription,
    usage: access.usage,
    preferences: access.preferences,
    reason: access.reason,
    sessionToSet: refreshed
  };
}

function isVoiceMode(value: unknown): value is VoiceMode {
  return (
    value === "browser" ||
    value === "neural" ||
    value === "authorized-clone"
  );
}
