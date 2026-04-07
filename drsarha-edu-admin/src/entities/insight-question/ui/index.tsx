'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  ChartColumnIncreasing,
  Pencil,
  Trash,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { copyToClipboard } from '@/shared/utils/copyToClipboard';
import { toast } from 'sonner';
import MergeTable, { Stat } from '@/components/merge-table';
import { AnalyticsQuestion } from '@/shared/types/analytics';

interface InsightQuestionProps {
  question: AnalyticsQuestion;
  getStats?: (
    id: string,
    opts?: { onlyUserResponses?: boolean }
  ) => Promise<any>;
  setQuestionToDelete?: (question: AnalyticsQuestion) => void;
  onEdit?: (question: AnalyticsQuestion) => void;
  hideBtns?: boolean;
  isAdmin?: boolean;
  /** Свитчер «только user» (админ) */
  showRealUserOnlySwitch?: boolean;
}

export const InsightQuestion = ({
  question,
  getStats,
  setQuestionToDelete,
  onEdit,
  hideBtns = false,
  isAdmin = false,
  showRealUserOnlySwitch = false,
}: InsightQuestionProps) => {
  const [openStats, setOpenStats] = useState(false);
  const [stats, setStats] = useState<any[]>([]);
  const [realUserOnly, setRealUserOnly] = useState(false);

  const loadStats = async () => {
    if (!getStats) return;
    const data = await getStats(question.id ?? '', {
      onlyUserResponses: realUserOnly,
    });
    setStats(data.results);
  };

  const handleShowStats = () => {
    setOpenStats(true);
  };

  useEffect(() => {
    if (!openStats || !getStats) return;
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- перезагрузка при переключателе и открытии панели
  }, [realUserOnly, openStats, question.id]);

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
          <div className="flex flex-col gap-3 mt-4 p-2 border rounded-md">
            <p className="text-sm font-bold">Статистика</p>
            {showRealUserOnlySwitch ? (
              <div className="flex items-center gap-3 rounded-md border bg-muted/40 px-3 py-2.5">
                <Switch
                  id={`real-answers-${question.id}`}
                  checked={realUserOnly}
                  onCheckedChange={(c) => setRealUserOnly(c === true)}
                />
                <Label
                  htmlFor={`real-answers-${question.id}`}
                  className="text-sm font-medium cursor-pointer leading-none">
                  Настоящие ответы (только инсайты type: user)
                </Label>
              </div>
            ) : null}
            <MergeTable
              initialStats={stats as Stat[]}
              questionId={question.id ?? ''}
              predefinedVariants={
                question.type === 'text' ? question.variants : []
              }
              onRewritesSaved={
                getStats
                  ? async () => {
                      const next = await getStats(question.id ?? '', {
                        onlyUserResponses: realUserOnly,
                      });
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
