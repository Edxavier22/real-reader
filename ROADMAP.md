# Roadmap REAL Reader

## V1 — Fundação funcional

- [x] Upload local de PDF e imagens
- [x] Extração de texto selecionável
- [x] OCR para páginas e imagens escaneadas
- [x] Texto separado por páginas
- [x] Leitura em voz alta no navegador
- [x] Controles de pausa, continuação, voltar, avançar e velocidade
- [x] Histórico local e download `.TXT`

## V1.1 — Extração completa e arquitetura de voz

- [x] Modo rápido: texto direto e OCR apenas quando necessário
- [x] Modo completo: OCR em todas as páginas do PDF
- [x] Combinação de texto direto + OCR com redução de duplicações evidentes
- [x] Indicador por página: Texto direto, OCR ou Texto direto + OCR
- [x] Estrutura para voz neural e voz autorizada do usuário
- [x] Consentimento documentado para voz autorizada/clonada

## V1.2 — Velocidade e divisão inteligente do PDF

- [x] OCR completo apenas por intervalo ou por bloco
- [x] Modo rápido mantido como padrão
- [x] Seleção de página inicial e final antes do OCR completo
- [x] Qualidade de renderização **Normal** e **Alta qualidade**
- [x] Aba **Dividir documento**
- [x] Blocos salvos no histórico local
- [x] Progresso real e cancelamento
- [x] Marcador **Salvar onde parei** e **Continuar de onde parei**
- [x] Download `.TXT` do documento inteiro e do bloco selecionado

## V1.3 Comercial — SaaS vendável

- [x] Landing page vendável
- [x] Página `/pricing`
- [x] Planos FREE e PREMIUM
- [x] Limite de páginas por plano na UI
- [x] Bloqueio de recursos premium no FREE
- [x] Página `/login` preparada para Supabase Auth
- [x] Schema SQL para usuários, assinaturas, documentos, blocos, bookmarks e uso
- [x] Stripe Checkout preparado em `/api/checkout/session`
- [x] Páginas `/checkout/success` e `/checkout/cancel`
- [x] ElevenLabs provider no servidor
- [x] Endpoint seguro `/api/tts/neural`
- [x] MP3 neural por página, bloco ou documento
- [x] Página `/minha-voz` com consentimento sem clonagem ativa
- [x] Botão **Limpar texto**
- [x] README_DEPLOY.md
- [x] TODO_COMERCIAL.md

## Próximos passos para produção real

- [ ] Instalar e conectar Supabase Auth no cliente
- [ ] Implementar sessão server-side real
- [ ] Ativar RLS no Supabase
- [ ] Criar webhook Stripe para atualizar `subscriptions`
- [ ] Trocar `NEXT_PUBLIC_REAL_READER_DEMO_PLAN` por plano vindo do banco
- [ ] Registrar uso mensal em `usage_limits`
- [ ] Persistir documentos/blocos/bookmarks no banco para usuários logados
- [ ] Criar painel de conta/assinatura
- [ ] Testar geração neural com volume real e custo controlado
- [ ] Criar fila/worker para MP3 de documentos grandes

## V2 — SaaS completo

- Login e contas de usuário em produção
- Banco de dados como fonte principal
- Limite de uso por usuário
- Planos pagos com cobrança recorrente
- Painel de consumo por páginas, OCR e caracteres de voz
- Processamento assíncrono de arquivos grandes
- Armazenamento seguro de arquivos
- Exclusão controlada pelo usuário

## V2.1 — Voz pessoal autorizada e estudo avançado

- Fluxo completo de consentimento e verificação de titularidade
- Registro e retirada de consentimento
- Exclusão de amostras e modelos de voz a pedido do titular
- Proibição técnica de voz de terceiros/impersonação
- Pastas, anotações, favoritos e playlists de estudo
- PWA e app móvel
