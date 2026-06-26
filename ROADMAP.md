# Roadmap REAL Reader

## Princípio de decisão

O REAL Reader é uma startup de aprendizado por IA. Cada Sprint deve aumentar pelo
menos uma destas métricas:

- aquisição;
- conversão;
- retenção;
- receita;
- percepção de valor Premium.

Funcionalidades interessantes, mas sem impacto claro nessas métricas, entram no
backlog ou no icebox.

## V1 — Fundação funcional

- [x] Upload local de PDF e imagens
- [x] Extração de texto selecionável
- [x] OCR para páginas e imagens escaneadas
- [x] Texto separado por páginas
- [x] Leitura em voz alta no navegador
- [x] Controles de pausa, continuação, voltar, avançar e velocidade
- [x] Histórico local e download `.TXT`

## V1.1 — Extração completa e arquitetura inicial de voz

- [x] Modo rápido: texto direto e OCR apenas quando necessário
- [x] Modo completo: OCR em todas as páginas do PDF
- [x] Combinação de texto direto + OCR com redução de duplicações evidentes
- [x] Indicador por página: Texto direto, OCR ou Texto direto + OCR
- [x] Estrutura inicial para voz neural e voz autorizada do usuário
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
- [x] Landing curta com Hero, upload, três passos, Premium compacto, FAQ e rodapé
- [x] Páginas específicas para conteúdos aprofundados removidos da Home
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
- [x] Biblioteca Premium de vozes preparada
- [x] Arquitetura de modos de estudo por IA
- [x] Página `/dashboard` para métricas de aprendizagem
- [x] Onboarding inteligente por objetivo e preferência
- [x] Tela **Minha Biblioteca**
- [x] Analytics local preparado para eventos reais
- [x] README_DEPLOY.md
- [x] TODO_COMERCIAL.md

## Sprint 5 — Efeito UAU da voz Premium

Objetivo: fazer o usuário sentir que o Premium entrega uma experiência de estudo
profissional, não apenas um leitor com botão de play.

- [x] Arquitetura profissional `SpeechProvider`
- [x] Provider `ElevenLabs` implementado no servidor
- [x] Providers `OpenAI TTS`, `Azure Speech`, `Google TTS` e `Amazon Polly` preparados para adapters futuros
- [x] Biblioteca de vozes com metadados profissionais
- [x] Indicação clara de disponibilidade por voz e provider
- [x] Player Premium com barra de progresso, tempo restante, tempo total, velocidade e voz selecionada
- [x] Continuação inteligente com destaque para “Continuar estudando”
- [x] Cache de áudio neural em memória para evitar gerar o mesmo áudio novamente
- [x] Arquitetura de “Minha Voz” com consentimento, validação, `voiceId`, remoção e LGPD
- [x] Documentação atualizada sem prometer recursos inexistentes

## Sprint — UX, Conversão e Primeiro Áudio

Objetivo: fazer o usuário chegar ao primeiro áudio no menor tempo possível.

- [x] Home reduzida para evitar excesso de explicação antes do teste
- [x] Upload no Hero com arquivo enviado diretamente ao workspace
- [x] CTA principal alterado para **Experimentar grátis**
- [x] Seção **Como funciona** reduzida a três passos: enviar, escolher voz, ouvir
- [x] Premium exibido de forma compacta e orientada a benefício
- [x] FAQ curto com objeções essenciais
- [x] Workspace com sensação de app e ação principal **Adicionar conteúdo**
- [x] Onboarding transformado em personalização opcional
- [x] Conteúdo longo movido para `/vozes`, `/ia-estudos`, `/analytics`,
      `/roadmap`, `/biblioteca-futura`, `/metricas` e `/depoimentos`

## Próximos passos para produção real

- [ ] Instalar e conectar Supabase Auth no cliente
- [ ] Implementar sessão server-side real
- [ ] Ativar RLS no Supabase
- [ ] Criar webhook Stripe para atualizar `subscriptions`
- [ ] Trocar `NEXT_PUBLIC_REAL_READER_DEMO_PLAN` por plano vindo do banco
- [ ] Registrar uso mensal em `usage_limits`
- [ ] Persistir documentos/blocos/bookmarks no banco para usuários logados
- [ ] Criar painel de conta/assinatura
- [ ] Configurar `ELEVENLABS_API_KEY` e Voice IDs reais
- [ ] Medir custo real de voz neural por caractere
- [ ] Criar fila/worker para MP3 de documentos grandes
- [ ] Trocar cache em memória por armazenamento durável
- [ ] Adicionar prévia curta das vozes antes de gerar MP3 completo
- [ ] Conectar dashboard a eventos reais de uso
- [ ] Criar Biblioteca/Playlist persistente
- [ ] Conectar provider de IA para resumos, quiz, flashcards e chat
- [ ] Enviar eventos locais para ferramenta real de analytics
- [ ] Criar experimento A/B de headline da landing
- [ ] Medir tempo real entre visita, upload, processamento e primeiro play
- [ ] Registrar evento `first_play` e funil Home → Upload → Play → Premium

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

## Backlog protegido pela Sprint 5

Itens que permanecem fora da Sprint 5 porque não atacam diretamente o gargalo de
conversão causado pela voz robótica:

- Dashboard novo
- Quiz
- Flashcards
- Professor IA
- Chat IA
- Gamificação
- Empresas
- Resumos IA
- Mapas mentais
- Biblioteca persistente
- Mobile avançado
