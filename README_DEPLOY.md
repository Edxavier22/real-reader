# Deploy do REAL Reader na Vercel

Guia para publicar a V1.3 Comercial.

Fontes oficiais úteis:

- Vercel Git Deployments: https://vercel.com/docs/git
- Vercel Environment Variables: https://vercel.com/docs/environment-variables
- Stripe Checkout Sessions: https://docs.stripe.com/api/checkout/sessions/create
- ElevenLabs Text to Speech: https://elevenlabs.io/docs/api-reference/text-to-speech/convert

## 1. Subir para GitHub

1. Crie um repositório no GitHub.
2. Suba o projeto:

   ```bash
   git init
   git add .
   git commit -m "REAL Reader V1.3 Comercial"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/real-reader.git
   git push -u origin main
   ```

## 2. Importar na Vercel

1. Acesse https://vercel.com.
2. Clique em **New Project**.
3. Importe o repositório do GitHub.
4. Framework: **Next.js**.
5. Build command: `pnpm build`.
6. Install command: `pnpm install`.
7. Output directory: deixe padrão.

A Vercel cria deploys automáticos quando há push na branch de produção,
normalmente `main`.

## 3. Configurar variáveis de ambiente

No painel da Vercel, abra:

```text
Project Settings → Environment Variables
```

Configure:

```env
NEXT_PUBLIC_APP_URL=https://seu-dominio.vercel.app
NEXT_PUBLIC_REAL_READER_DEMO_PLAN=free

TTS_PROVIDER=elevenlabs
ELEVENLABS_API_KEY=...
ELEVENLABS_VOICE_ID=...
ELEVENLABS_MODEL_ID=eleven_multilingual_v2
ELEVENLABS_OUTPUT_FORMAT=mp3_44100_128

STRIPE_SECRET_KEY=sk_live_...
STRIPE_PRICE_ID=price_...

NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Importante:

- variáveis sem `NEXT_PUBLIC_` ficam no servidor;
- depois de mudar variáveis na Vercel, gere um novo deploy;
- não publique chaves secretas no GitHub.

## 4. Banco de dados

1. Crie um projeto no Supabase.
2. Abra o SQL editor.
3. Execute `database/schema.sql`.
4. Antes de produção, ative RLS e crie políticas por `user_id`.
5. Conecte Supabase Auth na página `/login`.

## 5. Stripe

1. Crie um produto e um preço recorrente no Stripe.
2. Copie o `price_...` para `STRIPE_PRICE_ID`.
3. Copie a chave secreta para `STRIPE_SECRET_KEY`.
4. Teste `/pricing` → **Assinar Premium**.
5. Próximo passo obrigatório para produção: webhook Stripe para atualizar a tabela
   `subscriptions`.

## 6. ElevenLabs

1. Crie uma API key na ElevenLabs.
2. Configure `ELEVENLABS_API_KEY`.
3. Opcionalmente configure `ELEVENLABS_VOICE_ID`.
4. Use `TTS_PROVIDER=elevenlabs`.
5. Teste `/api/tts/neural` com uma conta Premium real ou token de staging.

## 7. Testar produção

Depois do deploy:

1. Acesse a landing page.
2. Teste o upload no plano FREE e confirme o limite de 10 páginas.
3. Abra `/pricing`.
4. Teste o botão Stripe em modo teste antes de usar `live`.
5. Sem `ELEVENLABS_API_KEY`, confirme que o app avisa que a voz neural não está
   configurada.
6. Com a chave configurada, teste um texto curto.
7. Verifique se nenhuma chave secreta aparece no navegador.

## 8. Build local antes do deploy

```bash
pnpm typecheck
pnpm build
```
