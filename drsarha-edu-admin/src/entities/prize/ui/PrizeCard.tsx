'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Award, Star } from 'lucide-react';
import type { Prize } from '@/shared/models/Prize';
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

interface PrizeCardProps {
  prize: Prize;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function PrizeCard({ prize, onEdit, onDelete }: PrizeCardProps) {
  return (
    <Card className="relative group hover:shadow-md transition-shadow overflow-hidden">
      {/* Изображение приза */}
      <div className="relative h-48 bg-gradient-to-br from-yellow-50 to-yellow-100">
        {prize.image ? (
          <Image
            src={getContentUrl(prize.image)}
            alt={prize.name}
            fill
            className="object-contain p-4"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Award className="h-16 w-16 text-yellow-400" />
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
              <DropdownMenuItem onClick={() => onEdit(prize._id)}>
                <Edit className="mr-2 h-4 w-4" />
                Редактировать
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(prize._id)}
                className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Удалить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Бейдж уровня */}
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="bg-white/90">
            Уровень {prize.level}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-2">
        <div className="space-y-1">
          <h3 className="font-semibold leading-none text-lg">{prize.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {prize.description}
          </p>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center gap-1">
          <div className="text-lg font-bold text-yellow-600">
            {prize.price.toLocaleString()} звёзд
          </div>
          <Star className="mr-1 fill-yellow-300 stroke-yellow-600 h-3 w-3" />
        </div>
      </CardContent>
    </Card>
  );
}
