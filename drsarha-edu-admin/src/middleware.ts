import { jwtVerify } from 'jose';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Роль-базированный доступ (можно расширить при необходимости)
const roleBasedAccess = {
  '/users': ['admin'], // для админов и модераторов
  '/users/:path*': ['admin'],
};

// Страницы, доступные без авторизации
const publicPages = ['/login', '/registration', '/forgot-password'];

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET_KEY!);

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// Функция для проверки доступа на основе роли
function checkRoleBasedAccess(requestedPath: string, userRole: string) {
  // Проверяем доступ к защищенным маршрутам
  for (const [route, allowedRoles] of Object.entries(roleBasedAccess)) {
    const routePattern = new RegExp(`^${route.replace(':path*', '.*')}$`);

    if (routePattern.test(requestedPath)) {
      const hasAccess = allowedRoles.includes(userRole);
      if (!hasAccess) {
        return false;
      }
    }
  }

  return true;
}

export async function middleware(request: NextRequest) {
  const url = new URL(request.url);

  console.log('🔍 Middleware triggered for:', url.pathname);

  // Клонируем заголовки запроса
  const requestHeaders = new Headers(request.headers);

  // Добавляем текущий путь в заголовки
  requestHeaders.set('x-pathname', request.nextUrl.pathname);

  // Проверяем статические файлы
  const isStaticFile =
    url.pathname.match(
      /\.(?:jpg|jpeg|gif|png|svg|ico|css|js|woff|woff2|ttf|eot|mp4|webm|pdf)$/
    ) ||
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/public/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/fonts/');

  if (isStaticFile) {
    console.log('📁 Static file, skipping auth check');
    return NextResponse.next();
  }

  // Получаем токен из куки
  const authToken = request.cookies.get('token')?.value;
  console.log('🔑 Token from cookies:', authToken ? 'EXISTS' : 'NOT FOUND');

  const isLoginPage = url.pathname === '/login';
  console.log('🚪 Is login page:', isLoginPage);

  // Проверяем, является ли страница публичной
  const isPublicPage = publicPages.some((pattern) => {
    const regexPattern = new RegExp(`^${pattern.replace(':path*', '.*')}$`);
    return regexPattern.test(url.pathname);
  });

  console.log('🌐 Is public page:', isPublicPage);

  // Если пользователь не авторизован и это не публичная страница
  if (!authToken && !isPublicPage) {
    console.log('❌ No token and not public page, redirecting to login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Если пользователь авторизован и находится на странице логина - редирект на главную
  if (authToken && isLoginPage) {
    console.log('✅ Has token and on login page, redirecting to home');
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Если есть токен, проверяем его валидность и доступ
  if (authToken && !isPublicPage) {
    console.log('🔍 Verifying token...');

    // Проверяем наличие секретного ключа
    if (!process.env.JWT_SECRET_KEY) {
      console.error('❌ JWT_SECRET_KEY not found in environment variables');
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      response.cookies.delete('user');
      return response;
    }

    const decodedToken: any = await verifyToken(authToken);
    console.log('🔓 Token decoded:', decodedToken ? 'SUCCESS' : 'FAILED');

    if (!decodedToken) {
      console.log('❌ Invalid token, redirecting to login');
      // Токен невалидный, удаляем куки и редиректим на логин
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      response.cookies.delete('user');
      return response;
    }

    // Проверяем срок действия токена
    const currentTime = Math.floor(Date.now() / 1000);
    if (decodedToken.expires && decodedToken.expires < currentTime) {
      console.log('⏰ Token expired, redirecting to login');
      // Токен истек, удаляем куки и редиректим на логин
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      response.cookies.delete('user');
      return response;
    }

    const userRole: string = decodedToken.role;
    const requestedPath = request.nextUrl.pathname;
    console.log('👤 User role:', userRole);
    console.log('🛣️ Requested path:', requestedPath);

    // Проверяем доступ на основе роли
    const hasRoleAccess = checkRoleBasedAccess(requestedPath, userRole);
    console.log('🔐 Role-based access:', hasRoleAccess ? 'ALLOWED' : 'DENIED');

    if (!hasRoleAccess) {
      console.log('❌ No role access, redirecting to home');
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  console.log('✅ Auth check passed, continuing...');

  // Возвращаем ответ с измененными заголовками
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public|images|icons|fonts).*)',
  ],
};
