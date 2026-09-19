"use client";
import { Controller, useFormContext } from "react-hook-form";
import type { RegistrationInput } from "@/lib/schemas";
import { COUNTRIES } from "@/data/countries";
import { CheckRow, Chips, Field, Select, TextInput } from "../ui";

export default function StepAbroad() {
  const { register, watch, control, formState: { errors } } = useFormContext<RegistrationInput>();
  const e = errors as Record<string, { message?: string } | undefined>;
  const plan = watch("abroadPlan");
  const english = watch("englishNeeded");
  const notTaken = watch("engNotTaken");
  const active = plan === "Yes" || plan === "Not sure";

  return (
    <div>
      <Field label="Planning to study abroad?" required error={e.abroadPlan?.message}>
        <Select {...register("abroadPlan")}>
          <option value="No">No</option><option value="Yes">Yes</option><option value="Not sure">Not sure</option>
        </Select>
      </Field>

      {active && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <Field label="Countries" required error={e.countries?.message}>
            <Controller control={control} name="countries" render={({ field }) => (
              <Chips
                options={["USA", "UK", "Canada", "Australia", "Germany", "Ireland", "Singapore", "New Zealand"]}
                value={field.value ?? []} onChange={field.onChange}
              />
            )} />
            <TextInput list="abroad-countries" placeholder="Or add your own…" {...register("countryOther")} className="mt-2" />
            <datalist id="abroad-countries">{COUNTRIES.map((c) => <option key={c.code} value={c.name} />)}</datalist>
          </Field>
          <Field label="Universities (optional)" hint="Separate with commas. It's fine if you don't know yet.">
            <Controller control={control} name="universities" render={({ field }) => (
              <TextInput
                placeholder="e.g. TU Munich, NUS"
                value={(field.value ?? []).join(", ")}
                onChange={(ev) => field.onChange(ev.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
              />
            )} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tuition budget" required error={e.budget?.message}>
              <Select {...register("budget")}>
                <option value="">Select…</option>
                <option>Under $10k / year</option><option>$10k – $25k / year</option>
                <option>$25k – $50k / year</option><option>$50k+ / year</option><option>Not sure yet</option>
              </Select>
            </Field>
            <Field label="Source of funds" required error={e.funds?.message}>
              <Select {...register("funds")}>
                <option value="">Select…</option>
                <option>Family</option><option>Scholarship</option><option>Education loan</option>
                <option>Self-funded</option><option>Sponsorship</option><option>Combination</option><option>Other</option>
              </Select>
            </Field>
          </div>
          <Field label="English proficiency test?" required error={e.englishNeeded?.message}>
            <Select {...register("englishNeeded")}>
              <option value="No">No</option><option value="Yes">Yes</option>
            </Select>
          </Field>
          {english === "Yes" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Exam type" required error={e.engType?.message}>
                <Select {...register("engType")}>
                  <option value="">Select…</option>
                  <option>IELTS</option><option>TOEFL iBT</option><option>PTE Academic</option>
                  <option>Duolingo English Test</option><option>Other</option>
                </Select>
              </Field>
              <div>
                <Field label="Score" required error={e.engScore?.message}>
                  <TextInput type="number" step="any" disabled={!!notTaken}
                    {...register("engScore", { setValueAs: (v) => (v === "" || v == null ? null : Number(v)) })} />
                </Field>
                <CheckRow label="Not taken yet" {...register("engNotTaken")} />
              </div>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Intake (optional)">
              <Select {...register("intake")}>
                <option value="">Select…</option>
                <option>Spring</option><option>Summer</option><option>Fall</option><option>Winter</option><option>Other</option>
              </Select>
            </Field>
            <Field label="Start year (optional)" error={e.startYear?.message}>
              <TextInput type="number" placeholder="e.g. 2027"
                {...register("startYear", { setValueAs: (v) => (v === "" || v == null ? null : Number(v)) })} />
            </Field>
          </div>
        </div>
      )}
    </div>
  );
}
