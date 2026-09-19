import { z } from "zod";
import {
  ABROAD_PLANS, ACTIVITIES, BOARDS, COUNSELLING_MODES, EMP_STATUSES,
  GOALS, GRADES, HEAR_OPTIONS, HIGHER_GRADES, JOB_GOAL, JOB_TYPES,
  ENG_SCALES, MAX_AGE, MIN_AGE, calculateAge, type Grade,
} from "./registration";
import { DEFAULT_PHONE_LENGTH, PHONE_LENGTHS, countryByCode } from "@/data/countries";

const gradeEnum = z.enum(GRADES.map((g) => g.value) as [Grade, ...Grade[]]);

type NeedFn = (cond: boolean, path: string[], message: string) => void;
function checker(ctx: { addIssue: (issue: Parameters<z.RefinementCtx["addIssue"]>[0]) => void }): NeedFn {
  return (cond, path, message) => {
    if (cond) ctx.addIssue({ code: z.ZodIssueCode.custom, path, message });
  };
}

/* ── Step 1: About you ─────────────────────────────────────────── */
const aboutFields = z.object({
  fullName: z.string().trim().min(3, "Please enter your full name."),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  phoneCountryCode: z.string().default("IN"),
  phone: z.string().trim().min(1, "Enter your phone number."),
  dob: z.string().min(1, "Pick your date of birth."),
  nationalityCode: z.string().min(2, "Select your nationality."),
  gender: z.enum(["Male", "Female", "Other", "Prefer not to say"], { errorMap: () => ({ message: "Select an option." }) }),
  password: z.string().min(6, "Password needs at least 6 characters."),
  confirmPassword: z.string(),
  consent: z.literal(true, { errorMap: () => ({ message: "Please accept the consent to continue." }) }),
});
type AboutFields = z.infer<typeof aboutFields>;
function refineAbout(v: AboutFields, need: NeedFn): void {
  const age = calculateAge(v.dob);
  need(age === null || age < MIN_AGE || age > MAX_AGE, ["dob"], `Students must be ${MIN_AGE}–${MAX_AGE} years old.`);
  need(v.password !== v.confirmPassword, ["confirmPassword"], "Passwords do not match.");
  const digits = (v.phone.match(/\d/g) || []).length;
  const [lo, hi] = PHONE_LENGTHS[v.phoneCountryCode] ?? DEFAULT_PHONE_LENGTH;
  need(digits < lo || digits > hi, ["phone"], `Enter a valid phone number for ${countryByCode(v.phoneCountryCode)?.name ?? "that country"}.`);
}
export const aboutSchema = aboutFields.superRefine((v, ctx) => refineAbout(v, checker(ctx)));

/* ── Step 2: Education ─────────────────────────────────────────── */
const educationFields = z.object({
  grade: gradeEnum,
  nationalityCode: z.string().default("IN"),
  stream: z.string().nullable().optional(),
  school: z.string().trim().nullable().optional(),
  board: z.string().nullable().optional(),
  boardOther: z.string().trim().nullable().optional(),
  degree: z.string().trim().nullable().optional(),
  fieldOfStudy: z.string().trim().nullable().optional(),
  stateCode: z.string().nullable().optional(),
  stateText: z.string().trim().nullable().optional(),
  districtCode: z.string().nullable().optional(),
  districtText: z.string().trim().nullable().optional(),
  city: z.string().trim().nullable().optional(),
  subjects: z.array(z.string()).default([]),
  enjoySubjects: z.array(z.string()).default([]),
  employmentStatus: z.string().nullable().optional(),
  workplace: z.string().trim().nullable().optional(),
  workField: z.string().trim().nullable().optional(),
});
type EducationFields = z.infer<typeof educationFields>;
function refineEducation(v: EducationFields, need: NeedFn): void {
  const higher = (HIGHER_GRADES as string[]).includes(v.grade);
  const grad = v.grade === "GRADUATE";
  const ug = v.grade === "UNDERGRADUATE";
  need(v.grade === "CLASS_11" && !v.stream, ["stream"], "Select your stream.");
  need(!higher && !(v.school ?? "").trim(), ["school"], "Enter your school / college.");
  need(!higher && !v.board, ["board"], "Select your syllabus / board.");
  need(!higher && v.board === "Other" && !(v.boardOther ?? "").trim(), ["boardOther"], "Name your board / curriculum.");
  need(ug && !(v.degree ?? "").trim(), ["degree"], "Tell us your degree / course.");
  need(ug && !(v.fieldOfStudy ?? "").trim(), ["fieldOfStudy"], "Tell us your field of study.");
  const indian = v.nationalityCode === "IN";
  need(indian && !v.stateCode, ["stateCode"], "Select your state.");
  need(indian && !(v.districtCode ?? "").trim(), ["districtCode"], "Select your district.");
  need(indian && (v.districtCode ?? "").trim() === "OTHER" && !(v.districtText ?? "").trim(), ["districtText"], "Type your district.");
  need(!indian && !(v.stateText ?? "").trim(), ["stateText"], "Enter your state / province.");
  need(!indian && !(v.city ?? "").trim(), ["city"], "Enter your city.");
  need(v.grade === "CLASS_11" && v.subjects.length === 0, ["subjects"], "Pick at least one subject.");
  need(v.enjoySubjects.length === 0, ["enjoySubjects"], "Pick at least one subject you enjoy.");
  need(grad && !(EMP_STATUSES as readonly string[]).includes(v.employmentStatus ?? ""), ["employmentStatus"], "Tell us whether you are working or a fresher.");
  need(grad && v.employmentStatus === "Working" && !(v.workplace ?? "").trim(), ["workplace"], "Tell us where you work.");
  need(grad && v.employmentStatus === "Working" && !(v.workField ?? "").trim(), ["workField"], "Tell us your current field / role.");
  need(grad && v.employmentStatus === "Fresher" && !(v.workField ?? "").trim(), ["workField"], "Tell us which field you want.");
}
export const educationSchema = educationFields.superRefine((v, ctx) => refineEducation(v, checker(ctx)));

/* ── Step 3: Goals ─────────────────────────────────────────────── */
const goalsFields = z.object({
  goal: z.enum(GOALS as unknown as [string, ...string[]], { errorMap: () => ({ message: "Choose your primary goal." }) }),
  goalOther: z.string().trim().nullable().optional(),
  jobStatus: z.string().nullable().optional(),
  jobField: z.string().trim().nullable().optional(),
  jobType: z.string().nullable().optional(),
  employmentStatus: z.string().nullable().optional(), // graduate shortcut for the job block
  grade: gradeEnum.optional(),
  counsellingMode: z.enum(COUNSELLING_MODES as unknown as [string, ...string[]], { errorMap: () => ({ message: "Choose a counselling mode." }) }),
  exams: z.array(z.string()).default([]),
  mockTestsOptIn: z.boolean().default(false),
  careerInterest: z.string().trim().nullable().optional(),
  careerUndecided: z.boolean().default(false),
  activities: z.array(z.string()).default([]),
  activityOther: z.string().trim().nullable().optional(),
  futureNote: z.string().trim().max(500).nullable().optional(),
  hearAbout: z.enum(HEAR_OPTIONS as unknown as [string, ...string[]], { errorMap: () => ({ message: "Tell us how you found us." }) }),
});
type GoalsFields = z.infer<typeof goalsFields>;
function refineGoals(v: GoalsFields, need: NeedFn): void {
  const wantJob = v.goal === JOB_GOAL;
  const gradEmp = v.grade === "GRADUATE" && (EMP_STATUSES as readonly string[]).includes(v.employmentStatus ?? "");
  need(v.goal === "Other" && !(v.goalOther ?? "").trim(), ["goalOther"], "Describe your goal in your words.");
  need(wantJob && !gradEmp && !["Actively looking", "Open to offers"].includes(v.jobStatus ?? ""), ["jobStatus"], "Tell us whether you are actively looking or open to offers.");
  need(wantJob && !(v.jobField ?? "").trim(), ["jobField"], "Tell us the field / role you are looking for.");
  need(wantJob && !(JOB_TYPES as readonly string[]).includes(v.jobType ?? ""), ["jobType"], "Pick the type of job that interests you.");
  need(!v.careerUndecided && !(v.careerInterest ?? "").trim(), ["careerInterest"], "Tell us your career interest — or tick undecided.");
  need(v.activities.length === 0, ["activities"], "Pick at least one activity you enjoy.");
  need(v.activities.includes("Other") && !(v.activityOther ?? "").trim(), ["activityOther"], "Describe your other activity.");
}
export const goalsSchema = goalsFields.superRefine((v, ctx) => refineGoals(v, checker(ctx)));

/* ── Step 4: Study abroad (school grades only) ─────────────────── */
const abroadFields = z.object({
  grade: gradeEnum.optional(),
  abroadPlan: z.enum(ABROAD_PLANS as unknown as [string, ...string[]], { errorMap: () => ({ message: "Tell us about your study-abroad plans." }) }),
  countries: z.array(z.string()).default([]),
  countryOther: z.string().trim().nullable().optional(),
  universities: z.array(z.string()).default([]),
  budget: z.string().nullable().optional(),
  funds: z.string().nullable().optional(),
  englishNeeded: z.enum(["Yes", "No"], { errorMap: () => ({ message: "Say whether you need an English test." }) }),
  engType: z.string().nullable().optional(),
  engScore: z.number().nullable().optional(),
  engNotTaken: z.boolean().default(false),
  intake: z.string().nullable().optional(),
  startYear: z.number().int().nullable().optional(),
});
type AbroadFields = z.infer<typeof abroadFields>;
function refineAbroad(v: AbroadFields, need: NeedFn): void {
  const active = v.abroadPlan === "Yes" || v.abroadPlan === "Not sure";
  need(active && v.countries.length === 0 && !(v.countryOther ?? "").trim(), ["countries"], "Pick at least one country — or add your own.");
  need(active && !v.budget, ["budget"], "Choose a tuition budget band.");
  need(active && !v.funds, ["funds"], "Tell us your source of funds.");
  need(active && v.englishNeeded === "Yes" && !v.engType, ["engType"], "Pick your English exam type.");
  need(active && v.englishNeeded === "Yes" && !v.engNotTaken && v.engScore == null, ["engScore"], "Enter your score — or tick not taken yet.");
  if (active && v.englishNeeded === "Yes" && !v.engNotTaken && v.engScore != null && v.engType) {
    const scale = ENG_SCALES[v.engType];
    if (scale) need(v.engScore < scale[0] || v.engScore > scale[1], ["engScore"], `Enter a valid score for ${v.engType} (${scale[0]}–${scale[1]}).`);
  }
  const year = new Date().getFullYear();
  need(v.startYear != null && (v.startYear < year || v.startYear > year + 8), ["startYear"], "Enter a sensible start year.");
}
export const abroadSchema = abroadFields.superRefine((v, ctx) => refineAbroad(v, checker(ctx)));

/* ── Full payload: every step merged + grade gates ───────────────
   Step superRefines are re-applied here — spreading `.shape` alone would
   silently drop all conditional rules. */
export const registrationSchema = z
  .object({ ...aboutFields.shape, ...educationFields.shape, ...goalsFields.shape, ...abroadFields.shape, grade: gradeEnum })
  .superRefine((v, ctx) => {
    const need = checker(ctx);
    refineAbout(v, need);
    refineEducation(v, need);
    refineGoals(v, need);
    refineAbroad(v, need);
    const higher = (HIGHER_GRADES as string[]).includes(v.grade);
    // UG/Graduate must never carry school-only data (defence in depth; normalize strips these first).
    need(higher && !!(v.school ?? "").trim(), ["school"], "School must be empty for higher education.");
    need(higher && v.subjects.length > 0, ["subjects"], "Subjects must be empty for higher education.");
    need(higher && (v.abroadPlan === "Yes" || v.abroadPlan === "Not sure"), ["abroadPlan"], "Study abroad applies to school grades only.");
  });

export type RegistrationInput = z.infer<typeof registrationSchema>;
export type AboutInput = z.infer<typeof aboutSchema>;
export type EducationInput = z.infer<typeof educationSchema>;
export type GoalsInput = z.infer<typeof goalsSchema>;
export type AbroadInput = z.infer<typeof abroadSchema>;

/** Field-level first error helper for API responses: { field, message }. */
export function firstError(error: z.ZodError): { field: string; message: string } {
  const issue = error.issues[0];
  return { field: String(issue.path[0] ?? "form"), message: issue.message };
}
