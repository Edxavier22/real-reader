import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { getAuthProviderStatus } from "@/lib/commercial/auth";

export default function LoginPage() {
  const status = getAuthProviderStatus();

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_440px] lg:px-8">
      <section>
        <Link href="/" className="text-sm font-bold text-real-700 hover:underline">
          ← Voltar
        </Link>
        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-real-600">
          Conta REAL Reader
        </p>
        <h1 className="mt-3 text-5xl font-black tracking-tight text-ink">
          Entre para salvar seu estudo e liberar o Premium automaticamente.
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-700">
          Sua conta conecta pagamento, plano, histórico, progresso, voz preferida
          e continuidade entre dispositivos.
        </p>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white/80 p-5">
          <p className="font-black text-ink">Status comercial</p>
          <p className="mt-2 text-slate-700">{status.detail}</p>
        </div>
      </section>

      <AuthForm configured={status.configured} />
    </main>
  );
}
