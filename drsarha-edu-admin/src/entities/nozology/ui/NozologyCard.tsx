import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit } from 'lucide-react';
import { Trash2 } from 'lucide-react';
import { getContentUrl } from '@/shared/utils/url';
import { copyToClipboardWithToast } from '@/shared/utils/copyToClipboard';
import { api } from '@convex/_generated/api';
import { useQuery } from 'convex/react';
import type { FunctionReturnType } from 'convex/server';
import type { Id } from '@convex/_generated/dataModel';

type NozologyItem = FunctionReturnType<
  typeof api.functions.nozologies.list
>[number];
type NozologyView = NozologyItem & {
  categoryName?: string;
  materials_count?: { total: number };
};
export function NozologyCard({
  nozology,
  onEdit,
  onDelete,
}: {
  nozology: NozologyView;
  onEdit: (id: Id<'nozologies'>) => void;
  onDelete: (id: Id<'nozologies'>) => void;
}) {
  const materialsCount = useQuery(api.functions.nozologies.materialsCount, {
    nozologyId: String(nozology._id),
    mongoId: nozology.mongoId,
  });
  return (
    <Card key={nozology._id} className="flex flex-col">
      <CardHeader className="p-0 relative">
        <div className="relative aspect-[1/1] w-full">
          <Image
            src={getContentUrl(nozology.cover_image)}
            alt={nozology.name}
            fill
            className="object-cover rounded-t-lg"
          />
          <Button
            variant="outline"
            className="absolute top-2 right-2"
            onClick={async () =>
              await copyToClipboardWithToast(String(nozology._id))
            }>
            {nozology._id}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex flex-row flex-wrap my-4 gap-2">
          <Badge variant="outline">{nozology.categoryName}</Badge>
          <Badge variant="outline">
            {materialsCount?.total ?? 0} материалов
          </Badge>
        </div>
        <h2 className="font-semibold text-lg line-clamp-2">{nozology.name}</h2>
        <p className="text-sm text-muted-foreground">{nozology.description}</p>
      </CardContent>
      <CardFooter className="gap-2">
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onEdit(nozology._id)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => onDelete(nozology._id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
