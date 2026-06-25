# TODO Comercial — REAL Reader

Este arquivo separa o que realmente aproxima o produto de venda do que deve
esperar. A regra é simples: se não aumenta aquisição, conversão, retenção,
receita ou percepção Premium, não entra na sprint atual.

## Alta prioridade antes de vender em produção

### Autenticação

- [ ] Instalar SDK do Supabase ou NextAuth escolhido.
- [ ] Implementar login real em `/login`.
- [ ] Criar sessão server-side.
- [ ] Remover dependência de `NEXT_PUBLIC_REAL_READER_DEMO_PLAN` em produção.
- [ ] Vincular usuário autenticado à tabela `users`.

### Assinaturas

- [ ] Criar webhook Stripe.
- [ ] Validar assinatura ativa pelo webhook, não pelo cliente.
- [ ] Salvar `stripe_customer_id` e `stripe_subscription_id`.
- [ ] Atualizar `subscriptions.status`.
- [ ] Criar página de gerenciamento/cancelamento de assinatura.

### Limites e custo

- [ ] Registrar páginas processadas.
- [ ] Registrar páginas com OCR.
- [ ] Registrar caracteres enviados para voz neural.
- [ ] Aplicar limite mensal real em `usage_limits`.
- [ ] Criar mensagens de limite atingido por plano.
- [ ] Medir custo real por documento, bloco e minuto de áudio.

### Persistência

- [ ] Salvar documentos no banco para usuários logados.
- [ ] Salvar blocos no banco.
- [ ] Salvar bookmarks no banco.
- [ ] Sincronizar histórico local com conta logada.
- [ ] Criar exclusão de documento/dados pelo usuário.

## Sprint 5 — Backlog direto da experiência de voz

- [ ] Configurar Voice IDs reais para Professor, Professora, Podcast, Calmo,
      Motivador, Jornalista, Storytelling e Infantil.
- [ ] Criar prévia curta de voz antes de gerar MP3 completo.
- [ ] Persistir cache de áudio em storage durável.
- [ ] Criar política de expiração de cache por plano.
- [ ] Criar fila/worker para documentos grandes.
- [ ] Mostrar custo estimado de caracteres antes de gerar áudio longo.
- [ ] Implementar fallback entre providers quando o principal falhar.
- [ ] Criar adapters reais para OpenAI TTS, Azure Speech, Google TTS e Amazon Polly.
- [ ] Criar testes com textos reais de apostilas, slides e concursos.

## Voz neural e MP3

- [ ] Testar ElevenLabs com textos reais e medir custo por caractere.
- [ ] Permitir MP3 por página/bloco/documento com progresso persistente.
- [ ] Salvar metadados de geração de áudio.
- [ ] Adicionar histórico de áudios gerados.
- [ ] Bloquear geração simultânea abusiva.

## Minha voz autorizada

- [ ] Escolher provider com fluxo completo de consentimento.
- [ ] Implementar verificação de titularidade.
- [ ] Registrar aceite de uso.
- [ ] Permitir revogação e remoção dos dados.
- [ ] Bloquear tecnicamente uso de voz de terceiros.
- [ ] Criar trilha de auditoria LGPD.

## Produção

- [ ] Ativar RLS no Supabase.
- [ ] Configurar domínio.
- [ ] Revisar política de privacidade e termos de uso.
- [ ] Criar página de suporte.
- [ ] Criar monitoramento de erros e custos.
- [ ] Fazer teste ponta a ponta em ambiente de staging.

## Backlog orientado a pagamento

Só implementar quando houver impacto claro em conversão, retenção ou receita:

- [ ] Persistir perfil de aprendizado no banco.
- [ ] Sincronizar onboarding entre dispositivos.
- [ ] Transformar recomendações em ações reais com IA.
- [ ] Conectar analytics local a PostHog, Plausible, Segment ou ferramenta escolhida.
- [ ] Importação Word, PowerPoint, EPUB, HTML e páginas web.
- [ ] YouTube, áudio e vídeo.
- [ ] Biblioteca persistente e coleções.
- [ ] Playlist e fila de documentos.
- [ ] Player mobile estilo Spotify.
- [ ] Modo carro, caminhada, academia e escuro.
- [ ] Professor Virtual e chat sobre documento.
- [ ] Empresas: universidades, cursos, escolas, treinamentos corporativos e EAD.
- [ ] Programa de indicação e métricas de LTV/churn.

## Itens proibidos na Sprint 5

Mantidos fora para preservar foco no “UAU” da voz Premium:

- [ ] Dashboard novo.
- [ ] Quiz.
- [ ] Flashcards.
- [ ] Professor IA.
- [ ] Chat IA.
- [ ] Gamificação.
- [ ] Empresas.
- [ ] Resumos IA.
- [ ] Mapas mentais.
- [ ] Biblioteca persistente.
- [ ] Mobile avançado.

## Icebox

Ideias úteis, mas fora do ciclo comercial atual:

- [ ] Avatares animados.
- [ ] Ranking público entre usuários.
- [ ] Marketplace de vozes.
- [ ] Comunidade/social feed.
- [ ] Editor completo de documentos.
