import Link from "next/link";
import type { ReactNode } from "react";
import { BillingPortalButton } from "@/components/BillingPortalButton";
import { CheckoutButton } from "@/components/CheckoutButton";
import { commercialPlans } from "@/lib/commercial/plans";

export default function PricingPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/" className="text-sm font-bold text-real-700 hover:underline">
        ← Voltar para o REAL Reader
      </Link>
      <header className="mt-8 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-real-600">
          Planos
        </p>
        <h1 className="mt-3 text-5xl font-black tracking-tight text-ink">
          Comece grátis. Assine quando precisar estudar pesado.
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-700">
          O Free ajuda você a experimentar. O Premium libera voz neural, MP3,
          OCR completo, blocos e continuidade de estudo vinculada à sua conta.
        </p>
      </header>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <PlanCard
          title={commercialPlans.free.name}
          badge={commercialPlans.free.badge}
          price={commercialPlans.free.priceLabel}
          features={[
            "Até 10 páginas por PDF",
            "Voz local do navegador",
            "Histórico local limitado",
            "Sem OCR completo",
            "Sem blocos",
            "Sem MP3"
          ]}
          action={
            <a
              href="/#reader"
              className="block w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center font-black text-ink transition hover:-translate-y-0.5 hover:shadow-md"
            >
              Começar grátis
            </a>
          }
        />
        <PlanCard
          featured
          title={commercialPlans.premium.name}
          badge={commercialPlans.premium.badge}
          price={commercialPlans.premium.priceLabel}
          features={[
            "Até 300 páginas por PDF",
            "Blocos e módulos",
            "OCR completo por intervalo/bloco",
            "Salvar onde parou",
            "Baixar TXT por bloco",
            "Voz neural e MP3 com ElevenLabs configurado"
          ]}
          action={<CheckoutButton />}
        />
      </section>

      <p className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        Para assinar, entre na sua conta. Após o pagamento, o webhook do Stripe
        libera Premium automaticamente. Se as chaves ainda não estiverem
        configuradas, o sistema informa isso em vez de simular compra.
      </p>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white/80 p-5">
        <h2 className="text-xl font-black text-ink">Já é assinante?</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Gerencie cancelamento, renovação e dados de cobrança pelo portal seguro
          do Stripe.
        </p>
        <div className="mt-4 max-w-sm">
          <BillingPortalButton />
        </div>
      </section>
    </main>
  );
}

function PlanCard({
  title,
  badge,
  price,
  features,
  action,
  featured = false
}: {
  title: string;
  badge: string;
  price: string;
  features: string[];
  action: ReactNode;
  featured?: boolean;
}) {
  return (
    <article
      className={[
        "rounded-[2rem] border p-6 shadow-soft",
        featured
          ? "border-real-200 bg-white ring-4 ring-real-100"
          : "border-slate-200 bg-white/80"
      ].join(" ")}
    >
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-real-600">
        {badge}
      </p>
      <h2 className="mt-3 text-3xl font-black text-ink">{title}</h2>
      <p className="mt-2 text-xl font-bold text-slate-700">{price}</p>
      <ul className="mt-6 space-y-3 text-slate-700">
        {features.map((feature) => (
          <li key={feature} className="rounded-2xl bg-slate-50 px-4 py-3">
            {feature}
          </li>
        ))}
      </ul>
      <div className="mt-6">{action}</div>
    </article>
  );
}
