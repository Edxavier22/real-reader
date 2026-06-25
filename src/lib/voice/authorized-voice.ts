export const authorizedVoiceFlow = [
  {
    id: "consent",
    title: "Consentimento",
    description: "Confirmação explícita de titularidade e finalidade de uso."
  },
  {
    id: "upload",
    title: "Upload de gravações",
    description: "Envio seguro de amostras somente do próprio titular."
  },
  {
    id: "validation",
    title: "Validação",
    description: "Checagem de qualidade, titularidade e ausência de terceiros."
  },
  {
    id: "training",
    title: "Treinamento",
    description: "Criação da voz em provider compatível, quando contratado."
  },
  {
    id: "voice-id",
    title: "Voice ID",
    description: "Vinculação do identificador autorizado à conta do usuário."
  },
  {
    id: "removal",
    title: "Remoção",
    description: "Revogação e exclusão dos dados a pedido do titular."
  },
  {
    id: "lgpd",
    title: "LGPD",
    description: "Registro de consentimento, finalidade e canal de remoção."
  }
];

export const authorizedVoiceRules = [
  "Nunca usar voz de terceiros.",
  "Nunca usar voz de celebridades, professores ou pessoas públicas sem consentimento verificável.",
  "Nunca aceitar gravações encontradas na internet.",
  "Sempre permitir remoção e revogação.",
  "Sempre registrar finalidade, data e versão do consentimento."
];
