'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import type { FunctionReturnType } from 'convex/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type ConferenceInteractive = NonNullable<
  FunctionReturnType<typeof api.functions.conference_interactives.getInteractiveById>
>;

type EditableVariant = {
  id: string;
  text: string;
  isCorrect?: boolean;
};

type EditableQuestion = {
  id: string;
  image: string;
  questionText: string;
  selectionMode: 'single' | 'multiple';
  variants: EditableVariant[];
};

interface ConferenceInteractiveFormProps {
  initialData?: ConferenceInteractive;
}

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const createVariant = (): EditableVariant => ({
  id: createId(),
  text: '',
  isCorrect: false,
});

const createQuestion = (): EditableQuestion => ({
  id: createId(),
  image: '',
  questionText: '',
  selectionMode: 'single',
  variants: [createVariant(), createVariant()],
});

function mapInitialQuestions(initialData?: ConferenceInteractive): EditableQuestion[] {
  if (!initialData?.questions?.length) {
    return [createQuestion()];
  }

  return initialData.questions.map((question) => ({
    id: question.id,
    image: question.image ?? '',
    questionText: question.questionText,
    selectionMode: question.selectionMode ?? 'single',
    variants: question.variants.map((variant) => ({
      id: variant.id,
      text: variant.text,
      isCorrect: variant.isCorrect ?? false,
    })),
  }));
}

export function ConferenceInteractiveForm({
  initialData,
}: ConferenceInteractiveFormProps) {
  const router = useRouter();
  const createInteractive = useMutation(
    api.functions.conference_interactives.createInteractive
  );
  const updateInteractive = useMutation(
    api.functions.conference_interactives.updateInteractive
  );

  const [title, setTitle] = useState(initialData?.title ?? '');
  const [kind, setKind] = useState<'quiz' | 'poll'>(initialData?.kind ?? 'quiz');
  const [showResults, setShowResults] = useState(initialData?.showResults ?? false);
  const [isDisplayed, setIsDisplayed] = useState(initialData?.isDisplayed ?? false);
  const [questions, setQuestions] = useState<EditableQuestion[]>(
    mapInitialQuestions(initialData)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!initialData) {
      return;
    }

    setTitle(initialData.title);
    setKind(initialData.kind);
    setShowResults(initialData.showResults);
    setIsDisplayed(initialData.isDisplayed);
    setQuestions(mapInitialQuestions(initialData));
  }, [initialData]);

  const totalCorrectAnswers = useMemo(
    () =>
      questions.reduce(
        (sum, question) =>
          sum + question.variants.filter((variant) => variant.isCorrect).length,
        0
      ),
    [questions]
  );

  const updateQuestion = (
    questionId: string,
    updater: (question: EditableQuestion) => EditableQuestion
  ) => {
    setQuestions((prev) =>
      prev.map((question) =>
        question.id === questionId ? updater(question) : question
      )
    );
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, createQuestion()]);
  };

  const removeQuestion = (questionId: string) => {
    setQuestions((prev) =>
      prev.length > 1 ? prev.filter((question) => question.id !== questionId) : prev
    );
  };

  const addVariant = (questionId: string) => {
    updateQuestion(questionId, (question) => ({
      ...question,
      variants: [...question.variants, createVariant()],
    }));
  };

  const removeVariant = (questionId: string, variantId: string) => {
    updateQuestion(questionId, (question) => ({
      ...question,
      variants:
        question.variants.length > 2
          ? question.variants.filter((variant) => variant.id !== variantId)
          : question.variants,
    }));
  };

  const handleVariantCorrectChange = (
    questionId: string,
    variantId: string,
    checked: boolean
  ) => {
    updateQuestion(questionId, (question) => {
      if (question.selectionMode === 'single' && checked) {
        return {
          ...question,
          variants: question.variants.map((variant) => ({
            ...variant,
            isCorrect: variant.id === variantId,
          })),
        };
      }

      return {
        ...question,
        variants: question.variants.map((variant) =>
          variant.id === variantId
            ? { ...variant, isCorrect: checked }
            : variant
        ),
      };
    });
  };

  const validateAndBuildQuestions = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      throw new Error('Название интерактива обязательно');
    }

    if (!questions.length) {
      throw new Error('Добавьте хотя бы один вопрос');
    }

    return {
      trimmedTitle,
      normalizedQuestions: questions.map((question, index) => {
        const questionText = question.questionText.trim();
        if (!questionText) {
          throw new Error(`Заполните текст вопроса ${index + 1}`);
        }

        if (question.variants.length < 2) {
          throw new Error(`В вопросе ${index + 1} должно быть минимум 2 варианта`);
        }

        const normalizedVariants = question.variants.map((variant, variantIndex) => {
          const variantText = variant.text.trim();
          if (!variantText) {
            throw new Error(
              `Заполните текст варианта ${variantIndex + 1} в вопросе ${index + 1}`
            );
          }

          return {
            id: variant.id,
            text: variantText,
            ...(kind === 'quiz' ? { isCorrect: Boolean(variant.isCorrect) } : {}),
          };
        });

        if (kind === 'quiz') {
          const correctAnswersCount = normalizedVariants.filter(
            (variant) => variant.isCorrect === true
          ).length;

          if (correctAnswersCount === 0) {
            throw new Error(
              `В тестовом вопросе ${index + 1} должен быть хотя бы один правильный ответ`
            );
          }

          if (
            question.selectionMode === 'single' &&
            correctAnswersCount > 1
          ) {
            throw new Error(
              `Вопрос ${index + 1} в режиме single не может иметь несколько правильных ответов`
            );
          }
        }

        return {
          id: question.id,
          ...(question.image.trim() ? { image: question.image.trim() } : {}),
          questionText,
          selectionMode: question.selectionMode,
          variants: normalizedVariants,
        };
      }),
    };
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const { trimmedTitle, normalizedQuestions } = validateAndBuildQuestions();

      const promise = initialData?._id
        ? updateInteractive({
            id: initialData._id as Id<'conference_interactives'>,
            data: {
              title: trimmedTitle,
              kind,
              showResults,
              isDisplayed,
              questions: normalizedQuestions,
            },
          })
        : createInteractive({
            title: trimmedTitle,
            kind,
            showResults,
            isDisplayed,
            questions: normalizedQuestions,
          });

      toast.promise(promise, {
        loading: initialData ? 'Сохраняем интерактив...' : 'Создаём интерактив...',
        success: initialData ? 'Интерактив обновлён' : 'Интерактив создан',
        error: 'Не удалось сохранить интерактив',
      });

      await promise;
      router.push('/broadcast/interactives');
      router.refresh();
    } catch (error) {
      console.error('Error submitting conference interactive form:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Не удалось сохранить интерактив'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {initialData ? 'Редактирование интерактива' : 'Новый интерактив'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="interactive-title">Название</Label>
              <Input
                id="interactive-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Например, Финальный опрос"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label>Тип интерактива</Label>
              <Select
                value={kind}
                onValueChange={(value: 'quiz' | 'poll') => setKind(value)}
                disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quiz">Тест</SelectItem>
                  <SelectItem value="poll">Опрос</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-1">
                <p className="font-medium">Показывать результаты</p>
                <p className="text-sm text-muted-foreground">
                  Разрешает клиенту показать экран результатов.
                </p>
              </div>
              <Switch
                checked={showResults}
                onCheckedChange={setShowResults}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-1">
                <p className="font-medium">Показывать в трансляции</p>
                <p className="text-sm text-muted-foreground">
                  Одновременно активен только один интерактив.
                </p>
              </div>
              <Switch
                checked={isDisplayed}
                onCheckedChange={setIsDisplayed}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Вопросы</h2>
            <p className="text-sm text-muted-foreground">
              {kind === 'quiz'
                ? `Всего отмечено правильных ответов: ${totalCorrectAnswers}`
                : 'Для опроса отметка правильных ответов не используется.'}
            </p>
          </div>
          <Button onClick={addQuestion} type="button" disabled={isSubmitting}>
            <Plus className="mr-2 h-4 w-4" />
            Добавить вопрос
          </Button>
        </div>

        {questions.map((question, questionIndex) => (
          <Card key={question.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Вопрос {questionIndex + 1}</CardTitle>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={isSubmitting || questions.length === 1}
                onClick={() => removeQuestion(question.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Текст вопроса</Label>
                <Textarea
                  value={question.questionText}
                  onChange={(event) =>
                    updateQuestion(question.id, (currentQuestion) => ({
                      ...currentQuestion,
                      questionText: event.target.value,
                    }))
                  }
                  className="min-h-[100px]"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Ссылка на изображение</Label>
                  <Input
                    value={question.image}
                    onChange={(event) =>
                      updateQuestion(question.id, (currentQuestion) => ({
                        ...currentQuestion,
                        image: event.target.value,
                      }))
                    }
                    placeholder="https://..."
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Режим выбора</Label>
                  <Select
                    value={question.selectionMode}
                    onValueChange={(value: 'single' | 'multiple') =>
                      updateQuestion(question.id, (currentQuestion) => ({
                        ...currentQuestion,
                        selectionMode: value,
                        variants:
                          value === 'single' && kind === 'quiz'
                            ? currentQuestion.variants.map((variant, variantIndex) => ({
                                ...variant,
                                isCorrect:
                                  variant.isCorrect === true &&
                                  currentQuestion.variants.findIndex(
                                    (item) => item.isCorrect === true
                                  ) === variantIndex,
                              }))
                            : currentQuestion.variants,
                      }))
                    }
                    disabled={isSubmitting}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="multiple">Multiple</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Варианты ответа</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addVariant(question.id)}
                    disabled={isSubmitting}>
                    <Plus className="mr-2 h-4 w-4" />
                    Добавить вариант
                  </Button>
                </div>

                <div className="space-y-3">
                  {question.variants.map((variant, variantIndex) => (
                    <div
                      key={variant.id}
                      className="rounded-lg border p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-2">
                          <Label>Вариант {variantIndex + 1}</Label>
                          <Input
                            value={variant.text}
                            onChange={(event) =>
                              updateQuestion(question.id, (currentQuestion) => ({
                                ...currentQuestion,
                                variants: currentQuestion.variants.map((item) =>
                                  item.id === variant.id
                                    ? { ...item, text: event.target.value }
                                    : item
                                ),
                              }))
                            }
                            placeholder="Введите текст варианта"
                            disabled={isSubmitting}
                          />
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={isSubmitting || question.variants.length <= 2}
                          onClick={() => removeVariant(question.id, variant.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {kind === 'quiz' && (
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={Boolean(variant.isCorrect)}
                            onCheckedChange={(checked) =>
                              handleVariantCorrectChange(
                                question.id,
                                variant.id,
                                checked === true
                              )
                            }
                            disabled={isSubmitting}
                          />
                          <span className="text-sm text-muted-foreground">
                            Правильный ответ
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Сохранить интерактив' : 'Создать интерактив'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/broadcast/interactives')}
          disabled={isSubmitting}>
          Отмена
        </Button>
      </div>
    </div>
  );
}
