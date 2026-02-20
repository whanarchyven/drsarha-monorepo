'use client';

import { useState } from 'react';
import { UserCard } from '@/components/user-card';
import { UserDetailsModal } from '@/components/user-details-modal';
import { Pagination } from '@/components/pagination';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import type { FunctionReturnType } from 'convex/server';

export default function RatingPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<Id<'users'> | null>(
    null
  );

  const pageSize = 15;
  const ratingResponse =
    useQuery(api.functions.ratings.listUsersWithStats, {
      page: currentPage,
      limit: pageSize,
    }) as
      | FunctionReturnType<typeof api.functions.ratings.listUsersWithStats>
      | undefined;
  const selectedUser = useQuery(
    api.functions.ratings.getUserDetails,
    selectedUserId ? { userId: selectedUserId } : 'skip'
  );
  const detailsLoading = !!selectedUserId && selectedUser === undefined;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const users = ratingResponse?.items ?? [];
  const totalPages = ratingResponse?.totalPages ?? 1;
  const loading = ratingResponse === undefined;

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
                onDetailsClick={() =>
                  setSelectedUserId(userWithStats.user._id as Id<'users'>)
                }
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
        userDetails={selectedUser ?? null}
        isOpen={!!selectedUserId}
        onClose={() => setSelectedUserId(null)}
        loading={detailsLoading}
      />
    </div>
  );
}
