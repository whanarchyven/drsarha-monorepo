'use client';

import { MarkupTaskForm } from '../_components/MarkupTaskForm';

export default function CreateMarkupTaskPage() {
  return (
    <div className="mx-auto max-w-6xl py-8">
      <h1 className="mb-8 text-2xl font-bold">Создание задачи на разметку</h1>
      <MarkupTaskForm />
    </div>
  );
}
