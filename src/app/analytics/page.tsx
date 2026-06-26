import Link from "next/link";

const events = [
  "novo usuário",
  "conteúdo adicionado",
  "documento processado",
  "primeiro play",
  "clique no Premium",
  "checkout iniciado",
  "compra concluída",
  "retorno ao app"
];

export default function AnalyticsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/" className="text-sm font-bold text-real-700 hover:underline">
        ← Voltar para experimentar
      </Link>

      <header className="mt-8 max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-real-600">
          Analytics
        </p>
        <h1 className="mt-3 text-5xl font-black tracking-tight text-ink">
          Medir o caminho até o primeiro áudio.
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-700">
          A Home não precisa explicar analytics. O produto precisa medir se o
          usuário chegou rápido ao primeiro play.
        </p>
      </header>

      <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {events.map((event) => (
          <article
            key={event}
            className="rounded-3xl border border-slate-200 bg-white p-5 font-black text-ink shadow-soft"
          >
            {event}
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-[2rem] border border-amber-200 bg-amber-50 p-6 text-amber-950">
        <h2 className="text-2xl font-black">Próximo passo</h2>
        <p className="mt-2 leading-7">
          Enviar eventos para uma ferramenta real como PostHog, Plausible,
          Segment ou banco próprio. Nada de métrica falsa.
        </p>
      </section>
    </main>
  );
}
