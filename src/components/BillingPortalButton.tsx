"use client";

import { useState } from "react";

export function BillingPortalButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const openPortal = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/billing/portal", {
        method: "POST"
      });
      const data = (await response.json().catch(() => null)) as
        | { url?: string; error?: string; details?: string }
        | null;

      if (!response.ok || !data?.url) {
        throw new Error(
          [data?.error, data?.details].filter(Boolean).join(" ") ||
            "Portal indisponível agora."
        );
      }

      window.location.href = data.url;
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível abrir o portal."
      );
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 font-black text-ink transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
        onClick={openPortal}
        disabled={loading}
      >
        {loading ? "Abrindo portal..." : "Gerenciar assinatura"}
      </button>
      {message ? (
        <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-sm leading-6 text-amber-900">
          {message}
        </p>
      ) : null}
    </div>
  );
}
