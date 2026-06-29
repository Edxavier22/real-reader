# Roadmap REAL Reader

## Regra de decisão

O REAL Reader é uma startup de aprendizado por IA. Cada Sprint deve melhorar
aquisição, conversão, retenção, receita ou percepção de valor Premium.

## Concluído

### V1 — Fundação funcional

- [x] Upload local de PDF e imagens.
- [x] Extração de texto selecionável.
- [x] OCR para páginas/imagens escaneadas.
- [x] Texto separado por páginas.
- [x] Leitura local no navegador.
- [x] Controles de pausa, continuação, página anterior/próxima e velocidade.
- [x] Histórico local e download `.TXT`.

### V1.1 — OCR completo e arquitetura de voz

- [x] Modo rápido.
- [x] Modo completo.
- [x] Combinação de texto direto + OCR.
- [x] Indicador por página: texto direto, OCR ou ambos.
- [x] Arquitetura para voz neural e voz autorizada.

### V1.2 — Velocidade e divisão inteligente

- [x] OCR completo por intervalo ou bloco.
- [x] Modo rápido como padrão.
- [x] Qualidade normal/alta.
- [x] Aba Dividir documento.
- [x] Progresso real e cancelamento.
- [x] Marcador e continuação.

### V1.3 — Base comercial e conversão

- [x] Landing curta.
- [x] Upload no Hero.
- [x] Workspace com aparência de app.
- [x] Página `/pricing`.
- [x] Planos Free/Premium.
- [x] ElevenLabs provider no servidor.
- [x] Biblioteca de vozes.
- [x] Player Premium visual.
- [x] Páginas de produto futuras fora da Home.

### RC1 Sprint 1 — Produto vendável

- [x] Cadastro, login, logout e recuperação de senha via Supabase Auth.
- [x] Sessão persistida em cookies httpOnly.
- [x] Páginas privadas protegidas.
- [x] Plano resolvido no servidor.
- [x] Supabase conectado por REST/Auth.
- [x] Schema com RLS, preferências, documentos, favoritos, progresso e uso.
- [x] Checkout Stripe autenticado.
- [x] Webhook Stripe com assinatura verificada.
- [x] Liberação automática de Premium por assinatura ativa.
- [x] Portal Stripe para cancelamento/gestão.
- [x] Endpoints Premium protegidos no servidor.
- [x] Registro mensal de caracteres de voz e MP3.
- [x] Sincronização de documentos, blocos, favoritos, progresso e preferências.
- [x] Fallback honesto para voz local quando voz neural falha ou não está configurada.

## Sprint 2 — Beta comercial assistido

Objetivo: colocar os primeiros usuários reais usando e pagando com segurança.

- [ ] Testar fluxo completo em produção com Stripe test mode.
- [ ] Testar webhook real na Vercel.
- [ ] Publicar Termos de Uso.
- [ ] Publicar Política de Privacidade/LGPD.
- [ ] Criar página simples de suporte.
- [ ] Validar custo ElevenLabs com PDFs reais.
- [ ] Criar checklist de atendimento dos primeiros clientes.
- [ ] Corrigir falhas observadas no onboarding/login/checkout.

## Sprint 3 — Retenção e estabilidade

- [ ] Melhorar painel de conta.
- [ ] Melhorar mensagens de limite atingido.
- [ ] Adicionar exclusão/exportação de dados do usuário.
- [ ] Salvar metadados de áudios gerados.
- [ ] Trocar cache em memória por storage durável.
- [ ] Adicionar monitoramento de erros.
- [ ] Adicionar logs de segurança.
- [ ] Medir funil real: visita → upload → primeiro play → Premium.

## Sprint 4 — Escala operacional

- [ ] Fila/worker para OCR/TTS pesado.
- [ ] Processamento assíncrono de MP3 longo.
- [ ] Rate limit distribuído.
- [ ] Painel admin básico.
- [ ] Alertas de custo de voz neural.
- [ ] Analytics real em ferramenta dedicada.
- [ ] Billing lifecycle: trial, churn, recuperação de pagamento.

## Sprint 5 — Inteligência avançada

Só iniciar depois que o produto estiver vendendo e medindo retenção.

- [ ] Resumos IA.
- [ ] Chat com documento.
- [ ] Flashcards.
- [ ] Questões/quiz.
- [ ] Professor IA.
- [ ] Mapas mentais.
- [ ] Vetorização.
- [ ] Memória de estudo.

## Backlog protegido

- Novos formatos: DOCX, PPTX, EPUB, HTML, Markdown, ZIP.
- YouTube, áudio e vídeo.
- Empresas/B2B.
- Gamificação.
- Mobile avançado/PWA.
- Biblioteca persistente com coleções e playlists avançadas.
- Minha Voz com clonagem ativa.

Esses itens não entram até que o RC1 prove aquisição, conversão e retenção.
