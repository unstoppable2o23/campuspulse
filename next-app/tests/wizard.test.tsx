// @vitest-environment jsdom
import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FormProvider, useForm, type UseFormReturn } from "react-hook-form";
import StepAbout from "@/components/wizard/StepAbout";
import type { RegistrationInput } from "@/lib/schemas";

let captured: UseFormReturn<RegistrationInput> | null = null;

function Harness() {
  const methods = useForm<RegistrationInput>();
  captured = methods;
  return (
    <FormProvider {...methods}>
      <StepAbout />
    </FormProvider>
  );
}

describe("wizard inputs register with RHF", () => {
  it("tracks a typed full name in form state", () => {
    render(<Harness />);
    const input = screen.getByPlaceholderText("e.g. Aarav Sharma") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "test" } });
    expect(input.value).toBe("test");
    expect(captured?.getValues("fullName")).toBe("test");
  });

  it("tracks password + confirm fields", () => {
    const { container } = render(<Harness />);
    const boxes = container.querySelectorAll('input[type="password"]');
    expect(boxes.length).toBe(2);
    fireEvent.change(boxes[0], { target: { value: "Secret@123" } });
    fireEvent.change(boxes[1], { target: { value: "Secret@123" } });
    expect(captured?.getValues("password")).toBe("Secret@123");
    expect(captured?.getValues("confirmPassword")).toBe("Secret@123");
  });

  it("registers select + checkbox inputs", () => {
    const { container } = render(<Harness />);
    const gender = container.querySelector('select[name="gender"]') as HTMLSelectElement;
    fireEvent.change(gender, { target: { value: "Male" } });
    expect(captured?.getValues("gender")).toBe("Male");
    const consent = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    fireEvent.click(consent);
    expect(captured?.getValues("consent")).toBe(true);
  });
});
