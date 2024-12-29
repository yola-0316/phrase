import assert from "node:assert";

import { TTSService } from "@/providers/tts";

export async function POST(request: Request) {
  const body = await request.json();
  const { text, language, voiceName } = body;
  assert(text, "text is required");

  try {
    const tts = new TTSService({ language, voiceName });
    const audio = await tts.speakTextAsync(text);
    console.log(`TTS generated ${audio.byteLength} bytes`);
    return new Response(audio, {
      headers: {
        "Content-Type": "audio/wav",
      },
    });
  } catch (error) {
    return new Response(`TTS generated fail ${error}`, {
      status: 500,
    });
  }
}
