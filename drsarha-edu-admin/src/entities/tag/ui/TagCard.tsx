'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Hash } from 'lucide-react';
import { api } from '@convex/_generated/api';
import type { FunctionReturnType } from 'convex/server';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';

interface TagCardProps {
  tag: FunctionReturnType<typeof api.functions.pin_tags.list>['items'][number];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TagCard({ tag, onEdit, onDelete }: TagCardProps) {
  return (
    <Card className="relative group hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-2">
            <Hash className="h-4 w-4 mt-1 text-muted-foreground" />
            <h3 className="font-semibold leading-none text-lg">{tag.name}</h3>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(tag._id)}>
                <Edit className="mr-2 h-4 w-4" />
                Редактировать
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(tag._id)}
                className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Удалить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
    </Card>
  );
}
