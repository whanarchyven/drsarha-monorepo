'use client';

import { useRouter } from 'next/navigation';

import { CategoryGrid } from './_components/CategoryGrid';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';


export default function CategoriesPage() {

  const router = useRouter();
  const data = useQuery(api.functions.categories.list, {});
  const isLoading = data === undefined;
  const remove = useMutation(api.functions.categories.remove);
  
  const handleEdit = async (id: Id<'categories'>) => {
    router.push(`/knowledge/categories/${id}/edit`);
  };

  const handleDelete = async (id: Id<'categories'>) => {
    try {
      await remove({ id });
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleCreate = () => {
    router.push('/knowledge/categories/create');
  };

  const pagination = { total: 0, pages: 1, totalPage: 1, hasMore: false };
  const handleSearch = () => {};

  return (
    <>
    {/* {JSON.stringify(data)} */}
    <CategoryGrid
      data={data}
      isLoading={isLoading}
      onSearch={handleSearch}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onCreate={handleCreate}
    /></>
  );
}
