import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import { Edit } from 'lucide-react';
import { copyToClipboardWithToast } from '@/shared/utils/copyToClipboard';
import { getContentUrl } from '@/shared/utils/url';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import type { FunctionReturnType } from 'convex/server';

type CategoryItem = FunctionReturnType<
  typeof api.functions.categories.list
>[number];

export function CategoryCard({
  category,
  onEdit,
  onDelete,
}: {
  category: CategoryItem;
  onEdit: (id: Id<'categories'>) => void;
  onDelete: (id: Id<'categories'>) => void;
}) {
  return (
    <Card key={category._id} className="flex flex-col">
      <CardHeader className="p-0 relative">
        <div className="relative aspect-video w-full">
          <Image
            src={getContentUrl(category.cover_image)}
            alt={category.name}
            fill
            className="object-cover rounded-t-lg"
          />
          <Button
            variant="outline"
            className="absolute top-2 right-2"
            onClick={async () =>
              await copyToClipboardWithToast(String(category._id))
            }>
            {category._id}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <h2 className="font-semibold text-lg line-clamp-2">{category.name}</h2>
        <h3 className="text-sm text-muted-foreground">
          {category.nozologiesCount} нозологий
        </h3>
      </CardContent>
      <CardFooter className="gap-2">
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onEdit(category._id)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => onDelete(category._id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
