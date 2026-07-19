import { describe, it, expect } from "vitest";
import { validateAnswer } from "@/features/public-form/validation";
import type { Question } from "@/types";

function makeQuestion(overrides: Partial<Question>): Question {
  return {
    id: "q1",
    form_id: "f1",
    type: "short_text",
    title: "Test question",
    description: "",
    required: false,
    order: 0,
    settings: {},
    choices: [],
    ...overrides,
  };
}

describe("validateAnswer", () => {
  it("requires a value when required is true", () => {
    const q = makeQuestion({ required: true });
    expect(validateAnswer(q, undefined)).toMatch(/required/i);
  });

  it("allows empty value when not required", () => {
    const q = makeQuestion({ required: false });
    expect(validateAnswer(q, undefined)).toBeNull();
  });

  it("validates email format", () => {
    const q = makeQuestion({ type: "email", required: true });
    expect(validateAnswer(q, { value_text: "not-an-email" })).toMatch(/valid email/i);
    expect(validateAnswer(q, { value_text: "a@b.com" })).toBeNull();
  });

  it("validates rating is within range", () => {
    const q = makeQuestion({ type: "rating", required: true, settings: { max_rating: 5 } });
    expect(validateAnswer(q, { value_number: 6 })).toMatch(/between 1 and 5/);
    expect(validateAnswer(q, { value_number: 3 })).toBeNull();
  });

  it("validates multiple choice selection belongs to the question", () => {
    const q = makeQuestion({
      type: "multiple_choice",
      required: true,
      choices: [{ id: "c1", label: "A", order: 0 }],
    });
    expect(validateAnswer(q, { choice_id: "invalid" })).toMatch(/valid option/i);
    expect(validateAnswer(q, { choice_id: "c1" })).toBeNull();
  });
});
