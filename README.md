# REAL Reader

REAL Reader é uma plataforma de aprendizado narrado por IA.

O produto não é vendido como “leitor de PDF”. Ele vende tempo, foco e estudo sem
ficar preso à tela.

> Transforme qualquer conteúdo em uma experiência de aprendizado narrada por
> Inteligência Artificial.

## Sprint 5 — Efeito UAU

Objetivo da Sprint: atacar o maior gargalo comercial do produto — a sensação de
voz robótica — e fazer a experiência Premium parecer um produto profissional.

Entregue nesta Sprint:

- arquitetura desacoplada de provedores de voz;
- biblioteca profissional de vozes Premium;
- player Premium com sensação de app de áudio;
- continuação inteligente para o usuário voltar direto de onde parou;
- cache de áudio neural no servidor para evitar regeração desnecessária;
- fluxo profissional de “Minha Voz” sem clonagem ativa;
- documentação clara sobre o que funciona e o que depende de API externa.

## O que funciona agora

- Landing page orientada a benefício, não tecnologia.
- Plano **FREE** com experimentação e limite de até 10 páginas por documento.
- Plano **PREMIUM** preparado para até 300 páginas por documento.
- Upload local de PDF e imagens (`PNG`, `JPG`, `WEBP`, `BMP`).
- Modo rápido como padrão.
- OCR completo apenas por intervalo ou bloco no Premium.
- Separação de texto por páginas.
- Leitura local com voz do navegador.
- Controle de play, pausa, página anterior, próxima página e velocidade.
- Blocos/módulos de estudo no Premium.
- Marcador para salvar onde parou.
- Histórico local limitado por plano.
- Download `.TXT` do documento inteiro e do bloco selecionado.
- Botão **Limpar texto** para reduzir ruído de OCR.
- Endpoint seguro `/api/tts/neural` para voz neural no servidor.
- Endpoint `/api/tts/mp3` para gerar áudio neural quando o plano e a API estiverem configurados.
- Página `/minha-voz` com consentimento e regras de uso responsável.
- Schema SQL em `database/schema.sql`.

## Voz neural e biblioteca de vozes

A Sprint 5 criou uma arquitetura de provedores:

- `browser`: voz local gratuita do navegador;
- `elevenlabs`: provider neural implementado no servidor;
- `openai`: provider preparado para adapter futuro;
- `azure`: provider preparado para adapter futuro;
- `google`: provider preparado para adapter futuro;
- `polly`: provider preparado para adapter futuro.

A biblioteca de vozes Premium foi preparada com:

- Professor
- Professora
- Narrador
- Podcast
- Calmo
- Motivador
- Jornalista
- Storytelling
- Infantil
- Minha Voz

Cada voz possui nome, descrição, idioma, gênero, categoria, provider, qualidade,
tipo de plano e disponibilidade. A interface mostra quando a voz está disponível,
quando falta configurar uma chave ou quando a voz ainda depende de provider futuro.

Importante: o app não finge voz neural. Se a API não estiver configurada, o usuário
vê um aviso claro.

## Player Premium

O player foi evoluído para transmitir mais valor percebido:

- barra de progresso;
- tempo total estimado;
- tempo restante estimado;
- página atual;
- capítulo anterior e próximo;
- play/pause;
- velocidade;
- indicação visual da voz selecionada;
- preparação para playlist futura.

## Cache de áudio

A geração neural usa cache em memória no servidor para evitar gerar novamente o
mesmo áudio com o mesmo provider, voz e texto. Isso reduz custo, espera e chamadas
desnecessárias.

Na produção, o próximo passo é trocar o cache em memória por armazenamento durável
com expiração e controle por usuário.

## Planos

| Recurso | FREE | PREMIUM |
| --- | --- | --- |
| Páginas por documento | até 10 | até 300 |
| Voz local do navegador | sim | sim |
| Histórico | limitado | avançado |
| Blocos/módulos | não | sim |
| OCR completo | não | por intervalo/bloco |
| Salvar onde parou | não | sim |
| TXT por bloco | não | sim |
| Voz neural | não | sim, se provider estiver configurado |
| MP3 | não | página/bloco/documento, se provider estiver configurado |
| Minha Voz | não | arquitetura preparada, sem clonagem ativa |

Antes de Supabase/Stripe estarem ligados de verdade, o plano exibido no cliente
vem de `NEXT_PUBLIC_REAL_READER_DEMO_PLAN`. Em produção, isso deve ser substituído
pelo plano salvo no banco e validado no servidor.

## Variáveis de ambiente

Copie:

```bash
Copy-Item .env.example .env.local
```

Principais variáveis:

```env
NEXT_PUBLIC_REAL_READER_DEMO_PLAN=free
NEXT_PUBLIC_APP_URL=http://localhost:3000

SPEECH_PROVIDER=elevenlabs
TTS_PROVIDER=browser
TTS_API_KEY=

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

OPENAI_API_KEY=
AZURE_SPEECH_KEY=
GOOGLE_TTS_API_KEY=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

AUTHORIZED_VOICE_ID=

STRIPE_SECRET_KEY=
STRIPE_PRICE_ID=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Nunca exponha `ELEVENLABS_API_KEY`, `STRIPE_SECRET_KEY` ou
`SUPABASE_SERVICE_ROLE_KEY` no navegador.

## Minha voz autorizada

Não há clonagem ativa na Sprint 5.

O fluxo preparado é:

1. consentimento;
2. upload de gravações;
3. validação de titularidade;
4. treinamento;
5. geração/registro de `voiceId`;
6. remoção sob solicitação;
7. conformidade LGPD.

Regra: jamais permitir voz de terceiros. A voz só pode ser usada com consentimento
explícito do dono da voz.

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

## O que depende de configuração externa

- Voz neural real depende de `ELEVENLABS_API_KEY`.
- Vozes específicas dependem dos respectivos `ELEVENLABS_VOICE_*_ID`.
- Checkout real depende de Stripe.
- Login real e assinatura real dependem de Supabase/Auth e webhooks.
- “Minha Voz” depende de provider com fluxo completo de consentimento, validação
  e remoção.

## O que ficou fora da Sprint 5

Ficaram no backlog por não resolverem diretamente o gargalo do “UAU” da voz:

- Dashboard novo;
- Quiz;
- Flashcards;
- Professor IA;
- Chat IA;
- Gamificação;
- Empresas;
- Resumos IA;
- Mapas mentais;
- Biblioteca persistente;
- Mobile avançado.

## Regra de produto

Toda nova funcionalidade deve responder “sim” à pergunta:

> Isso aumenta significativamente a chance de alguém pagar pelo REAL Reader?

Se não aumentar conversão, retenção, receita ou percepção Premium, entra no
backlog em vez de ser implementada agora.
