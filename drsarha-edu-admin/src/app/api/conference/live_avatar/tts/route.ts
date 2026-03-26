import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@convex/_generated/api';

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
  const convexUrl =
    process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
  const s3AccessKey = process.env.S3_ACCESS_KEY;
  const s3SecretKey = process.env.S3_SECRET_KEY;
  const s3Bucket = process.env.S3_BUCKET_NAME;
  const s3Endpoint = process.env.S3_ENDPOINT_URL;
  const storagePublicBaseUrl = process.env.STORAGE_PUBLIC_BASE_URL;
  const s3Prefix = (process.env.S3_IMAGE_DIRECTORY || '').replace(/\/$/, '');

  if (!apiKey || !voiceId) {
    return NextResponse.json(
      {
        error:
          'Не заданы ELEVEN_LABS_API_KEY или ELEVEN_LABS_VOICE_ID в переменных окружения.',
      },
      { status: 500 }
    );
  }

  if (!convexUrl) {
    return NextResponse.json(
      { error: 'Не задан CONVEX_URL или NEXT_PUBLIC_CONVEX_URL.' },
      { status: 500 }
    );
  }

  if (!s3AccessKey || !s3SecretKey || !s3Bucket || !storagePublicBaseUrl) {
    return NextResponse.json(
      {
        error:
          'Не заданы S3_ACCESS_KEY, S3_SECRET_KEY, S3_BUCKET_NAME или STORAGE_PUBLIC_BASE_URL.',
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
  const fileName = `sarah-tts-${Date.now()}.mp3`;
  const mimeType = response.headers.get('content-type') ?? 'audio/mpeg';
  const key = s3Prefix
    ? `${s3Prefix}/conference/live-avatar/${fileName}`
    : `conference/live-avatar/${fileName}`;
  const audioUrl = `${storagePublicBaseUrl.replace(/\/$/, '')}/${s3Bucket}/${key}`;
  const client = new ConvexHttpClient(convexUrl);
  const s3Client = new S3Client({
    region: process.env.S3_REGION ?? process.env.AWS_REGION ?? 'us-east-1',
    credentials: {
      accessKeyId: s3AccessKey,
      secretAccessKey: s3SecretKey,
    },
    ...(s3Endpoint && {
      endpoint: s3Endpoint,
      forcePathStyle: true,
    }),
  });

  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: s3Bucket,
        Key: key,
        Body: Buffer.from(audioBuffer),
        ContentType: mimeType,
      })
    );
  } catch (error) {
    console.error('[live_avatar][tts] S3 upload failed:', error);
    return NextResponse.json(
      { error: 'Аудио сгенерировано, но не удалось загрузить его в S3.' },
      { status: 500 }
    );
  }

  try {
    await client.mutation(
      api.functions.conference_generated_audio.saveLatestConferenceGeneratedAudio,
      {
        text,
        fileName,
        mimeType,
        audioUrl,
        provider: 'elevenlabs',
        modelId,
        voiceId,
        byteLength: audioBuffer.byteLength,
      }
    );
  } catch (error) {
    console.error('[live_avatar][tts] Convex save failed:', error);
    return NextResponse.json(
      { error: 'Аудио сгенерировано, но не удалось сохранить его в Convex.' },
      { status: 500 }
    );
  }

  return new NextResponse(new Uint8Array(audioBuffer), {
    status: 200,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Disposition': `inline; filename="${fileName}"`,
      'Content-Type': mimeType,
      'X-Generated-File-Name': fileName,
    },
  });
}
