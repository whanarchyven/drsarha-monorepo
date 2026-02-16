'use client';

import { useState } from 'react';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Star,
  Phone,
  MapPin,
  Briefcase,
  MessageCircle,
  CheckCircle,
  XCircle,
  Mail,
} from 'lucide-react';
import type { UserWithStats } from '@/shared/models/Rating';
import { toast } from '@/hooks/use-toast';
import { ratingsApi } from '@/shared/api/rating';
import { tasksApi } from '@/shared/api/tasks';

interface UserCardProps {
  userWithStats: UserWithStats;
  onDetailsClick: () => void;
}

export function UserCard({ userWithStats, onDetailsClick }: UserCardProps) {
  const { user, userCompletions } = userWithStats;
  const [starsOpen, setStarsOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [starsValue, setStarsValue] = useState<number | ''>('');
  const [taskIdValue, setTaskIdValue] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const handleSubmitStars = async () => {
    const value = starsValue === '' ? NaN : Number(starsValue);
    if (Number.isNaN(value)) {
      toast({
        title: 'Ошибка',
        description: 'Введите число звёзд',
        variant: 'destructive',
      });
      return;
    }
    try {
      setSubmitting(true);
      await ratingsApi.manageStars(user._id, { stars: value });
      toast({ title: 'Успешно', description: 'Звёзды обновлены' });
      setStarsOpen(false);
    } catch (e: any) {
      toast({
        title: 'Ошибка',
        description: e?.response?.data?.message || 'Не удалось обновить звёзды',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitTask = async () => {
    const taskId = taskIdValue.trim();
    if (!taskId) {
      toast({
        title: 'Ошибка',
        description: 'Введите ID задания',
        variant: 'destructive',
      });
      return;
    }
    try {
      setSubmitting(true);
      await tasksApi.completeTaskDirectly(taskId, [user._id]);
      toast({
        title: 'Успешно',
        description: 'Задание выполнено для пользователя',
      });
      setTaskOpen(false);
    } catch (e: any) {
      toast({
        title: 'Ошибка',
        description:
          e?.response?.data?.message || 'Не удалось выполнить задание',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={user.avatar || undefined} />
            <AvatarFallback className="bg-blue-100 text-blue-600">
              {getInitials(user.name || user.fullName || 'NN')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">
              {user.name || user.fullName || 'Без имени'}
            </h3>
            <div className="flex items-center space-x-1 mt-1">
              <span className="text-base font-bold text-black">
                {user.stars || 0}
              </span>
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">{user.email}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">{user.phone}</span>
          </div>

          {user.telegram && (
            <div className="flex items-center text-sm text-gray-600">
              <MessageCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">{user.telegram}</span>
            </div>
          )}

          {user.city && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">{user.city}</span>
            </div>
          )}

          {user.workplace && (
            <div className="flex items-center text-sm text-gray-600">
              <Briefcase className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">{user.workplace}</span>
            </div>
          )}

          {user.position && (
            <Badge variant="secondary" className="text-xs">
              {user.position}
            </Badge>
          )}
        </div>

        <div className="pt-2 border-t">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">
                {userCompletions.completed}
              </span>
              <span className="text-xs text-gray-500">выполнено</span>
            </div>
            <div className="flex items-center space-x-1">
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium">
                {userCompletions.uncompleted}
              </span>
              <span className="text-xs text-gray-500">не выполнено</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-4 flex flex-col gap-2">
        <Button onClick={onDetailsClick} className="w-full" variant="outline">
          Подробнее
        </Button>

        <Dialog open={starsOpen} onOpenChange={setStarsOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" variant="secondary">
              Установить звёзды
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Установить звёзды пользователю</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="starsValue">Количество звёзд</Label>
              <Input
                id="starsValue"
                type="number"
                value={starsValue}
                onChange={(e) =>
                  setStarsValue(
                    e.target.value === '' ? '' : Number(e.target.value)
                  )
                }
                placeholder="Например, 150"
                disabled={submitting}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setStarsOpen(false)}
                disabled={submitting}>
                Отмена
              </Button>
              <Button onClick={handleSubmitStars} disabled={submitting}>
                Сохранить
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={taskOpen} onOpenChange={setTaskOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" variant="secondary">
              Выполнить задание
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Выполнить задание для пользователя</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="taskId">ID задания</Label>
              <Input
                id="taskId"
                value={taskIdValue}
                onChange={(e) => setTaskIdValue(e.target.value)}
                placeholder="Например, 687e355f0160517b666430a5"
                disabled={submitting}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setTaskOpen(false)}
                disabled={submitting}>
                Отмена
              </Button>
              <Button onClick={handleSubmitTask} disabled={submitting}>
                Выполнить
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
