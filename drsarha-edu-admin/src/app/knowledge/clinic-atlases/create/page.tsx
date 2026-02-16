'use client';

import { ClinicAtlasForm } from '../_components/ClinicAtlasForm';

export default function CreateClinicAtlasPage() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Создание клинического атласа</h1>
      <ClinicAtlasForm />
    </div>
  );
}
