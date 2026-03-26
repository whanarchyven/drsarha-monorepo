import { NextRequest, NextResponse } from 'next/server';

const ASK_SARAH_URL =
  'https://agreeable-swordfish-909.eu-west-1.convex.site/run-method/ask-sarah';

function extractAnswer(payload: unknown): string | null {
  if (typeof payload === 'string') {
    const trimmed = payload.trim();
    return trimmed || null;
  }

  if (Array.isArray(payload)) {
    for (const item of payload) {
      const answer = extractAnswer(item);
      if (answer) {
        return answer;
      }
    }
    return null;
  }

  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const record = payload as Record<string, unknown>;

  for (const key of [
    'answer',
    'text',
    'response',
    'result',
    'message',
    'content',
    'data',
  ]) {
    const answer = extractAnswer(record[key]);
    if (answer) {
      return answer;
    }
  }

  for (const value of Object.values(record)) {
    const answer = extractAnswer(value);
    if (answer) {
      return answer;
    }
  }

  return null;
}

async function readErrorMessage(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';

  try {
    if (contentType.includes('application/json')) {
      const payload = await response.json();
      return extractAnswer(payload) ?? JSON.stringify(payload);
    }

    return await response.text();
  } catch {
    return 'Не удалось прочитать ответ сервиса.';
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const question = body?.question?.trim();

  if (!question) {
    return NextResponse.json(
      { error: 'Вопрос не передан.' },
      { status: 400 }
    );
  }

  const response = await fetch(ASK_SARAH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question }),
    cache: 'no-store',
  }).catch(() => null);

  if (!response) {
    return NextResponse.json(
      { error: 'Не удалось обратиться к сервису ask-sarah.' },
      { status: 502 }
    );
  }

  if (!response.ok) {
    const message = await readErrorMessage(response);
    return NextResponse.json(
      { error: message || 'Сервис ask-sarah вернул ошибку.' },
      { status: response.status }
    );
  }

  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    const payload = await response.json();
    console.log('[live_avatar][ask] JSON response:', {
      question,
      status: response.status,
      contentType,
      payload,
    });
    const answer = extractAnswer(payload) ?? JSON.stringify(payload, null, 2);
    return NextResponse.json({ answer, raw: payload });
  }

  const answer = (await response.text()).trim();
  console.log('[live_avatar][ask] Text response:', {
    question,
    status: response.status,
    contentType,
    answer,
  });
  return NextResponse.json({ answer });
}
