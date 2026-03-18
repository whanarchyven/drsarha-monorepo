'use client';

import { ConferenceInteractiveForm } from '../_components/ConferenceInteractiveForm';

export default function CreateConferenceInteractivePage() {
  return (
    <div className="mx-auto max-w-5xl py-8">
      <h1 className="mb-8 text-2xl font-bold">Создание интерактива</h1>
      <ConferenceInteractiveForm />
    </div>
  );
}
