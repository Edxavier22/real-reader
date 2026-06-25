import Link from "next/link";

export default function MinhaVozPage() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/" className="text-sm font-bold text-real-700 hover:underline">
        ← Voltar
      </Link>
      <header className="mt-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-real-600">
          Minha voz
        </p>
        <h1 className="mt-3 text-5xl font-black text-ink">
          Voz própria autorizada, sem clonagem nesta etapa.
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-700">
          Esta tela prepara o fluxo de consentimento. Ela não envia amostras, não
          clona voz e não permite voz de terceiros.
        </p>
      </header>

      <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-2xl font-black text-ink">Consentimento obrigatório</h2>
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
            voiceId futuro
          </span>
          <input
            disabled
            placeholder="Será preenchido quando um provider autorizado existir"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
          />
        </label>
        <p className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          Não é permitido usar voz de terceiros, celebridades, professores ou
          qualquer pessoa sem consentimento explícito, informado e verificável.
        </p>
      </section>
    </main>
  );
}
