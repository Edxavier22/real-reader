import Link from "next/link";
import { studyModes } from "@/lib/product/experience";

export default function IaEstudosPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/" className="text-sm font-bold text-real-700 hover:underline">
        ← Voltar para experimentar
      </Link>

      <header className="mt-8 max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-real-600">
          IA de estudos
        </p>
        <h1 className="mt-3 text-5xl font-black tracking-tight text-ink">
          O REAL Reader evolui para ensinar, não apenas narrar.
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-700">
          Estes modos estão preparados na arquitetura, mas só devem ser vendidos
          como ativos quando um provider de IA estiver conectado e validado.
        </p>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {studyModes.map((mode) => (
          <article
            key={mode.id}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft"
          >
            <p className="text-xl font-black text-ink">{mode.label}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {mode.promise}
            </p>
            <p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
              Arquitetura preparada
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
