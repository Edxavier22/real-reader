import Link from "next/link";
import { getAuthProviderStatus } from "@/lib/commercial/auth";

export default function LoginPage() {
  const status = getAuthProviderStatus();

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-4 py-10">
      <Link href="/" className="text-sm font-bold text-real-700 hover:underline">
        ← Voltar
      </Link>
      <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-real-600">
        Login
      </p>
      <h1 className="mt-3 text-5xl font-black text-ink">
        Autenticação preparada para Supabase Auth.
      </h1>
      <p className="mt-4 text-lg leading-8 text-slate-700">
        Usuários gratuitos podem testar sem login. Usuários Premium devem entrar
        para liberar limites, histórico avançado, voz neural e MP3.
      </p>
      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5">
        <p className="font-black text-ink">Status</p>
        <p className="mt-2 text-slate-700">{status.detail}</p>
        <p className="mt-3 text-sm text-slate-500">
          A UI não coleta senha nesta V1.3 enquanto o provider não estiver
          conectado. Depois de configurar Supabase, conecte o cliente nesta
          página e grave o usuário nas tabelas comerciais.
        </p>
      </div>
    </main>
  );
}
