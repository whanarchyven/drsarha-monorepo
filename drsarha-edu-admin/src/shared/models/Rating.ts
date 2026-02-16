export interface Rating {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  email: string;
  phone: string;
  password?: string; // Не должно возвращаться в API
  subscribeTill: string;
  tariff: string;
  birthDate?: string;
  gender?: string;
  name?: string;
  fullName?: string;
  address_pool?: string[];
  is_banned?: boolean;
  plan?: string;
  avatar?: string | null;
  stars?: number;
  isPediatric?: boolean;
  isScientific?: boolean;
  privateClinic?: boolean;
  city?: string;
  workplace?: string;
  position?: string;
  diploma?: string;
  specialization?: string;
  telegram?: string;
  isApproved?: boolean;
  resetCode?: string;
  resetCodeExpires?: string;
}

export interface UserCompletions {
  completed: number;
  uncompleted: number;
}

export interface UserWithStats {
  user: User;
  userCompletions: UserCompletions;
}

export interface RatingPaginatedResponse {
  items: UserWithStats[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface RatingDetails {
  user: User;
  fullCompletions: FullCompletion[];
}

// Интерфейсы для структуры завершенных заданий
export interface FullCompletion {
  completion: Completion;
  knowledge: Knowledge;
}

export interface Completion {
  _id: string;
  user_id: string;
  knowledge_id: string;
  type:
    | 'lection'
    | 'clinic_task'
    | 'interactive_task'
    | 'interactive_match'
    | 'interactive_quiz';
  created_at: string;
  updated_at: string;
  is_completed: boolean;
  completed_at: string | null;
  metadata: CompletionMetadata | CompletionMetadata[] | null;
  feedback: Feedback[];
}

export interface Knowledge {
  name?: string;
  stars?: number;
  type: string;
  _id: string;
}

// Метаданные для разных типов заданий
export type CompletionMetadata =
  | LectionMetadata
  | ClinicTaskMetadata
  | InteractiveTaskMetadata;

// Метаданные для лекций
export interface LectionMetadata {
  active_time: number;
  notes: Note[];
}

export interface Note {
  time: number;
  note: string;
}

// Метаданные для клинических задач
export interface ClinicTaskMetadata {
  attempt: ClinicTaskAttempt;
  dialogue: any[]; // Может быть массив диалогов, но в примере пустой
  created_at: string;
}

export interface ClinicTaskAttempt {
  diagnosis: string;
  treatment: string;
  is_correct: boolean;
}

// Метаданные для интерактивных заданий
export interface InteractiveTaskMetadata {
  attempt: InteractiveTaskAttempt;
  dialogue: any; // null в примере
  created_at: string;
}

export interface InteractiveTaskAttempt {
  answers: InteractiveAnswer[];
  is_correct: boolean;
}

export interface InteractiveAnswer {
  image: string;
  answer: string;
  is_correct: boolean;
}

// Структура обратной связи
export interface Feedback {
  feedback: FeedbackQuestion[];
  created_at: string;
}

export interface FeedbackQuestion {
  question: string;
  has_correct: boolean;
  answers: FeedbackAnswer[];
  user_answers: string | string[];
  analytic_questions?: string[];
}

export interface FeedbackAnswer {
  answer: string;
  is_correct: boolean;
}
