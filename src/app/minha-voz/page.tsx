import Link from "next/link";
import {
  authorizedVoiceFlow,
  authorizedVoiceRules
} from "@/lib/voice/authorized-voice";

export default function MinhaVozPage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/" className="text-sm font-bold text-real-700 hover:underline">
        ← Voltar
      </Link>
      <header className="mt-8 max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-real-600">
          Minha voz
        </p>
        <h1 className="mt-3 text-5xl font-black text-ink">
          Voz própria autorizada, com consentimento e LGPD.
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-700">
          Esta Sprint não clona voz. Ela prepara um fluxo profissional para que,
          no futuro, somente o titular possa criar e remover a própria voz.
        </p>
      </header>

      <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {authorizedVoiceFlow.map((step, index) => (
            <article key={step.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-real-600 font-black text-white">
                {index + 1}
              </div>
              <h2 className="mt-4 text-lg font-black text-ink">{step.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-2xl font-black text-ink">
            Consentimento obrigatório
          </h2>
          <div className="mt-5 space-y-3 text-slate-700">
            <label className="flex gap-3 rounded-2xl bg-slate-50 p-4">
              <input type="checkbox" disabled className="mt-1 h-4 w-4" />
              <span>Confirmo que sou titular da voz que será usada.</span>
            </label>
            <label className="flex gap-3 rounded-2xl bg-slate-50 p-4">
              <input type="checkbox" disabled className="mt-1 h-4 w-4" />
              <span>Aceito o uso apenas para leitura dos meus documentos.</span>
            </label>
            <label className="flex gap-3 rounded-2xl bg-slate-50 p-4">
              <input type="checkbox" disabled className="mt-1 h-4 w-4" />
              <span>Entendo que poderei solicitar remoção dos dados de voz.</span>
            </label>
          </div>
          <label className="mt-5 block">
            <span className="text-sm font-bold text-slate-700">
              Voice ID autorizado futuro
            </span>
            <input
              disabled
              placeholder="Será preenchido quando validação e provider existirem"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            />
          </label>
        </div>

        <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 text-amber-950">
          <h2 className="text-2xl font-black">Regras inegociáveis</h2>
          <ul className="mt-5 space-y-3">
            {authorizedVoiceRules.map((rule) => (
              <li key={rule} className="rounded-2xl bg-white/70 px-4 py-3 font-bold">
                {rule}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
