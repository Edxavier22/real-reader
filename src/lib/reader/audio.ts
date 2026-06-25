import type { ReaderDocument, VoiceMode } from "./types";
import { combinePagesText, safeFileName } from "./text";
import type { ReaderPage } from "./types";

export async function requestMp3Generation(
  readerDocument: ReaderDocument,
  voiceMode: VoiceMode,
  pages: ReaderPage[] = readerDocument.pages,
  title = readerDocument.name,
  voiceProfileId?: string
) {
  const response = await fetch("/api/tts/mp3", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title,
      text: combinePagesText(pages),
      voiceMode,
      voiceProfileId
    })
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as
      | { error?: string; details?: string }
      | null;

    throw new Error(
      [data?.error, data?.details].filter(Boolean).join(" ") ||
        "Não foi possível gerar o MP3 agora."
    );
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = window.document.createElement("a");
  anchor.href = url;
  anchor.download = `${safeFileName(title)}.mp3`;
  anchor.click();
  URL.revokeObjectURL(url);
}
