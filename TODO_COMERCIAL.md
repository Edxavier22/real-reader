# TODO Comercial — REAL Reader RC1

Este arquivo separa o que falta para vender com segurança do que deve ficar no
backlog oficial.

## Antes de abrir venda pública

- [ ] Executar `database/schema.sql` no Supabase de produção.
- [ ] Configurar Supabase Auth por e-mail/senha.
- [ ] Configurar variáveis Supabase na Vercel.
- [ ] Configurar produto/preço Stripe.
- [ ] Configurar webhook Stripe `/api/stripe/webhook`.
- [ ] Configurar `STRIPE_WEBHOOK_SECRET`.
- [ ] Configurar Stripe Billing Portal.
- [ ] Configurar ElevenLabs.
- [ ] Testar login, logout e recuperação de senha.
- [ ] Testar checkout em modo teste.
- [ ] Confirmar liberação automática de Premium após webhook.
- [ ] Confirmar remoção de Premium após cancelamento.
- [ ] Confirmar bloqueio de MP3/voz neural para Free.
- [ ] Confirmar MP3 neural para Premium.
- [ ] Confirmar sincronização de documento/progresso após novo login.
- [x] Criar Termos de Uso.
- [x] Criar Política de Privacidade.
- [x] Criar página de Suporte.
- [ ] Configurar `NEXT_PUBLIC_SUPPORT_EMAIL` com e-mail real.

## Primeiros clientes beta

- [ ] Convidar 5 a 20 usuários reais.
- [ ] Medir tempo até primeiro áudio.
- [ ] Medir quantos fazem upload.
- [ ] Medir quantos clicam em Premium.
- [ ] Medir quantos concluem checkout.
- [ ] Medir retorno em 24h e 7 dias.
- [ ] Coletar feedback sobre voz neural.
- [ ] Coletar feedback sobre OCR em apostilas/slides.
- [ ] Registrar bugs críticos de login/pagamento.

## Segurança e operação

- [ ] Revisar políticas RLS no Supabase de produção.
- [ ] Criar rotina de exclusão/exportação de dados.
- [ ] Criar página de suporte.
- [ ] Adicionar monitoramento de erro.
- [ ] Adicionar logs persistentes de eventos críticos.
- [ ] Trocar rate limit em memória por solução persistente.
- [ ] Monitorar custo ElevenLabs por usuário.
- [ ] Definir política de reembolso/cancelamento.

## Retenção

- [ ] Melhorar painel de conta.
- [ ] Mostrar uso mensal de caracteres/MP3.
- [ ] Criar e-mails simples de ativação e retorno.
- [ ] Criar aviso contextual após primeiro play: “Quer voz humana e MP3?”
- [ ] Melhorar continuidade entre dispositivos.
- [ ] Salvar metadados dos MP3 gerados.
- [ ] Evoluir cache de áudio para storage durável.

## Backlog protegido

Não implementar no RC1:

- [ ] Chat IA.
- [ ] Professor IA.
- [ ] Resumos IA.
- [ ] Flashcards.
- [ ] Quiz.
- [ ] Mapas mentais.
- [ ] Vetorização.
- [ ] DOCX, PPTX, EPUB, HTML, Markdown e ZIP.
- [ ] YouTube, áudio e vídeo.
- [ ] Empresas/B2B.
- [ ] Gamificação.
- [ ] Mobile avançado/PWA.
- [ ] Minha Voz com clonagem ativa.

Esses itens só entram depois que o produto estiver vendendo e as métricas
mostrarem onde está o maior gargalo.
