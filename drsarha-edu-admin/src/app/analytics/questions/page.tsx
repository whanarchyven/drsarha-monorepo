'use client';
import { useInsightQuestions } from '@/shared/hooks/use-insight-questions';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { InsightQuestion } from '@/entities/insight-question/ui';
import { useEffect, useMemo, useRef, useState } from 'react';
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
import { useDebounce } from '@/shared/hooks/useDebounce';
import { Pagination } from '@/shared/ui/pagination';

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100] as const;

const QuestionsPage = () => {
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const convexClient = getConvexHttpClient();
  const prevDebouncedSearch = useRef<string | undefined>(undefined);

  const currentPage = useMemo(() => {
    const pageParam = Number(searchParams.get('page') || '1');
    return Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  }, [searchParams]);

  const limit = useMemo(() => {
    const limitParam = Number(searchParams.get('limit') || '30');
    if (!Number.isFinite(limitParam) || limitParam <= 0) return 30;
    const n = Math.floor(limitParam);
    return (PAGE_SIZE_OPTIONS as readonly number[]).includes(n) ? n : 30;
  }, [searchParams]);

  const skip = useMemo(() => (currentPage - 1) * limit, [currentPage, limit]);
  const {
    questions,
    pagination,
    isLoadingQuestions,
    addInsightQuestion,
    updateInsightQuestion,
    deleteQuestion,
    getStats,
  } = useInsightQuestions(debouncedSearch, limit, skip);

  const { questions: allQuestionsForSelect } = useInsightQuestions('', 5000, 0);
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

    const selectedQuestion = allQuestionsForSelect.find(
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

  useEffect(() => {
    if (prevDebouncedSearch.current === undefined) {
      prevDebouncedSearch.current = debouncedSearch;
      return;
    }
    if (prevDebouncedSearch.current === debouncedSearch) return;
    prevDebouncedSearch.current = debouncedSearch;
    const params = new URLSearchParams(searchParams.toString());
    if (params.get('page') === '1') return;
    params.set('page', '1');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [debouncedSearch, pathname, router, searchParams]);

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
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
            <Input
              placeholder="Поиск по тексту вопроса"
              className="bg-white max-w-md"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <Button onClick={() => setCreatePopOpen(true)}>Добавить вопрос</Button>
          </div>
          <div className="flex flex-col gap-4">
            {isLoadingQuestions ? (
              <div className="flex justify-center items-center h-full py-12">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            ) : questions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                {debouncedSearch.trim()
                  ? 'Ничего не найдено по запросу'
                  : 'Вопросов пока нет'}
              </p>
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-4">
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>Всего: {pagination.total}</span>
              <label className="flex items-center gap-2">
                На странице:
                <select
                  className="rounded-md border border-input bg-white px-2 py-1 text-sm"
                  value={limit}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    const params = new URLSearchParams(searchParams.toString());
                    params.set('limit', String(next));
                    params.set('page', '1');
                    router.replace(`${pathname}?${params.toString()}`, {
                      scroll: false,
                    });
                  }}>
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(p) => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set('page', String(p));
                  params.set('limit', String(limit));
                  router.replace(`${pathname}?${params.toString()}`, {
                    scroll: false,
                  });
                }}
                disabled={isLoadingQuestions}
              />
            )}
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
                    {allQuestionsForSelect.map((question) => (
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
