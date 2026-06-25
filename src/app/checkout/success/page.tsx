import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-4 py-10 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-real-600">
        Checkout
      </p>
      <h1 className="mt-3 text-5xl font-black text-ink">
        Pagamento recebido.
      </h1>
      <p className="mt-4 text-lg leading-8 text-slate-700">
        A assinatura precisa ser confirmada por webhook do Stripe e vinculada ao
        login do usuário antes de liberar o plano Premium em produção.
      </p>
      <Link
        href="/"
        className="mx-auto mt-8 rounded-2xl bg-real-600 px-6 py-4 font-black text-white"
      >
        Voltar ao leitor
      </Link>
    </main>
  );
}
