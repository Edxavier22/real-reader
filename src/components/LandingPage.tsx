import Link from "next/link";
import {
  futureContentSources,
  learningMetrics,
  premiumVoiceLibrary,
  studyModes
} from "@/lib/product/experience";

const outcomes = [
  "Estude enquanto dirige, caminha ou trabalha.",
  "Transforme apostilas cansativas em uma rotina de áudio.",
  "Revise sem ficar preso à tela.",
  "Use OCR para ouvir slides, prints e digitalizações.",
  "Volte exatamente de onde parou quando assinar o Premium.",
  "Economize horas com resumos e modos de estudo por IA quando configurados."
];

const howItWorks = [
  {
    step: "1",
    title: "Envie seu conteúdo",
    text: "Comece com PDF ou imagem. A arquitetura já está pronta para evoluir para Word, PPT, EPUB, HTML e web."
  },
  {
    step: "2",
    title: "O REAL Reader transforma em texto estudável",
    text: "Extração rápida, OCR quando necessário e limpeza para reduzir ruído."
  },
  {
    step: "3",
    title: "Você aprende em áudio",
    text: "Ouça no navegador grátis ou gere áudio neural Premium quando as chaves estiverem configuradas."
  }
];

const faqs = [
  {
    question: "Isso é só um leitor de PDF?",
    answer:
      "Não. O posicionamento agora é aprendizado narrado por IA. PDF é o primeiro canal; o produto evolui para qualquer conteúdo."
  },
  {
    question: "A voz neural já funciona?",
    answer:
      "A rota e o provider ElevenLabs estão prontos no servidor. Para funcionar, é preciso configurar a API key e liberar um plano Premium real."
  },
  {
    question: "O plano grátis é limitado demais?",
    answer:
      "Ele existe para experimentação: até 10 páginas por documento e voz local. O Premium vende economia de tempo e experiência completa."
  },
  {
    question: "Minha voz já pode ser clonada?",
    answer:
      "Não. A tela prepara consentimento e LGPD. Clonagem só deve existir com provider compatível, titularidade validada e remoção garantida."
  }
];

export function LandingPage() {
  return (
    <main className="bg-[radial-gradient(circle_at_top_left,#d8f3dc_0,transparent_32%),linear-gradient(180deg,#fffaf0_0%,#f8f5ef_55%,#eef7f1_100%)]">
      <section className="mx-auto grid min-h-screen w-full max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8">
        <div>
          <div className="mb-5 inline-flex rounded-full border border-real-100 bg-white/80 px-3 py-1 text-sm font-black text-real-700 shadow-sm">
            REAL Reader · Aprendizado narrado por IA
          </div>
          <h1 className="max-w-5xl text-5xl font-black tracking-tight text-ink sm:text-7xl">
            Estude enquanto dirige, caminha ou trabalha.
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-9 text-slate-700">
            Transforme qualquer conteúdo em uma experiência de aprendizado narrada
            por Inteligência Artificial — começando por PDFs e imagens, evoluindo
            para toda a sua biblioteca de estudos.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#reader"
              className="rounded-2xl bg-real-600 px-6 py-4 text-center font-black text-white transition hover:-translate-y-0.5 hover:bg-real-700"
            >
              Testar grátis agora
            </a>
            <Link
              href="/pricing"
              className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-center font-black text-ink transition hover:-translate-y-0.5 hover:shadow-md"
            >
              Ver plano Premium
            </Link>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-500">
            O grátis vende experimentação. O Premium vende tempo, foco e
            continuidade de estudo.
          </p>
        </div>

        <div className="rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-soft backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-real-600">
            O que você compra de verdade
          </p>
          <div className="mt-5 grid gap-3">
            {outcomes.map((benefit) => (
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

      <LandingSection eyebrow="Como funciona" title="De conteúdo parado para aprendizado em movimento.">
        <div className="grid gap-4 md:grid-cols-3">
          {howItWorks.map((item) => (
            <article key={item.step} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-real-600 text-xl font-black text-white">
                {item.step}
              </div>
              <h3 className="mt-5 text-xl font-black text-ink">{item.title}</h3>
              <p className="mt-2 leading-7 text-slate-600">{item.text}</p>
            </article>
          ))}
        </div>
      </LandingSection>

      <LandingSection eyebrow="Antes e depois" title="A mesma apostila. Uma rotina completamente diferente.">
        <div className="grid gap-5 lg:grid-cols-2">
          <BeforeAfterCard
            label="Antes"
            title="Conteúdo preso na tela"
            items={[
              "Leitura cansativa no fim do dia",
              "PDF gigante parado no computador",
              "Slides e prints difíceis de revisar",
              "Sem continuidade real de estudo"
            ]}
          />
          <BeforeAfterCard
            positive
            label="Depois"
            title="Aprendizado que acompanha você"
            items={[
              "Áudio para deslocamento, caminhada e academia",
              "Capítulos e blocos para estudar por partes",
              "OCR para transformar imagem em conteúdo audível",
              "Progresso, biblioteca e IA como vantagem Premium"
            ]}
          />
        </div>
      </LandingSection>

      <LandingSection eyebrow="Premium" title="A experiência Premium precisa parecer outro produto.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {premiumVoiceLibrary.map((voice) => (
            <div key={voice.id} className="rounded-3xl border border-slate-200 bg-white p-4">
              <p className="font-black text-ink">{voice.label}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{voice.promise}</p>
              <p className="mt-3 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
                exige provider compatível
              </p>
            </div>
          ))}
        </div>
      </LandingSection>

      <LandingSection eyebrow="IA de estudo" title="Não só ler. Ensinar, revisar e fixar.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {studyModes.slice(0, 9).map((mode) => (
            <div key={mode.id} className="rounded-3xl border border-slate-200 bg-white p-4">
              <p className="font-black text-ink">{mode.label}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{mode.promise}</p>
              <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                Arquitetura preparada
              </p>
            </div>
          ))}
        </div>
      </LandingSection>

      <LandingSection eyebrow="Biblioteca futura" title="PDF é só o começo.">
        <div className="flex flex-wrap gap-2">
          {futureContentSources.map((source) => (
            <span
              key={source}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700"
            >
              {source}
            </span>
          ))}
        </div>
      </LandingSection>

      <LandingSection eyebrow="Progresso" title="O usuário precisa sentir evolução.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {learningMetrics.map((metric) => (
            <div key={metric} className="rounded-3xl border border-real-100 bg-real-50 p-4 font-black text-real-900">
              {metric}
            </div>
          ))}
        </div>
      </LandingSection>

      <LandingSection eyebrow="Depoimentos" title="Estrutura preparada para prova social.">
        <div className="grid gap-4 md:grid-cols-3">
          {["Concurseira", "Professor", "Profissional sem tempo"].map((persona) => (
            <article key={persona} className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-5">
              <p className="font-black text-ink">{persona}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Espaço reservado para depoimento real. Não usar prova social falsa.
              </p>
            </article>
          ))}
        </div>
      </LandingSection>

      <LandingSection eyebrow="Planos" title="Experimente grátis. Pague quando o tempo economizado ficar óbvio.">
        <div className="grid gap-5 lg:grid-cols-2">
          <PlanTeaser
            title="FREE"
            text="Teste a transformação com até 10 páginas por documento e voz local."
            cta="Testar grátis"
            href="#reader"
          />
          <PlanTeaser
            premium
            title="PREMIUM"
            text="Para quem quer estudar por capítulos, gerar áudio neural e transformar leitura acumulada em rotina."
            cta="Ver Premium"
            href="/pricing"
          />
        </div>
      </LandingSection>

      <LandingSection eyebrow="FAQ" title="Perguntas que removem objeções.">
        <div className="grid gap-3">
          {faqs.map((faq) => (
            <details key={faq.question} className="rounded-3xl border border-slate-200 bg-white p-5">
              <summary className="cursor-pointer font-black text-ink">{faq.question}</summary>
              <p className="mt-3 leading-7 text-slate-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      </LandingSection>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-ink p-6 text-center text-white shadow-soft sm:p-10">
          <h2 className="text-3xl font-black sm:text-5xl">
            Sua apostila agora fala com você.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl leading-8 text-real-50">
            Comece com um PDF. A plataforma cresce para virar seu assistente de
            aprendizado por IA.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <a href="#reader" className="rounded-2xl bg-white px-6 py-4 font-black text-ink">
              Testar grátis
            </a>
            <Link href="/pricing" className="rounded-2xl bg-real-500 px-6 py-4 font-black text-white">
              Assinar Premium
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white/80 px-4 py-8 text-sm text-slate-600 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-black text-ink">REAL Reader</p>
          <p>Aprendizado narrado por IA. Sem funcionalidades falsas. Sem voz de terceiros.</p>
        </div>
      </footer>
    </main>
  );
}

function LandingSection({
  eyebrow,
  title,
  children
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-real-600">
        {eyebrow}
      </p>
      <h2 className="mt-3 max-w-4xl text-3xl font-black tracking-tight text-ink sm:text-5xl">
        {title}
      </h2>
      <div className="mt-8">{children}</div>
    </section>
  );
}

function BeforeAfterCard({
  label,
  title,
  items,
  positive = false
}: {
  label: string;
  title: string;
  items: string[];
  positive?: boolean;
}) {
  return (
    <article
      className={[
        "rounded-[2rem] border p-6 shadow-soft",
        positive ? "border-real-200 bg-real-50" : "border-slate-200 bg-white"
      ].join(" ")}
    >
      <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <h3 className="mt-3 text-2xl font-black text-ink">{title}</h3>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li key={item} className="rounded-2xl bg-white/80 px-4 py-3 font-bold text-slate-700">
            {item}
          </li>
        ))}
      </ul>
    </article>
  );
}

function PlanTeaser({
  title,
  text,
  cta,
  href,
  premium = false
}: {
  title: string;
  text: string;
  cta: string;
  href: string;
  premium?: boolean;
}) {
  const className = premium
    ? "rounded-[2rem] border border-real-200 bg-white p-6 shadow-soft ring-4 ring-real-100"
    : "rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-soft";

  return (
    <article className={className}>
      <h3 className="text-3xl font-black text-ink">{title}</h3>
      <p className="mt-3 min-h-16 leading-7 text-slate-600">{text}</p>
      <a
        href={href}
        className={[
          "mt-6 inline-flex rounded-2xl px-5 py-3 font-black transition",
          premium
            ? "bg-real-600 text-white hover:bg-real-700"
            : "border border-slate-200 bg-white text-ink hover:shadow-md"
        ].join(" ")}
      >
        {cta}
      </a>
    </article>
  );
}
