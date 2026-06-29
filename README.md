# REAL Reader

REAL Reader é uma plataforma de aprendizado narrado por IA.

O produto não é vendido como “leitor de PDF”. Ele vende tempo, foco e estudo sem
ficar preso à tela.

> Transforme qualquer conteúdo em uma experiência de aprendizado narrada por
> Inteligência Artificial.

## RC1 — Produto Vendável

Objetivo do RC1: permitir que um novo usuário crie conta, assine o Premium,
tenha o plano liberado automaticamente e retome seus estudos depois de sair e
voltar.

O que foi fechado nesta etapa:

- cadastro, login, logout, recuperação de senha e persistência de sessão via
  Supabase Auth;
- plano resolvido no servidor, não por variável pública;
- checkout Stripe autenticado;
- webhook Stripe com assinatura verificada;
- assinatura Premium persistida no banco;
- portal Stripe para cancelamento/gestão de cobrança;
- endpoints Premium protegidos no servidor;
- uso mensal de voz neural/MP3 registrado;
- documentos, favoritos, blocos, progresso e preferências sincronizados para
  usuários logados;
- fallback local quando voz neural não está configurada ou falha;
- schema Supabase com índices, preferências, conteúdo sincronizado e RLS.

## O que funciona

- Landing curta com upload direto.
- Upload local de PDF e imagens (`PNG`, `JPG`, `WEBP`, `BMP`).
- Extração de texto selecionável em PDF.
- OCR rápido quando a página não tem texto útil.
- OCR completo por intervalo/bloco no Premium.
- Texto separado por páginas.
- Leitura local com voz do navegador.
- Player com play, pausa, página anterior/próxima, velocidade e estimativas.
- Blocos/módulos de estudo no Premium.
- Salvar e continuar de onde parou.
- Histórico local para visitantes.
- Sincronização em nuvem para usuários logados.
- Download `.TXT` do documento inteiro e do bloco selecionado.
- MP3 com voz neural Premium quando ElevenLabs estiver configurado.
- Biblioteca de vozes Premium com disponibilidade real por provider.
- Minha Voz preparada com consentimento, sem clonagem ativa.

## Planos

| Recurso | FREE | PREMIUM |
| --- | --- | --- |
| Páginas por documento | até 10 | até 300 |
| Voz local do navegador | sim | sim |
| Histórico | local limitado | sincronizado |
| Blocos/módulos | não | sim |
| OCR completo | não | por intervalo/bloco |
| Salvar onde parou | não | sim |
| TXT por bloco | não | sim |
| Voz neural | não | sim, com ElevenLabs configurado |
| MP3 | não | página/bloco/documento |
| Minha Voz | não | arquitetura preparada, sem clonagem ativa |

## Variáveis de ambiente

Copie:

```bash
Copy-Item .env.example .env.local
```

Configure:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPPORT_EMAIL=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

STRIPE_SECRET_KEY=
STRIPE_PRICE_ID=
STRIPE_WEBHOOK_SECRET=

SPEECH_PROVIDER=elevenlabs
TTS_PROVIDER=browser

ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=
ELEVENLABS_MODEL_ID=eleven_multilingual_v2
ELEVENLABS_OUTPUT_FORMAT=mp3_44100_128

ELEVENLABS_VOICE_PROFESSOR_ID=
ELEVENLABS_VOICE_PROFESSORA_ID=
ELEVENLABS_VOICE_PODCAST_ID=
ELEVENLABS_VOICE_CALMO_ID=
ELEVENLABS_VOICE_MOTIVADOR_ID=
ELEVENLABS_VOICE_JORNALISTA_ID=
ELEVENLABS_VOICE_STORYTELLING_ID=
ELEVENLABS_VOICE_INFANTIL_ID=

AUTHORIZED_VOICE_ID=
```

Nunca exponha no navegador:

- `SUPABASE_SERVICE_ROLE_KEY`;
- `STRIPE_SECRET_KEY`;
- `STRIPE_WEBHOOK_SECRET`;
- `ELEVENLABS_API_KEY`.

## Banco de dados

1. Crie um projeto Supabase.
2. Abra o SQL Editor.
3. Execute `database/schema.sql`.
4. Confirme que RLS está ativo nas tabelas.
5. Configure Supabase Auth com e-mail/senha.

Tabelas principais:

- `users`
- `subscriptions`
- `user_preferences`
- `documents`
- `study_blocks`
- `reading_bookmarks`
- `usage_limits`
- `security_events`

## Stripe

1. Crie produto e preço recorrente.
2. Defina `STRIPE_PRICE_ID`.
3. Defina `STRIPE_SECRET_KEY`.
4. Crie webhook apontando para:

```text
https://SEU-DOMINIO/api/stripe/webhook
```

5. Eventos recomendados:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

6. Defina `STRIPE_WEBHOOK_SECRET`.
7. Configure o Stripe Billing Portal para permitir cancelamento/gestão.

## ElevenLabs

Para voz neural/MP3:

1. Configure `ELEVENLABS_API_KEY`.
2. Configure `ELEVENLABS_VOICE_ID`.
3. Opcionalmente configure Voice IDs específicos da biblioteca.

Se ElevenLabs não estiver configurado, o app não finge voz neural. O usuário
continua com a voz local gratuita do navegador.

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

## Checklist comercial antes de vender

- [ ] Supabase configurado em produção.
- [ ] `database/schema.sql` executado.
- [ ] Stripe Checkout em modo teste validado.
- [ ] Webhook Stripe recebendo eventos.
- [ ] Assinatura Premium gravando em `subscriptions`.
- [ ] Login, logout e recuperação testados.
- [ ] Usuário Premium conseguindo gerar MP3 neural.
- [ ] Usuário Free bloqueado nos endpoints Premium.
- [ ] Documento/progresso/favorito sincronizando após novo login.
- [ ] Termos de uso, privacidade e suporte publicados.
- [ ] `NEXT_PUBLIC_SUPPORT_EMAIL` configurado com e-mail real.

## Backlog protegido

Não entram no RC1:

- Chat IA;
- Professor IA;
- Quiz;
- Flashcards;
- Mapas mentais;
- novos formatos de arquivo;
- empresas/B2B;
- gamificação.

Esses itens permanecem no backlog oficial até que o produto esteja vendendo e
medindo conversão/retenção.
