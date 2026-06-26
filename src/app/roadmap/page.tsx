import Link from "next/link";

const roadmap = [
  {
    title: "Agora",
    items: ["Upload rápido", "Voz local", "OCR por demanda", "Player Premium"]
  },
  {
    title: "Próximo",
    items: ["Login real", "Stripe webhook", "Premium validado no servidor", "Cache persistente"]
  },
  {
    title: "Depois",
    items: ["IA de estudos", "Biblioteca persistente", "Apps mobile/PWA", "Empresas"]
  }
];

export default function RoadmapPage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/" className="text-sm font-bold text-real-700 hover:underline">
        ← Voltar para experimentar
      </Link>

      <header className="mt-8 max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-real-600">
          Roadmap
        </p>
        <h1 className="mt-3 text-5xl font-black tracking-tight text-ink">
          Crescer sem atrapalhar o primeiro áudio.
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-700">
          O roadmap fica fora da Home para que o visitante experimente antes de
          ler planos futuros.
        </p>
      </header>

      <section className="mt-8 grid gap-5 md:grid-cols-3">
        {roadmap.map((phase) => (
          <article
            key={phase.title}
            className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft"
          >
            <h2 className="text-2xl font-black text-ink">{phase.title}</h2>
            <ul className="mt-5 space-y-3">
              {phase.items.map((item) => (
                <li key={item} className="rounded-2xl bg-slate-50 px-4 py-3 font-bold text-slate-700">
                  {item}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </main>
  );
}
