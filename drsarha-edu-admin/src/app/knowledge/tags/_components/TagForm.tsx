'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { FunctionReturnType } from 'convex/server';

const formSchema = z.object({
  name: z.string().min(2, 'Минимум 2 символа').max(50, 'Максимум 50 символов'),
});

interface TagFormProps {
  initialData?: FunctionReturnType<
    typeof api.functions.pin_tags.getById
  > | null;
}

export function TagForm({ initialData }: TagFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createTag = useMutation(api.functions.pin_tags.create);
  const updateTag = useMutation(api.functions.pin_tags.update);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? { name: initialData.name }
      : {
          name: '',
        },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({ name: initialData.name });
    }
  }, [form, initialData]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      const promise = initialData?._id
        ? updateTag({ id: initialData._id, name: values.name })
        : createTag({ name: values.name });

      toast.promise(promise, {
        loading: initialData ? 'Сохраняем тег...' : 'Создаём тег...',
        success: initialData ? 'Тег успешно обновлён' : 'Тег успешно создан',
        error: 'Произошла ошибка при сохранении тега',
      });

      await promise;
      router.push('/knowledge/tags');
      router.refresh();
    } catch (error: any) {
      console.error('Error submitting form:', error);
      toast.error('Произошла ошибка при сохранении тега');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Название тега</FormLabel>
              <FormControl>
                <Input
                  placeholder="Введите название тега..."
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? 'Сохранить' : 'Создать'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}>
            Отмена
          </Button>
        </div>
      </form>
    </Form>
  );
}
