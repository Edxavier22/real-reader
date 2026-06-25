import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-4 py-10 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-real-600">
        Checkout cancelado
      </p>
      <h1 className="mt-3 text-5xl font-black text-ink">
        Tudo bem, você continua no plano grátis.
      </h1>
      <p className="mt-4 text-lg leading-8 text-slate-700">
        Volte quando quiser para assinar o Premium e liberar blocos, OCR completo,
        voz neural e MP3.
      </p>
      <Link
        href="/pricing"
        className="mx-auto mt-8 rounded-2xl bg-real-600 px-6 py-4 font-black text-white"
      >
        Ver planos
      </Link>
    </main>
  );
}
