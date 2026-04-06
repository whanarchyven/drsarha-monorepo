import { ConvexHttpClient } from 'convex/browser';

let client: ConvexHttpClient | null = null;

export function getConvexUrl() {
  const convexUrl =
    process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL || '';

  if (!convexUrl) {
    throw new Error('NEXT_PUBLIC_CONVEX_URL is not set');
  }

  return convexUrl;
}

export function getConvexHttpClient() {
  if (!client) {
    client = new ConvexHttpClient(getConvexUrl());
  }

  return client;
}

export async function fetchConvexHttp<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(`${getConvexUrl()}/api${path}`, init);

  if (!response.ok) {
    const payload = await response
      .json()
      .catch(() => ({ error: 'Request failed' }));
    throw new Error(payload?.error || 'Request failed');
  }

  return (await response.json()) as T;
}
