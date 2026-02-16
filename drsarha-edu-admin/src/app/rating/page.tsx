'use client';

import { useState, useEffect } from 'react';
import { UserCard } from '@/components/user-card';
import { UserDetailsModal } from '@/components/user-details-modal';
import { Pagination } from '@/components/pagination';
import { LoadingSpinner } from '@/components/loading-spinner';
import type {
  UserWithStats,
  RatingPaginatedResponse,
  RatingDetails,
} from '@/shared/models/Rating';
import { ratingsApi } from '@/shared/api/rating';

export default function RatingPage() {
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<RatingDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Симуляция загрузки данных
  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const fetchUsers = async (page: number) => {
    setLoading(true);
    try {
      // Симуляция API запроса
      const mockResponse = await ratingsApi.getAll({ page: page, limit: 15 });
      setUsers(mockResponse.items);
      setTotalPages(mockResponse.totalPages);
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId: string) => {
    setDetailsLoading(true);
    try {
      // Симуляция API запроса
      const response = await ratingsApi.getById(userId);

      if (!response) return;

      // Мок данные для деталей
      const mockDetails: RatingDetails = {
        user: response.user,
        fullCompletions: response.fullCompletions,
      };

      setSelectedUser(mockDetails);
    } catch (error) {
      console.error('Ошибка загрузки деталей пользователя:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleUserClick = (userId: string) => {
    fetchUserDetails(userId);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Рейтинг пользователей
        </h1>
        <p className="text-gray-600">
          Список пользователей с их достижениями и статистикой
        </p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-8">
            {users.map((userWithStats) => (
              <UserCard
                key={userWithStats.user._id}
                userWithStats={userWithStats}
                onDetailsClick={() => handleUserClick(userWithStats.user._id)}
              />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}

      <UserDetailsModal
        userDetails={selectedUser}
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        loading={detailsLoading}
      />
    </div>
  );
}
