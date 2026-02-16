export const translateKnowledgeType = (type: string) => {
  const translations = new Map<string, string>([
    ['clinic_task', 'Клиническая задача'],
    ['clinic_atlas', 'Клинический атлас'],
    ['interactive_task', 'Интерактивная задача'],
    ['brochure', 'Брошюра'],
    ['lection', 'Лекция'],
  ]);
  return translations.get(type);
};

export const translateKnowledgeTypeToSlug = (type: string) => {
  const translations = new Map<string, string>([
    ['clinic_task', 'clinic-tasks'],
    ['clinic_atlas', 'clinic-atlases'],
    ['interactive_task', 'interactive-tasks'],
    ['interactive_quiz', 'interactive-quizzes'],
    ['interactive_match', 'interactive-matches'],
    ['brochure', 'brochures'],
    ['lection', 'lections'],
  ]);
  return translations.get(type);
};
