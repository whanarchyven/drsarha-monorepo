'use client';

import { useState } from 'react';
import Image from 'next/image';
import { copyToClipboardWithToast } from '@/shared/utils/copyToClipboard';
import { getContentUrl } from '@/shared/utils/url';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Edit, Eye, Star, Trash2, BarChart } from 'lucide-react';
import { TaskBadges } from '@/shared/ui/TaskBadges/TaskBadges';
import type { ClinicTask } from '@/shared/models/ClinicTask';
import { clinicTasksApi } from '@/shared/api/clinic-tasks';

interface ClinicTaskCardProps extends ClinicTask {
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function ClinicTaskCard({
  _id,
  name,
  difficulty,
  description,
  cover_image,
  images,
  additional_info,
  ai_scenario,
  stars,
  nozology,
  feedback,
  interviewMode,
  interviewQuestions,
  onEdit,
  onDelete,
}: ClinicTaskCardProps) {
  const [imagesOpen, setImagesOpen] = useState(false);
  const [statsPopOpen, setStatsPopOpen] = useState(false);
  const [statistics, setStatistics] = useState({
    views: 0,
    completed: 0,
  });

  const handleStatsClick = async () => {
    try {
      const stats = await clinicTasksApi.getStatistics(_id as string);
      setStatistics(stats);
      setStatsPopOpen(true);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  return (
    <>
      <Card className="overflow-hidden">
        <div className="relative aspect-[16/9]">
          <Image
            src={getContentUrl(cover_image)}
            alt={name}
            fill
            className="object-cover"
          />
          <Button
            variant="outline"
            className="absolute top-2 right-2"
            onClick={async () => await copyToClipboardWithToast(_id as string)}>
            {_id}
          </Button>
        </div>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold leading-none tracking-tight">
                {name}
              </h3>
            </div>
            <div className="flex -ml-1 text-yellow-400">
              <Star className={`w-4 h-4 fill-current`} />
              <p className="text-sm text-black">{stars}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm">
            <strong>Сложность:</strong> {difficulty}
          </div>
          {interviewMode && (
            <div className="text-sm">
              <strong>Режим интервью:</strong> Включен
              <div className="mt-1">
                <strong>Количество вопросов:</strong>{' '}
                {interviewQuestions.length}
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <TaskBadges feedback={feedback} />
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
          {onEdit && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEdit?.(_id as string)}>
              <Edit className="w-4 h-4" />
              <span className="sr-only">Редактировать</span>
            </Button>
          )}
          {onDelete && (
            <Button
              variant="destructive"
              size="icon"
              onClick={() => onDelete?.(_id as string)}>
              <Trash2 className="w-4 h-4" />
              <span className="sr-only">Удалить</span>
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={handleStatsClick}>
            <BarChart className="w-4 h-4" />
            <span className="sr-only">Статистика</span>
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={imagesOpen} onOpenChange={setImagesOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{name}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Описание:</h3>
              <p>{description}</p>
            </div>
            {additional_info && (
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">
                  Дополнительная информация:
                </h3>
                <p>{additional_info}</p>
              </div>
            )}
            {interviewMode && (
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">
                  Вопросы интервью:
                </h3>
                <ul className="list-disc ml-5 space-y-2">
                  {interviewQuestions.map((question, index) => (
                    <li key={index}>{question}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Изображения:</h3>
              <div className="grid grid-cols-2 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative aspect-[16/9]">
                    <Image
                      src={getContentUrl(image.image)}
                      alt={`Image ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                    />
                    {!image.is_open && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-semibold">
                          Закрыто
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={statsPopOpen} onOpenChange={setStatsPopOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Статистика</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Просмотров: {statistics.views}</p>
            <p>Выполнено: {statistics.completed}</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
