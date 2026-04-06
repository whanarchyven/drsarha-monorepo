import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@convex/_generated/api';
import { getConvexHttpClient } from '@/shared/lib/convex';
import {
  AnalyticsQuestion,
  AnalyticsQuestionFormData,
  AnalyticsQuestionSummary,
} from '@/shared/types/analytics';

function mapQuestion(question: any): AnalyticsQuestion {
  return {
    id: String(question._id),
    text: question.text,
    type: question.type,
    variants: question.variants ?? [],
  };
}

export const useInsightQuestions = (
  search?: string,
  limit?: number,
  skip?: number
) => {
  const client = useMemo(() => getConvexHttpClient(), []);
  const [questions, setQuestions] = useState<AnalyticsQuestion[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedQuestionsIds, setSelectedQuestionsIds] = useState<string[]>(
    []
  );

  const page = Math.floor((skip ?? 0) / (limit ?? 100)) + 1;

  const loadQuestions = useCallback(async () => {
    setIsLoadingQuestions(true);
    try {
      const result = await client.query(api.functions.analytic_questions.list, {
        search: search || undefined,
        page,
        limit: limit ?? 100,
      });
      setQuestions((result.items ?? []).map(mapQuestion));
    } finally {
      setIsLoadingQuestions(false);
    }
  }, [client, limit, page, search]);

  useEffect(() => {
    void loadQuestions();
  }, [loadQuestions, reloadKey]);

  const refresh = () => setReloadKey((prev) => prev + 1);

  const addInsightQuestion = async (question: AnalyticsQuestionFormData) => {
    await client.mutation(api.functions.analytic_questions.insert, {
      text: question.text,
      type: question.type,
      variants: question.type === 'text' ? question.variants : undefined,
    });
    refresh();
  };

  const updateInsightQuestion = async (
    id: string,
    question: AnalyticsQuestionFormData
  ) => {
    await client.mutation(api.functions.analytic_questions.update, {
      id: id as any,
      data: {
        text: question.text,
        type: question.type,
        variants: question.type === 'text' ? question.variants : undefined,
      },
    });
    refresh();
  };

  const canCreateSurveyResponse = selectedQuestionsIds.length > 0;

  const getStats = async (questionId: string) => {
    return (await client.query(api.functions.analytic_insights.summaryByQuestion, {
      question_id: questionId as any,
    })) as AnalyticsQuestionSummary;
  };

  const createSurveyResponse = async (
    response: string,
    questionIds?: string[]
  ) => {
    const idsToUse = questionIds || selectedQuestionsIds;

    if (!idsToUse.length) {
      alert('Выберите хотя бы один вопрос');
      return;
    }

    throw new Error(
      'Создание user insight через extractor в админке не подключено'
    );
  };

  const deleteQuestion = async (questionId: string) => {
    await client.mutation(api.functions.analytic_questions.remove, {
      id: questionId as any,
    });
    refresh();
  };

  return {
    questions,
    isLoadingQuestions,
    addInsightQuestion,
    updateInsightQuestion,
    deleteQuestion,
    selectedQuestionsIds,
    setSelectedQuestionsIds,
    createSurveyResponse,
    canCreateSurveyResponse,
    getStats,
  };
};

export const useInsightQuestion = (questionId: string) => {
  const client = useMemo(() => getConvexHttpClient(), []);
  const [question, setQuestion] = useState<AnalyticsQuestion | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true);

  useEffect(() => {
    const loadQuestion = async () => {
      setIsLoadingQuestion(true);
      try {
        const result = await client.query(api.functions.analytic_questions.getById, {
          id: questionId,
        });
        setQuestion(result ? mapQuestion(result) : null);
      } finally {
        setIsLoadingQuestion(false);
      }
    };

    if (questionId) {
      void loadQuestion();
    } else {
      setQuestion(null);
      setIsLoadingQuestion(false);
    }
  }, [client, questionId]);

  return { question, isLoadingQuestion };
};
