"use client";
import { useEffect, useState } from "react";

const TESTIMONIALS = [
  { quote: "CampusPulse helped me figure out my career path and connect with the perfect mentor. I got into my dream university!", name: "Diya Patel", detail: "Class 12" },
  { quote: "I was torn between Science and Commerce in Class 11. My counsellor mapped both paths and I finally felt sure.", name: "Rohan Mehta", detail: "Class 12" },
  { quote: "The mock tests showed me exactly where I was losing marks in Physics. Three months later my scores jumped a full grade.", name: "Sneha Reddy", detail: "Class 11" },
  { quote: "As a dropper I felt behind everyone. My counsellor built a study plan around my weak chapters instead of generic advice.", name: "Arjun Nair", detail: "Dropper" },
  { quote: "I had no idea how study-abroad budgets worked. We shortlisted universities I could actually afford — with a loan plan.", name: "Ishita Bose", detail: "Class 12" },
  { quote: "Fresher with zero direction after graduation. Two sessions in, I had a target role, a skills list, and interview prep.", name: "Kabir Malhotra", detail: "Graduate" },
];

export default function Testimonials() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, [paused]);

  const cur = TESTIMONIALS[idx];
  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-live="polite"
    >
      <div key={idx} className="rounded-xl bg-white/10 p-5 text-sm leading-relaxed">
        <p>“{cur.quote}”</p>
        <p className="mt-3 font-semibold">— {cur.name}, {cur.detail}</p>
      </div>
      <div className="mt-3 flex items-center gap-2" role="tablist" aria-label="Testimonials">
        {TESTIMONIALS.map((t, i) => (
          <button
            key={t.name}
            role="tab"
            aria-selected={i === idx}
            aria-label={`Show testimonial from ${t.name}`}
            onClick={() => setIdx(i)}
            className={`h-2 rounded-full transition-all ${i === idx ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/70"}`}
          />
        ))}
      </div>
    </div>
  );
}
