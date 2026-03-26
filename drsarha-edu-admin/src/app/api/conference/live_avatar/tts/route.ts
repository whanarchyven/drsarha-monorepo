import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const ELEVEN_LABS_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

async function readElevenLabsError(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';

  try {
    if (contentType.includes('application/json')) {
      const payload = await response.json();
      return JSON.stringify(payload);
    }

    return await response.text();
  } catch {
    return 'Не удалось прочитать ответ ElevenLabs.';
  }
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.ELEVEN_LABS_API_KEY;
  const voiceId = process.env.ELEVEN_LABS_VOICE_ID;
  const modelId =
    process.env.ELEVENLABS_MODEL_ID ?? 'eleven_multilingual_v2';

  if (!apiKey || !voiceId) {
    return NextResponse.json(
      {
        error:
          'Не заданы ELEVEN_LABS_API_KEY или ELEVEN_LABS_VOICE_ID в переменных окружения.',
      },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null);
  const text = body?.text?.trim();

  if (!text) {
    return NextResponse.json(
      { error: 'Текст для синтеза не передан.' },
      { status: 400 }
    );
  }

  const response = await fetch(`${ELEVEN_LABS_URL}/${voiceId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({
      text,
      model_id: modelId,
      voice_settings: {
        stability: 0.45,
        similarity_boost: 0.8,
        style: 0.1,
        use_speaker_boost: true,
      },
    }),
    cache: 'no-store',
  }).catch(() => null);

  if (!response) {
    return NextResponse.json(
      { error: 'Не удалось обратиться к ElevenLabs.' },
      { status: 502 }
    );
  }

  if (!response.ok) {
    const message = await readElevenLabsError(response);
    return NextResponse.json(
      { error: message || 'ElevenLabs вернул ошибку.' },
      { status: response.status }
    );
  }

  const audioBuffer = await response.arrayBuffer();

  return new NextResponse(new Uint8Array(audioBuffer), {
    status: 200,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Disposition': 'inline; filename="sarah-tts.mp3"',
      'Content-Type': response.headers.get('content-type') ?? 'audio/mpeg',
      'X-Generated-File-Name': 'sarah-tts.mp3',
    },
  });
}
