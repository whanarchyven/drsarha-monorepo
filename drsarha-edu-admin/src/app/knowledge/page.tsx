import Link from 'next/link';

export default function KnowledgePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">База знаний</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/knowledge/categories"
          className="p-6 border col-span-2 bg-black text-white rounded-lg hover:border-white transition-colors">
          <h2 className="text-xl font-semibold mb-2">Категории</h2>
          <p className="text-muted-foreground">Управление категориями</p>
        </Link>

        <Link
          href="/knowledge/nozologies"
          className="p-6 border col-span-2 bg-black text-white rounded-lg hover:border-white transition-colors">
          <h2 className="text-xl font-semibold mb-2">Нозологии</h2>
          <p className="text-muted-foreground">Управление нозологиями</p>
        </Link>

        <Link
          href="/knowledge/brochures"
          className="p-6 border rounded-lg hover:border-primary transition-colors">
          <h2 className="text-xl font-semibold mb-2">Брошюры</h2>
          <p className="text-muted-foreground">
            Управление информационными брошюрами
          </p>
        </Link>

        <Link
          href="/knowledge/lections"
          className="p-6 border rounded-lg hover:border-primary transition-colors">
          <h2 className="text-xl font-semibold mb-2">Лекции</h2>
          <p className="text-muted-foreground">
            Управление обучающими лекциями
          </p>
        </Link>

        <Link
          href="/knowledge/clinic-tasks"
          className="p-6 border rounded-lg hover:border-primary transition-colors">
          <h2 className="text-xl font-semibold mb-2">Клинические задачи</h2>
          <p className="text-muted-foreground">
            Управление клиническими задачами
          </p>
        </Link>

        <Link
          href="/knowledge/clinic-atlases"
          className="p-6 border rounded-lg hover:border-primary transition-colors">
          <h2 className="text-xl font-semibold mb-2">Клинические атласы</h2>
          <p className="text-muted-foreground">
            Управление клиническими атласами
          </p>
        </Link>

        <Link
          href="/knowledge/interactive-tasks"
          className="p-6 border rounded-lg hover:border-primary transition-colors">
          <h2 className="text-xl font-semibold mb-2">Интерактивные задачи</h2>
          <p className="text-muted-foreground">
            Управление интерактивными заданиями
          </p>
        </Link>

        <Link
          href="/knowledge/markup-tasks"
          className="p-6 border rounded-lg hover:border-primary transition-colors">
          <h2 className="text-xl font-semibold mb-2">Задачи на разметку</h2>
          <p className="text-muted-foreground">
            Управление задачами с разметкой элементов на слайдах
          </p>
        </Link>

        <Link
          href="/knowledge/interactive-quizzes"
          className="p-6 border rounded-lg hover:border-primary transition-colors">
          <h2 className="text-xl font-semibold mb-2">Интерактивные квизы</h2>
          <p className="text-muted-foreground">
            Управление интерактивными квизами
          </p>
        </Link>

        <Link
          href="/knowledge/interactive-matches"
          className="p-6 border rounded-lg hover:border-primary transition-colors">
          <h2 className="text-xl font-semibold mb-2">
            Интерактивные соединения
          </h2>
          <p className="text-muted-foreground">
            Управление интерактивными соединениями
          </p>
        </Link>

        <Link
          href="/knowledge/tags"
          className="p-6 border rounded-lg hover:border-primary transition-colors">
          <h2 className="text-xl font-semibold mb-2">Теги</h2>
          <p className="text-muted-foreground">
            Управление тегами клинического атласа
          </p>
        </Link>

        <Link
          href="/knowledge/prizes"
          className="p-6 border rounded-lg hover:border-primary transition-colors">
          <h2 className="text-xl font-semibold mb-2">Призы</h2>
          <p className="text-muted-foreground">
            Управление наградами и призами
          </p>
        </Link>

        <Link
          href="/knowledge/lootboxes"
          className="p-6 border rounded-lg hover:border-primary transition-colors">
          <h2 className="text-xl font-semibold mb-2">Лутбоксы</h2>
          <p className="text-muted-foreground">
            Управление лутбоксами (награды, бонусы)
          </p>
        </Link>

        <Link
          href="/knowledge/task-groups"
          className="p-6 border rounded-lg hover:border-primary transition-colors">
          <h2 className="text-xl font-semibold mb-2">Группы заданий</h2>
          <p className="text-muted-foreground">
            Управление группами заданий и заданиями
          </p>
        </Link>
      </div>
    </div>
  );
}
