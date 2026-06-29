import Link from "next/link";
import type { ReactNode } from "react";

export default function TermsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/" className="text-sm font-bold text-real-700 hover:underline">
        ← Voltar
      </Link>

      <article className="mt-8 rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-soft sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-real-600">
          Termos de Uso
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-ink">
          REAL Reader Beta Comercial
        </h1>
        <p className="mt-4 leading-7 text-slate-700">
          Estes termos explicam, de forma simples, como usar o REAL Reader durante
          o Beta Comercial. Ao criar conta ou usar o serviço, você concorda com
          estas condições.
        </p>

        <div className="mt-8 space-y-6 text-slate-700">
          <Section title="1. Produto em beta">
            O REAL Reader está em fase beta. Isso significa que o produto já pode
            ser usado por clientes reais, mas ainda pode receber ajustes,
            melhorias e correções com base no uso dos primeiros usuários.
          </Section>

          <Section title="2. Uso pessoal">
            O serviço é destinado ao estudo pessoal e ao consumo individual de
            conteúdo. Você é responsável por ter direito de usar os documentos
            enviados ao REAL Reader.
          </Section>

          <Section title="3. Planos e limites">
            O plano Free permite testar o produto com limites menores. O plano
            Premium libera recursos pagos como OCR completo, continuidade de
            estudo, voz neural e MP3, respeitando os limites informados no
            produto.
          </Section>

          <Section title="4. Pagamento e cancelamento">
            Assinaturas são processadas pelo Stripe. O cancelamento deve ser feito
            pelo portal de cobrança disponível no produto. Após o cancelamento, o
            acesso Premium pode permanecer ativo até o fim do período já pago,
            conforme a configuração da assinatura.
          </Section>

          <Section title="5. Voz neural">
            A voz neural depende de provedores externos, como ElevenLabs. Caso o
            provedor esteja instável, indisponível ou sem configuração válida, o
            REAL Reader pode voltar para a voz local do navegador.
          </Section>

          <Section title="6. Minha Voz">
            O REAL Reader não permite uso de voz de terceiros sem autorização. O
            recurso Minha Voz só deve ser usado com consentimento do titular da
            voz e respeitando direitos de imagem, voz e privacidade.
          </Section>

          <Section title="7. Responsabilidades">
            O OCR pode conter erros dependendo da qualidade do documento. O REAL
            Reader ajuda no estudo, mas não substitui revisão humana, orientação
            profissional ou leitura crítica de conteúdos importantes.
          </Section>

          <Section title="8. Mudanças nos termos">
            Estes termos podem ser atualizados durante o beta. Quando houver
            mudança relevante, a versão publicada nesta página será atualizada.
          </Section>
        </div>
      </article>
    </main>
  );
}

function Section({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-black text-ink">{title}</h2>
      <p className="mt-2 leading-7">{children}</p>
    </section>
  );
}
