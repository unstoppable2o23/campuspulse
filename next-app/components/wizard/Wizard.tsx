"use client";
import { useMemo, useRef, useState } from "react";
import { FormProvider, useForm, type FieldErrors, type Resolver } from "react-hook-form";
import { useRouter } from "next/navigation";
import { z } from "zod";
import {
  aboutSchema, abroadSchema, educationSchema, firstError, goalsSchema,
  registrationSchema, type RegistrationInput,
} from "@/lib/schemas";
import { normalizePayload, shouldShowStudyAbroad } from "@/lib/registration";
import { Button, Card, StepIndicator } from "../ui";
import StepAbout from "./StepAbout";
import StepEducation from "./StepEducation";
import StepGoals from "./StepGoals";
import StepAbroad from "./StepAbroad";

const STEP_SCHEMAS = [aboutSchema, educationSchema, goalsSchema, abroadSchema] as const;

const FIELD_STEP: Record<string, number> = {
  fullName: 0, email: 0, phone: 0, phoneCountryCode: 0, dob: 0, nationalityCode: 0, gender: 0,
  password: 0, confirmPassword: 0, consent: 0,
  grade: 1, stream: 1, school: 1, board: 1, boardOther: 1, degree: 1, fieldOfStudy: 1,
  stateCode: 1, stateText: 1, districtCode: 1, districtText: 1, city: 1,
  subjects: 1, enjoySubjects: 1, employmentStatus: 1, workplace: 1, workField: 1,
  goal: 2, goalOther: 2, jobStatus: 2, jobField: 2, jobType: 2, counsellingMode: 2,
  exams: 2, mockTestsOptIn: 2, careerInterest: 2, careerUndecided: 2, activities: 2,
  activityOther: 2, futureNote: 2, hearAbout: 2,
  abroadPlan: 3, countries: 3, countryOther: 3, universities: 3, budget: 3, funds: 3,
  englishNeeded: 3, engType: 3, engScore: 3, engNotTaken: 3, intake: 3, startYear: 3,
};

const DEFAULTS: RegistrationInput = {
  fullName: "", email: "", phoneCountryCode: "IN", phone: "", dob: "",
  nationalityCode: "IN", gender: "" as unknown as RegistrationInput["gender"],
  password: "", confirmPassword: "", consent: false as unknown as true,
  grade: "" as unknown as RegistrationInput["grade"],
  stream: null, school: null, board: null, boardOther: null, degree: null, fieldOfStudy: null,
  stateCode: null, stateText: null, districtCode: null, districtText: null, city: null,
  subjects: [], enjoySubjects: [], employmentStatus: null, workplace: null, workField: null,
  goal: "" as unknown as RegistrationInput["goal"], goalOther: null,
  jobStatus: null, jobField: null, jobType: null,
  counsellingMode: "" as unknown as RegistrationInput["counsellingMode"],
  exams: [], mockTestsOptIn: false, careerInterest: null, careerUndecided: false,
  activities: [], activityOther: null, futureNote: null,
  hearAbout: "" as unknown as RegistrationInput["hearAbout"],
  abroadPlan: "No", countries: [], countryOther: null, universities: [],
  budget: null, funds: null, englishNeeded: "No",
  engType: null, engScore: null, engNotTaken: false, intake: null, startYear: null,
};

/** Live per-step resolver: validates only the visible step so errors appear
 *  and clear as the user types (manual setError errors never clear on edit). */
function stepResolver(stepRef: React.MutableRefObject<number>): Resolver<RegistrationInput> {
  return async (values) => {
    const parsed = STEP_SCHEMAS[stepRef.current].safeParse(values);
    if (parsed.success) return { values, errors: {} };
    const errors: Record<string, { type: string; message: string }> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "");
      if (key && !errors[key]) errors[key] = { type: issue.code, message: issue.message };
    }
    return { values: {}, errors: errors as unknown as FieldErrors<RegistrationInput> };
  };
}

export default function Wizard() {
  const router = useRouter();
  const stepRef = useRef(0);
  const methods = useForm<RegistrationInput>({
    defaultValues: DEFAULTS, mode: "onTouched", resolver: stepResolver(stepRef),
  });
  const { getValues, setError, clearErrors, trigger } = methods;
  const grade = methods.watch("grade");
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const submitGuard = useRef(false);

  const steps = useMemo(
    () => ["About you", "Education", "Goals", ...(shouldShowStudyAbroad(grade) ? ["Study abroad"] : [])],
    [grade]
  );
  const activeStep = Math.min(step, steps.length - 1);
  stepRef.current = activeStep;
  const last = activeStep === steps.length - 1;

  function applyIssues(error: z.ZodError): number {
    let jump = activeStep;
    for (const issue of error.issues) {
      const name = String(issue.path[0] ?? "");
      if (!name) continue;
      setError(name as never, { type: "manual", message: issue.message });
      const s = FIELD_STEP[name];
      if (s !== undefined && s < jump) jump = s;
    }
    return jump;
  }

  async function next() {
    setServerError(null);
    const ok = await trigger();
    if (!ok) return;
    setStep(activeStep + 1);
    window.scrollTo({ top: 0 });
  }

  function back() {
    clearErrors();
    setServerError(null);
    setStep(Math.max(0, activeStep - 1));
    window.scrollTo({ top: 0 });
  }

  async function submit() {
    if (submitGuard.current || submitting) return;
    clearErrors();
    setServerError(null);
    const normalized = normalizePayload({ ...getValues() });
    // Fold a typed "other" country into the multi-select.
    if (normalized.countryOther?.trim()) {
      normalized.countries = [...normalized.countries, normalized.countryOther.trim()];
      normalized.countryOther = null;
    }
    const parsed = registrationSchema.safeParse(normalized);
    if (!parsed.success) { setStep(applyIssues(parsed.error)); window.scrollTo({ top: 0 }); return; }
    submitGuard.current = true;
    setSubmitting(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (json.field) { setStep(FIELD_STEP[json.field] ?? activeStep); setError(json.field, { type: "manual", message: json.error ?? "Invalid value." }); }
        else setServerError(json.error ?? "Registration failed. Please try again.");
        return;
      }
      router.push("/dashboard");
    } catch {
      setServerError("Network error. Check your connection and try again.");
    } finally {
      setSubmitting(false);
      submitGuard.current = false;
    }
  }

  return (
    <FormProvider {...methods}>
      <Card>
        <StepIndicator steps={steps} current={activeStep} />
        {serverError && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{serverError}</p>}
        {activeStep === 0 && <StepAbout />}
        {activeStep === 1 && <StepEducation />}
        {activeStep === 2 && <StepGoals />}
        {activeStep === 3 && <StepAbroad />}
        <div className="mt-6 flex items-center justify-between">
          {activeStep > 0
            ? <Button variant="secondary" onClick={back}>Back</Button>
            : <span />}
          {!last
            ? <Button onClick={next}>Continue →</Button>
            : <Button type="submit" disabled={submitting} onClick={submit}>{submitting ? "Creating your profile…" : "Create my profile"}</Button>}
        </div>
      </Card>
    </FormProvider>
  );
}
