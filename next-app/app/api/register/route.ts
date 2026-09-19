import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { normalizePayload } from "@/lib/registration";
import { firstError, registrationSchema } from "@/lib/schemas";
import { newSession, sessionCookie } from "@/lib/session";

function completionPct(v: Record<string, unknown>): number {
  const checks = [
    !!v.fullName, !!v.email, !!v.phone, !!v.dob, !!v.grade,
    !!v.counsellingMode, (v.enjoySubjects as unknown[])?.length > 0,
    (v.activities as unknown[])?.length > 0, !!v.hearAbout,
    !!v.careerUndecided || !!v.careerInterest,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export async function POST(req: NextRequest) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!raw || typeof raw !== "object") return NextResponse.json({ error: "Invalid request body." }, { status: 400 });

  // Strip stale hidden-field values BEFORE validation so conditional UI state can never block submit.
  const normalized = normalizePayload(raw as Record<string, unknown>);
  const parsed = registrationSchema.safeParse(normalized);
  if (!parsed.success) {
    const f = firstError(parsed.error);
    return NextResponse.json({ error: f.message, field: f.field }, { status: 400 });
  }
  const v = parsed.data;
  const email = v.email.toLowerCase();

  try {
    const dupe = await prisma.user.findUnique({ where: { email } });
    if (dupe) return NextResponse.json({ error: "This email is already registered — try signing in.", field: "email" }, { status: 400 });

    // Least-loaded counsellor.
    const counsellors = await prisma.user.findMany({ where: { role: "COUNSELLOR" }, select: { id: true } });
    let counsellorId: number | null = null;
    if (counsellors.length > 0) {
      const loads = await prisma.user.groupBy({ by: ["counsellorId"], where: { role: "STUDENT", counsellorId: { not: null } }, _count: true });
      const load = new Map(loads.map((l) => [l.counsellorId, l._count]));
      counsellorId = [...counsellors].sort((a, b) => (load.get(a.id) ?? 0) - (load.get(b.id) ?? 0))[0].id;
    }

    const passwordHash = await bcrypt.hash(v.password, 12);
    const { token, signature } = newSession();
    const expiresAt = new Date(Date.now() + 7 * 86400 * 1000);

    const user = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          role: "STUDENT", name: v.fullName.trim(), email,
          passwordHash, status: "NEW", counsellorId,
          profile: {
            create: {
              phone: v.phone.trim(), phoneCountryCode: v.phoneCountryCode, dateOfBirth: new Date(v.dob + "T00:00:00"),
              gender: v.gender, nationalityCode: v.nationalityCode, grade: v.grade,
              stream: v.stream, school: v.school?.trim() || null,
              board: v.board, boardOther: v.boardOther?.trim() || null,
              degree: v.degree?.trim() || null, fieldOfStudy: v.fieldOfStudy?.trim() || null,
              careerInterest: v.careerInterest?.trim() || null, careerUndecided: v.careerUndecided,
              counsellingMode: v.counsellingMode, mockTestsOptIn: v.mockTestsOptIn,
              futureNote: v.futureNote?.slice(0, 500) || null, hearAbout: v.hearAbout,
              completionPct: completionPct(v as unknown as Record<string, unknown>),
              location: {
                create: {
                  countryCode: v.nationalityCode,
                  stateCode: v.stateCode,
                  stateText: v.stateText?.trim() || null,
                  districtCode: v.districtCode === "OTHER" ? null : v.districtCode,
                  districtText: v.districtText?.trim() || null,
                  city: v.city?.trim() || null,
                },
              },
              ...(v.grade === "GRADUATE"
                ? { employment: { create: { status: v.employmentStatus!, workplace: v.workplace?.trim() || null, fieldRole: v.employmentStatus === "Working" ? v.workField?.trim() || null : null, desiredField: v.employmentStatus === "Fresher" ? v.workField?.trim() || null : null } } }
                : {}),
              goal: { create: { primary: v.goal, otherText: v.goalOther?.trim() || null } },
              ...(v.goal === "Looking for a job"
                ? { job: { create: { status: v.jobStatus ?? (v.employmentStatus === "Working" ? "Open to offers" : "Actively looking"), fieldRole: v.jobField!.trim(), jobType: v.jobType! } } }
                : {}),
              activities: {
                create: v.activities.map((a) => ({ activity: a, customText: a === "Other" ? v.activityOther?.trim() || null : null })),
              },
              exams: { create: v.exams.map((x) => ({ exam: x })) },
              ...(v.abroadPlan === "Yes" || v.abroadPlan === "Not sure"
                ? {
                    studyAbroad: {
                      create: {
                        plan: v.abroadPlan, budget: v.budget, funds: v.funds,
                        intake: v.intake, startYear: v.startYear,
                        countries: { create: v.countries.map((c) => ({ customName: c })) },
                        universities: { create: v.universities.map((u) => ({ name: u })) },
                        ...(v.englishNeeded === "Yes" && v.engType
                          ? { englishTests: { create: [{ examType: v.engType, score: v.engNotTaken ? null : v.engScore, taken: !v.engNotTaken }] } }
                          : {}),
                      },
                    },
                  }
                : {}),
            },
          },
          consents: { create: [{ version: "v1" }] },
          sessions: { create: [{ token, expiresAt }] },
        },
        include: { profile: true },
      });
      return u;
    });

    const res = NextResponse.json({ ok: true, completionPct: user.profile?.completionPct ?? 0 });
    res.headers.set("Set-Cookie", sessionCookie(token, signature));
    return res;
  } catch (err) {
    // Never log PII. Prisma unique-violation race on email:
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002")
      return NextResponse.json({ error: "This email is already registered — try signing in.", field: "email" }, { status: 400 });
    console.error("register failed:", err instanceof Error ? err.message : "unknown");
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
