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
