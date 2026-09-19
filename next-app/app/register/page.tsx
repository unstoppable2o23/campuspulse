import Wizard from "@/components/wizard/Wizard";

export default function RegisterPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold text-brand-950">Create your student account</h1>
      <p className="mb-6 text-sm text-slate-600">About 3 minutes. You can go back and change anything.</p>
      <Wizard />
    </main>
  );
}
