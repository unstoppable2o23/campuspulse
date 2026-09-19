import Link from "next/link";

export default function WelcomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-12">
      <div className="grid w-full items-center gap-10 md:grid-cols-2">
        <div className="rounded-3xl bg-brand-950 p-10 text-white">
          <p className="text-xl font-bold">🎓 CampusPulse</p>
          <h1 className="mt-6 text-4xl font-extrabold leading-tight">STUDENT GUIDANCE PLATFORM</h1>
          <p className="mt-3 text-lg text-white/80">The right counsellor, right on time.</p>
          <div className="mt-8 rounded-xl bg-white/10 p-5 text-sm leading-relaxed">
            “CampusPulse helped me figure out my career path and connect with the perfect mentor.
            I got into my dream university!”
            <p className="mt-3 font-semibold">— Aarav Sharma, Class 12</p>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          <h2 className="text-2xl font-bold text-brand-950">Find your path, with a counsellor beside you</h2>
          <p className="mt-2 text-sm text-slate-600">
            Tell us where you are in school or college, what you enjoy, and where you want to go —
            we match you with the right counsellor in about 3 minutes.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link href="/register" className="rounded-lg bg-brand-950 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-brand-800">
              Create your profile
            </Link>
            <Link href="/login" className="rounded-lg bg-slate-100 px-5 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-200">
              Already have an account? Sign in
            </Link>
          </div>
          <p className="mt-5 text-xs leading-relaxed text-slate-500">
            🔒 Your details stay private. We only share your profile with your assigned counsellor —
            never with advertisers, and never without your consent.
          </p>
        </div>
      </div>
    </main>
  );
}
