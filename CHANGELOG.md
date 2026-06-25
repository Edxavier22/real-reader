# Changelog

## Sprint 5 — Efeito UAU da Voz Premium

Data: 2026-06-25

### Objetivo

Resolver o principal gargalo comercial do REAL Reader: o usuário gostar da
proposta, enviar um PDF, ouvir uma voz robótica e perder o encantamento.

### Entregue

- Arquitetura `SpeechProvider` desacoplada de fornecedores.
- Provider ElevenLabs implementado no servidor.
- Providers OpenAI TTS, Azure Speech, Google TTS e Amazon Polly preparados para
  adapters futuros.
- Biblioteca de vozes Premium com metadados de nome, descrição, idioma, gênero,
  categoria, provider, qualidade, plano e disponibilidade.
- Interface que mostra claramente quando uma voz está disponível, indisponível
  ou dependente de configuração.
- Player Premium com progresso, tempo restante, tempo total, velocidade, página
  atual, capítulo anterior/próximo e indicação visual da voz.
- Card **Continuar estudando** para reduzir fricção de retorno.
- Cache de áudio neural em memória para evitar regeneração do mesmo áudio.
- Página **Minha Voz** reformulada com fluxo de consentimento, upload futuro,
  validação, treinamento, Voice ID, remoção e LGPD.
- `.env.example`, README, ROADMAP, README_DEPLOY e TODO_COMERCIAL atualizados.

### Decisões de produto

- Não foi criada clonagem de voz. O produto só prepara arquitetura e consentimento.
- Não foi criado dashboard novo, quiz, flashcards, chat IA ou gamificação.
- O foco da Sprint foi aumentar valor percebido Premium no momento mais crítico:
  ouvir o conteúdo com voz humana.

### Critérios de sucesso

- Usuário entende que voz local é grátis e limitada.
- Usuário entende que voz neural é Premium e depende de configuração real.
- Usuário percebe a experiência de áudio como mais profissional.
- Usuário consegue voltar rapidamente ao último ponto de estudo.

### Backlog gerado

- Configurar Voice IDs reais por perfil de voz.
- Adicionar prévia curta de cada voz.
- Medir custo por caractere em uso real.
- Criar fila/worker para MP3 de documentos longos.
- Persistir cache de áudio em armazenamento durável.
- Implementar adapters reais para OpenAI TTS, Azure, Google e Amazon Polly.
- Ligar plano Premium a assinatura real no banco.

## Sprint — Biblioteca de Estudos e Conversão

Data: 2026-06-25

### Objetivo

Reposicionar a experiência inicial como plataforma de aprendizado, não leitor de
PDF.

### Entregue

- Landing page completa orientada à transformação.
- Biblioteca de vozes Premium preparada.
- Arquitetura de modos de estudo por IA.
- Página `/dashboard` para métricas futuras.
- Onboarding inteligente com objetivo e preferência de estudo.
- Área **Minha Biblioteca** dentro do app.
- Analytics local preparado para eventos reais.

### Critérios de sucesso

- Aumentar cliques em **Adicionar conteúdo**.
- Aumentar cliques em Premium/pricing.
- Aumentar percepção de que o produto economiza tempo.
- Preparar base para retenção e personalização.

### Backlog gerado

- Persistir perfil de aprendizado em banco.
- Enviar eventos para analytics real.
- Conectar IA para resumo, quiz, flashcards e chat.
- Criar biblioteca/playlist persistente.

### Icebox

- Avatares animados.
- Ranking público.
- Marketplace de vozes.
