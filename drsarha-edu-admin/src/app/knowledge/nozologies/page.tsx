'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NozologyGrid } from './_components/NozologyGrid';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { FunctionReturnType } from 'convex/server';
import type { Id } from '@convex/_generated/dataModel';

export default function NozologiesPage() {
  const [search, setSearch] = useState<string | undefined>(undefined);
  const router = useRouter();
  const nozologies = useQuery(api.functions.nozologies.list, {});
  const categories = useQuery(api.functions.categories.list, {});
  const removeNozology = useMutation(api.functions.nozologies.remove);

  type NozologyItem = FunctionReturnType<
    typeof api.functions.nozologies.list
  >[number];
  type NozologyView = NozologyItem & {
    categoryName?: string;
    materials_count?: { total: number };
  };

  const data: NozologyView[] | undefined = useMemo(() => {
    if (!nozologies) return undefined;
    const categoryMap = new Map<string, string>();
    if (categories) {
      for (const category of categories) {
        categoryMap.set(String(category._id), category.name);
        if (category.mongoId) {
          categoryMap.set(category.mongoId, category.name);
        }
      }
    }
    const withCategory = nozologies.map((nozology) => ({
      ...nozology,
      categoryName: categoryMap.get(String(nozology.category_id)),
    }));
    if (!search) return withCategory;
    const lowered = search.toLowerCase();
    return withCategory.filter((item) =>
      item.name.toLowerCase().includes(lowered)
    );
  }, [nozologies, categories, search]);

  const handleSearch = (params: { search?: string }) => {
    setSearch(params.search || undefined);
  };

  const handleEdit = async (id: Id<'nozologies'>) => {
    router.push(`/knowledge/nozologies/${id}/edit`);
  };

  const handleDelete = async (id: Id<'nozologies'>) => {
    try {
      await removeNozology({ id });
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleCreate = () => {
    router.push('/knowledge/nozologies/create');
  };

  return (
    <NozologyGrid
      data={data}
      isLoading={data === undefined}
      onSearch={handleSearch}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onCreate={handleCreate}
    />
  );
}
