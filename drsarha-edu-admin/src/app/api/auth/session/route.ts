import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

/**
 * Сессия для клиентских компонентов: кука `token` httpOnly, в JS не читается.
 * Здесь токен читается на сервере и отдаются безопасные поля (роль, id).
 */
export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({
        authenticated: false,
        role: null,
        userId: null,
      });
    }

    const secret = process.env.JWT_SECRET_KEY;
    if (!secret) {
      console.error('[auth/session] JWT_SECRET_KEY не задан');
      return NextResponse.json({ error: 'server_misconfigured' }, { status: 500 });
    }

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );

    const p = payload as Record<string, unknown>;
    const role = typeof p.role === 'string' ? p.role : null;
    const userId =
      typeof p.adminId === 'string'
        ? p.adminId
        : typeof p.userId === 'string'
          ? p.userId
          : null;

    return NextResponse.json({
      authenticated: true,
      role,
      userId,
    });
  } catch (e) {
    console.warn('[auth/session] токен невалиден или истёк', e);
    return NextResponse.json({
      authenticated: false,
      role: null,
      userId: null,
    });
  }
}
