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
  const [iqSearch, setIqSearch] = useState('');
  const iqLimit = 100;
  const iqSkip = (iqPage - 1) * iqLimit;
  const { questions } = useInsightQuestions(iqSearch, iqLimit, iqSkip);

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
    <Dialog>
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
            value={iqSearch}
            onChange={(e) => setIqSearch(e.target.value)}
          />
        </div>
        <ScrollArea className="h-[300px] mt-4">
          <div className="space-y-2">
            {questions.map((question: AnalyticsQuestion) => (
              <Button
                key={question.id}
                variant={questionId === question.id ? 'default' : 'outline'}
                className="w-full justify-start text-left"
                onClick={() => {
                  handleQuestionSelect(question.id ?? '');
                }}>
                {question.text}
              </Button>
            ))}
          </div>
        </ScrollArea>
        <div className="flex justify-end gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIqPage((p) => Math.max(1, p - 1))}
            disabled={iqPage === 1}>
            Назад
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (questions.length === iqLimit) setIqPage((p) => p + 1);
            }}
            disabled={questions.length < iqLimit}>
            Вперед
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
