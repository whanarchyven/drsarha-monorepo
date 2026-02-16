'use client';
import { BaseInsightQuestionDto } from '@/app/api/client/schemas';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ChartColumnIncreasing,
  Pencil,
  Trash,
  MessageSquare,
} from 'lucide-react';
import {
  useInsightQuestion,
  useInsightQuestions,
} from '@/shared/hooks/use-insight-questions';
import { useState, useEffect } from 'react';
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { copyToClipboard } from '@/shared/utils/copyToClipboard';
import { toast } from 'sonner';
import MergeTable, { Stat } from '@/components/merge-table';

interface InsightQuestionProps {
  question: BaseInsightQuestionDto;
  getStats?: (id: string) => Promise<any>;
  setQuestionToDelete?: (question: BaseInsightQuestionDto) => void;
  hideBtns?: boolean;
  onSubmitResponse?: (
    questionId: string,
    response: string | number | string[]
  ) => Promise<void>;
  isAdmin?: boolean;
}

interface InsightQuestionResponseFormProps {
  question: BaseInsightQuestionDto;
  onSubmit: (response: string | number | string[]) => Promise<void>;
  onCancel: () => void;
}

const InsightQuestionResponseForm = ({
  question,
  onSubmit,
  onCancel,
}: InsightQuestionResponseFormProps) => {
  const [response, setResponse] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(response);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Ответ на вопрос</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="font-medium mb-2">{question.prompt}</p>
            <div>
              <label className="block mb-1">Ваш ответ</label>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                className="w-full border rounded p-2 dark:bg-gray-700"
                rows={4}
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white">
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Отправить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const InsightQuestion = ({
  question,
  getStats,
  setQuestionToDelete,
  hideBtns = false,
  onSubmitResponse,
  isAdmin = false,
}: InsightQuestionProps) => {
  const [openStats, setOpenStats] = useState(false);
  const [stats, setStats] = useState<any[]>([]);
  const [average, setAverage] = useState<number | null>(null);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const { selectedQuestionsIds, setSelectedQuestionsIds } =
    useInsightQuestions();

  const handleShowStats = async () => {
    if (!getStats) return;
    const stats = await getStats(question.id ?? '');
    console.log(stats, 'STATS');
    setStats(stats.results);
    if (stats.avg) {
      setAverage(stats.avg);
    }
    setOpenStats(true);
  };

  const handleSubmitResponse = async (response: string | number | string[]) => {
    if (onSubmitResponse && question.id) {
      await onSubmitResponse(question.id, response);
      toast.success('Ответ отправлен');
      setShowResponseForm(false);
    }
  };

  const handleOpenResponseForm = () => {
    setShowResponseForm(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col  gap-2 ">
        <div className="flex flex-row items-center gap-2 justify-between w-full">
          <div className="flex flex-row items-center gap-4">
            <CardTitle>{question.title}</CardTitle>
            <Badge variant="default">
              {question.response_type === 'int' ? 'Числовой' : 'Варианты'}
            </Badge>
          </div>
          <div className="flex flex-row items-center gap-2">
            {onSubmitResponse && (
              <Button onClick={handleOpenResponseForm} variant="default">
                <MessageSquare className="w-4 h-4 mr-1" />
                Ответить
              </Button>
            )}
            {!hideBtns && (
              <>
                <Button onClick={handleShowStats} variant="info">
                  <ChartColumnIncreasing className="w-4 h-4 stroke-white" />
                </Button>
                <Button
                  onClick={() => {
                    if (setQuestionToDelete) setQuestionToDelete(question);
                  }}
                  variant="destructive">
                  <Trash className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
        <Badge
          onClick={async () => {
            await copyToClipboard(question.id ?? '');
            toast.success('ID скопирован в буфер обмена');
          }}
          className="w-fit cursor-pointer"
          variant="outline">
          ID: {question.id}
        </Badge>
      </CardHeader>
      <CardContent>
        <p>{question.prompt}</p>
        {question.response_type == 'variants_multiple' && (
          <div className="flex p-2 border rounded-md flex-col mt-4 gap-2">
            <p className="text-sm font-medium">Варианты ответов:</p>
            <div className="flex items-center flex-wrap gap-2">
              {question?.response_variants?.map((variant, index) => (
                <Badge key={index} className="w-fit" variant="outline">
                  {variant}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {openStats && (
          <div className="flex flex-col gap-2 mt-4 p-2 border rounded-md">
            <p className="text-sm font-bold">Статистика:</p>
            {average && (
              <p className="text-sm font-medium">Среднее значение: {average}</p>
            )}
            <MergeTable
              initialStats={stats as Stat[]}
              questionId={question.id ?? ''}
            />
          </div>
        )}
      </CardContent>
      {showResponseForm && (
        <InsightQuestionResponseForm
          question={question}
          onSubmit={handleSubmitResponse}
          onCancel={() => setShowResponseForm(false)}
        />
      )}
    </Card>
  );
};
