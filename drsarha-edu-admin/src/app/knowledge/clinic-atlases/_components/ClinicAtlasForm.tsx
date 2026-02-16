'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { clinicAtlasesApi } from '@/shared/api/clinic-atlases';
import type { ClinicAtlas } from '@/shared/models/ClinicAtlas';
import { Badge } from '@/components/ui/badge';
import { X, Upload } from 'lucide-react';
import Image from 'next/image';
import { getContentUrl } from '@/shared/utils/url';

const formSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  description: z.string().min(1, 'Описание обязательно'),
  coverImage: z.string().optional(),
  images: z
    .array(
      z.object({
        title: z.string().min(1, 'Заголовок изображения обязателен'),
        image: z.string().min(1, 'Изображение обязательно'),
        description: z.string().min(1, 'Описание изображения обязательно'),
      })
    )
    .default([]),
  tags: z.array(z.string()).default([]),
});

interface ClinicAtlasFormProps {
  initialData?: ClinicAtlas;
}

const FormFields = ({
  form,
  coverPreviewUrl,
  previewUrls,
  handleCoverImageSelect,
  handleImageSelect,
  handleRemoveImage,
  updateImageData,
}: {
  form: any;
  coverPreviewUrl: string;
  previewUrls: { title: string; image: string; description: string }[];
  handleCoverImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveImage: (index: number) => void;
  updateImageData: (
    index: number,
    field: 'title' | 'description',
    value: string
  ) => void;
}) => {
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    if (newTag.trim()) {
      const currentTags = form.getValues('tags');
      if (!currentTags.includes(newTag.trim())) {
        form.setValue('tags', [...currentTags, newTag.trim()]);
      }
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = form.getValues('tags');
    form.setValue(
      'tags',
      currentTags.filter((tag: string) => tag !== tagToRemove)
    );
  };

  return (
    <>
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

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Описание</FormLabel>
            <FormControl>
              <Textarea {...field} placeholder="Введите описание" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="coverImage"
        render={() => (
          <FormItem>
            <FormLabel>Обложка</FormLabel>
            <FormControl>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageSelect}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Загрузить обложку
                  </Button>
                </div>
                {coverPreviewUrl && (
                  <div className="relative aspect-[16/9] max-w-sm">
                    <Image
                      src={
                        coverPreviewUrl.startsWith('data:')
                          ? coverPreviewUrl
                          : getContentUrl(coverPreviewUrl)
                      }
                      alt="Cover preview"
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="tags"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Теги</FormLabel>
            <FormControl>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Введите тег"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddTag}>
                    Добавить
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {field.value.map((tag: string, index: number) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1">
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => handleRemoveTag(tag)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="images"
        render={() => (
          <FormItem>
            <FormLabel>Изображения</FormLabel>
            <FormControl>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Загрузить
                  </Button>
                </div>
                <div className="space-y-4">
                  {previewUrls.map((imageData, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 space-y-4">
                      <div className="relative aspect-[16/9] group">
                        <Image
                          src={
                            imageData.image.startsWith('data:')
                              ? imageData.image
                              : getContentUrl(imageData.image)
                          }
                          alt={`Image ${index + 1}`}
                          fill
                          className="object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveImage(index)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Input
                          placeholder="Заголовок изображения *"
                          value={imageData.title}
                          onChange={(e) =>
                            updateImageData(index, 'title', e.target.value)
                          }
                          required
                        />
                        <Textarea
                          placeholder="Описание изображения *"
                          value={imageData.description}
                          onChange={(e) =>
                            updateImageData(
                              index,
                              'description',
                              e.target.value
                            )
                          }
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export function ClinicAtlasForm({ initialData }: ClinicAtlasFormProps) {
  const router = useRouter();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const [previewUrls, setPreviewUrls] = useState<
    { title: string; image: string; description: string }[]
  >(initialData?.images || []);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string>(
    initialData?.coverImage || ''
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      coverImage: initialData?.coverImage || '',
      images: initialData?.images || [],
      tags: initialData?.tags || [],
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Валидация изображений
      for (let i = 0; i < selectedFiles.length; i++) {
        const imageData = previewUrls[i];
        if (
          !imageData ||
          !imageData.title.trim() ||
          !imageData.description.trim()
        ) {
          alert(
            `Пожалуйста, заполните заголовок и описание для изображения ${i + 1}`
          );
          return;
        }
      }

      const formData = new FormData();

      // Базовые поля
      formData.append('name', values.name);
      formData.append('description', values.description);

      // Добавляем теги по одному
      values.tags.forEach((tag) => {
        formData.append('tags', tag);
      });

      // Добавляем обложку если выбрана
      if (selectedCoverFile) {
        formData.append('coverImage', selectedCoverFile);
      }

      // Добавляем изображения с метаданными
      selectedFiles.forEach((file, index) => {
        const imageData = previewUrls[index];
        if (imageData && imageData.title && imageData.description) {
          formData.append(`images[${index}][title]`, imageData.title);
          formData.append(`images[${index}][image]`, file);
          formData.append(
            `images[${index}][description]`,
            imageData.description
          );
        }
      });

      if (initialData?._id) {
        await clinicAtlasesApi.update(initialData._id.toString(), formData);
      } else {
        await clinicAtlasesApi.create(formData);
      }

      router.push('/knowledge/clinic-atlases');
      router.refresh();
    } catch (error: any) {
      console.error('Error saving clinic atlas:', error);
      alert(error.message || 'Произошла ошибка при сохранении атласа');
    }
  };

  const handleCoverImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedCoverFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    setSelectedFiles([...selectedFiles, ...newFiles]);

    // Создаем превью для новых файлов
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls((prev) => [
          ...prev,
          {
            title: '',
            image: reader.result as string,
            description: '',
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    setPreviewUrls(previewUrls.filter((_, i) => i !== index));
  };

  const updateImageData = (
    index: number,
    field: 'title' | 'description',
    value: string
  ) => {
    setPreviewUrls((prev) =>
      prev.map((img, i) => (i === index ? { ...img, [field]: value } : img))
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="p-6 space-y-6">
          <FormFields
            form={form}
            coverPreviewUrl={coverPreviewUrl}
            previewUrls={previewUrls}
            handleCoverImageSelect={handleCoverImageSelect}
            handleImageSelect={handleImageSelect}
            handleRemoveImage={handleRemoveImage}
            updateImageData={updateImageData}
          />
        </Card>

        <div className="flex gap-4">
          <Button type="submit">
            {initialData ? 'Сохранить изменения' : 'Создать клинический атлас'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Отмена
          </Button>
        </div>
      </form>
    </Form>
  );
}
