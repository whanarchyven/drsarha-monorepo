'use client';

import { Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/shared/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { EntityContextMenu } from './_components/EntityContextMenu';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';

function KnowledgeLayoutContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentNozologyId = searchParams.get('nozologyId');

  const items = useQuery(api.functions.nozologies.list, {});
  const removeNozology = useMutation(api.functions.nozologies.remove);

  const handleNozologyChange = (nozologyId: string) => {
    const params = new URLSearchParams(searchParams);
    if (nozologyId === 'all') {
      params.delete('nozologyId');
    } else {
      params.set('nozologyId', nozologyId);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleEditNozology = (id: Id<'nozologies'>) => {
    router.push(`/knowledge/nozologies/${id}/edit`);
  };

  const handleDeleteNozology = async (id: Id<'nozologies'>) => {
    try {
      await removeNozology({ id });

      if (currentNozologyId === id.toString()) {
        const params = new URLSearchParams(searchParams);
        params.delete('nozologyId');
        router.push(`${pathname}?${params.toString()}`);
      }
    } catch (error) {
      console.error('Error deleting nozology:', error);
    }
  };

  const handleCreateNozology = () => {
    router.push('/knowledge/nozologies/create');
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-600 space-y-4">
        <Tabs
          value={currentNozologyId || 'all'}
          onValueChange={handleNozologyChange}>
          <TabsList className="flex flex-wrap min-h-9 h-auto w-full justify-start items-start p-1">
            <TabsTrigger value="all">Все</TabsTrigger>
            {Array.isArray(items) &&
              [...items].map((nozology) => (
                <EntityContextMenu
                  key={nozology._id?.toString()}
                  onEdit={() =>
                    handleEditNozology(nozology._id as Id<'nozologies'>)
                  }
                  onDelete={() =>
                    handleDeleteNozology(nozology._id as Id<'nozologies'>)
                  }>
                  <TabsTrigger value={nozology._id?.toString() || ''}>
                    {nozology.name}
                  </TabsTrigger>
                </EntityContextMenu>
              ))}
          </TabsList>
        </Tabs>
        <div className="flex justify-end">
          <Button onClick={handleCreateNozology} size="sm" className="gap-2">
            <Plus size={16} />
            Добавить нозологию
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function KnowledgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <KnowledgeLayoutContent />
      {children}
    </Suspense>
  );
}
