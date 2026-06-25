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

  const recommendation = useMemo(() => {
    if (!profile) {
      return "Configure seu perfil para receber recomendações de estudo.";
    }

    if (profile.objective === "concurso") {
      return "Priorize capítulos curtos, revisão recorrente e questões quando a IA estiver conectada.";
    }

    if (profile.preference === "escutando") {
      return "Use blocos menores e velocidade confortável para transformar deslocamento em estudo.";
    }

    if (profile.preference === "flashcards" || profile.preference === "questoes") {
      return "Quando a IA estiver ativa, transforme capítulos em recuperação ativa.";
    }

    return "Comece com um documento curto e crie rotina antes de processar materiais longos.";
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
    <section className="mb-6 rounded-[2rem] border border-white/80 bg-white/85 p-5 shadow-soft backdrop-blur sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-real-600">
            Minha Biblioteca
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-ink">
            {profile
              ? `Seu espaço de estudo: ${getObjectiveLabel(profile.objective)}`
              : "Vamos personalizar seu jeito de aprender."}
          </h2>
          <p className="mt-2 max-w-2xl leading-7 text-slate-600">
            {profile
              ? `Preferência principal: ${getPreferenceLabel(
                  profile.preference
                )}. ${recommendation}`
              : "Responda duas perguntas rápidas para o REAL Reader deixar de ser upload e virar rotina de aprendizado."}
          </p>
        </div>
        <button
          type="button"
          className="rounded-2xl bg-real-600 px-5 py-4 font-black text-white transition hover:-translate-y-0.5 hover:bg-real-700"
          onClick={addContent}
        >
          Adicionar conteúdo
        </button>
      </div>

      {!profile ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <OnboardingGroup
            title="Qual seu objetivo principal?"
            options={learningObjectiveOptions}
            value={objective}
            onChange={(value) => setObjective(value as LearningObjective)}
          />
          <OnboardingGroup
            title="Como você prefere aprender?"
            options={learningPreferenceOptions.map((option) => ({
              ...option,
              promise: "Personaliza sua experiência de estudo."
            }))}
            value={preference}
            onChange={(value) => setPreference(value as LearningPreference)}
          />
          <button
            type="button"
            className="rounded-2xl bg-ink px-5 py-4 font-black text-white transition hover:-translate-y-0.5 lg:col-span-2"
            onClick={saveProfile}
          >
            Criar minha experiência de estudo
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <LearningStat label="Documentos na biblioteca" value={history.length} />
          <LearningStat
            label="Continue estudando"
            value={currentDocument?.name ?? history[0]?.name ?? "Nenhum documento"}
            compact
          />
          <LearningStat label="Plano atual" value={plan.name} compact />
          <LearningStat label="Tempo estudado" value="A registrar" compact />
        </div>
      )}

      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        <LearningCollection title="Continue estudando" text="Retome seu último conteúdo sem procurar arquivo." />
        <LearningCollection title="Objetivos de estudo" text="Metas semanais entram quando analytics e login forem conectados." />
        <LearningCollection title="Recomendações" text={recommendation} />
      </div>
    </section>
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
            <p className="mt-1 text-xs leading-5 text-slate-500">{option.promise}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function LearningStat({
  label,
  value,
  compact = false
}: {
  label: string;
  value: string | number;
  compact?: boolean;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4">
      <p className={compact ? "truncate text-lg font-black text-ink" : "text-3xl font-black text-ink"}>
        {value}
      </p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
    </div>
  );
}

function LearningCollection({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-4">
      <p className="font-black text-ink">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}
