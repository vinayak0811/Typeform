export type FormStatus = "draft" | "published";

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}


export type QuestionType =
  | "short_text"
  | "long_text"
  | "multiple_choice"
  | "email"
  | "dropdown"
  | "number"
  | "yes_no"
  | "rating";

export interface Choice {
  id: string;
  question_id?: string;
  label: string;
  order: number;
}

export interface QuestionSettings {
  placeholder?: string;
  max_rating?: number;
  min?: number;
  max?: number;
  [key: string]: unknown;
}

export interface Question {
  id: string;
  form_id: string;
  type: QuestionType;
  title: string;
  description?: string | null;
  required: boolean;
  order: number;
  settings: QuestionSettings;
  choices: Choice[];
}

export interface FormListItem {
  id: string;
  title: string;
  description?: string | null;
  status: FormStatus;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  response_count: number;
  question_count: number;
}

export interface FormDetail {
  id: string;
  title: string;
  description?: string | null;
  status: FormStatus;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  questions: Question[];
}

export interface PublicForm {
  id: string;
  title: string;
  description?: string | null;
  status: FormStatus;
  questions: Question[];
}

export interface AnswerSubmit {
  question_id: string;
  value_text?: string | null;
  value_number?: number | null;
  choice_id?: string | null;
}

export interface AnswerRead {
  id: string;
  question_id: string;
  value_text: string | null;
  value_number: number | null;
  choice_id: string | null;
}

export interface ResponseListItem {
  id: string;
  form_id: string;
  completed: boolean;
  submitted_at: string;
}

export interface ResponseDetail extends ResponseListItem {
  answers: AnswerRead[];
}

export interface PaginatedResponses {
  items: ResponseListItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ChoiceDistributionItem {
  choice_id: string;
  label: string;
  count: number;
  percentage: number;
}

export interface QuestionStat {
  question_id: string;
  title: string;
  type: QuestionType;
  answered_count: number;
  skipped_count: number;
  choice_distribution?: ChoiceDistributionItem[] | null;
  average?: number | null;
  min_value?: number | null;
  max_value?: number | null;
  sample_answers?: string[] | null;
}

export interface FormAnalytics {
  form_id: string;
  total_responses: number;
  completed_responses: number;
  completion_rate: number;
  question_stats: QuestionStat[];
}

export interface ApiValidationError {
  message: string;
  errors: Record<string, string>;
}
