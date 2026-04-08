'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useInsightQuestions } from '@/shared/hooks/use-insight-questions';
import { AnalyticsQuestion } from '@/shared/types/analytics';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { Pagination } from '@/shared/ui/pagination';
import { Loader2 } from 'lucide-react';

interface QuestionSelectorProps {
  questionId: string;
  questionTitleCache: Record<string, string>;
  onSelect: (questionId: string) => void;
  getQuestionText: (questionId: string) => string;
  onQuestionTitleUpdate?: (questionId: string, title: string) => void;
}

export function QuestionSelector({
  questionId,
  questionTitleCache,
  onSelect,
  getQuestionText,
  onQuestionTitleUpdate,
}: QuestionSelectorProps) {
  const [iqPage, setIqPage] = useState(1);
  const [iqSearchInput, setIqSearchInput] = useState('');
  const debouncedIqSearch = useDebounce(iqSearchInput, 300);
  const iqLimit = 20;
  const iqSkip = (iqPage - 1) * iqLimit;
  const { questions, pagination, isLoadingQuestions } = useInsightQuestions(
    debouncedIqSearch,
    iqLimit,
    iqSkip
  );

  useEffect(() => {
    setIqPage(1);
  }, [debouncedIqSearch]);

  // Загружаем текст вопроса, если его нет в кэше, но есть в списке вопросов
  useEffect(() => {
    if (!questionId || questionTitleCache[questionId]) return;

    // Ищем вопрос в текущем списке вопросов
    const questionInList = questions.find((q) => q.id === questionId);
    if (questionInList?.text && onQuestionTitleUpdate) {
      // Обновляем кэш из списка вопросов
      onQuestionTitleUpdate(questionId, questionInList.text);
    }
  }, [questionId, questions, questionTitleCache, onQuestionTitleUpdate]);

  // Получаем текст вопроса из кэша или из списка вопросов
  const getDisplayText = () => {
    if (!questionId) return 'Выберите вопрос';

    // Сначала проверяем кэш
    if (questionTitleCache[questionId]) {
      return questionTitleCache[questionId];
    }

    // Если нет в кэше, ищем в текущем списке вопросов
    const questionInList = questions.find((q) => q.id === questionId);
    if (questionInList?.text) {
      return questionInList.text;
    }

    // Если ничего не найдено, используем getQuestionText (который вернет ID)
    return getQuestionText(questionId);
  };

  const handleQuestionSelect = (selectedQuestionId: string) => {
    // Находим вопрос в списке и сразу обновляем кэш, если есть колбэк
    const selectedQuestion = questions.find((q) => q.id === selectedQuestionId);
    if (selectedQuestion?.text && selectedQuestionId && onQuestionTitleUpdate) {
      onQuestionTitleUpdate(selectedQuestionId, selectedQuestion.text);
    }
    onSelect(selectedQuestionId);
  };

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) setIqPage(1);
      }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          {getDisplayText()}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Выберите вопрос</DialogTitle>
        </DialogHeader>
        <div className="mb-2">
          <Input
            placeholder="Поиск вопросов..."
            value={iqSearchInput}
            onChange={(e) => setIqSearchInput(e.target.value)}
          />
        </div>
        <ScrollArea className="h-[300px] mt-4">
          <div className="space-y-2">
            {isLoadingQuestions ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              questions.map((question: AnalyticsQuestion) => (
                <Button
                  key={question.id}
                  variant={questionId === question.id ? 'default' : 'outline'}
                  className="w-full justify-start text-left"
                  onClick={() => {
                    handleQuestionSelect(question.id ?? '');
                  }}>
                  {question.text}
                </Button>
              ))
            )}
          </div>
        </ScrollArea>
        <div className="mt-3 flex flex-col gap-2 border-t pt-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Всего: {pagination.total}</span>
          </div>
          {pagination.totalPages > 1 && (
            <Pagination
              compact
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={setIqPage}
              disabled={isLoadingQuestions}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
