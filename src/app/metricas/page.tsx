import Link from "next/link";
import { learningMetrics } from "@/lib/product/experience";

export default function MetricasPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/" className="text-sm font-bold text-real-700 hover:underline">
        ← Voltar para experimentar
      </Link>

      <header className="mt-8 max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-real-600">
          Métricas de aprendizado
        </p>
        <h1 className="mt-3 text-5xl font-black tracking-tight text-ink">
          Mostrar progresso aumenta retenção.
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-700">
          Métricas entram como gatilho de hábito quando login, banco e eventos
          reais estiverem conectados.
        </p>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {learningMetrics.map((metric) => (
          <article
            key={metric}
            className="rounded-3xl border border-real-100 bg-real-50 p-5 font-black text-real-950 shadow-soft"
          >
            {metric}
          </article>
        ))}
      </section>
    </main>
  );
}
