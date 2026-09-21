import { ReactNode, forwardRef } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>{children}</div>;
}

export function Button({
  children, variant = "primary", type = "button", disabled, onClick, className = "",
}: {
  children: ReactNode; variant?: "primary" | "secondary"; type?: "button" | "submit";
  disabled?: boolean; onClick?: () => void; className?: string;
}) {
  const base = "rounded-lg px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";
  const style = variant === "primary"
    ? "bg-brand-950 text-white hover:bg-brand-800"
    : "bg-slate-100 text-slate-700 hover:bg-slate-200";
  return <button type={type} disabled={disabled} onClick={onClick} className={`${base} ${style} ${className}`}>{children}</button>;
}

export function Field({ label, required, error, hint, children }: {
  label: string; required?: boolean; error?: string; hint?: string; children: ReactNode;
}) {
  return (
    <div className="mb-4">
      <label className="mb-1 block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600" role="alert">{error}</p>}
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-brand-800 focus:outline-none focus:ring-1 focus:ring-brand-800";

/* forwardRef: RHF's register() passes a ref that MUST reach the DOM node,
   otherwise the field silently never registers (values read as undefined). */
export const TextInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function TextInput(props, ref) {
    return <input ref={ref} {...props} className={`${inputCls} ${props.className ?? ""}`} />;
  }
);

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ children, ...props }, ref) {
    return <select ref={ref} {...props} className={`${inputCls} ${props.className ?? ""}`}>{children}</select>;
  }
);

export const TextArea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function TextArea(props, ref) {
    return <textarea ref={ref} {...props} className={`${inputCls} ${props.className ?? ""}`} />;
  }
);

export const CheckRow = forwardRef<HTMLInputElement, { label: string } & React.InputHTMLAttributes<HTMLInputElement>>(
  function CheckRow({ label, ...props }, ref) {
    return (
      <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" ref={ref} {...props} className="h-4 w-4 rounded accent-brand-950" />
        {label}
      </label>
    );
  }
);

export function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="mb-6 flex items-center gap-1 text-xs sm:text-sm" aria-label="Registration progress">
      {steps.map((s, i) => (
        <li key={s} className="flex flex-1 items-center gap-1 last:flex-none">
          <span className={`flex h-6 w-6 items-center justify-center rounded-full font-semibold ${
            i < current ? "bg-brand-800 text-white" : i === current ? "bg-brand-950 text-white" : "bg-slate-200 text-slate-500"
          }`}>{i < current ? "✓" : i + 1}</span>
          <span className={`hidden sm:inline ${i === current ? "font-semibold text-brand-950" : "text-slate-500"}`}>{s}</span>
          {i < steps.length - 1 && <span className="mx-1 h-px flex-1 bg-slate-200" />}
        </li>
      ))}
    </ol>
  );
}

/** Toggle chips for multi-select fields. */
export function Chips({ options, value, onChange }: { options: string[]; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <button key={o} type="button" aria-pressed={on} onClick={() => onChange(on ? value.filter((v) => v !== o) : [...value, o])}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              on ? "border-brand-950 bg-brand-950 text-white" : "border-slate-300 bg-white text-slate-600 hover:border-brand-800"
            }`}>{o}</button>
        );
      })}
    </div>
  );
}
