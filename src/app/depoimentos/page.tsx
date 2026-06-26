import Link from "next/link";

const personas = [
  "Concurseira",
  "Professor",
  "Profissional sem tempo",
  "Universitário",
  "Pesquisador",
  "Aluno de curso técnico"
];

export default function DepoimentosPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/" className="text-sm font-bold text-real-700 hover:underline">
        ← Voltar para experimentar
      </Link>

      <header className="mt-8 max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-real-600">
          Depoimentos
        </p>
        <h1 className="mt-3 text-5xl font-black tracking-tight text-ink">
          Prova social só entra quando for real.
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-700">
          A Home ficou curta. Depoimentos completos ficam aqui e só devem ser
          publicados depois de validação real com usuários.
        </p>
      </header>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {personas.map((persona) => (
          <article
            key={persona}
            className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-5 shadow-soft"
          >
            <p className="text-xl font-black text-ink">{persona}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Espaço reservado para depoimento real. Não usar prova social falsa.
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
