'use client';

import { LectionForm } from '../_components/LectionForm';

export default function CreateLectionPage() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Создание лекции</h1>
      <LectionForm />
    </div>
  );
}
