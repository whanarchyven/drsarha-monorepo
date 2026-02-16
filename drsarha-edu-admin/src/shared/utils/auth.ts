'use server';

import { cookies } from 'next/headers';

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
  cookieStore.delete({
    name: 'authToken',
    path: '/',
    domain: process.env.NODE_ENV === 'production' ? '.drsarha.ru' : undefined,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}
