import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuestionField } from "@/features/public-form/question-field";
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

describe("QuestionField", () => {
  it("renders a text input for short_text", () => {
    render(
      <QuestionField question={makeQuestion({ type: "short_text" })} value={undefined} onChange={vi.fn()} onSubmitEnter={vi.fn()} />
    );
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("calls onChange when typing", () => {
    const onChange = vi.fn();
    render(
      <QuestionField question={makeQuestion({ type: "short_text" })} value={undefined} onChange={onChange} onSubmitEnter={vi.fn()} />
    );
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "hello" } });
    expect(onChange).toHaveBeenCalledWith({ value_text: "hello" });
  });

  it("renders multiple choice options as buttons", () => {
    const question = makeQuestion({
      type: "multiple_choice",
      choices: [
        { id: "c1", label: "Option A", order: 0 },
        { id: "c2", label: "Option B", order: 1 },
      ],
    });
    render(<QuestionField question={question} value={undefined} onChange={vi.fn()} onSubmitEnter={vi.fn()} />);
    expect(screen.getByText("Option A")).toBeInTheDocument();
    expect(screen.getByText("Option B")).toBeInTheDocument();
  });

  it("selects a choice on click", () => {
    const onChange = vi.fn();
    const question = makeQuestion({
      type: "multiple_choice",
      choices: [{ id: "c1", label: "Option A", order: 0 }],
    });
    render(<QuestionField question={question} value={undefined} onChange={onChange} onSubmitEnter={vi.fn()} />);
    fireEvent.click(screen.getByText("Option A"));
    expect(onChange).toHaveBeenCalledWith({ choice_id: "c1" });
  });

  it("renders star buttons for rating", () => {
    const question = makeQuestion({ type: "rating", settings: { max_rating: 5 } });
    render(<QuestionField question={question} value={undefined} onChange={vi.fn()} onSubmitEnter={vi.fn()} />);
    expect(screen.getAllByRole("button")).toHaveLength(5);
  });

  it("triggers onSubmitEnter when Enter is pressed in short_text", () => {
    const onSubmitEnter = vi.fn();
    render(
      <QuestionField
        question={makeQuestion({ type: "short_text" })}
        value={undefined}
        onChange={vi.fn()}
        onSubmitEnter={onSubmitEnter}
      />
    );
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(onSubmitEnter).toHaveBeenCalled();
  });
});
