"use client";
import { Controller, useFormContext } from "react-hook-form";
import type { RegistrationInput } from "@/lib/schemas";
import { ACTIVITIES, COUNSELLING_MODES, GOALS, HEAR_OPTIONS, JOB_GOAL, careerSuggestions, examsForGrade } from "@/lib/registration";
import { CheckRow, Chips, Field, Select, TextArea, TextInput } from "../ui";

export default function StepGoals() {
  const { register, watch, control, setValue, formState: { errors } } = useFormContext<RegistrationInput>();
  const e = errors as Record<string, { message?: string } | undefined>;
  const goal = watch("goal");
  const grade = watch("grade");
  const undecided = watch("careerUndecided");
  const activities = watch("activities") ?? [];
  const wantJob = goal === JOB_GOAL;

  return (
    <div>
      <Field label="Primary goal" required error={e.goal?.message}>
        <Select {...register("goal")}>
          <option value="">Select…</option>
          {GOALS.map((g) => <option key={g}>{g}</option>)}
        </Select>
      </Field>
      {goal === "Other" && (
        <Field label="Describe your goal" required error={e.goalOther?.message}>
          <TextInput placeholder="In your own words" {...register("goalOther")} />
        </Field>
      )}

      {wantJob && (
        <div className="mb-4 rounded-xl border border-brand-100 bg-brand-50 p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Current status" required error={e.jobStatus?.message}>
              <Select {...register("jobStatus")}>
                <option value="">Select…</option>
                <option>Actively looking</option><option>Open to offers</option>
              </Select>
            </Field>
            <Field label="Job type" required error={e.jobType?.message}>
              <Select {...register("jobType")}>
                <option value="">Select…</option>
                <option>Full-time</option><option>Part-time</option><option>Internship</option>
              </Select>
            </Field>
          </div>
          <Field label="Field / Role" required error={e.jobField?.message}>
            <TextInput placeholder="e.g. Software Engineer" {...register("jobField")} />
          </Field>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Counselling mode" required error={e.counsellingMode?.message}>
          <Select {...register("counsellingMode")}>
            <option value="">Select…</option>
            {COUNSELLING_MODES.map((m) => <option key={m}>{m}</option>)}
          </Select>
        </Field>
        <Field label="Exams" hint={grade ? (["UNDERGRADUATE", "GRADUATE"].includes(grade) ? "PG / entrance exams" : "School / competitive exams") : undefined}>
          <Controller control={control} name="exams" render={({ field }) => (
            <Chips options={examsForGrade(grade)} value={field.value ?? []} onChange={field.onChange} />
          )} />
        </Field>
      </div>

      <div className="mb-4"><CheckRow label="Opt-in for free mock tests" {...register("mockTestsOptIn")} /></div>

      <Field label="Career interest" required error={e.careerInterest?.message} hint="Type to search suggestions, or tick undecided.">
        <TextInput list="career-list" placeholder="e.g. Data & AI" disabled={!!undecided} {...register("careerInterest")} />
        <datalist id="career-list">{careerSuggestions(grade).map((c) => <option key={c} value={c} />)}</datalist>
        <div className="mt-2">
          <CheckRow label="I haven't decided" checked={!!undecided}
            onChange={(ev) => { setValue("careerUndecided", ev.target.checked); if (ev.target.checked) setValue("careerInterest", null); }} />
        </div>
      </Field>

      <Field label="Activities you enjoy" required error={e.activities?.message}>
        <Controller control={control} name="activities" render={({ field }) => (
          <Chips options={[...ACTIVITIES]} value={field.value ?? []} onChange={field.onChange} />
        )} />
        {activities.includes("Other") && (
          <TextInput placeholder="Describe your other activity" {...register("activityOther")} className="mt-2" />
        )}
        {e.activityOther?.message && <p className="mt-1 text-xs text-red-600" role="alert">{e.activityOther.message}</p>}
      </Field>

      <Field label="Anything else about your future? (optional)">
        <TextArea rows={2} maxLength={500} placeholder="Optional note for your counsellor" {...register("futureNote")} />
      </Field>
      <Field label="How did you hear about us?" required error={e.hearAbout?.message}>
        <Select {...register("hearAbout")}>
          <option value="">Select…</option>
          {HEAR_OPTIONS.map((h) => <option key={h}>{h}</option>)}
        </Select>
      </Field>
    </div>
  );
}
