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
  BaseInsightQuestionDto,
  CreateInsightQuestionDto,
} from '@/app/api/client/schemas';
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
const QuestionsPage = () => {
  const [search, setSearch] = useState<string>('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

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
    deleteQuestion,
    createSurveyResponse,
    selectedQuestionsIds,
    setSelectedQuestionsIds,
    canCreateSurveyResponse,
    getStats,
  } = useInsightQuestions(search, limit, skip);

  console.log(questions, 'QUESTIONS');
  const [createPopOpen, setCreatePopOpen] = useState(false);
  const [deletePopOpen, setDeletePopOpen] = useState(false);

  const [questionToDelete, setQuestionToDelete] =
    useState<BaseInsightQuestionDto | null>(null);

  const handleAddInsightQuestion = async (data: CreateInsightQuestionDto) => {
    await addInsightQuestion({
      ...data,
      llm_model: 'gpt-4o',
      llm_temperature: 0,
    });

    setCreatePopOpen(false);
  };

  const { role } = useAuth();
  const isAdmin = role === 'admin';

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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Вопросы</h1>
        <Button onClick={() => setCreatePopOpen(true)}>Добавить вопрос</Button>
      </div>
      <Input
        placeholder="Поиск"
        className="mt-4 bg-white"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="flex mt-4 flex-col gap-4">
        {isLoadingQuestions ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        ) : (
          questions.map((question: BaseInsightQuestionDto) => (
            <InsightQuestion
              onSubmitResponse={async (
                questionId: string,
                response: string | number | string[]
              ) => {
                console.log(
                  response,
                  'RESPONSE',
                  [questionId],
                  'SELECTED QUESTIONS IDS'
                );
                await createSurveyResponse(String(response), [questionId]);
              }}
              setQuestionToDelete={setQuestionToDelete}
              getStats={getStats}
              key={question.id}
              question={question}
              isAdmin={isAdmin}
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
