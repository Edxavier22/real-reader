export type PlanId = "free" | "premium";

export type CommercialPlan = {
  id: PlanId;
  name: string;
  badge: string;
  priceLabel: string;
  ctaLabel: string;
  maxPagesPerPdf: number;
  historyLimit: number;
  maxNeuralCharsPerRequest: number;
  monthlyNeuralChars: number;
  features: {
    localVoice: boolean;
    neuralVoice: boolean;
    mp3: boolean;
    studyBlocks: boolean;
    fullOcr: boolean;
    bookmarks: boolean;
    txtByBlock: boolean;
    advancedHistory: boolean;
  };
};

export const commercialPlans: Record<PlanId, CommercialPlan> = {
  free: {
    id: "free",
    name: "FREE",
    badge: "Teste grátis",
    priceLabel: "R$ 0",
    ctaLabel: "Começar grátis",
    maxPagesPerPdf: 10,
    historyLimit: 3,
    maxNeuralCharsPerRequest: 0,
    monthlyNeuralChars: 0,
    features: {
      localVoice: true,
      neuralVoice: false,
      mp3: false,
      studyBlocks: false,
      fullOcr: false,
      bookmarks: false,
      txtByBlock: false,
      advancedHistory: false
    }
  },
  premium: {
    id: "premium",
    name: "PREMIUM",
    badge: "Para estudar pesado",
    priceLabel: "Assinatura mensal",
    ctaLabel: "Assinar Premium",
    maxPagesPerPdf: 300,
    historyLimit: 30,
    maxNeuralCharsPerRequest: 4_000,
    monthlyNeuralChars: 500_000,
    features: {
      localVoice: true,
      neuralVoice: true,
      mp3: true,
      studyBlocks: true,
      fullOcr: true,
      bookmarks: true,
      txtByBlock: true,
      advancedHistory: true
    }
  }
};

export function getPlan(planId?: string | null): CommercialPlan {
  return planId === "premium" ? commercialPlans.premium : commercialPlans.free;
}

export function getClientConfiguredPlan(): CommercialPlan {
  return getPlan(process.env.NEXT_PUBLIC_REAL_READER_DEMO_PLAN);
}

export function formatPlanRestriction(plan: CommercialPlan, feature: string) {
  return `${feature} faz parte do plano PREMIUM. O plano ${plan.name} continua disponível para teste com voz local e limite de ${plan.maxPagesPerPdf} páginas por PDF.`;
}

export function isOverPageLimit(plan: CommercialPlan, pageCount: number) {
  return pageCount > plan.maxPagesPerPdf;
}
