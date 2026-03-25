import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@convex/_generated/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email и пароль обязательны' },
        { status: 400 }
      );
    }

    const convexUrl =
      process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      return NextResponse.json(
        { error: 'CONVEX_URL не задан' },
        { status: 500 }
      );
    }

    const client = new ConvexHttpClient(convexUrl);
    const authResponse = await client.action(
      api.functions.admin_users_actions.login,
      { email, password }
    );

    if (authResponse.status !== 200 || !authResponse.token) {
      return NextResponse.json(authResponse, {
        status: authResponse.status ?? 401,
      });
    }

    const adminUser = authResponse.adminUser;
    const maxAge = adminUser?.exp
      ? Math.max(adminUser.exp - Math.floor(Date.now() / 1000), 0)
      : 60 * 60 * 24;
    const nextResponse = NextResponse.json(authResponse);

    nextResponse.cookies.set('token', authResponse.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    });

    if (adminUser) {
      nextResponse.cookies.set('user', JSON.stringify(adminUser), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge,
      });
    }

    return nextResponse;
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера при авторизации' },
      { status: 500 }
    );
  }
}
