import Link from "next/link";

const supportEmail =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "configure-seu-email@realreader.app";

export default function SupportPage() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/" className="text-sm font-bold text-real-700 hover:underline">
        ← Voltar
      </Link>

      <article className="mt-8 rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-soft sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-real-600">
          Suporte
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-ink">
          Precisa de ajuda com o REAL Reader?
        </h1>
        <p className="mt-4 leading-7 text-slate-700">
          Durante o Beta Comercial, o suporte é direto e objetivo. Envie uma
          mensagem com o e-mail usado na conta e uma descrição do problema.
        </p>

        <section className="mt-8 rounded-3xl bg-real-50 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-real-700">
            E-mail de contato
          </p>
          <a
            href={`mailto:${supportEmail}`}
            className="mt-2 block text-2xl font-black text-real-800 hover:underline"
          >
            {supportEmail}
          </a>
          <p className="mt-3 text-sm leading-6 text-real-900">
            Prazo esperado de resposta: até 2 dias úteis durante o beta.
          </p>
        </section>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <SupportCard
            title="Problemas com pagamento"
            text="Informe o e-mail da conta, data aproximada da compra e o que aparece na tela de planos."
          />
          <SupportCard
            title="Problemas com login"
            text="Informe o e-mail usado no cadastro e se o problema acontece no login, cadastro ou recuperação de senha."
          />
          <SupportCard
            title="Problemas com documentos"
            text="Informe tipo de arquivo, tamanho aproximado, número de páginas e se o erro aconteceu no upload, OCR ou leitura."
          />
          <SupportCard
            title="Problemas com voz neural"
            text="Informe se o erro aconteceu ao ouvir, gerar MP3 ou escolher uma voz Premium."
          />
        </div>
      </article>
    </main>
  );
}

function SupportCard({ title, text }: { title: string; text: string }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-black text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </section>
  );
}
