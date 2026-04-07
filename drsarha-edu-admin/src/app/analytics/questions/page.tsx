'use client';
import { useInsightQuestions } from '@/shared/hooks/use-insight-questions';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { InsightQuestion } from '@/entities/insight-question/ui';
import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { InsightQuestionForm } from '@/components/insight-question-form';
import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/shared/hooks/useAuth';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AnalyticsQuestion, AnalyticsQuestionFormData } from '@/shared/types/analytics';
import { getConvexHttpClient } from '@/shared/lib/convex';
import { api } from '@convex/_generated/api';
const QuestionsPage = () => {
  const [search, setSearch] = useState<string>('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const convexClient = getConvexHttpClient();

  const currentPage = useMemo(() => {
    const pageParam = Number(searchParams.get('page') || '1');
    return Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  }, [searchParams]);

  const limit = useMemo(() => {
    const limitParam = Number(searchParams.get('limit') || '100');
    return Number.isFinite(limitParam) && limitParam > 0 ? limitParam : 10;
  }, [searchParams]);

  const skip = useMemo(() => (currentPage - 1) * limit, [currentPage, limit]);
  const {
    questions,
    isLoadingQuestions,
    addInsightQuestion,
    updateInsightQuestion,
    deleteQuestion,
    getStats,
  } = useInsightQuestions(search, limit, skip);
  const [createPopOpen, setCreatePopOpen] = useState(false);
  const [editPopOpen, setEditPopOpen] = useState(false);

  const [questionToDelete, setQuestionToDelete] =
    useState<AnalyticsQuestion | null>(null);
  const [questionToEdit, setQuestionToEdit] =
    useState<AnalyticsQuestion | null>(null);
  const [autoInsightForm, setAutoInsightForm] = useState({
    questionId: '',
    userId: 'manual:auto',
    response: '',
    timestamp: new Date().toISOString().slice(0, 16),
  });

  const handleAddInsightQuestion = async (data: AnalyticsQuestionFormData) => {
    await addInsightQuestion(data);
    setCreatePopOpen(false);
  };

  const handleEditInsightQuestion = async (data: AnalyticsQuestionFormData) => {
    if (!questionToEdit) return;
    await updateInsightQuestion(questionToEdit.id, data);
    setEditPopOpen(false);
    setQuestionToEdit(null);
  };

  const handleCreateAutoInsight = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !autoInsightForm.questionId ||
      !autoInsightForm.userId.trim() ||
      !autoInsightForm.response.trim() ||
      !autoInsightForm.timestamp
    ) {
      toast.error('Заполните все поля для auto insight');
      return;
    }

    const selectedQuestion = questions.find(
      (q) => q.id === autoInsightForm.questionId
    );
    const rawResponse = autoInsightForm.response.trim();
    let responsePayload: string | number = rawResponse;
    if (selectedQuestion?.type === 'numeric') {
      const n = Number(rawResponse.replace(',', '.'));
      if (!Number.isFinite(n)) {
        toast.error('Для числового вопроса укажите число');
        return;
      }
      responsePayload = n;
    }

    try {
      await convexClient.mutation(api.functions.analytic_insights.insert, {
        question_id: autoInsightForm.questionId as any,
        user_id: autoInsightForm.userId.trim(),
        response: responsePayload as any,
        type: 'auto',
        timestamp: new Date(autoInsightForm.timestamp).getTime(),
      });
      toast.success('Auto insight создан');
      setAutoInsightForm((prev) => ({
        ...prev,
        response: '',
      }));
    } catch (error) {
      console.error(error);
      toast.error('Не удалось создать auto insight');
    }
  };

  const { role } = useAuth();
  const isAdmin = role?.toLowerCase() === 'admin';
  const showRealUserOnlySwitch = role?.toLowerCase() === 'admin';

  // При изменении строки поиска сбрасываем страницу в URL на 1
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get('page') !== '1') {
      params.set('page', '1');
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
    // Важно: сбрасывать страницу только при изменении строки поиска
  }, [search, pathname, router]);

  const hasMore = useMemo(
    () => (questions?.length ?? 0) === limit,
    [questions, limit]
  );

  return (
    <div className="bg-slate-100 p-4 rounded-md">
      <Tabs defaultValue="questions" className="w-full">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Вопросы</h1>
          <TabsList>
            <TabsTrigger value="questions">Вопросы</TabsTrigger>
            <TabsTrigger value="auto-insight">Ручной auto insight</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="questions" className="space-y-4 mt-4">
          <div className="flex justify-between items-center gap-4">
            <Input
              placeholder="Поиск"
              className="bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button onClick={() => setCreatePopOpen(true)}>Добавить вопрос</Button>
          </div>
          <div className="flex flex-col gap-4">
            {isLoadingQuestions ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            ) : (
              questions.map((question: AnalyticsQuestion) => (
                <InsightQuestion
                  setQuestionToDelete={setQuestionToDelete}
                  getStats={getStats}
                  key={question.id}
                  question={question}
                  onEdit={(value) => {
                    setQuestionToEdit(value);
                    setEditPopOpen(true);
                  }}
                  isAdmin={isAdmin}
                  showRealUserOnlySwitch={showRealUserOnlySwitch}
                />
              ))
            )}
          </div>
          <div className="flex items-center justify-end mt-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (currentPage <= 1 || isLoadingQuestions) return;
                const params = new URLSearchParams(searchParams.toString());
                params.set('page', String(currentPage - 1));
                params.set('limit', String(limit));
                router.replace(`${pathname}?${params.toString()}`, {
                  scroll: false,
                });
              }}
              disabled={currentPage === 1 || isLoadingQuestions}>
              Назад
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (!hasMore || isLoadingQuestions) return;
                const params = new URLSearchParams(searchParams.toString());
                params.set('page', String(currentPage + 1));
                params.set('limit', String(limit));
                router.replace(`${pathname}?${params.toString()}`, {
                  scroll: false,
                });
              }}
              disabled={!hasMore || isLoadingQuestions}>
              Вперед
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="auto-insight" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Создать auto insight вручную</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateAutoInsight} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="auto-question-id">Вопрос</Label>
                  <select
                    id="auto-question-id"
                    className="w-full rounded-md border bg-white px-3 py-2 text-sm"
                    value={autoInsightForm.questionId}
                    onChange={(e) =>
                      setAutoInsightForm((prev) => ({
                        ...prev,
                        questionId: e.target.value,
                      }))
                    }>
                    <option value="">Выберите вопрос</option>
                    {questions.map((question) => (
                      <option key={question.id} value={question.id}>
                        {question.text}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="auto-user-id">user_id</Label>
                  <Input
                    id="auto-user-id"
                    value={autoInsightForm.userId}
                    onChange={(e) =>
                      setAutoInsightForm((prev) => ({
                        ...prev,
                        userId: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="auto-response">Ответ</Label>
                  <Textarea
                    id="auto-response"
                    value={autoInsightForm.response}
                    onChange={(e) =>
                      setAutoInsightForm((prev) => ({
                        ...prev,
                        response: e.target.value,
                      }))
                    }
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="auto-timestamp">Дата и время</Label>
                  <Input
                    id="auto-timestamp"
                    type="datetime-local"
                    value={autoInsightForm.timestamp}
                    onChange={(e) =>
                      setAutoInsightForm((prev) => ({
                        ...prev,
                        timestamp: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit">Создать auto insight</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Dialog open={createPopOpen} onOpenChange={setCreatePopOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить вопрос</DialogTitle>
          </DialogHeader>
          <InsightQuestionForm
            onSubmit={handleAddInsightQuestion}
            onCancel={() => setCreatePopOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={editPopOpen}
        onOpenChange={(open) => {
          setEditPopOpen(open);
          if (!open) {
            setQuestionToEdit(null);
          }
        }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать вопрос</DialogTitle>
          </DialogHeader>
          <InsightQuestionForm
            initialData={
              questionToEdit
                ? {
                    text: questionToEdit.text,
                    type: questionToEdit.type,
                    variants: questionToEdit.variants,
                  }
                : undefined
            }
            onSubmit={handleEditInsightQuestion}
            onCancel={() => {
              setEditPopOpen(false);
              setQuestionToEdit(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={questionToDelete != null}
        onOpenChange={() => setQuestionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить вопрос</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Вы уверены, что хотите удалить вопрос? Отменить это действие будет
            невозможно.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <Button onClick={() => setQuestionToDelete(null)}>Отмена</Button>
            <Button
              variant="destructive"
              onClick={() => {
                deleteQuestion(questionToDelete?.id ?? '');
                setQuestionToDelete(null);
                toast.success('Вопрос удален');
              }}>
              Удалить
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default QuestionsPage;
