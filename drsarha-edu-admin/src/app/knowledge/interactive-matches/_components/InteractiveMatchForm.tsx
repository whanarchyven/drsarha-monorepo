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
import { interactiveMatchesApi } from '@/shared/api/interactive-matches';
import type { InteractiveMatch } from '@/shared/models/InteractiveMatch';
import { FeedbackQuestions } from '@/shared/ui/FeedBackQuestions/FeedbackQuestions';
import type { Nozology } from '@/shared/models/Nozology';

import Image from 'next/image';
import { getContentUrl } from '@/shared/utils/url';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';

const publishAfterSchema = z.preprocess(
  (value) =>
    typeof value === 'string' && value.length === 0 ? undefined : value,
  z.string().optional()
);

const formSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  cover_image: z.any(),
  answers: z.array(z.string()).default([]),
  available_errors: z.number().min(0),
  stars: z.number().min(0).max(5),
  nozology: z.string().min(1, 'Нозология обязательна'),
  publishAfter: publishAfterSchema,
  interviewMode: z.boolean().default(false),
  interviewQuestions: z.array(z.string()).default([]),
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

interface InteractiveMatchFormProps {
  initialData?: InteractiveMatch;
}

export function InteractiveMatchForm({
  initialData,
}: InteractiveMatchFormProps) {
  const router = useRouter();
  const { items, fetchNozologies } = useNozologiesStore();
  const [newAnswer, setNewAnswer] = useState('');
  const [answerList, setAnswerList] = useState<string[]>(
    initialData?.answers || []
  );
  const [newInterviewQuestion, setNewInterviewQuestion] = useState('');
  const [interviewQuestionsList, setInterviewQuestionsList] = useState<
    string[]
  >(initialData?.interviewQuestions || []);
  const [references, setReferences] = useState<
    Array<{ name: string; url: string }>
  >(initialData?.references || []);
  const [newReferenceName, setNewReferenceName] = useState('');
  const [newReferenceUrl, setNewReferenceUrl] = useState('');

  useEffect(() => {
    fetchNozologies();
  }, [fetchNozologies]);

  const handleAddAnswer = () => {
    if (newAnswer.trim()) {
      setAnswerList([...answerList, newAnswer.trim()]);
      setNewAnswer('');
    }
  };

  const handleRemoveAnswer = (index: number) => {
    const newAnswers = [...answerList];
    newAnswers.splice(index, 1);
    setAnswerList(newAnswers);
  };

  const handleAddInterviewQuestion = () => {
    if (newInterviewQuestion.trim()) {
      setInterviewQuestionsList([
        ...interviewQuestionsList,
        newInterviewQuestion.trim(),
      ]);
      setNewInterviewQuestion('');
    }
  };

  const handleRemoveInterviewQuestion = (index: number) => {
    const newQuestions = [...interviewQuestionsList];
    newQuestions.splice(index, 1);
    setInterviewQuestionsList(newQuestions);
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      cover_image: initialData?.cover_image || null,
      available_errors: initialData?.available_errors || 0,
      answers: initialData?.answers || [],
      stars: initialData?.stars || 0,
      nozology: initialData?.nozology || '',
      feedback: initialData?.feedback || [],
      interviewMode: initialData?.interviewMode || false,
      interviewQuestions: initialData?.interviewQuestions || [],
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

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('available_errors', values.available_errors.toString());
      formData.append('stars', values.stars.toString());
      formData.append('nozology', values.nozology);
      if (values.publishAfter) {
        formData.append('publishAfter', values.publishAfter);
      }
      formData.append('interviewMode', values.interviewMode.toString());

      // Добавляем ответы
      formData.append('answers', JSON.stringify(answerList));

      // Добавляем вопросы интервью
      formData.append(
        'interviewQuestions',
        JSON.stringify(interviewQuestionsList)
      );

      // Добавляем фидбэк
      formData.append('feedback', JSON.stringify(values.feedback));
      formData.append('app_visible', values.app_visible.toString());
      formData.append('references', JSON.stringify(references));

      // Обрабатываем изображение
      if (values.cover_image && values.cover_image instanceof File) {
        formData.append('cover_image', values.cover_image);
      }

      if (initialData?._id) {
        // Обновление
        await interactiveMatchesApi.update(initialData._id, formData);
        toast.success('Интерактивное соединение обновлено');
      } else {
        // Создание
        await interactiveMatchesApi.create(formData);
        toast.success('Интерактивное соединение создано');
      }

      router.push('/knowledge/interactive-matches');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Ошибка при сохранении');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <Card className="p-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Название</FormLabel>
                <FormControl>
                  <Input placeholder="Введите название" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="my-4">
            <FormField
              control={form.control}
              name="cover_image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Обложка</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          field.onChange(file);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                  {initialData?.cover_image && (
                    <div className="mt-2">
                      <p className="text-sm mb-2">Текущая обложка:</p>
                      <div className="relative h-40 w-full">
                        <Image
                          src={getContentUrl(initialData.cover_image)}
                          alt="Cover"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                  )}
                </FormItem>
              )}
            />
          </div>

          <div className="my-4">
            <FormLabel>Ответы (в правильном порядке)</FormLabel>
            <div className="flex items-center gap-2 mt-2">
              <Input
                placeholder="Добавить ответ"
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
              />
              <Button
                type="button"
                onClick={handleAddAnswer}
                variant="secondary">
                Добавить
              </Button>
            </div>
            <div className="mt-4">
              <ul className="space-y-2">
                {answerList.map((answer, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between bg-gray-100 p-2 rounded">
                    <span>{answer}</span>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveAnswer(index)}>
                      Удалить
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 my-4">
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

            <FormField
              control={form.control}
              name="stars"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Звезды </FormLabel>
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

          <div className="my-4">
            <FormField
              control={form.control}
              name="nozology"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Нозология</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите нозологию" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {items.map((nozology: Nozology) => (
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
          </div>

          <div className="my-4">
            <FormField
              control={form.control}
              name="interviewMode"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Режим интервью</FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>

          {form.watch('interviewMode') && (
            <div className="my-4">
              <FormLabel>Вопросы интервью</FormLabel>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  placeholder="Добавить вопрос интервью"
                  value={newInterviewQuestion}
                  onChange={(e) => setNewInterviewQuestion(e.target.value)}
                />
                <Button
                  type="button"
                  onClick={handleAddInterviewQuestion}
                  variant="secondary">
                  Добавить
                </Button>
              </div>
              <div className="mt-4">
                <ul className="space-y-2">
                  {interviewQuestionsList.map((question, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between bg-gray-100 p-2 rounded">
                      <span>{question}</span>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveInterviewQuestion(index)}>
                        Удалить
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="my-4">
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
          </div>

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

          <div className="mt-8">
            <FormLabel>Обратная связь</FormLabel>
            <FeedbackQuestions />
          </div>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/knowledge/interactive-matches')}>
            Отмена
          </Button>
          <Button type="submit">{initialData ? 'Обновить' : 'Создать'}</Button>
        </div>
      </form>
    </Form>
  );
}
