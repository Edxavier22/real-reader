import Link from "next/link";
import { premiumVoiceLibrary } from "@/lib/product/experience";

export default function VozesPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/" className="text-sm font-bold text-real-700 hover:underline">
        ← Voltar para experimentar
      </Link>

      <header className="mt-8 max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-real-600">
          Biblioteca de vozes
        </p>
        <h1 className="mt-3 text-5xl font-black tracking-tight text-ink">
          Escolha o jeito como seu conteúdo deve falar com você.
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-700">
          Esta página explica a biblioteca Premium sem interromper quem só quer
          enviar um documento e ouvir agora.
        </p>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {premiumVoiceLibrary.map((voice) => (
          <article
            key={voice.id}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft"
          >
            <p className="text-xl font-black text-ink">{voice.label}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {voice.promise}
            </p>
            <p className="mt-4 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900">
              Premium · exige provider compatível
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
