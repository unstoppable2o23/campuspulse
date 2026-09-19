/** Shared conditional-form utilities. Used by both client components and tests. */

export const MIN_AGE = 10;
export const MAX_AGE = 35;

export type Grade =
  | "CLASS_8" | "CLASS_9" | "CLASS_10" | "CLASS_11" | "CLASS_12"
  | "DROPPER" | "UNDERGRADUATE" | "GRADUATE";

export const GRADES: { value: Grade; label: string }[] = [
  { value: "CLASS_8", label: "Class 8" },
  { value: "CLASS_9", label: "Class 9" },
  { value: "CLASS_10", label: "Class 10" },
  { value: "CLASS_11", label: "Class 11" },
  { value: "CLASS_12", label: "Class 12" },
  { value: "DROPPER", label: "Dropper" },
  { value: "UNDERGRADUATE", label: "Undergraduate" },
  { value: "GRADUATE", label: "Graduate" },
];

export const SCHOOL_GRADES: Grade[] = ["CLASS_8", "CLASS_9", "CLASS_10", "CLASS_11", "CLASS_12", "DROPPER"];
export const HIGHER_GRADES: Grade[] = ["UNDERGRADUATE", "GRADUATE"];

export const STREAMS = ["Science", "Commerce", "Humanities / Arts", "Vocational / Other"] as const;
export const BOARDS = ["CBSE", "ICSE", "State Board", "IB", "Cambridge (IGCSE / A-Levels)", "NIOS", "Other"] as const;
export const GOALS = [
  "Prepare for higher education",
  "Prepare for competitive exams",
  "Looking for a job",
  "Build career skills",
  "Explore career options",
  "Start a business",
  "Study abroad",
  "Improve academic performance",
  "Other",
] as const;
export const JOB_GOAL = "Looking for a job";
export const JOB_TYPES = ["Full-time", "Part-time", "Internship"] as const;
export const EMP_STATUSES = ["Working", "Fresher"] as const;
export const COUNSELLING_MODES = ["Online", "In-person", "Either"] as const;
export const ABROAD_PLANS = ["Yes", "No", "Not sure"] as const;
export const ACTIVITIES = [
  "Reading", "Sports", "Music", "Art & Design", "Coding", "Gaming",
  "Volunteering", "Debate / MUN", "Drama", "Photography", "Travel", "Other",
] as const;
export const HEAR_OPTIONS = ["Instagram", "YouTube", "Friend / Family", "School", "Google Search", "Other"] as const;

/** Accurate age in completed years (not just year subtraction). */
export function calculateAge(dobIso: string, now: Date = new Date()): number | null {
  const dob = new Date(dobIso + "T00:00:00");
  if (Number.isNaN(dob.getTime())) return null;
  let age = now.getFullYear() - dob.getFullYear();
  if (now.getMonth() < dob.getMonth() || (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate())) age--;
  return age;
}

/** Step 4 renders only for school grades. UG/Graduate end after Step 3. */
export function shouldShowStudyAbroad(grade: Grade | undefined): boolean {
  return !!grade && (SCHOOL_GRADES as Grade[]).includes(grade);
}

export function isHigherGrade(grade: Grade | undefined): boolean {
  return !!grade && (HIGHER_GRADES as Grade[]).includes(grade);
}

const STREAM_SUBJECTS: Record<string, string[]> = {
  Science: ["Physics", "Chemistry", "Mathematics", "Biology", "Computer Science", "English", "Other"],
  Commerce: ["Accountancy", "Business Studies", "Economics", "Mathematics", "English", "Other"],
  "Humanities / Arts": ["History", "Political Science", "Geography", "Economics", "Sociology", "Psychology", "English", "Other"],
  "Vocational / Other": ["English", "Mathematics", "Computer Applications", "Other"],
};

export function subjectsForStream(stream: string | undefined): string[] {
  return (stream && STREAM_SUBJECTS[stream]) || [];
}

const FOUNDATION_SUBJECTS = ["Mathematics", "Science", "English", "Social Science", "Hindi / Regional Language", "Computer Science", "Other"];
const SENIOR_SUBJECTS = ["Physics", "Chemistry", "Mathematics", "Biology", "Accountancy", "Business Studies", "Economics", "History", "Political Science", "Psychology", "English", "Computer Science", "Other"];
const HIGHER_SUBJECTS = ["Engineering & Technology", "Medicine & Life Sciences", "Commerce & Management", "Arts & Humanities", "Law", "Design", "Computer Applications", "Pure Sciences", "Other"];

export function enjoySubjectsForGrade(grade: Grade | undefined, stream?: string): string[] {
  if (!grade) return [];
  if (grade === "CLASS_11" && stream) return subjectsForStream(stream);
  if (grade === "CLASS_8" || grade === "CLASS_9" || grade === "CLASS_10") return FOUNDATION_SUBJECTS;
  if (grade === "CLASS_12" || grade === "DROPPER") return SENIOR_SUBJECTS;
  return HIGHER_SUBJECTS;
}

const SCHOOL_CAREERS = ["Engineering", "Medicine", "Law", "Design", "Teaching", "Civil Services", "Defence", "Business / Management", "Data & AI", "Arts & Media"];
const HIGHER_CAREERS = ["Software Engineering", "Data Science / AI", "Product Management", "UX Design", "Chartered Accountancy", "Medicine / Research", "Law (Corporate / Litigation)", "Civil Services", "Marketing & Growth", "Entrepreneurship / Startups", "Academia / PhD"];

export function careerSuggestions(grade: Grade | undefined): string[] {
  return isHigherGrade(grade) ? HIGHER_CAREERS : SCHOOL_CAREERS;
}

export const SCHOOL_EXAMS = ["JEE Main", "JEE Advanced", "NEET-UG", "CUET", "Olympiads", "NTSE", "Boards"];
export const HIGHER_EXAMS = ["CAT", "GATE", "GRE", "GMAT", "UPSC CSE", "SSC / Banking", "CUET-PG"];

export function examsForGrade(grade: Grade | undefined): string[] {
  return isHigherGrade(grade) ? HIGHER_EXAMS : SCHOOL_EXAMS;
}

/** English-test score bands per exam type. */
export const ENG_SCALES: Record<string, [number, number]> = {
  IELTS: [0, 9],
  "TOEFL iBT": [0, 120],
  "PTE Academic": [10, 90],
  "Duolingo English Test": [10, 160],
};

/**
 * Strip fields that are logically invalid for the current answers so stale
 * hidden values can never block submission or pollute the database.
 */
export function normalizePayload<T extends Record<string, unknown>>(raw: T): T {
  const b = { ...raw } as Record<string, unknown>;
  const grade = b.grade as Grade | undefined;
  const higher = isHigherGrade(grade);
  const showAbroadStep = shouldShowStudyAbroad(grade);

  if (higher) {
    b.school = null; b.board = null; b.boardOther = null;
    b.subjects = [];
    if (grade !== "UNDERGRADUATE") { b.degree = null; b.fieldOfStudy = null; }
    if (grade !== "GRADUATE") { b.employmentStatus = null; b.workplace = null; b.workField = null; }
    b.abroadPlan = "No"; b.countries = []; b.budget = null; b.funds = null;
    b.englishNeeded = "No"; b.engType = null; b.engScore = null;
  } else {
    if (grade !== "UNDERGRADUATE") { /* n/a in this model */ }
    if (grade !== "GRADUATE") { b.employmentStatus = null; b.workplace = null; b.workField = null; }
    if (grade !== "CLASS_11") { b.stream = null; b.subjects = []; }
    if (!showAbroadStep || (b.abroadPlan !== "Yes" && b.abroadPlan !== "Not sure")) {
      if (!showAbroadStep) b.abroadPlan = "No";
      b.countries = []; b.budget = null; b.funds = null;
      b.englishNeeded = "No"; b.engType = null; b.engScore = null;
    }
    if (b.englishNeeded !== "Yes") { b.engType = null; b.engScore = null; }
  }
  if (b.goal !== JOB_GOAL) { b.jobStatus = null; b.jobField = null; b.jobType = null; }
  if (b.goal !== "Other") b.goalOther = null;
  if (b.careerUndecided) b.careerInterest = null;
  if (b.board !== "Other") b.boardOther = null;
  return b as T;
}
