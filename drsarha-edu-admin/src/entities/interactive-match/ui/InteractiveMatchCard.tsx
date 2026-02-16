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
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Edit, Eye, Star, Trash2, BarChart } from 'lucide-react';
import { TaskBadges } from '@/shared/ui/TaskBadges/TaskBadges';
import { InteractiveMatch } from '@/shared/models/InteractiveMatch';
import { interactiveMatchesApi } from '@/shared/api/interactive-matches';

interface InteractiveMatchCardProps extends InteractiveMatch {
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function InteractiveMatchCard({
  _id,
  name,
  cover_image,
  answers,
  available_errors,
  feedback,
  nozology,
  stars,
  interviewMode,
  interviewQuestions,
  onEdit,
  onDelete,
}: InteractiveMatchCardProps) {
  const [imagesOpen, setImagesOpen] = useState(false);
  const [statsPopOpen, setStatsPopOpen] = useState(false);
  const [statistics, setStatistics] = useState({
    views: 0,
    completed: 0,
    correct_answers: 0,
    incorrect_answers: 0,
  });

  const handleStatsClick = async () => {
    try {
      const stats = await interactiveMatchesApi.getStatistics(_id as string);
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
            <strong>Доступно ошибок:</strong> {available_errors}
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
            <DialogTitle>{name} - Ответы</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Список ответов:</h3>
              <ul className="list-disc ml-5 space-y-2">
                {answers.map((answer, index) => (
                  <li key={index}>{answer}</li>
                ))}
              </ul>
            </div>
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
            <p>Правильных ответов: {statistics.correct_answers}</p>
            <p>Неправильных ответов: {statistics.incorrect_answers}</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
