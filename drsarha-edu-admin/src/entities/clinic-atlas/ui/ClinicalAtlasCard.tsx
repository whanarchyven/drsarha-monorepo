'use client';
import Image from 'next/image';
import { useState } from 'react';
import { Edit, Trash2, Eye, Heart, MessageSquare, Tag } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

import type { ClinicAtlas } from '@/shared/models/ClinicAtlas';
import { getContentUrl } from '@/shared/utils/url';
import { copyToClipboardWithToast } from '@/shared/utils/copyToClipboard';
import { clinicAtlasesApi } from '@/shared/api/clinic-atlases';

interface ClinicAtlasCardProps extends ClinicAtlas {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ClinicalAtlasCard({
  _id,
  name,
  coverImage,
  images,
  description,
  tags,
  likes,
  comments,
  createdAt,
  onEdit,
  onDelete,
}: ClinicAtlasCardProps) {
  const [imagesOpen, setImagesOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(likes);
  const [localComments, setLocalComments] = useState(comments);

  const handleLike = async () => {
    if (!_id) return;
    try {
      if (isLiked) {
        await clinicAtlasesApi.unlike(_id.toString());
        setLocalLikes(localLikes.filter((like) => like !== 'current-user-id')); // Замените на реальный ID пользователя
      } else {
        await clinicAtlasesApi.like(_id.toString());
        setLocalLikes([...localLikes, 'current-user-id']); // Замените на реальный ID пользователя
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleAddComment = async () => {
    if (!_id || !newComment.trim()) return;
    try {
      const updatedAtlas = await clinicAtlasesApi.addComment(
        _id.toString(),
        newComment
      );
      setLocalComments(updatedAtlas.comments);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleRemoveComment = async (commentId: string) => {
    if (!_id) return;
    try {
      const updatedAtlas = await clinicAtlasesApi.removeComment(
        _id.toString(),
        commentId
      );
      setLocalComments(updatedAtlas.comments);
    } catch (error) {
      console.error('Error removing comment:', error);
    }
  };

  return (
    <>
      <Card className="overflow-hidden">
        <div className="relative aspect-[16/9]">
          {coverImage && typeof coverImage === 'string' && (
            <Image
              src={getContentUrl(coverImage)}
              alt={name}
              fill
              className="object-cover"
            />
          )}
          <Button
            variant="outline"
            className="absolute top-2 right-2"
            onClick={async () =>
              await copyToClipboardWithToast(_id?.toString() || '')
            }>
            {_id?.toString()}
          </Button>
        </div>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold leading-none tracking-tight">
                {name}
              </h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <Badge key={index} variant="secondary">
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={handleLike}>
                    <Heart
                      className={`w-4 h-4 ${isLiked ? 'fill-current text-red-500' : ''}`}
                    />
                    {localLikes.length}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isLiked ? 'Убрать лайк' : 'Поставить лайк'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => setCommentsOpen(true)}>
                    <MessageSquare className="w-4 h-4" />
                    {localComments.length}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Показать комментарии</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div>{new Date(createdAt).toLocaleDateString()}</div>
          </div>
        </CardContent>
        <CardFooter className="gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setImagesOpen(true)}>
            <Eye className="w-4 h-4 mr-2" />
            Просмотр
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEdit?.(_id?.toString() || '')}>
            <Edit className="w-4 h-4" />
            <span className="sr-only">Редактировать</span>
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => onDelete?.(_id?.toString() || '')}>
            <Trash2 className="w-4 h-4" />
            <span className="sr-only">Удалить</span>
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={imagesOpen} onOpenChange={setImagesOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{name} - Изображения</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-6">
            {images.map((imageData, index) => (
              <div key={index} className="space-y-4">
                <div className="relative aspect-[16/9]">
                  <Image
                    src={getContentUrl(imageData.image)}
                    alt={imageData.title || `Image ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{imageData.title}</h3>
                  <p className="text-muted-foreground">
                    {imageData.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={commentsOpen} onOpenChange={setCommentsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{name} - Комментарии</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {localComments.map((comment, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between gap-4 p-4 bg-muted rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm">{comment}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveComment(comment)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Textarea
                placeholder="Добавить комментарий..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleAddComment}>Отправить</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
