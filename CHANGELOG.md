# Changelog

## Sprint 1.5 — Operação, produção e beta comercial

Data: 2026-06-29

### Objetivo

Preparar o RC1 para operação comercial real: validação local, GitHub, deploy,
ambiente de produção, documentos legais mínimos e teste ponta a ponta.

### Entregue no código local

- Páginas mínimas criadas:
  - `/termos`;
  - `/privacidade`;
  - `/suporte`.
- Rodapé da Home atualizado com links para Termos, Privacidade e Suporte.
- Suporte preparado com `NEXT_PUBLIC_SUPPORT_EMAIL`.
- Documentação de deploy atualizada com e-mail de suporte.

### Bloqueios externos

- Supabase, Stripe, ElevenLabs e Vercel dependem de credenciais/acesso real ao
  painel de cada serviço.

## RC1 Sprint 1 — Produto Vendável

Data: 2026-06-29

### Objetivo

Transformar o REAL Reader em um produto comercial capaz de receber os primeiros
clientes: conta, pagamento, Premium automático, proteção de recursos pagos e
continuidade após novo login.

### Entregue

- Cadastro, login, logout e recuperação de senha via Supabase Auth.
- Sessão persistida em cookies httpOnly.
- Plano resolvido no servidor por sessão + assinatura no banco.
- Remoção da dependência de variável pública para marcar usuário como Premium.
- Páginas privadas protegidas por middleware.
- Banco conectado por APIs Supabase REST/Auth.
- Schema atualizado com usuários, assinaturas, preferências, documentos,
  favoritos, progresso, uso mensal, logs de segurança, índices e RLS.
- Checkout Stripe autenticado.
- Webhook Stripe com validação de assinatura.
- Atualização automática de assinatura Premium.
- Tratamento de criação, atualização, cancelamento, renovação e falha de
  pagamento por eventos Stripe.
- Portal Stripe para gerenciamento/cancelamento de assinatura.
- Endpoints `/api/tts/neural` e `/api/tts/mp3` protegidos por plano real.
- Registro mensal de caracteres de voz neural e gerações de MP3.
- Rate limit básico em endpoints comerciais críticos.
- Sincronização de documentos, blocos, favoritos, progresso e preferências para
  usuários logados.
- Salvamento automático da página atual durante leitura Premium.
- Fallback honesto para voz local quando voz neural falha ou não está
  configurada.
- Documentação atualizada para RC1, deploy e operação comercial.

### Ainda depende de configuração externa

- Supabase em produção.
- Execução de `database/schema.sql`.
- Stripe com preço recorrente, webhook e Billing Portal ativos.
- ElevenLabs com API key e Voice IDs.
- Termos de Uso e Política de Privacidade publicados.

### Impacto esperado

- Conversão: usuário pode sair de teste grátis para assinatura sem intervenção
  manual.
- Retenção: progresso, preferências e documentos passam a acompanhar a conta.
- Receita: Premium deixa de ser um estado visual e passa a ser uma assinatura
  validada pelo servidor.

## Sprint 6 — Primeiro áudio em menos de 30 segundos

Data: 2026-06-27

- Drag and drop mais evidente.
- Microcopy humana durante upload/processamento.
- Barra de progresso visual.
- Empty state profissional.
- Card do documento com ações rápidas.
- Player mais premium.
- Continuidade com CTA de retorno.

## Sprint UX — Conversão e primeiro áudio

Data: 2026-06-26

- Home reduzida.
- Upload direto no Hero.
- Workspace com sensação de app.
- Conteúdos longos movidos para páginas específicas.
- Premium exibido depois da experimentação.

## Sprint 5 — Efeito UAU da voz Premium

Data: 2026-06-25

- Arquitetura `SpeechProvider`.
- Provider ElevenLabs no servidor.
- Biblioteca profissional de vozes.
- Player Premium.
- Cache de áudio neural em memória.
- Minha Voz preparada com consentimento, sem clonagem ativa.

## Backlog mantido fora do RC1

- Chat IA.
- Professor IA.
- Flashcards.
- Quiz.
- Resumos IA.
- Mapas mentais.
- Novos formatos de arquivo.
- Empresas/B2B.
- Gamificação.
