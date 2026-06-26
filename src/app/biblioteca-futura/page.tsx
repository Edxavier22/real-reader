import Link from "next/link";
import { futureContentSources } from "@/lib/product/experience";

export default function BibliotecaFuturaPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/" className="text-sm font-bold text-real-700 hover:underline">
        ← Voltar para experimentar
      </Link>

      <header className="mt-8 max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-real-600">
          Biblioteca futura
        </p>
        <h1 className="mt-3 text-5xl font-black tracking-tight text-ink">
          PDF é a primeira porta. Conteúdo é o mercado.
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-700">
          Esta visão fica em página própria para não atrasar quem quer testar
          PDF e imagem agora.
        </p>
      </header>

      <section className="mt-8 flex flex-wrap gap-3">
        {futureContentSources.map((source) => (
          <span
            key={source}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm"
          >
            {source}
          </span>
        ))}
      </section>
    </main>
  );
}
