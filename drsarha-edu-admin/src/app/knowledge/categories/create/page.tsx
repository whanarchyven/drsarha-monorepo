import { CategoryForm } from '../_components/CategoryForm';

export default function CreateCategoryPage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Создание категории</h1>
      <CategoryForm />
    </div>
  );
}
