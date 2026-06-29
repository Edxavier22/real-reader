# Deploy do REAL Reader RC1 na Vercel

Este guia publica a versão vendável: login, checkout, webhook, Premium automático
e voz neural quando as chaves estiverem configuradas.

## 1. Subir para GitHub

```bash
git add .
git commit -m "REAL Reader RC1 produto vendavel"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/real-reader.git
git push -u origin main
```

## 2. Criar Supabase

1. Crie um projeto no Supabase.
2. Ative Auth por e-mail/senha.
3. Abra o SQL Editor.
4. Execute `database/schema.sql`.
5. Copie:
   - Project URL;
   - anon public key;
   - service role key.

## 3. Criar Stripe

1. Crie produto Premium mensal.
2. Crie preço recorrente.
3. Copie o `price_...`.
4. Configure Billing Portal no painel do Stripe.
5. Depois do deploy Vercel, crie webhook para:

```text
https://SEU-DOMINIO/api/stripe/webhook
```

Eventos:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

Copie o `whsec_...` para `STRIPE_WEBHOOK_SECRET`.

## 4. Importar na Vercel

1. Acesse https://vercel.com.
2. Clique em **New Project**.
3. Importe o repositório.
4. Framework: **Next.js**.
5. Install command: `pnpm install`.
6. Build command: `pnpm build`.

## 5. Variáveis de ambiente na Vercel

Configure em:

```text
Project Settings → Environment Variables
```

```env
NEXT_PUBLIC_APP_URL=https://SEU-DOMINIO
NEXT_PUBLIC_SUPPORT_EMAIL=suporte@SEU-DOMINIO

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

Não use variável pública para marcar Premium. O RC1 resolve Premium por sessão
Supabase + assinatura Stripe gravada no banco.

## 6. Teste de produção

Execute em ordem:

1. Acesse a landing.
2. Crie uma conta em `/login`.
3. Faça logout.
4. Faça login novamente.
5. Envie um PDF pequeno.
6. Ouça com voz local.
7. Salve onde parou.
8. Saia e entre novamente.
9. Confirme que o documento/progresso voltou.
10. Acesse `/pricing`.
11. Clique em **Assinar Premium**.
12. Pague em modo teste do Stripe.
13. Aguarde o webhook.
14. Confirme que o plano virou Premium.
15. Gere MP3 neural com texto curto.
16. Abra o portal de cobrança.
17. Cancele em modo teste.
18. Confirme que o webhook remove acesso Premium.

## 7. Validação local antes do deploy

```bash
pnpm typecheck
pnpm build
```

## 8. Bloqueios comuns

- Login não funciona: confira Supabase URL/anon/service role.
- Premium não libera: confira webhook Stripe e `STRIPE_WEBHOOK_SECRET`.
- Checkout abre mas não vincula: usuário precisa estar logado antes de assinar.
- MP3 não gera: confira `ELEVENLABS_API_KEY` e `ELEVENLABS_VOICE_ID`.
- Billing Portal falha: configure o portal dentro do dashboard do Stripe.
