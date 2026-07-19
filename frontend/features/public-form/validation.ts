import { z } from "zod";
import type { Question } from "@/types";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * Builds a client-side validator for a single question's current value.
 * Mirrors app/services/validation_service.py on the backend so users see
 * the same error before ever hitting the network.
 */
export function validateAnswer(
  question: Question,
  value: { value_text?: string | null; value_number?: number | null; choice_id?: string | null } | undefined
): string | null {
  const isEmpty =
    !value ||
    ((value.value_text === undefined || value.value_text === null || value.value_text === "") &&
      value.value_number === undefined &&
      value.value_number === null &&
      !value.choice_id);

  if (question.required && isEmpty) {
    return "This question is required.";
  }
  if (isEmpty) return null;

  switch (question.type) {
    case "email":
      if (!value?.value_text || !EMAIL_RE.test(value.value_text)) {
        return "Please enter a valid email address.";
      }
      return null;
    case "multiple_choice":
    case "dropdown": {
      const validIds = new Set(question.choices.map((c) => c.id));
      if (!value?.choice_id || !validIds.has(value.choice_id)) {
        return "Please select a valid option.";
      }
      return null;
    }
    case "yes_no":
      if (value?.value_text !== "yes" && value?.value_text !== "no") {
        return "Please select yes or no.";
      }
      return null;
    case "number":
      if (value?.value_number === undefined || value?.value_number === null || Number.isNaN(value.value_number)) {
        return "Please enter a number.";
      }
      return null;
    case "rating": {
      const max = (question.settings?.max_rating as number) || 5;
      if (
        value?.value_number === undefined ||
        value?.value_number === null ||
        value.value_number < 1 ||
        value.value_number > max
      ) {
        return `Please select a rating between 1 and ${max}.`;
      }
      return null;
    }
    case "short_text":
    case "long_text":
      if (!value?.value_text || !value.value_text.trim()) {
        return "This field cannot be empty.";
      }
      return null;
    default:
      return null;
  }
}

// A generic zod string schema kept for form-level metadata edits (title/description) in the builder.
export const questionMetaSchema = z.object({
  title: z.string().max(500),
  description: z.string().max(1000).optional(),
  required: z.boolean(),
});
