"use client";
import { Controller, useFormContext } from "react-hook-form";
import type { RegistrationInput } from "@/lib/schemas";
import { BOARDS, GRADES, enjoySubjectsForGrade, isHigherGrade, subjectsForStream } from "@/lib/registration";
import { INDIAN_STATES, districtsForState } from "@/data/india";
import { Chips, Field, Select, TextInput } from "../ui";

export default function StepEducation() {
  const { register, watch, control, formState: { errors } } = useFormContext<RegistrationInput>();
  const e = errors as Record<string, { message?: string } | undefined>;
  const grade = watch("grade");
  const stream = watch("stream");
  const board = watch("board");
  const nationality = watch("nationalityCode");
  const stateCode = watch("stateCode");
  const employment = watch("employmentStatus");
  const higher = isHigherGrade(grade);
  const indian = (nationality ?? "IN") === "IN";

  return (
    <div>
      <Field label="Grade" required error={e.grade?.message}>
        <Select {...register("grade")}>
          <option value="">Select…</option>
          {GRADES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
        </Select>
      </Field>

      {grade === "CLASS_11" && (
        <Field label="Stream" required error={e.stream?.message}>
          <Select {...register("stream")}>
            <option value="">Select…</option>
            <option>Science</option><option>Commerce</option>
            <option>Humanities / Arts</option><option>Vocational / Other</option>
          </Select>
        </Field>
      )}

      {!higher && grade && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="School / College" required error={e.school?.message}>
            <TextInput placeholder="Enter name" {...register("school")} />
          </Field>
          <div>
            <Field label="Board" required error={e.board?.message}>
              <Select {...register("board")}>
                <option value="">Select…</option>
                {BOARDS.map((b) => <option key={b}>{b}</option>)}
              </Select>
            </Field>
            {board === "Other" && (
              <Field label="Name your board" required error={e.boardOther?.message}>
                <TextInput placeholder="Board / curriculum" {...register("boardOther")} />
              </Field>
            )}
          </div>
        </div>
      )}

      {grade === "UNDERGRADUATE" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Degree / Course" required error={e.degree?.message}>
            <TextInput placeholder="e.g. B.Tech" {...register("degree")} />
          </Field>
          <Field label="Field of study" required error={e.fieldOfStudy?.message}>
            <TextInput placeholder="e.g. Computer Science" {...register("fieldOfStudy")} />
          </Field>
        </div>
      )}

      {grade && (indian ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="State" required error={e.stateCode?.message}>
            <Select {...register("stateCode")}>
              <option value="">Select…</option>
              {INDIAN_STATES.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
            </Select>
          </Field>
          <Field label="District" required error={e.districtCode?.message} hint="Can't find yours? Choose Other and type it below.">
            <Select {...register("districtCode")}>
              <option value="">Select…</option>
              {districtsForState(stateCode ?? "").map((d) => <option key={d} value={d}>{d}</option>)}
              <option value="OTHER">Other (type below)</option>
            </Select>
            {(stateCode && districtsForState(stateCode).length === 0) || watch("districtCode") === "OTHER" ? (
              <TextInput placeholder="Type your district" {...register("districtText")} className="mt-2" />
            ) : null}
          </Field>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="State / Province" required error={e.stateText?.message}>
            <TextInput placeholder="Enter state / province" {...register("stateText")} />
          </Field>
          <Field label="City" required error={e.city?.message}>
            <TextInput placeholder="Enter city" {...register("city")} />
          </Field>
        </div>
      ))}

      {grade === "CLASS_11" && stream && (
        <Field label="Subjects you're pursuing" required error={e.subjects?.message}>
          <Controller control={control} name="subjects" render={({ field }) => (
            <Chips options={subjectsForStream(stream)} value={field.value ?? []} onChange={field.onChange} />
          )} />
        </Field>
      )}

      {grade && (
        <Field label="Subjects you enjoy" required error={e.enjoySubjects?.message}>
          <Controller control={control} name="enjoySubjects" render={({ field }) => (
            <Chips options={enjoySubjectsForGrade(grade, stream ?? undefined)} value={field.value ?? []} onChange={field.onChange} />
          )} />
        </Field>
      )}

      {grade === "GRADUATE" && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <Field label="Employment status" required error={e.employmentStatus?.message}>
            <Select {...register("employmentStatus")}>
              <option value="">Select…</option>
              <option>Working</option><option>Fresher</option>
            </Select>
          </Field>
          {employment === "Working" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Workplace" required error={e.workplace?.message}>
                <TextInput placeholder="Company name" {...register("workplace")} />
              </Field>
              <Field label="Field / Role" required error={e.workField?.message}>
                <TextInput placeholder="e.g. Data Analyst" {...register("workField")} />
              </Field>
            </div>
          )}
          {employment === "Fresher" && (
            <Field label="Desired field" required error={e.workField?.message}>
              <TextInput placeholder="e.g. Marketing" {...register("workField")} />
            </Field>
          )}
        </div>
      )}
    </div>
  );
}
