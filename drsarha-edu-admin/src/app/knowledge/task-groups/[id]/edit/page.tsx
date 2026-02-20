'use client';

import { useParams, useRouter } from 'next/navigation';
import { TaskGroupForm } from '../../_components/TaskGroupForm';
import LoadingSpinner from '@/shared/ui/LoadingSpinner/LoadingSpinner';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';

export default function EditTaskGroupPage() {
  const params = useParams();
  const router = useRouter();
  const taskGroup = useQuery(api.functions.task_groups.getById, {
    id: params.id as Id<'task_groups'>,
  });
  const isLoading = taskGroup === undefined;

  if (isLoading) {
    return (
      <div className="container p-6">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!taskGroup) return null;

  return <TaskGroupForm initialData={taskGroup} isEditing />;
}
