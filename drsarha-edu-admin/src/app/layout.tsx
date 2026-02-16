import './globals.css';
import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/widgets/Navbar/Navbar';
import { Toaster } from 'sonner';
import { cookies } from 'next/headers';
import { Providers } from './Providers';

// import 'swiper/css';
// import 'swiper/css/navigation';
// import 'swiper/css/pagination';

// Шрифты
// const Roboto = localFont({
//   src: [
//     {
//       path: '../../public/fonts/Robotocondensed.woff2',
//       weight: '400',
//       style: 'normal',
//     },
//   ],
//   display: 'swap',
//   variable: '--base-font',
// });
// ? clsx(Roboto.variable) для body

export const metadata: Metadata = {
  title: 'Next.js Project',
  description:
    'Lorem ipsum dolor sit amet consectetur adipisicing elit. Omnis, et',
};

interface RootLayoutProps {
  children: React.ReactNode;
  params: any;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const token = await cookies().get('token')?.value;
  const user = await cookies().get('user')?.value;
  const isAuthorized = !!token && !!user;

  return (
    <html lang="ru">
      <head></head>
      <body>
        <Providers>
          <div className="flex">
            {isAuthorized && <Navbar />}
            <main className="flex-1 p-6">{children}</main>
          </div>
          <Toaster richColors />
        </Providers>
      </body>
    </html>
  );
}
