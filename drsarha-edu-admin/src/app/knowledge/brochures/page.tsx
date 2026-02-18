'use client';

import { useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { BrochureGrid } from './_components/BrochureGrid';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';

export default function BrochuresPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const removeBrochure = useMutation(api.functions.brochures.remove);

  const queryArgs = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    const search = params.get('search') || undefined;
    const page = params.get('page');
    const nozologyId = params.get('nozologyId') || undefined;
    const adminId = process.env.NEXT_PUBLIC_ADMIN_ID || undefined;
    return {
      search,
      page: page ? Number(page) : 1,
      limit: 12,
      nozology: nozologyId,
      admin_id: adminId,
    };
  }, [searchParams]);

  const response = useQuery(api.functions.brochures.list, queryArgs);
  const data = response?.items;
  const pagination = response;
  const isLoading = response === undefined;

  const handleSearch = (params: { search?: string; page?: number }) => {
    const nextParams = new URLSearchParams(searchParams);
    if (params.search) {
      nextParams.set('search', params.search);
    } else {
      nextParams.delete('search');
    }
    if (params.page) {
      nextParams.set('page', String(params.page));
    } else {
      nextParams.delete('page');
    }
    router.push(`${pathname}?${nextParams.toString()}`);
  };

  const handleEdit = (id: Id<'brochures'>) => {
    router.push(`/knowledge/brochures/${id}/edit`);
  };

  const handleDelete = async (id: Id<'brochures'>) => {
    try {
      await removeBrochure({ id });
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleCreate = () => {
    router.push(`/knowledge/brochures/create`);
    console.log('Create new brochure');
  };

  return (
    <BrochureGrid
      pagination={pagination}
      data={data}
      isLoading={isLoading}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onCreate={handleCreate}
      onSearch={handleSearch}
    />
  );
}
