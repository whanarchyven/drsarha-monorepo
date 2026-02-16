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
import { tagsApi } from '@/shared/api/tags';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const formSchema = z.object({
  name: z.string().min(2, 'Минимум 2 символа').max(50, 'Максимум 50 символов'),
});

interface TagFormProps {
  initialData?: {
    _id?: string;
    name: string;
  };
}

export function TagForm({ initialData }: TagFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      if (initialData && initialData._id) {
        await tagsApi.update(initialData._id, { name: values.name });
        toast.success('Тег успешно обновлен');
      } else {
        await tagsApi.create({ name: values.name });
        toast.success('Тег успешно создан');
      }

      router.push('/knowledge/tags');
      router.refresh();
    } catch (error: any) {
      console.error('Error submitting form:', error);
      toast.error(
        error.response?.data?.message || 'Произошла ошибка при сохранении тега'
      );
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
