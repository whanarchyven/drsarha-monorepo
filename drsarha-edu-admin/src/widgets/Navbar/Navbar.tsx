'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/shared/lib/utils';
import { authApi } from '@/shared/api/auth';
import { toast } from 'sonner';
import axios from 'axios';
import { useAuth } from '@/shared/hooks/useAuth';

const navItems = [
  {
    name: 'База знаний',
    path: '/knowledge',
    children: [
      { name: 'Категории', path: '/knowledge/categories' },
      { name: 'Нозологии', path: '/knowledge/nozologies' },
      { name: 'Курсы', path: '/knowledge/courses' },
      { name: 'Брошюры', path: '/knowledge/brochures' },
      { name: 'Лекции', path: '/knowledge/lections' },
      { name: 'Клинические задачи', path: '/knowledge/clinic-tasks' },
      { name: 'Задачи на разметку', path: '/knowledge/markup-tasks' },
      { name: 'Интерактивные задачи', path: '/knowledge/interactive-tasks' },
      { name: 'Интерактивные квизы', path: '/knowledge/interactive-quizzes' },
      {
        name: 'Интерактивные соединения',
        path: '/knowledge/interactive-matches',
      },
    ],
  },
  {
    name: 'Аналитика',
    path: '/analytics',
    children: [
      { name: 'Вопросы', path: '/analytics/questions' },
      { name: 'Компании', path: '/analytics/companies' },
    ],
  },
  {
    name: 'Управление',
    path: '/users',
    children: [
      { name: 'Пользователи', path: '/users' },
      { name: 'Рейтинг', path: '/rating' },
    ],
    private: true,
  },
  {
    name: 'Клин. атлас',
    path: '/clinic-atlas',
    children: [
      { name: 'Теги', path: '/knowledge/tags' },
      { name: 'Призы', path: '/knowledge/prizes' },
      { name: 'Лутбоксы', path: '/knowledge/lootboxes' },
      { name: 'Группы заданий', path: '/knowledge/task-groups' },
      { name: 'Заявки на призы', path: '/knowledge/prize-claims' },
    ],
    private: false,
  },
  {
    name: 'Управление кейсами',
    path: '/cases',
    children: [
      { name: 'Жалобы', path: '/cases/reports' },
      { name: 'Типы жалоб', path: '/cases/report-types' },
      { name: 'Удалить кейс', path: '/cases/delete-case' },
    ],
    private: false,
  },
  {
    name: 'Трансляция',
    path: '/broadcast',
    children: [
      { name: 'Настройки трансляции', path: '/broadcast' },
      { name: 'Интерактивы', path: '/broadcast/interactives' },
      { name: 'Промокоды', path: '/broadcast/promocodes' },
      { name: 'Live Avatar', path: '/conference/live_avatar' },
      { name: 'Live Avatar Player', path: '/conference/live_avatar/player' },
    ],
    private: false,
  },
];

export const Navbar = () => {
  const pathname = usePathname();
  const { role } = useAuth();
  const handleLogout = async () => {
    try {
      toast.success('Выход из системы...');
      await axios.post('/api/logout', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Ошибка при выходе');
    }
  };

  return (
    <nav className="w-64 min-h-screen bg-gray-800 text-white p-4 flex flex-col">
      <div className="text-xl font-bold mb-8">DrSarha Edu Admin</div>

      {/* Основная навигация */}
      <div className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => {
          if (item.private && role !== 'admin') return null;
          return (
            <div key={item.path}>
              <Link
                href={item.path}
                className={cn(
                  'p-2 rounded hover:bg-gray-700 transition-colors block',
                  pathname === item.path && 'bg-gray-700'
                )}>
                {item.name}
              </Link>

              {item.children && (
                <div className="ml-4 mt-2 flex flex-col gap-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.path}
                      href={child.path}
                      className={cn(
                        'p-2 rounded hover:bg-gray-700 transition-colors block text-sm',
                        pathname === child.path && 'bg-gray-700'
                      )}>
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Кнопка выхода */}
      <div className="border-t border-gray-600 pt-4 mt-4">
        <button
          onClick={handleLogout}
          className="w-full p-2 rounded hover:bg-red-600 transition-colors flex items-center gap-2 text-red-300 hover:text-white">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Выйти
        </button>
      </div>
    </nav>
  );
};
