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
  password?: string;
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
}

export type CompletionMetadata =
  | LectionMetadata
  | ClinicTaskMetadata
  | InteractiveTaskMetadata;

export interface LectionMetadata {
  active_time: number;
  notes: Note[];
}

export interface Note {
  time: number;
  note: string;
}

export interface ClinicTaskMetadata {
  attempt: ClinicTaskAttempt;
  dialogue: any[];
  created_at: string;
}

export interface ClinicTaskAttempt {
  diagnosis: string;
  treatment: string;
  is_correct: boolean;
}

export interface InteractiveTaskMetadata {
  attempt: InteractiveTaskAttempt;
  dialogue: any;
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
