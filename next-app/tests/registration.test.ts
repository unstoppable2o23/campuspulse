import { describe, expect, it } from "vitest";
import {
  aboutSchema, abroadSchema, educationSchema, goalsSchema, registrationSchema,
  type RegistrationInput,
} from "@/lib/schemas";
import {
  calculateAge, enjoySubjectsForGrade, normalizePayload,
  shouldShowStudyAbroad, subjectsForStream,
} from "@/lib/registration";

function base(): RegistrationInput {
  return {
    fullName: "Aarav Sharma", email: "aarav@example.com", phoneCountryCode: "IN",
    phone: "9876543210", dob: "2008-05-10", nationalityCode: "IN",
    gender: "Male", password: "Secret@123", confirmPassword: "Secret@123", consent: true,
    grade: "CLASS_11", stream: "Science", school: "DPS", board: "CBSE", boardOther: null,
    degree: null, fieldOfStudy: null, stateCode: "RJ", stateText: null,
    districtCode: "Kota", districtText: null, city: null,
    subjects: ["Physics", "Mathematics"], enjoySubjects: ["Mathematics"],
    employmentStatus: null, workplace: null, workField: null,
    goal: "Prepare for higher education", goalOther: null,
    jobStatus: null, jobField: null, jobType: null, counsellingMode: "Online",
    exams: [], mockTestsOptIn: false, careerInterest: "Data & AI", careerUndecided: false,
    activities: ["Reading"], activityOther: null, futureNote: null, hearAbout: "Google Search",
    abroadPlan: "No", countries: [], countryOther: null, universities: [],
    budget: null, funds: null, englishNeeded: "No", engType: null, engScore: null,
    engNotTaken: false, intake: null, startYear: null,
  };
}

const valid = (patch: Partial<RegistrationInput> = {}) =>
  registrationSchema.safeParse(normalizePayload({ ...base(), ...patch }));

describe("calculateAge", () => {
  it("counts completed years, not just year subtraction", () => {
    const now = new Date("2026-09-19T00:00:00");
    expect(calculateAge("2016-09-19", now)).toBe(10); // birthday today
    expect(calculateAge("2016-09-20", now)).toBe(9); // birthday tomorrow
    expect(calculateAge("not-a-date", now)).toBeNull();
  });
});

describe("step visibility", () => {
  it("shows Step 4 for school grades only", () => {
    for (const g of ["CLASS_8", "CLASS_9", "CLASS_10", "CLASS_11", "CLASS_12", "DROPPER"] as const)
      expect(shouldShowStudyAbroad(g)).toBe(true);
    expect(shouldShowStudyAbroad("UNDERGRADUATE")).toBe(false);
    expect(shouldShowStudyAbroad("GRADUATE")).toBe(false);
  });
  it("gates subjects by stream and grade", () => {
    expect(subjectsForStream("Science")).toContain("Physics");
    expect(subjectsForStream("Commerce")).toContain("Accountancy");
    expect(enjoySubjectsForGrade("CLASS_11", "Science")).toContain("Physics");
    expect(enjoySubjectsForGrade("UNDERGRADUATE")).toContain("Engineering & Technology");
  });
});

describe("about step", () => {
  it("rejects bad email, age out of range, mismatch, missing consent", () => {
    expect(aboutSchema.safeParse({ ...base(), email: "nope" }).success).toBe(false);
    expect(aboutSchema.safeParse({ ...base(), dob: "2022-01-01" }).success).toBe(false);
    expect(aboutSchema.safeParse({ ...base(), confirmPassword: "x" }).success).toBe(false);
    expect(aboutSchema.safeParse({ ...base(), consent: false }).success).toBe(false);
  });
  it("enforces country-aware phone lengths", () => {
    expect(aboutSchema.safeParse({ ...base(), phone: "123" }).success).toBe(false);
    expect(aboutSchema.safeParse({ ...base(), phoneCountryCode: "US", phone: "2125551234" }).success).toBe(true);
  });
});

/* ── CRITICAL REGRESSION: Graduate students must be able to submit ── */
describe("graduate flow (regression)", () => {
  const gradWorking: Partial<RegistrationInput> = {
    grade: "GRADUATE", employmentStatus: "Working", workplace: "Infosys", workField: "Testing",
    school: "Old School", board: "CBSE", subjects: ["Physics"], // stale school data must be stripped
    goal: "Prepare for higher education", abroadPlan: "Yes", countries: ["USA"], budget: "x", funds: "y",
  };
  it("Graduate + Working submits; stale school/abroad data is stripped, not fatal", () => {
    const r = valid(gradWorking);
    expect(r.success).toBe(true);
  });
  it("Graduate + Fresher submits with desired field", () => {
    const r = valid({ ...gradWorking, employmentStatus: "Fresher", workplace: null, workField: "Marketing" });
    expect(r.success).toBe(true);
  });
  it("Graduate without employment status is rejected with a useful message", () => {
    const r = valid({ ...gradWorking, employmentStatus: null, workField: null, workplace: null });
    expect(r.success).toBe(false);
    if (!r.success) {
      const issue = r.error.issues.find((i) => String(i.path[0]) === "employmentStatus");
      expect(issue?.message).toMatch(/working or a fresher/);
    }
  });
  it("Graduate + job goal reuses employment status (no duplicate jobStatus demanded)", () => {
    const r = valid({ ...gradWorking, goal: "Looking for a job", jobField: "QA", jobType: "Full-time", jobStatus: null });
    expect(r.success).toBe(true);
  });
  it("per-step education schema accepts a Graduate payload", () => {
    const r = educationSchema.safeParse(normalizePayload({ ...base(), ...gradWorking }));
    expect(r.success).toBe(true);
  });
});

describe("undergraduate flow", () => {
  it("requires degree + field, skips Step 4", () => {
    expect(valid({ grade: "UNDERGRADUATE", degree: "", fieldOfStudy: "" }).success).toBe(false);
    const r = valid({ grade: "UNDERGRADUATE", degree: "B.Tech", fieldOfStudy: "CS", abroadPlan: "No" });
    expect(r.success).toBe(true);
  });
});

describe("school flows", () => {
  it("Class 11 requires stream + subjects; other classes must not send them", () => {
    expect(valid({ grade: "CLASS_11", stream: null, subjects: [] }).success).toBe(false);
    expect(valid({ grade: "CLASS_12", stream: "Science", subjects: ["Physics"] }).success).toBe(true);
  });
  it("custom board requires a name", () => {
    expect(valid({ board: "Other", boardOther: "" }).success).toBe(false);
    expect(valid({ board: "Other", boardOther: "My Board" }).success).toBe(true);
  });
});

describe("location gates", () => {
  it("India: state + district required, city not required", () => {
    expect(valid({ nationalityCode: "IN", stateCode: null }).success).toBe(false);
    expect(valid({ nationalityCode: "IN", districtCode: null }).success).toBe(false);
    expect(valid({ nationalityCode: "IN", city: "Jaipur" }).success).toBe(true);
  });
  it("non-India: state text + city required", () => {
    const p = { nationalityCode: "US", stateCode: null, districtCode: null, stateText: "California", city: "Fremont" };
    expect(valid(p).success).toBe(true);
    expect(valid({ ...p, city: "" }).success).toBe(false);
  });
  it("OTHER district requires typed text", () => {
    expect(valid({ districtCode: "OTHER", districtText: "" }).success).toBe(false);
    expect(valid({ districtCode: "OTHER", districtText: "My District" }).success).toBe(true);
  });
});

describe("goals gates", () => {
  it("job goal requires the job block; other goals must not carry it", () => {
    expect(valid({ goal: "Looking for a job", jobStatus: null, jobField: null, jobType: null }).success).toBe(false);
    const r = valid({ goal: "Looking for a job", jobStatus: "Actively looking", jobField: "SWE", jobType: "Full-time" });
    expect(r.success).toBe(true);
    expect(valid({ goal: "Build career skills", jobStatus: "Actively looking", jobField: "x", jobType: "Full-time" }).success).toBe(true);
  });
  it("Other goal requires free text; undecided clears career interest", () => {
    expect(valid({ goal: "Other", goalOther: "" }).success).toBe(false);
    const r = valid({ goal: "Other", goalOther: "Film", careerUndecided: true, careerInterest: "Acting" });
    expect(r.success).toBe(true);
    if (r.success) expect(normalizePayload(r.data).careerInterest).toBeNull();
  });
  it("activities require at least one; Other needs text", () => {
    expect(valid({ activities: [] }).success).toBe(false);
    expect(valid({ activities: ["Other"], activityOther: "" }).success).toBe(false);
  });
});

describe("abroad gates", () => {
  const abroad: {
    abroadPlan: "Yes"; countries: string[]; countryOther: null; budget: string;
    funds: string; englishNeeded: "Yes"; engType: string; engScore: number;
  } = {
    abroadPlan: "Yes", countries: ["USA"], countryOther: null, budget: "Under $10k / year",
    funds: "Family", englishNeeded: "Yes", engType: "IELTS", engScore: 7.5,
  };
  it("Yes requires countries/budget/funds; No skips everything", () => {
    expect(valid(abroad).success).toBe(true);
    expect(valid({ ...abroad, countries: [] }).success).toBe(false);
    expect(valid({ abroadPlan: "No" }).success).toBe(true);
  });
  it("validates score per exam band", () => {
    expect(valid({ ...abroad, engScore: 12 }).success).toBe(false); // IELTS max 9
    expect(valid({ ...abroad, engType: "TOEFL iBT", engScore: 110 }).success).toBe(true);
  });
  it("per-step abroad schema accepts a full Yes payload", () => {
    expect(abroadSchema.safeParse({ ...base(), ...abroad }).success).toBe(true);
  });
});

describe("goals per-step schema", () => {
  it("accepts a non-job payload without job fields", () => {
    expect(goalsSchema.safeParse(base()).success).toBe(true);
  });
});
