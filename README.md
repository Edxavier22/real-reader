# REAL Reader

REAL Reader é uma plataforma de aprendizado narrado por IA. O produto não é
vendido como “leitor de PDF”: ele vende tempo, foco e estudo sem tela.

Posicionamento:

> Transforme qualquer conteúdo em uma experiência de aprendizado narrada por
> Inteligência Artificial.

A V1.3 Comercial preserva a base local e adiciona a fundação SaaS: landing page
de conversão, planos, pricing, login preparado, Stripe Checkout, schema de banco,
dashboard de aprendizado e voz neural real via ElevenLabs quando as chaves forem
configuradas.

## O que funciona na V1.3 Comercial

- Landing page vendável com CTA **Testar grátis** e **Assinar Premium**
- Landing completa com hero, benefícios, como funciona, antes/depois,
  depoimentos preparados, planos, FAQ, CTA e rodapé
- Plano **FREE** com limite de 10 páginas por PDF
- Plano **PREMIUM** preparado com limite de 300 páginas por PDF
- Biblioteca Premium de vozes preparada: Professor, Professora, Narrador,
  Podcast, Calmo, Motivador, Jornalista, Infantil, Storytelling e Minha Voz
- Arquitetura de modos de estudo por IA: resumos, mapa mental, questões,
  flashcards, modo aula, podcast e audiobook
- Dashboard `/dashboard` preparado para métricas de aprendizagem
- Onboarding inteligente no primeiro acesso
- Tela do app evoluída para **Minha Biblioteca**
- Analytics local preparado para eventos reais: onboarding, conteúdo adicionado,
  documento processado, checkout, MP3 e limpeza de texto
- Página `/pricing`
- Páginas `/checkout/success` e `/checkout/cancel`
- Página `/login` preparada para Supabase Auth
- Página `/minha-voz` com fluxo de consentimento, sem clonagem ativa
- Upload local de PDF e imagens (`PNG`, `JPG`, `WEBP`, `BMP`)
- Modo rápido como padrão
- OCR completo por intervalo/bloco somente no Premium
- Blocos, marcador, TXT por bloco e MP3 bloqueados no FREE com aviso claro
- Histórico local limitado por plano
- Botão **Limpar texto** para reduzir ruído de OCR
- Endpoint `/api/checkout/session` para Stripe Checkout
- Endpoint `/api/tts/neural` para ElevenLabs
- Endpoint `/api/tts/mp3` com geração neural quando o plano e a API estiverem prontos
- Schema SQL em `database/schema.sql`

## Planos

| Recurso | FREE | PREMIUM |
| --- | --- | --- |
| Páginas por PDF | até 10 | até 300 |
| Voz local do navegador | sim | sim |
| Histórico | limitado | avançado |
| Blocos/módulos | não | sim |
| OCR completo | não | por intervalo/bloco |
| Salvar onde parou | não | sim |
| TXT por bloco | não | sim |
| Voz neural | não | sim, se ElevenLabs estiver configurado |
| MP3 | não | página/bloco/documento, se ElevenLabs estiver configurado |

Antes de Supabase/Stripe estarem ligados de verdade, o plano exibido no cliente
vem de `NEXT_PUBLIC_REAL_READER_DEMO_PLAN`. Em produção, substitua isso pelo
plano salvo no banco e validado no servidor.

## Variáveis de ambiente

Copie:

```bash
Copy-Item .env.example .env.local
```

Principais variáveis:

```env
NEXT_PUBLIC_REAL_READER_DEMO_PLAN=free
NEXT_PUBLIC_APP_URL=http://localhost:3000

TTS_PROVIDER=browser
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=
ELEVENLABS_MODEL_ID=eleven_multilingual_v2

STRIPE_SECRET_KEY=
STRIPE_PRICE_ID=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Nunca exponha `ELEVENLABS_API_KEY`, `STRIPE_SECRET_KEY` ou
`SUPABASE_SERVICE_ROLE_KEY` no navegador.

## Voz neural real

A integração ElevenLabs fica no servidor:

- `/api/tts/neural`
- `/api/tts/mp3` com `voiceMode: "neural"`

Se `ELEVENLABS_API_KEY` não existir, o app retorna aviso claro. Se o usuário não
tiver plano Premium, o servidor bloqueia a geração.

## Minha voz autorizada

A página `/minha-voz` prepara o consentimento:

- confirmação de titularidade
- aceite de uso
- aviso de remoção dos dados
- campo futuro `voiceId`

Não há clonagem ativa na V1.3. O sistema não permite voz de terceiros.

## Banco de dados

O arquivo `database/schema.sql` prepara:

- `users`
- `subscriptions`
- `documents`
- `study_blocks`
- `reading_bookmarks`
- `usage_limits`

Antes de produção, aplique RLS, webhooks do Stripe e vínculo real entre sessão,
assinatura e limites.

## Como rodar

```bash
pnpm install
pnpm dev
```

Abra:

```text
http://localhost:3000
```

## Como validar

```bash
pnpm typecheck
pnpm build
```

## Observação importante

A V1.3 deixa as peças comerciais prontas, mas não finge login, pagamento ou
assinatura ativa sem configuração real. Recursos externos dependem das chaves e
dos webhooks corretos.

## Regra de produto

Toda nova funcionalidade deve responder “sim” à pergunta:

> Isso aumenta significativamente a chance de alguém pagar pelo REAL Reader?

Se não aumentar conversão, retenção, receita ou percepção Premium, entra no
backlog em vez de ser implementada agora.

## Sprint atual — Biblioteca de Estudos

Objetivo: fazer o usuário sentir que entrou no lugar onde estuda, não em um
leitor de PDF.

Escopo entregue:

- onboarding por objetivo de aprendizado;
- preferência de estudo;
- área **Minha Biblioteca**;
- continue estudando;
- recomendações simples baseadas no perfil;
- arquitetura local de analytics.

Critérios de sucesso desta Sprint:

- mais usuários clicando em **Adicionar conteúdo**;
- maior clareza do valor Premium;
- base pronta para medir retenção e conversão sem inventar métricas.
