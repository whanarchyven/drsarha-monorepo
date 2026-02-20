'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Gift } from 'lucide-react';
import { api } from '@convex/_generated/api';
import type { FunctionReturnType } from 'convex/server';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { getContentUrl } from '@/shared/utils/url';

interface LootboxCardProps {
  lootbox: FunctionReturnType<typeof api.functions.lootboxes.list>['items'][number];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function LootboxCard({ lootbox, onEdit, onDelete }: LootboxCardProps) {
  return (
    <Card className="relative group hover:shadow-md transition-shadow overflow-hidden">
      {/* Изображение лутбокса */}
      <div className="relative h-48 bg-gradient-to-br from-blue-50 to-blue-100">
        {lootbox.image ? (
          <Image
            src={getContentUrl(lootbox.image)}
            alt={lootbox.title}
            fill
            className="object-contain p-4"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Gift className="h-16 w-16 text-blue-400" />
          </div>
        )}
        {/* Действия в правом верхнем углу */}
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="h-8 w-8 p-0 bg-white/90 hover:bg-white">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(lootbox._id)}>
                <Edit className="mr-2 h-4 w-4" />
                Редактировать
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(lootbox._id)}
                className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Удалить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* Количество предметов */}
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="bg-white/90">
            {lootbox.items.length} предмет
            {lootbox.items.length === 1
              ? ''
              : lootbox.items.length < 5
                ? 'а'
                : 'ов'}
          </Badge>
        </div>
      </div>
      <CardHeader className="pb-2">
        <div className="space-y-1">
          <h3 className="font-semibold leading-none text-lg">
            {lootbox.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {lootbox.description}
          </p>
        </div>
      </CardHeader>
    </Card>
  );
}
