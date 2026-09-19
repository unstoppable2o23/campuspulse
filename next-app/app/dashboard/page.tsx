import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { verifySessionCookie } from "@/lib/session";

export const dynamic = "force-dynamic";

const GRADE_LABELS: Record<string, string> = {
  CLASS_8: "Class 8", CLASS_9: "Class 9", CLASS_10: "Class 10", CLASS_11: "Class 11",
  CLASS_12: "Class 12", DROPPER: "Dropper", UNDERGRADUATE: "Undergraduate", GRADUATE: "Graduate",
};

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">{title}</h2>
      {children}
    </div>
  );
}

export default async function DashboardPage() {
  const token = verifySessionCookie(cookies().toString());
  const session = token
    ? await prisma.session.findUnique({
        where: { token },
        include: {
          user: {
            include: {
              profile: { include: { location: true, employment: true, goal: true, job: true, studyAbroad: true } },
              counsellor: { select: { name: true } },
            },
          },
        },
      })
    : null;
  if (!session || session.expiresAt < new Date() || !session.user.profile) redirect("/login");

  const user = session.user;
  const p = session.user.profile;
  const pct = p.completionPct;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 rounded-3xl bg-brand-950 p-8 text-white">
        <p className="text-sm text-white/70">Welcome{user.counsellor ? ` — your counsellor is ${user.counsellor.name}` : ""},</p>
        <h1 className="mt-1 text-3xl font-extrabold">{user.name.split(" ")[0]} 👋</h1>
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-white/80">
            <span>Profile completion</span><span>{pct}%</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-white/20"><div className="h-2 rounded-full bg-white" style={{ width: `${pct}%` }} /></div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Shell title="Education">
          <p className="font-semibold">{GRADE_LABELS[p.grade] ?? p.grade}{p.stream ? ` · ${p.stream}` : ""}</p>
          <p className="mt-1 text-sm text-slate-600">
            {[p.school, p.board, p.degree, p.fieldOfStudy].filter(Boolean).join(" · ") || "—"}
          </p>
          {p.employment && (
            <p className="mt-1 text-sm text-slate-600">
              {p.employment.status}{p.employment.workplace ? ` at ${p.employment.workplace}` : ""}{p.employment.fieldRole ? ` · ${p.employment.fieldRole}` : ""}{p.employment.desiredField ? ` → wants ${p.employment.desiredField}` : ""}
            </p>
          )}
        </Shell>
        <Shell title="Goals">
          <p className="font-semibold">{p.goal?.primary}</p>
          {p.job && <p className="mt-1 text-sm text-slate-600">{p.job.status} · {p.job.fieldRole} · {p.job.jobType}</p>}
          <p className="mt-1 text-sm text-slate-600">
            {p.careerUndecided ? "Exploring career options" : p.careerInterest} · {p.counsellingMode} counselling
          </p>
        </Shell>
        {p.studyAbroad && p.studyAbroad.plan !== "No" && (
          <Shell title="Study abroad">
            <p className="font-semibold">{p.studyAbroad.plan === "Yes" ? "Planning to go abroad" : "Considering it"}</p>
          </Shell>
        )}
        <Shell title="What should I do next?">
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Your counsellor will reach out within 24 hours.</li>
            {p.mockTestsOptIn && <li>Your free mock tests are unlocked — check back soon.</li>}
            {!p.careerUndecided && p.careerInterest && <li>Explore the {p.careerInterest} career path with your counsellor.</li>}
            <li>Keep your phone handy for session scheduling.</li>
          </ul>
        </Shell>
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        Need to fix something? <Link href="/register" className="font-semibold text-brand-800">Update your profile</Link>
      </p>
    </main>
  );
}
