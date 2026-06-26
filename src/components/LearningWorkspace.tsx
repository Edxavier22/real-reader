"use client";

import { useEffect, useMemo, useState } from "react";
import type { CommercialPlan } from "@/lib/commercial/plans";
import { trackProductEvent } from "@/lib/product/analytics";
import {
  getObjectiveLabel,
  getPreferenceLabel,
  learningObjectiveOptions,
  learningPreferenceOptions,
  readLearningProfile,
  saveLearningProfile,
  type LearningObjective,
  type LearningPreference,
  type LearningProfile
} from "@/lib/product/onboarding";
import type { HistoryRecord, ReaderDocument } from "@/lib/reader/types";

export function LearningWorkspace({
  history,
  currentDocument,
  plan,
  onAddContent
}: {
  history: HistoryRecord[];
  currentDocument: ReaderDocument | null;
  plan: CommercialPlan;
  onAddContent: () => void;
}) {
  const [profile, setProfile] = useState<LearningProfile | null>(null);
  const [objective, setObjective] = useState<LearningObjective>("concurso");
  const [preference, setPreference] = useState<LearningPreference>("escutando");

  useEffect(() => {
    setProfile(readLearningProfile());
  }, []);

  const latestDocument = currentDocument ?? history[0] ?? null;
  const hasSavedProgress = Boolean(latestDocument?.lastRead);

  const welcome = useMemo(() => {
    if (!profile) {
      return "Bom te ver por aqui. Envie um conteúdo e comece a ouvir.";
    }

    return `Foco: ${getObjectiveLabel(profile.objective)} · ${getPreferenceLabel(
      profile.preference
    )}.`;
  }, [profile]);

  const saveProfile = () => {
    const nextProfile: LearningProfile = {
      objective,
      preference,
      createdAt: new Date().toISOString()
    };
    saveLearningProfile(nextProfile);
    setProfile(nextProfile);
    trackProductEvent("onboarding_completed", {
      objective,
      preference
    });
  };

  const addContent = () => {
    trackProductEvent("add_content_clicked", {
      surface: "learning_workspace",
      plan: plan.id
    });
    onAddContent();
  };

  return (
    <section className="mb-5 rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-soft backdrop-blur sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[1fr_320px] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-real-600">
            Minha Biblioteca
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-ink sm:text-4xl">
            {welcome}
          </h2>
          <p className="mt-2 max-w-2xl leading-7 text-slate-600">
            A ação principal é simples: adicionar conteúdo e apertar play.
          </p>
        </div>
        <button
          type="button"
          className="rounded-[1.5rem] bg-real-600 px-6 py-5 text-lg font-black text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-real-700"
          onClick={addContent}
        >
          + Adicionar conteúdo
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <WorkspaceCard
          title="Biblioteca"
          value={`${history.length} documento(s)`}
          text="Seus arquivos recentes ficam neste navegador."
        />
        <WorkspaceCard
          title="Últimos documentos"
          value={latestDocument?.name ?? "Nenhum ainda"}
          text={latestDocument ? "Clique no histórico para reabrir." : "Envie o primeiro arquivo."}
          truncate
        />
        <WorkspaceCard
          title="Continuar de onde parou"
          value={hasSavedProgress ? `Página ${latestDocument?.lastRead?.pageNumber}` : "Premium"}
          text={
            plan.features.bookmarks
              ? "Seu ponto salvo aparece aqui."
              : "O Premium salva seu progresso."
          }
        />
        <WorkspaceCard
          title="Plano atual"
          value={plan.name}
          text={
            plan.id === "premium"
              ? "Voz neural, blocos e MP3 liberados conforme configuração."
              : "Teste rápido com voz local."
          }
        />
      </div>

      <details className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <summary className="cursor-pointer text-sm font-black text-slate-700">
          Personalizar meu estudo depois
        </summary>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <OnboardingGroup
            title="Objetivo"
            options={learningObjectiveOptions}
            value={objective}
            onChange={(value) => setObjective(value as LearningObjective)}
          />
          <OnboardingGroup
            title="Preferência"
            options={learningPreferenceOptions.map((option) => ({
              ...option,
              promise: "Personaliza sua experiência."
            }))}
            value={preference}
            onChange={(value) => setPreference(value as LearningPreference)}
          />
          <button
            type="button"
            className="rounded-2xl bg-ink px-5 py-4 font-black text-white transition hover:-translate-y-0.5 lg:col-span-2"
            onClick={saveProfile}
          >
            Salvar preferências
          </button>
        </div>
      </details>
    </section>
  );
}

function WorkspaceCard({
  title,
  value,
  text,
  truncate = false
}: {
  title: string;
  value: string;
  text: string;
  truncate?: boolean;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
        {title}
      </p>
      <p
        className={[
          "mt-2 text-xl font-black text-ink",
          truncate ? "truncate" : ""
        ].join(" ")}
      >
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
    </div>
  );
}

function OnboardingGroup({
  title,
  options,
  value,
  onChange
}: {
  title: string;
  options: Array<{ value: string; label: string; promise: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4">
      <p className="font-black text-ink">{title}</p>
      <div className="mt-3 grid gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={[
              "rounded-2xl border p-3 text-left transition",
              value === option.value
                ? "border-real-300 bg-real-50"
                : "border-slate-200 hover:bg-slate-50"
            ].join(" ")}
            onClick={() => onChange(option.value)}
          >
            <p className="font-bold text-ink">{option.label}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {option.promise}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
