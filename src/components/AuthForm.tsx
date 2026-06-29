"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";

type AuthMode = "login" | "signup" | "recover";

export function AuthForm({ configured }: { configured: boolean }) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const nextUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return "/";
    }

    return new URLSearchParams(window.location.search).get("next") || "/";
  }, []);

  const submit = async () => {
    setMessage("");
    setLoading(true);

    try {
      const endpoint =
        mode === "signup"
          ? "/api/auth/signup"
          : mode === "recover"
            ? "/api/auth/recover"
            : "/api/auth/login";
      const payload =
        mode === "recover"
          ? { email }
          : {
              email,
              password,
              ...(mode === "signup" ? { fullName } : {})
            };
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const data = (await response.json().catch(() => null)) as
        | {
            ok?: boolean;
            error?: string;
            message?: string;
            requiresEmailConfirmation?: boolean;
          }
        | null;

      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "Não foi possível concluir a ação.");
      }

      if (mode === "recover") {
        setMessage(
          data.message ||
            "Se esse e-mail estiver cadastrado, enviaremos instruções de recuperação."
        );
        return;
      }

      if (data.requiresEmailConfirmation) {
        setMessage(
          "Conta criada. Confirme seu e-mail antes de entrar, se a confirmação estiver ativa no Supabase."
        );
        setMode("login");
        return;
      }

      window.location.href = nextUrl;
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível concluir a ação agora."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-soft">
      <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1 text-sm font-black">
        <AuthTab active={mode === "login"} onClick={() => setMode("login")}>
          Entrar
        </AuthTab>
        <AuthTab active={mode === "signup"} onClick={() => setMode("signup")}>
          Criar conta
        </AuthTab>
        <AuthTab active={mode === "recover"} onClick={() => setMode("recover")}>
          Senha
        </AuthTab>
      </div>

      <div className="mt-6 space-y-4">
        {mode === "signup" ? (
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Nome</span>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-real-100 transition focus:border-real-400 focus:ring-4"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Seu nome"
              autoComplete="name"
            />
          </label>
        ) : null}

        <label className="block">
          <span className="text-sm font-bold text-slate-700">E-mail</span>
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-real-100 transition focus:border-real-400 focus:ring-4"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="voce@email.com"
            type="email"
            autoComplete="email"
          />
        </label>

        {mode !== "recover" ? (
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Senha</span>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-real-100 transition focus:border-real-400 focus:ring-4"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Mínimo 8 caracteres"
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />
          </label>
        ) : null}

        <button
          type="button"
          className="w-full rounded-2xl bg-real-600 px-5 py-4 text-lg font-black text-white transition hover:-translate-y-0.5 hover:bg-real-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!configured || loading}
          onClick={submit}
        >
          {loading
            ? "Processando..."
            : mode === "signup"
              ? "Criar minha conta"
              : mode === "recover"
                ? "Enviar recuperação"
                : "Entrar no REAL Reader"}
        </button>

        {!configured ? (
          <p className="rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            Supabase ainda não está configurado. Defina as variáveis de ambiente
            para ativar cadastro, login e sessão.
          </p>
        ) : null}

        {message ? (
          <p className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            {message}
          </p>
        ) : null}
      </div>
    </section>
  );
}

function AuthTab({
  active,
  children,
  onClick
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={[
        "rounded-xl px-3 py-2 transition",
        active ? "bg-white text-real-700 shadow-sm" : "text-slate-500"
      ].join(" ")}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
