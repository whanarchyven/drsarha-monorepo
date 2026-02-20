'use client';

import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Calendar, Target, Award } from 'lucide-react';
import { api } from '@convex/_generated/api';
import type { FunctionReturnType } from 'convex/server';
import type { Id } from '@convex/_generated/dataModel';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { copyToClipboard } from '@/shared/utils/copyToClipboard';
import { toast } from 'sonner';

interface TaskListProps {
  tasks: FunctionReturnType<typeof api.functions.tasks.listByGroup>;
  onAddTask: () => void;
  onEditTask: (taskId: Id<'tasks'>) => void;
  onDeleteTask: (taskId: Id<'tasks'>) => void;
}

export function TaskList({
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
}: TaskListProps) {
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

  const handleDelete = async (taskId: Id<'tasks'>) => {
    setDeleteTaskId(null);
    onDeleteTask(taskId);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Задания в группе</h2>
        <Button onClick={onAddTask}>
          <Plus className="mr-2 h-4 w-4" />
          Добавить задание
        </Button>
      </div>

      {tasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-muted-foreground mb-4">
              В этой группе пока нет заданий
            </div>
            <Button onClick={onAddTask}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить первое задание
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <Card key={task._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{task.title}</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onEditTask(task._id)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setDeleteTaskId(task._id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {task.description}
                </p>

                <div className="flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span>{task.actionType}</span>
                  <span className="font-medium">
                    {task.config.targetAmount}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4 text-yellow-500" />
                      <span>{task.reward.stars}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4 text-blue-500" />
                      <span>{task.reward.exp}</span>
                    </div>
                  </div>
                </div>
                <Badge
                  onClick={() => {
                    copyToClipboard(task._id);
                    toast.success('ID скопирован в буфер обмена');
                  }}
                  className="cursor-pointer"
                  variant="outline">
                  {task._id}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog
        open={!!deleteTaskId}
        onOpenChange={() => setDeleteTaskId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить это задание? Это действие нельзя
              отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTaskId && handleDelete(deleteTaskId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
