'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useNozologiesStore } from '@/shared/store/nozologiesStore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { interactiveQuizzesApi } from '@/shared/api/interactive-quizzes';
import type { InteractiveQuiz } from '@/shared/models/InteractiveQuiz';
import { FeedbackQuestions } from '@/shared/ui/FeedBackQuestions/FeedbackQuestions';

import Image from 'next/image';
import { getContentUrl } from '@/shared/utils/url';
import QuestionCreator from '@/components/question-creator';
import { useState } from 'react';
import type { Question } from '@/shared/models/types/QuestionType';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

const publishAfterSchema = z.preprocess(
  (value) =>
    typeof value === 'string' && value.length === 0 ? undefined : value,
  z.string().optional()
);

const formSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),

  cover_image: z.any(),
  // Редактор вопросов управляет стейтом отдельно; не валидируем здесь
  questions: z.any().optional().default([]),
  available_errors: z.number().min(0),
  stars: z.number().min(0).max(5),
  nozology: z.string().min(1, 'Нозология обязательна'),
  publishAfter: publishAfterSchema,
  feedback: z
    .array(
      z.object({
        question: z.string(),
        has_correct: z.boolean(),
        answers: z
          .array(
            z.object({
              answer: z.string(),
              is_correct: z.boolean(),
            })
          )
          .optional(),
        analytic_questions: z.array(z.string()).default([]),
      })
    )
    .default([]),
  app_visible: z.boolean().default(false),
  references: z
    .array(
      z.object({
        name: z.string(),
        url: z.string(),
      })
    )
    .default([]),
});

interface InteractiveQuizFormProps {
  initialData?: InteractiveQuiz;
}

export function InteractiveQuizForm({ initialData }: InteractiveQuizFormProps) {
  const router = useRouter();
  const { items: nozologies } = useNozologiesStore();

  const [questions, setQuestions] = useState<Question[]>(
    initialData?.questions || []
  );
  const [references, setReferences] = useState<
    Array<{ name: string; url: string }>
  >(initialData?.references || []);
  const [newReferenceName, setNewReferenceName] = useState('');
  const [newReferenceUrl, setNewReferenceUrl] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      available_errors: initialData?.available_errors || 0,
      stars: initialData?.stars || 0,
      nozology: initialData?.nozology || '',
      questions: initialData?.questions || [],
      feedback: initialData?.feedback || [],
      cover_image: undefined,
      publishAfter: initialData?.publishAfter
        ? typeof initialData.publishAfter === 'string'
          ? initialData.publishAfter.slice(0, 10)
          : initialData.publishAfter instanceof Date
            ? initialData.publishAfter.toISOString().slice(0, 10)
            : String(initialData.publishAfter).slice(0, 10)
        : '',
      app_visible: initialData?.app_visible || false,
      references: initialData?.references || [],
    },
  });

  // Подсветка первой ошибки Zod и фокус на поле
  const onInvalid = (errors: any) => {
    const getFirstErrorField = (errObj: any, parent = ''): string | null => {
      for (const key of Object.keys(errObj || {})) {
        const node = errObj[key];
        const name = parent ? `${parent}.${key}` : key;
        if (node && typeof node === 'object') {
          if (node.message) return name;
          const nested = getFirstErrorField(node, name);
          if (nested) return nested;
        }
      }
      return null;
    };
    const first = getFirstErrorField(errors);
    if (first) {
      // @ts-ignore — имя может быть вложенным (array/object)
      form.setFocus(first);
    }
    toast.error('Проверьте обязательные поля и исправьте ошибки формы');
    console.error('Form validation errors:', errors);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values, 'VALUES');
    try {
      console.log(values, 'VALUES');
      console.log(questions, 'QUESTIONS');

      if (!initialData && !values.cover_image?.[0]) {
        throw new Error(
          'Обложка обязательна при создании интерактивной викторины'
        );
      }

      const formData = new FormData();

      // Базовые поля
      formData.append('name', values.name);
      formData.append('available_errors', values.available_errors.toString());
      formData.append('stars', values.stars.toString());
      formData.append('nozology', values.nozology);
      if (values.publishAfter) {
        formData.append('publishAfter', values.publishAfter);
      }

      // Обработка обложки
      if (values.cover_image?.[0] instanceof File) {
        formData.append('cover_image', values.cover_image[0]);
      }

      // Подготовка данных вопросов
      const questionsData = questions.map((question, index) => {
        const questionData: any = {
          question: question.question,
          type: question.type,
          correct_answer_comment: question.correct_answer_comment,
        };

        // Обработка изображения вопроса
        if (question.image) {
          if (typeof question.image === 'string') {
            if (question.image.includes('/images/')) {
              // Изображение уже на сервере
              questionData.image = question.image;
            } else if (question.image.startsWith('blob:')) {
              // Новое изображение
              questionData.image = `question_image_${index}`;
            } else {
              // Существующее изображение
              questionData.image = question.image;
            }
          }
        }

        // Обработка ответов
        if (question.type === 'variants' && question.answers) {
          questionData.answers = question.answers.map((answer, answerIndex) => {
            const answerData: any = {
              answer: answer.answer,
              isCorrect: answer.isCorrect,
            };

            // Обработка изображения ответа
            if (answer.image) {
              if (typeof answer.image === 'string') {
                if (answer.image.includes('/images/')) {
                  // Изображение уже на сервере
                  answerData.image = answer.image;
                } else if (answer.image.startsWith('blob:')) {
                  // Новое изображение
                  answerData.image = `question_${index}_answer_${answerIndex}_image`;
                } else {
                  // Существующее изображение
                  answerData.image = answer.image;
                }
              }
            }

            return answerData;
          });
        } else if (question.type === 'text') {
          questionData.answer = question.answer;
          if ('additional_info' in question && question.additional_info) {
            questionData.additional_info = question.additional_info;
          }
        }

        return questionData;
      });

      // Добавление данных вопросов в FormData
      formData.append('questions', JSON.stringify(questionsData));

      // Добавление данных обратной связи
      const feedbackData = values.feedback.map((item) => ({
        ...item,
        analytic_questions: item.analytic_questions || [],
      }));

      formData.append('feedback', JSON.stringify(feedbackData));
      formData.append('app_visible', values.app_visible.toString());
      formData.append('references', JSON.stringify(references));

      // Загрузка файлов изображений для вопросов
      for (let qIndex = 0; qIndex < questions.length; qIndex++) {
        const question = questions[qIndex];

        // Загрузка изображения вопроса
        if (
          question.image &&
          typeof question.image === 'string' &&
          question.image.startsWith('blob:') &&
          !question.image.includes('/images/')
        ) {
          try {
            const response = await fetch(question.image);
            const blob = await response.blob();
            const file = new File([blob], `question_image_${qIndex}.jpg`, {
              type: 'image/jpeg',
            });
            formData.append(`question_image_${qIndex}`, file);
          } catch (error) {
            console.error(`Error processing question ${qIndex} image:`, error);
            throw new Error(
              `Ошибка при обработке изображения для вопроса ${qIndex + 1}`
            );
          }
        }

        // Загрузка изображений для ответов
        if (question.type === 'variants' && question.answers) {
          for (let aIndex = 0; aIndex < question.answers.length; aIndex++) {
            const answer = question.answers[aIndex];
            if (
              answer.image &&
              typeof answer.image === 'string' &&
              answer.image.startsWith('blob:') &&
              !answer.image.includes('/images/')
            ) {
              try {
                const response = await fetch(answer.image);
                const blob = await response.blob();
                const file = new File(
                  [blob],
                  `answer_image_${qIndex}_${aIndex}.jpg`,
                  { type: 'image/jpeg' }
                );
                formData.append(
                  `question_${qIndex}_answer_${aIndex}_image`,
                  file
                );
              } catch (error) {
                console.error(
                  `Error processing answer ${aIndex} image for question ${qIndex}:`,
                  error
                );
                throw new Error(
                  `Ошибка при обработке изображения для варианта ответа ${aIndex + 1} вопроса ${qIndex + 1}`
                );
              }
            }
          }
        }
      }

      // Для отладки выводим содержимое FormData
      console.log('FormData contents:');
      for (const pair of Array.from(formData.entries())) {
        console.log(pair[0], pair[1]);
      }

      if ((initialData as any)?._id) {
        const id = (initialData as any)._id;
        await interactiveQuizzesApi.update(id, formData);
        toast.success('Интерактивная викторина успешно обновлена');
      } else {
        await interactiveQuizzesApi.create(formData);
        toast.success('Интерактивная викторина успешно создана');
      }

      router.push('/knowledge/interactive-quizzes');
      router.refresh();
    } catch (error: any) {
      console.error('Error saving interactive quiz:', error);
      toast.error(
        error.message ||
          'Произошла ошибка при сохранении интерактивной викторины'
      );
    }
  };

  const handleAddReference = () => {
    if (newReferenceName.trim() && newReferenceUrl.trim()) {
      setReferences([
        ...references,
        { name: newReferenceName.trim(), url: newReferenceUrl.trim() },
      ]);
      setNewReferenceName('');
      setNewReferenceUrl('');
    }
  };

  const handleRemoveReference = (index: number) => {
    const newReferences = [...references];
    newReferences.splice(index, 1);
    setReferences(newReferences);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
        noValidate
        className="space-y-8">
        <Card className="p-6 space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Название</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Введите название" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="stars"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Звезды (0-5)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={5}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="available_errors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Доступные ошибки</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="publishAfter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Дата публикации</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nozology"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Нозология</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите нозологию" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {nozologies.map((nozology) => (
                      <SelectItem key={nozology._id} value={nozology._id}>
                        {nozology.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cover_image"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Обложка</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onChange(e.target.files)}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                {initialData?.cover_image && (
                  <div className="relative aspect-video w-full">
                    <Image
                      src={getContentUrl(initialData.cover_image)}
                      alt="Preview"
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                )}
              </FormItem>
            )}
          />
          <QuestionCreator questions={questions} setQuestions={setQuestions} />

          <FormField
            control={form.control}
            name="app_visible"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Видимость в приложении</FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <div className="my-4">
            <FormLabel>Ссылки (References)</FormLabel>
            <div className="space-y-2 mt-2">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Название ссылки"
                  value={newReferenceName}
                  onChange={(e) => setNewReferenceName(e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="URL"
                  value={newReferenceUrl}
                  onChange={(e) => setNewReferenceUrl(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleAddReference}
                  variant="secondary">
                  Добавить
                </Button>
              </div>
              <div className="mt-4">
                <ul className="space-y-2">
                  {references.map((ref, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between bg-gray-100 p-2 rounded">
                      <span>
                        <strong>{ref.name}:</strong> {ref.url}
                      </span>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveReference(index)}>
                        Удалить
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <FeedbackQuestions />
        </Card>

        <div className="flex gap-4">
          <Button type="submit">
            {initialData
              ? 'Сохранить изменения'
              : 'Создать интерактивную викторину'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Отмена
          </Button>
        </div>
      </form>
    </Form>
  );
}
