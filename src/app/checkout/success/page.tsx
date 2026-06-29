import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-4 py-10 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-real-600">
        Premium
      </p>
      <h1 className="mt-3 text-5xl font-black text-ink">
        Pagamento aprovado. Liberando seu Premium.
      </h1>
      <p className="mt-4 text-lg leading-8 text-slate-700">
        O Stripe envia a confirmação para o REAL Reader por webhook. Normalmente
        a liberação é automática em poucos segundos. Se ainda aparecer Free,
        atualize a página após alguns instantes.
      </p>
      <div className="mx-auto mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/#reader"
          className="rounded-2xl bg-real-600 px-6 py-4 font-black text-white"
        >
          Ir para o leitor
        </Link>
        <Link
          href="/pricing"
          className="rounded-2xl border border-slate-200 bg-white px-6 py-4 font-black text-ink"
        >
          Ver plano
        </Link>
      </div>
    </main>
  );
}
