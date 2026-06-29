import { NextResponse } from "next/server";
import {
  clearAuthCookies,
  resolveServerAccess,
  setAuthCookies,
  refreshSessionFromRequest
} from "@/lib/commercial/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  let access = await resolveServerAccess(request);
  let refreshedSession: Awaited<ReturnType<typeof refreshSessionFromRequest>> = null;

  if (!access.isAuthenticated) {
    const refreshed = await refreshSessionFromRequest(request).catch(() => null);

    if (refreshed) {
      refreshedSession = refreshed;
      access = await resolveServerAccess(
        new Request(request.url, {
          headers: {
            cookie: `real_reader_access_token=${encodeURIComponent(
              refreshed.access_token
            )}`
          }
        })
      );
    }
  }

  const payload = {
    authenticated: access.isAuthenticated,
    user: access.user,
    plan: access.plan,
    subscription: access.subscription,
    usage: access.usage,
    preferences: access.preferences,
    reason: access.reason
  };

  const response = NextResponse.json(payload);

  if (refreshedSession) {
    setAuthCookies(response, refreshedSession);
  } else if (!access.isAuthenticated) {
    clearAuthCookies(response);
  }

  return response;
}
