import Link from "next/link";

const benefits = [
  "estudar enquanto trabalha",
  "ouvir apostilas longas",
  "OCR para slides e imagens",
  "blocos por capítulo",
  "continuar de onde parou",
  "voz neural premium"
];

export function LandingPage() {
  return (
    <section className="mx-auto grid min-h-screen w-full max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8">
      <div>
        <div className="mb-5 inline-flex rounded-full border border-real-100 bg-white/80 px-3 py-1 text-sm font-black text-real-700 shadow-sm">
          REAL Reader · SaaS V1.3 Comercial
        </div>
        <h1 className="max-w-4xl text-5xl font-black tracking-tight text-ink sm:text-7xl">
          Transforme PDFs longos em áudio de estudo.
        </h1>
        <p className="mt-6 max-w-2xl text-xl leading-9 text-slate-700">
          Leia apostilas, slides e PDFs escaneados em voz alta, divida por
          capítulos e gere áudio premium quando sua conta tiver voz neural
          configurada.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href="#reader"
            className="rounded-2xl bg-real-600 px-6 py-4 text-center font-black text-white transition hover:-translate-y-0.5 hover:bg-real-700"
          >
            Testar grátis
          </a>
          <Link
            href="/pricing"
            className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-center font-black text-ink transition hover:-translate-y-0.5 hover:shadow-md"
          >
            Assinar Premium
          </Link>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-500">
          O teste grátis usa voz local do navegador. Voz neural, MP3 e recursos
          avançados dependem de plano premium, login e chaves externas
          configuradas no servidor.
        </p>
      </div>

      <div className="rounded-[2rem] border border-white/80 bg-white/80 p-6 shadow-soft backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-real-600">
          Benefícios
        </p>
        <div className="mt-5 grid gap-3">
          {benefits.map((benefit) => (
            <div
              key={benefit}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-700"
            >
              {benefit}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
