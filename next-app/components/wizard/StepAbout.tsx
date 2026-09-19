"use client";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import type { RegistrationInput } from "@/lib/schemas";
import { COUNTRIES } from "@/data/countries";
import { CheckRow, Field, Select, TextInput } from "../ui";

function strength(pw: string): { label: string; width: string; color: string } {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return [
    { label: "Too weak", width: "w-1/4", color: "bg-red-500" },
    { label: "Weak", width: "w-2/4", color: "bg-amber-500" },
    { label: "Good", width: "w-3/4", color: "bg-lime-600" },
    { label: "Strong", width: "w-full", color: "bg-brand-800" },
  ][Math.min(s, 3)];
}

export default function StepAbout() {
  const { register, watch, formState: { errors } } = useFormContext<RegistrationInput>();
  const [showPw, setShowPw] = useState(false);
  const pw = watch("password") ?? "";
  const st = strength(pw);
  const e = errors as Record<string, { message?: string } | undefined>;

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" required error={e.fullName?.message}>
          <TextInput placeholder="e.g. Aarav Sharma" {...register("fullName")} />
        </Field>
        <Field label="Email" required error={e.email?.message}>
          <TextInput type="email" placeholder="you@example.com" {...register("email")} />
        </Field>
      </div>
      <Field label="Phone" required error={e.phone?.message} hint="Number length is checked against the selected country.">
        <div className="flex gap-2">
          <select {...register("phoneCountryCode")} className="w-40 flex-none rounded-lg border border-slate-300 px-2 py-2.5 text-sm" aria-label="Country code">
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.flag} {c.dialCode} {c.name}</option>
            ))}
          </select>
          <TextInput type="tel" placeholder="Mobile number" {...register("phone")} />
        </div>
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date of birth" required error={e.dob?.message}>
          <TextInput type="date" max={new Date().toISOString().slice(0, 10)} {...register("dob")} />
        </Field>
        <Field label="Nationality" required error={e.nationalityCode?.message} hint="Type to search by country or nationality.">
          <TextInput list="nationality-list" placeholder="Start typing…" {...register("nationalityCode")} />
          <datalist id="nationality-list">
            {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name} — {c.nationality}</option>)}
            <option value="OTHER">Other</option>
          </datalist>
        </Field>
      </div>
      <Field label="Gender" required error={e.gender?.message}>
        <Select {...register("gender")}>
          <option value="">Select…</option>
          <option>Male</option><option>Female</option><option>Other</option><option>Prefer not to say</option>
        </Select>
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Password" required error={e.password?.message}>
          <div className="relative">
            <TextInput type={showPw ? "text" : "password"} {...register("password")} className="pr-16" />
            <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-2 top-2.5 text-xs font-semibold text-brand-800">
              {showPw ? "Hide" : "Show"}
            </button>
          </div>
          {pw.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 rounded bg-slate-200"><div className={`h-1.5 rounded ${st.width} ${st.color}`} /></div>
              <span className="text-xs text-slate-500">{st.label}</span>
            </div>
          )}
        </Field>
        <Field label="Confirm password" required error={e.confirmPassword?.message}>
          <TextInput type={showPw ? "text" : "password"} {...register("confirmPassword")} />
        </Field>
      </div>
      <CheckRow label="I accept the privacy policy and consent to being contacted about counselling." {...register("consent")} />
      {e.consent?.message && <p className="mt-1 text-xs text-red-600" role="alert">{e.consent.message}</p>}
    </div>
  );
}
