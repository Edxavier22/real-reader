"use client";

export type ProductEventName =
  | "onboarding_completed"
  | "add_content_clicked"
  | "document_processed"
  | "premium_clicked"
  | "checkout_started"
  | "mp3_generation_requested"
  | "text_cleaned";

export type ProductEvent = {
  id: string;
  name: ProductEventName;
  occurredAt: string;
  anonymousId: string;
  properties: Record<string, string | number | boolean | null>;
};

const ANALYTICS_KEY = "real-reader:analytics:v1";
const ANONYMOUS_ID_KEY = "real-reader:anonymous-id:v1";
const MAX_LOCAL_EVENTS = 250;

export function trackProductEvent(
  name: ProductEventName,
  properties: ProductEvent["properties"] = {}
) {
  if (typeof window === "undefined") {
    return;
  }

  const event: ProductEvent = {
    id: crypto.randomUUID(),
    name,
    occurredAt: new Date().toISOString(),
    anonymousId: getAnonymousId(),
    properties
  };

  const events = readProductEvents();
  const nextEvents = [event, ...events].slice(0, MAX_LOCAL_EVENTS);
  window.localStorage.setItem(ANALYTICS_KEY, JSON.stringify(nextEvents));
}

export function readProductEvents(): ProductEvent[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(ANALYTICS_KEY);
    return raw ? (JSON.parse(raw) as ProductEvent[]) : [];
  } catch {
    return [];
  }
}

function getAnonymousId() {
  const current = window.localStorage.getItem(ANONYMOUS_ID_KEY);

  if (current) {
    return current;
  }

  const next = crypto.randomUUID();
  window.localStorage.setItem(ANONYMOUS_ID_KEY, next);
  return next;
}
