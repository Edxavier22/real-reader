import Link from "next/link";
import type { ReactNode } from "react";

export default function PrivacyPage() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/" className="text-sm font-bold text-real-700 hover:underline">
        ← Voltar
      </Link>

      <article className="mt-8 rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-soft sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-real-600">
          Privacidade
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-ink">
          Como o REAL Reader trata seus dados
        </h1>
        <p className="mt-4 leading-7 text-slate-700">
          Esta política resume quais dados coletamos, por que coletamos e como
          você pode solicitar acesso, correção ou exclusão.
        </p>

        <div className="mt-8 space-y-6 text-slate-700">
          <Section title="1. Dados de conta">
            Coletamos dados necessários para criar e manter sua conta, como
            e-mail, nome informado, plano, status de assinatura e último acesso.
          </Section>

          <Section title="2. Documentos e progresso">
            Para usuários logados, podemos salvar documentos processados, texto
            extraído, blocos, favoritos, página onde parou, preferências de voz e
            velocidade. Visitantes podem usar histórico local no próprio
            navegador.
          </Section>

          <Section title="3. Pagamentos">
            Pagamentos são processados pelo Stripe. O REAL Reader não armazena o
            número completo do cartão. Guardamos apenas identificadores de cliente
            e assinatura para liberar ou remover o Premium automaticamente.
          </Section>

          <Section title="4. Supabase">
            Usamos Supabase para autenticação, sessão, banco de dados e
            persistência de informações da conta.
          </Section>

          <Section title="5. ElevenLabs">
            Quando você usa voz neural ou MP3 Premium, o texto enviado pode ser
            processado pela ElevenLabs para gerar áudio. Se a voz neural não
            estiver configurada ou falhar, a voz local do navegador pode ser usada
            como alternativa.
          </Section>

          <Section title="6. Uso e limites">
            Registramos métricas de uso, como páginas processadas, páginas com
            OCR, caracteres de voz neural e gerações de MP3 para aplicar limites
            de plano, controlar custos e manter o serviço funcionando.
          </Section>

          <Section title="7. Direitos do usuário">
            Você pode solicitar acesso, correção ou exclusão dos seus dados. Em
            caso de assinatura ativa, alguns registros financeiros podem precisar
            ser mantidos pelo período exigido por lei ou por obrigações
            antifraude.
          </Section>

          <Section title="8. Segurança">
            Chaves de API e credenciais sensíveis ficam no servidor. Ainda assim,
            evite enviar documentos que você não tenha autorização para processar.
          </Section>
        </div>
      </article>
    </main>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-black text-ink">{title}</h2>
      <p className="mt-2 leading-7">{children}</p>
    </section>
  );
}
