import { TagForm } from '../_components/TagForm';

export default function CreateTagPage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Создание тега</h1>
      <TagForm />
    </div>
  );
}
