"use client";

export type LearningObjective =
  | "concurso"
  | "faculdade"
  | "trabalho"
  | "pesquisa"
  | "desenvolvimento"
  | "outro";

export type LearningPreference =
  | "escutando"
  | "lendo"
  | "resumos"
  | "flashcards"
  | "questoes"
  | "revisao";

export type LearningProfile = {
  objective: LearningObjective;
  preference: LearningPreference;
  createdAt: string;
};

export const learningObjectiveOptions: Array<{
  value: LearningObjective;
  label: string;
  promise: string;
}> = [
  {
    value: "concurso",
    label: "Concurso Público",
    promise: "Revisão, questões e constância."
  },
  {
    value: "faculdade",
    label: "Faculdade",
    promise: "Aulas, apostilas e trabalhos sem acumular leitura."
  },
  {
    value: "trabalho",
    label: "Trabalho",
    promise: "Relatórios, normas e treinamentos em áudio."
  },
  {
    value: "pesquisa",
    label: "Pesquisa",
    promise: "Artigos e leituras técnicas com mais ritmo."
  },
  {
    value: "desenvolvimento",
    label: "Desenvolvimento Pessoal",
    promise: "Livros, conteúdos e aprendizado contínuo."
  },
  {
    value: "outro",
    label: "Outro",
    promise: "Uma biblioteca de estudo flexível para sua rotina."
  }
];

export const learningPreferenceOptions: Array<{
  value: LearningPreference;
  label: string;
}> = [
  { value: "escutando", label: "Escutando" },
  { value: "lendo", label: "Lendo" },
  { value: "resumos", label: "Resumos" },
  { value: "flashcards", label: "Flashcards" },
  { value: "questoes", label: "Questões" },
  { value: "revisao", label: "Revisão" }
];

const PROFILE_KEY = "real-reader:learning-profile:v1";

export function readLearningProfile() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as LearningProfile) : null;
  } catch {
    return null;
  }
}

export function saveLearningProfile(profile: LearningProfile) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function getObjectiveLabel(objective: LearningObjective) {
  return (
    learningObjectiveOptions.find((option) => option.value === objective)?.label ??
    "Objetivo de estudo"
  );
}

export function getPreferenceLabel(preference: LearningPreference) {
  return (
    learningPreferenceOptions.find((option) => option.value === preference)
      ?.label ?? "Aprendizado"
  );
}
