'use client';

import { CategoryForm } from '../../_components/CategoryForm';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';

export default function EditCategoryPage({
  params,
}: {
  params: { id: string };
}) {
  const categoryId = params.id as Id<'categories'>;
  const category = useQuery(api.functions.categories.getById, {
    id: categoryId,
  });
  const isLoading = category === undefined;

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (!category) {
    return <div>Категория не найдена</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Редактирование категории</h1>
      {category && category._id && <CategoryForm initialData={category} />}
    </div>
  );
}
