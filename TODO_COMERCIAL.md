# TODO Comercial — REAL Reader V1.3

## Autenticação

- [ ] Instalar SDK do Supabase ou NextAuth escolhido.
- [ ] Implementar login real em `/login`.
- [ ] Criar sessão server-side.
- [ ] Remover dependência de `NEXT_PUBLIC_REAL_READER_DEMO_PLAN` em produção.
- [ ] Vincular usuário autenticado à tabela `users`.

## Assinaturas

- [ ] Criar webhook Stripe.
- [ ] Validar assinatura ativa pelo webhook, não pelo cliente.
- [ ] Salvar `stripe_customer_id` e `stripe_subscription_id`.
- [ ] Atualizar `subscriptions.status`.
- [ ] Criar página de gerenciamento/cancelamento de assinatura.

## Limites

- [ ] Registrar páginas processadas.
- [ ] Registrar páginas com OCR.
- [ ] Registrar caracteres enviados para voz neural.
- [ ] Aplicar limite mensal real em `usage_limits`.
- [ ] Criar mensagens de limite atingido por plano.

## Persistência

- [ ] Salvar documentos no banco para usuários logados.
- [ ] Salvar blocos no banco.
- [ ] Salvar bookmarks no banco.
- [ ] Sincronizar histórico local com conta logada.
- [ ] Criar exclusão de documento/dados pelo usuário.

## Voz neural e MP3

- [ ] Testar ElevenLabs com textos reais e medir custo por caractere.
- [ ] Criar fila para documentos longos.
- [ ] Permitir MP3 por página/bloco/documento com progresso.
- [ ] Salvar metadados de geração de áudio.
- [ ] Adicionar fallback quando provider externo falhar.

## Minha voz autorizada

- [ ] Escolher provider com fluxo completo de consentimento.
- [ ] Implementar verificação de titularidade.
- [ ] Registrar aceite de uso.
- [ ] Permitir revogação e remoção dos dados.
- [ ] Bloquear tecnicamente uso de voz de terceiros.

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

## Icebox

Ideias úteis, mas fora da Sprint atual:

- [ ] Avatares animados.
- [ ] Ranking público entre usuários.
- [ ] Marketplace de vozes.
- [ ] Comunidade/social feed.
- [ ] Editor completo de documentos.
