'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Pencil } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/shared/ui/pagination';
import Image from 'next/image';
import ClinicTaskCard from '@/entities/clinical-case/ui/ClinicalCaseCard';
import { ClinicTask } from '@/shared/models/ClinicTask';
import { clinicTasksApi } from '@/shared/api/clinic-tasks';
import { DeleteDialog } from '@/shared/ui/DeleteDialog/DeleteDialog';
import { getContentUrl } from '@/shared/utils/url';
import { copyToClipboardWithToast } from '@/shared/utils/copyToClipboard';

interface ClinicTaskGridProps {
  data: ClinicTask[];
  isLoading: boolean;
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
  };
  onPageChange: (page: number) => void;
}

export function ClinicTaskGrid({
  data,
  isLoading,
  pagination,
  onPageChange,
}: ClinicTaskGridProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [clinicTaskToDelete, setClinicTaskToDelete] = useState<string | null>(
    null
  );

  const handleDelete = async () => {
    if (!clinicTaskToDelete) return;

    try {
      setIsDeleting(true);
      await clinicTasksApi.delete(clinicTaskToDelete);
      setIsDeleteDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error deleting clinic task:', error);
    } finally {
      setIsDeleting(false);
      setClinicTaskToDelete(null);
    }
  };

  const openDeleteDialog = (id: string) => {
    setClinicTaskToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="p-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {data.map((task) => (
            <Card key={task._id} className="p-4 relative">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{task.name}</h3>
                <div className="flex space-x-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() =>
                      router.push(`/knowledge/clinic-tasks/${task._id}/edit`)
                    }>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => openDeleteDialog(task._id!)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="relative w-full h-96 mb-4 border rounded-md overflow-hidden">
                <Image
                  src={getContentUrl(task.cover_image)}
                  alt={task.name}
                  fill
                  className="object-cover"
                />
                <Button
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={async () =>
                    await copyToClipboardWithToast(task._id as string)
                  }>
                  {task._id}
                </Button>
              </div>
              <p className="text-gray-600 mb-2">{task.description}</p>
              {task.additional_info && (
                <p className="text-sm text-gray-500">{task.additional_info}</p>
              )}
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Сложность: {task.difficulty}/10
                </span>
                <span className="text-sm text-gray-500">
                  Звёзды: {task.stars}
                </span>
              </div>
            </Card>
          ))}
        </div>
        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-4">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </div>

      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}>
        Вы уверены, что хотите удалить клиническую задачу?
      </DeleteDialog>
    </>
  );
}
