'use server';

import { cookies } from 'next/headers';

const isProduction = process.env.NODE_ENV === 'production';
const cookieDomain = process.env.COOKIE_DOMAIN || undefined;

export function getAuthCookieOptions(maxAge?: number) {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
    ...(cookieDomain ? { domain: cookieDomain } : {}),
    ...(typeof maxAge === 'number' ? { maxAge } : {}),
  };
}

export function getAuthCookieDeleteOptions(name: string) {
  return {
    name,
    path: '/',
    ...(cookieDomain ? { domain: cookieDomain } : {}),
  };
}

export async function getAuthToken() {
  const cookieStore = await cookies();
  // Основная кука аутентификации
  const authToken = cookieStore.get('authToken')?.value;
  if (authToken) return authToken;
  // Fallback для совместимости
  return cookieStore.get('token')?.value;
}

export async function deleteAuthToken() {
  const cookieStore = await cookies();
  cookieStore.delete(getAuthCookieDeleteOptions('authToken'));
  cookieStore.delete(getAuthCookieDeleteOptions('token'));
  cookieStore.delete(getAuthCookieDeleteOptions('user'));
}
