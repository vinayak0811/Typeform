import {
  Type,
  AlignLeft,
  ListChecks,
  Mail,
  ChevronDownSquare,
  Hash,
  ToggleLeft,
  Star,
} from "lucide-react";
import type { QuestionType } from "@/types";

export interface QuestionTypeMeta {
  type: QuestionType;
  label: string;
  shortLabel: string;
  description: string;
  icon: typeof Type;
  hasChoices: boolean;
  defaultSettings: Record<string, unknown>;
}

export const QUESTION_TYPES: QuestionTypeMeta[] = [
  {
    type: "short_text",
    label: "Short Text",
    shortLabel: "Text",
    description: "A single line of text",
    icon: Type,
    hasChoices: false,
    defaultSettings: { placeholder: "Type your answer here..." },
  },
  {
    type: "long_text",
    label: "Long Text",
    shortLabel: "Paragraph",
    description: "A multi-line paragraph",
    icon: AlignLeft,
    hasChoices: false,
    defaultSettings: { placeholder: "Type your answer here..." },
  },
  {
    type: "email",
    label: "Email",
    shortLabel: "Email",
    description: "Validated email address",
    icon: Mail,
    hasChoices: false,
    defaultSettings: { placeholder: "name@example.com" },
  },
  {
    type: "multiple_choice",
    label: "Multiple Choice",
    shortLabel: "Choice",
    description: "Pick one option from a list",
    icon: ListChecks,
    hasChoices: true,
    defaultSettings: {},
  },
  {
    type: "dropdown",
    label: "Dropdown",
    shortLabel: "Dropdown",
    description: "Pick one option from a dropdown",
    icon: ChevronDownSquare,
    hasChoices: true,
    defaultSettings: {},
  },
  {
    type: "number",
    label: "Number",
    shortLabel: "Number",
    description: "A single numeric value",
    icon: Hash,
    hasChoices: false,
    defaultSettings: { placeholder: "0" },
  },
  {
    type: "yes_no",
    label: "Yes / No",
    shortLabel: "Yes/No",
    description: "A simple yes or no",
    icon: ToggleLeft,
    hasChoices: false,
    defaultSettings: {},
  },
  {
    type: "rating",
    label: "Rating",
    shortLabel: "Rating",
    description: "A star rating scale",
    icon: Star,
    hasChoices: false,
    defaultSettings: { max_rating: 5 },
  },
];

export const QUESTION_TYPE_MAP: Record<QuestionType, QuestionTypeMeta> = Object.fromEntries(
  QUESTION_TYPES.map((meta) => [meta.type, meta])
) as Record<QuestionType, QuestionTypeMeta>;

export function getQuestionTypeMeta(type: QuestionType): QuestionTypeMeta {
  return QUESTION_TYPE_MAP[type];
}
