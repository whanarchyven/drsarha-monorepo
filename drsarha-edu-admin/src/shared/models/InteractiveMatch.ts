import type { FeedBackQuestions } from './types/FeedBackQuestions.ts';

export interface InteractiveMatch {
  _id?: string;
  name: string;
  cover_image: string;
  answers: string[];
  available_errors: number;
  feedback: FeedBackQuestions;
  nozology: string;
  stars: number;
  publishAfter?: string | null;
}
