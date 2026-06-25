"use client";

import { useState } from "react";

export function CheckoutButton() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const startCheckout = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/checkout/session", {
        method: "POST"
      });
      const data = (await response.json().catch(() => null)) as
        | { url?: string; error?: string; details?: string }
        | null;

      if (!response.ok || !data?.url) {
        throw new Error(
          [data?.error, data?.details].filter(Boolean).join(" ") ||
            "Checkout indisponível agora."
        );
      }

      window.location.href = data.url;
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível iniciar o checkout."
      );
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        className="w-full rounded-2xl bg-real-600 px-5 py-4 font-black text-white transition hover:-translate-y-0.5 hover:bg-real-700 disabled:cursor-not-allowed disabled:opacity-60"
        onClick={startCheckout}
        disabled={loading}
      >
        {loading ? "Abrindo checkout..." : "Assinar Premium"}
      </button>
      {message ? (
        <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-sm leading-6 text-amber-900">
          {message}
        </p>
      ) : null}
    </div>
  );
}
