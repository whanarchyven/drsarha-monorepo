'use client';

import type React from 'react';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AnalyticsQuestionFormData } from '@/shared/types/analytics';

interface InsightQuestionFormProps {
  initialData?: AnalyticsQuestionFormData;
  onSubmit: (data: AnalyticsQuestionFormData) => Promise<void>;
  onCancel: () => void;
}

export function InsightQuestionForm({
  initialData,
  onSubmit,
  onCancel,
}: InsightQuestionFormProps) {
  const [formData, setFormData] = useState<AnalyticsQuestionFormData>({
    text: initialData?.text ?? '',
    type: initialData?.type ?? 'text',
    variants: initialData?.variants ?? [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      text: formData.text.trim(),
      type: formData.type,
      variants: formData.variants
        .map((variant) => variant.trim())
        .filter(Boolean),
    });
  };

  const handleAddOption = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [...(prev.variants || []), ''],
    }));
  };

  const handleOptionChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((opt, i) =>
        i === index ? value : opt
      ),
    }));
  };

  const handleRemoveOption = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="question-text">Текст вопроса</Label>
          <Textarea
            id="question-text"
            value={formData.text}
            onChange={(e) =>
              setFormData({ ...formData, text: e.target.value })
            }
            rows={3}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="response-type">Тип вопроса</Label>
          <Select
            value={formData.type}
            onValueChange={(value: 'numeric' | 'text') =>
              setFormData({
                ...formData,
                type: value,
                variants: value === 'text' ? formData.variants : [],
              })
            }>
            <SelectTrigger id="response-type">
              <SelectValue placeholder="Выберите тип вопроса" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="numeric">Числовой</SelectItem>
              <SelectItem value="text">Текстовый / с вариантами</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.type === 'text' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Варианты ответов</Label>
              <Button
                type="button"
                onClick={handleAddOption}
                size="sm"
                variant="outline">
                <Plus className="h-4 w-4 mr-1" /> Добавить вариант
              </Button>
            </div>

            {formData.variants.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Можно оставить список пустым или добавить варианты ответа.
              </p>
            )}

            {formData.variants.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Вариант ${index + 1}`}
                  className="flex-1"
                  required
                />
                <Button
                  type="button"
                  onClick={() => handleRemoveOption(index)}
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Удалить вариант</span>
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" onClick={onCancel} variant="outline">
            Отмена
          </Button>
          <Button type="submit">Сохранить</Button>
        </div>
      </form>
    </div>
  );
}
