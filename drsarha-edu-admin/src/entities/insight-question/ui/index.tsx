'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ChartColumnIncreasing,
  Pencil,
  Trash,
} from 'lucide-react';
import { useState } from 'react';
import { copyToClipboard } from '@/shared/utils/copyToClipboard';
import { toast } from 'sonner';
import MergeTable, { Stat } from '@/components/merge-table';
import { AnalyticsQuestion } from '@/shared/types/analytics';

interface InsightQuestionProps {
  question: AnalyticsQuestion;
  getStats?: (id: string) => Promise<any>;
  setQuestionToDelete?: (question: AnalyticsQuestion) => void;
  onEdit?: (question: AnalyticsQuestion) => void;
  hideBtns?: boolean;
  isAdmin?: boolean;
}

export const InsightQuestion = ({
  question,
  getStats,
  setQuestionToDelete,
  onEdit,
  hideBtns = false,
  isAdmin = false,
}: InsightQuestionProps) => {
  const [openStats, setOpenStats] = useState(false);
  const [stats, setStats] = useState<any[]>([]);

  const handleShowStats = async () => {
    if (!getStats) return;
    const stats = await getStats(question.id ?? '');
    setStats(stats.results);
    setOpenStats(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col  gap-2 ">
        <div className="flex flex-row items-center gap-2 justify-between w-full">
          <div className="flex flex-row items-center gap-4">
            <CardTitle>{question.text}</CardTitle>
            <Badge variant="default">
              {question.type === 'numeric' ? 'Числовой' : 'Текстовый'}
            </Badge>
          </div>
          <div className="flex flex-row items-center gap-2">
            {!hideBtns && (
              <>
                <Button onClick={handleShowStats} variant="info">
                  <ChartColumnIncreasing className="w-4 h-4 stroke-white" />
                </Button>
                {onEdit && (
                  <Button onClick={() => onEdit(question)} variant="outline">
                    <Pencil className="w-4 h-4" />
                  </Button>
                )}
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
        <p>{question.text}</p>
        {question.type === 'text' && question.variants.length > 0 && (
          <div className="flex p-2 border rounded-md flex-col mt-4 gap-2">
            <p className="text-sm font-medium">Варианты ответов:</p>
            <div className="flex items-center flex-wrap gap-2">
              {question.variants.map((variant, index) => (
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
            <MergeTable
              initialStats={stats as Stat[]}
              questionId={question.id ?? ''}
              predefinedVariants={
                question.type === 'text' ? question.variants : []
              }
              onRewritesSaved={
                getStats
                  ? async () => {
                      const next = await getStats(question.id ?? '');
                      setStats(next.results);
                    }
                  : undefined
              }
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
