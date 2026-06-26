"use client";

import Link from "next/link";
import { useRef, type ChangeEvent, type DragEvent } from "react";

const steps = [
  {
    title: "Enviar documento",
    text: "Arraste PDF ou imagem e deixe o REAL Reader preparar o texto."
  },
  {
    title: "Escolher voz",
    text: "Comece grátis com voz local. No Premium, use voz humana."
  },
  {
    title: "Ouvir",
    text: "Aperte play e transforme leitura parada em estudo em movimento."
  }
];

const premiumBenefits = [
  "Voz humana",
  "Continue exatamente de onde parou",
  "Biblioteca organizada",
  "Áudios para ouvir offline",
  "Organização por capítulos"
];

const faqs = [
  {
    question: "Preciso pagar para testar?",
    answer:
      "Não. O plano grátis existe para você enviar um documento curto e ouvir com voz local antes de decidir."
  },
  {
    question: "A voz humana já funciona?",
    answer:
      "Funciona quando o provider neural, como ElevenLabs, está configurado no servidor e o usuário possui acesso Premium."
  },
  {
    question: "O que posso enviar agora?",
    answer:
      "Nesta versão, PDF e imagens. Outros formatos ficam em páginas específicas e no roadmap, sem atrapalhar o primeiro teste."
  }
];

export function LandingPage() {
  const inputRef = useRef<HTMLInputElement>(null);

  const sendFileToWorkspace = (file?: File) => {
    if (!file) {
      return;
    }

    window.dispatchEvent(
      new CustomEvent("real-reader-upload-file", {
        detail: { file }
      })
    );

    window.requestAnimationFrame(() => {
      document.getElementById("reader")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    sendFileToWorkspace(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    sendFileToWorkspace(event.dataTransfer.files?.[0]);
  };

  return (
    <main className="bg-[radial-gradient(circle_at_top_left,#d8f3dc_0,transparent_30%),linear-gradient(180deg,#fffaf0_0%,#f8f5ef_55%,#eef7f1_100%)]">
      <section className="mx-auto grid min-h-[88vh] w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:items-center lg:px-8">
        <div>
          <div className="mb-5 inline-flex rounded-full border border-real-100 bg-white/80 px-3 py-1 text-sm font-black text-real-700 shadow-sm">
            REAL Reader · Aprendizado em áudio
          </div>
          <h1 className="max-w-5xl text-5xl font-black tracking-tight text-ink sm:text-7xl">
            Estude enquanto dirige, trabalha ou caminha.
          </h1>
          <p className="mt-5 max-w-2xl text-xl leading-9 text-slate-700">
            Envie um PDF ou imagem e ouça seu conteúdo em poucos cliques. O foco
            é chegar ao primeiro áudio rápido.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className="rounded-2xl bg-real-600 px-6 py-4 text-center font-black text-white transition hover:-translate-y-0.5 hover:bg-real-700"
              onClick={() => inputRef.current?.click()}
            >
              Experimentar grátis
            </button>
            <a
              href="#reader"
              className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-center font-black text-ink transition hover:-translate-y-0.5 hover:shadow-md"
            >
              Abrir workspace
            </a>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-500">
            Grátis para testar com voz local. Premium para voz humana, capítulos,
            continuidade e MP3.
          </p>
        </div>

        <div
          className="rounded-[2rem] border-2 border-dashed border-real-200 bg-white/90 p-5 shadow-soft backdrop-blur"
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,image/png,image/jpeg,image/webp,image/bmp"
            className="hidden"
            onChange={handleInputChange}
          />
          <div className="rounded-[1.5rem] bg-gradient-to-br from-real-600 to-real-950 p-6 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-real-100">
              Comece aqui
            </p>
            <h2 className="mt-4 text-3xl font-black">
              Arraste seu PDF ou escolha um arquivo.
            </h2>
            <p className="mt-3 leading-7 text-real-50">
              O app processa no modo rápido primeiro para você ouvir sem esperar
              OCR pesado.
            </p>
            <button
              type="button"
              className="mt-6 w-full rounded-2xl bg-white px-5 py-4 font-black text-real-700 transition hover:-translate-y-0.5 hover:shadow-lg"
              onClick={() => inputRef.current?.click()}
            >
              Escolher arquivo
            </button>
          </div>
          <div className="mt-4 grid gap-2 text-sm font-bold text-slate-600 sm:grid-cols-3">
            <span className="rounded-2xl bg-real-50 px-3 py-2 text-real-800">
              PDF
            </span>
            <span className="rounded-2xl bg-real-50 px-3 py-2 text-real-800">
              Imagens
            </span>
            <span className="rounded-2xl bg-amber-50 px-3 py-2 text-amber-900">
              Voz local grátis
            </span>
          </div>
        </div>
      </section>

      <LandingSection eyebrow="Como funciona" title="Três passos. Sem palestra.">
        <div className="grid gap-3 md:grid-cols-3">
          {steps.map((step, index) => (
            <article
              key={step.title}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-real-600 text-lg font-black text-white">
                {index + 1}
              </div>
              <h3 className="mt-4 text-xl font-black text-ink">{step.title}</h3>
              <p className="mt-2 leading-7 text-slate-600">{step.text}</p>
            </article>
          ))}
        </div>
      </LandingSection>

      <LandingSection eyebrow="Premium" title="Pague quando perceber o tempo economizado.">
        <div className="grid gap-5 lg:grid-cols-[1fr_320px] lg:items-center">
          <div className="grid gap-3 sm:grid-cols-2">
            {premiumBenefits.map((benefit) => (
              <div
                key={benefit}
                className="rounded-2xl border border-real-100 bg-white px-4 py-3 font-black text-slate-700"
              >
                ✔ {benefit}
              </div>
            ))}
          </div>
          <Link
            href="/pricing"
            className="rounded-3xl bg-ink px-6 py-5 text-center text-xl font-black text-white transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            Assinar Premium
          </Link>
        </div>
      </LandingSection>

      <LandingSection eyebrow="FAQ" title="Dúvidas rápidas antes do primeiro teste.">
        <div className="grid gap-3">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="rounded-3xl border border-slate-200 bg-white p-5"
            >
              <summary className="cursor-pointer font-black text-ink">
                {faq.question}
              </summary>
              <p className="mt-3 leading-7 text-slate-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      </LandingSection>

      <footer className="border-t border-slate-200 bg-white/80 px-4 py-8 text-sm text-slate-600 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <p className="font-black text-ink">REAL Reader</p>
          <nav className="flex flex-wrap gap-3">
            <Link href="/vozes" className="font-bold hover:text-real-700">
              Vozes
            </Link>
            <Link href="/ia-estudos" className="font-bold hover:text-real-700">
              IA de estudos
            </Link>
            <Link href="/dashboard" className="font-bold hover:text-real-700">
              Dashboard
            </Link>
            <Link href="/roadmap" className="font-bold hover:text-real-700">
              Roadmap
            </Link>
          </nav>
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
    <section className="mx-auto w-full max-w-7xl px-4 py-9 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-real-600">
        {eyebrow}
      </p>
      <h2 className="mt-3 max-w-4xl text-3xl font-black tracking-tight text-ink sm:text-5xl">
        {title}
      </h2>
      <div className="mt-7">{children}</div>
    </section>
  );
}
