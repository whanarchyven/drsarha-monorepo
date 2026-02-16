import { useState } from 'react';
import {
  CreateInsightQuestionDto,
  CreateSurveyResponseDto,
} from '@/app/api/client/schemas';
import {
  createInsightQuestionInsightQuestionsPost,
  useCreateInsightQuestionInsightQuestionsPost,
  useGetInsightQuestionInsightQuestionsGetQuestionIdGet,
  useListQuestionsInsightQuestionsListGet,
  deleteInsightQuestionInsightQuestionsQuestionIdDelete,
  createAndGainInsightsSurveyResponsesCreateAndGainInsightsPost,
  summaryByInsightQuestionIdInsightResultsSummaryByInsightQuestionIdInsightQuestionIdGet,
} from '@/app/api/sdk/insightQuestionsAPI';

export const useInsightQuestions = (
  search?: string,
  limit?: number,
  skip?: number
) => {
  const {
    data: questionsData,
    isLoading: isLoadingQuestions,
    mutate,
  } = useListQuestionsInsightQuestionsListGet({
    title: search || undefined,
    limit: limit,
    skip: skip,
  });
  const questions = questionsData?.data ?? [];
  const [selectedQuestionsIds, setSelectedQuestionsIds] = useState<string[]>(
    []
  );

  const addInsightQuestion = async (question: CreateInsightQuestionDto) => {
    await createInsightQuestionInsightQuestionsPost(question);
    mutate(); // Обновляем список вопросов после добавления
  };
  const canCreateSurveyResponse = selectedQuestionsIds.length > 0;

  const getStats = async (questionId: string) => {
    const stats =
      summaryByInsightQuestionIdInsightResultsSummaryByInsightQuestionIdInsightQuestionIdGet(
        questionId
      )
        .then((d) => d.data)
        .then((d) => {
          return d;
        });
    return stats;
  };
  const createSurveyResponse = async (
    response: string,
    questionIds?: string[]
  ) => {
    // Используем переданные ID вопросов, если они есть, иначе используем selectedQuestionsIds
    const idsToUse = questionIds || selectedQuestionsIds;

    if (!idsToUse.length) {
      alert('Выберите хотя бы один вопрос');
      return;
    }

    await createAndGainInsightsSurveyResponsesCreateAndGainInsightsPost({
      response,
      insight_question_ids: idsToUse,
    });

    mutate(); // Обновляем список вопросов после добавления
  };

  const deleteQuestion = async (questionId: string) => {
    await deleteInsightQuestionInsightQuestionsQuestionIdDelete(questionId);
    mutate(); // Обновляем список вопросов после удаления
  };

  return {
    questions,
    isLoadingQuestions,
    addInsightQuestion,
    deleteQuestion,
    selectedQuestionsIds,
    setSelectedQuestionsIds,
    createSurveyResponse,
    canCreateSurveyResponse,
    getStats,
  };
};

export const useInsightQuestion = (questionId: string) => {
  const { data: questionData, isLoading: isLoadingQuestion } =
    useGetInsightQuestionInsightQuestionsGetQuestionIdGet(questionId);
  const question = questionData?.data;
  return { question, isLoadingQuestion };
};
