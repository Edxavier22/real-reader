import Link from "next/link";
import { learningMetrics } from "@/lib/product/experience";

export default function DashboardPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/" className="text-sm font-bold text-real-700 hover:underline">
        ← Voltar
      </Link>
      <header className="mt-8 max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-real-600">
          Dashboard de aprendizado
        </p>
        <h1 className="mt-3 text-5xl font-black tracking-tight text-ink">
          Mostre ao usuário o tempo que ele ganhou.
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-700">
          Esta página prepara as métricas que aumentam retenção: progresso, dias
          consecutivos, capítulos concluídos e horas economizadas. Dados reais
          entram quando login e banco forem conectados.
        </p>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {learningMetrics.map((metric) => (
          <article key={metric} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-3xl font-black text-ink">0</p>
            <p className="mt-2 font-bold text-slate-700">{metric}</p>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Aguardando persistência por usuário.
            </p>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-[2rem] border border-amber-200 bg-amber-50 p-6 text-amber-950">
        <h2 className="text-2xl font-black">Próximo passo de produto</h2>
        <p className="mt-2 leading-7">
          Conectar Supabase Auth e salvar eventos reais em `usage_limits` para
          transformar esse dashboard em gatilho de retenção e upgrade.
        </p>
      </section>
    </main>
  );
}
