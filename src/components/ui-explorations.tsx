"use client";

import Image from "next/image";
import { Check, ChevronRight, Flame, Minus, MoonStar, Sparkles } from "lucide-react";

type SampleHabit = {
  name: string;
  category: string;
  progress: string;
  complete: boolean;
};

const habits: SampleHabit[] = [
  { name: "Minoxidil", category: "Health", progress: "done", complete: true },
  { name: "Design", category: "Learning", progress: "45 / 60 min", complete: false },
  { name: "Reading", category: "Learning", progress: "30 / 30 min", complete: true },
  { name: "Bhagavad Gita", category: "Spiritual", progress: "12 / 15 min", complete: false },
  { name: "Journalling", category: "Discipline", progress: "done", complete: true },
  { name: "Workout", category: "Health", progress: "open", complete: false },
];

const dates = [
  { label: "19", day: "Wed" },
  { label: "20", day: "Thu" },
  { label: "21", day: "Fri" },
  { label: "22", day: "Sat" },
  { label: "23", day: "Sun" },
  { label: "24", day: "Mon" },
];

function PixelMark({ active }: { active: boolean }) {
  return (
    <span
      className={[
        "inline-grid h-6 w-6 grid-cols-2 grid-rows-2 gap-[2px] rounded-[4px] border p-[3px]",
        active ? "border-slate-900 bg-slate-900" : "border-slate-300 bg-white",
      ].join(" ")}
      aria-hidden="true"
    >
      <span className={active ? "bg-white" : "bg-slate-300"} />
      <span className={active ? "bg-white" : "bg-slate-300"} />
      <span className={active ? "bg-white" : "bg-slate-300"} />
      <span className="bg-transparent" />
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{children}</p>;
}

function ToolLikeConcept() {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
      <div className="grid min-h-[760px] lg:grid-cols-[220px_minmax(0,1fr)_280px]">
        <aside className="border-b border-slate-200 bg-slate-950 px-6 py-8 text-slate-100 lg:border-b-0 lg:border-r lg:border-slate-800">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Progress</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">Tracker</h2>
          <div className="mt-10 space-y-2 text-sm">
            {["Today", "Weekly", "Consistency", "Setup"].map((item, index) => (
              <div
                key={item}
                className={[
                  "flex items-center justify-between rounded-xl px-3 py-2",
                  index === 0 ? "bg-white text-slate-950" : "text-slate-400",
                ].join(" ")}
              >
                <span>{item}</span>
                {index === 0 ? <ChevronRight className="h-4 w-4" /> : null}
              </div>
            ))}
          </div>
          <div className="mt-12 rounded-2xl border border-slate-800 p-4">
            <SectionLabel>Weekly</SectionLabel>
            <p className="mt-3 text-3xl font-semibold">68%</p>
            <p className="mt-1 text-sm text-slate-400">Average</p>
          </div>
        </aside>

        <main className="px-6 py-8 sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <SectionLabel>Today</SectionLabel>
              <h3 className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-slate-950">
                Sunday, 23 Mar
              </h3>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right">
              <SectionLabel>Complete</SectionLabel>
              <p className="mt-2 text-3xl font-semibold text-slate-950">3 / 6</p>
            </div>
          </div>

          <div className="mt-8 grid gap-3">
            {habits.map((habit) => (
              <div
                key={habit.name}
                className="grid items-center gap-4 rounded-2xl border border-slate-200 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_150px_120px]"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <p className="truncate text-sm font-medium text-slate-950">{habit.name}</p>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-600">
                      {habit.category}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-slate-600">{habit.progress}</div>
                <button
                  className={[
                    "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium",
                    habit.complete
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-950 text-white",
                  ].join(" ")}
                >
                  {habit.complete ? "Done" : "Open"}
                </button>
              </div>
            ))}
          </div>
        </main>

        <aside className="border-t border-slate-200 bg-slate-50 px-6 py-8 lg:border-t-0 lg:border-l">
          <div className="space-y-8">
            <div>
              <SectionLabel>Week</SectionLabel>
              <div className="mt-4 grid grid-cols-7 gap-2">
                {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                  <div key={`${day}-${index}`} className="text-center">
                    <div
                      className={[
                        "rounded-xl py-3 text-xs font-medium",
                        index > 3 ? "bg-slate-900 text-white" : "bg-white text-slate-500",
                      ].join(" ")}
                    >
                      {day}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-amber-500" />
                <p className="text-sm font-medium text-slate-900">Streaks</p>
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>No porn</span>
                  <span>12d</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Reading</span>
                  <span>5d</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Design</span>
                  <span>3d</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function JournalLikeConcept() {
  return (
    <section className="overflow-hidden rounded-[28px] border border-stone-200 bg-[#f4efe6] shadow-[0_24px_80px_rgba(68,64,60,0.12)]">
      <div className="grid min-h-[760px] lg:grid-cols-[minmax(0,1fr)_300px]">
        <main className="px-7 py-8 sm:px-10">
          <SectionLabel>Today</SectionLabel>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4 border-b border-stone-300 pb-6">
            <div>
              <h2 className="text-5xl font-semibold tracking-[-0.06em] text-stone-950">
                23 March
              </h2>
            </div>
            <div className="rounded-full border border-stone-300 px-4 py-2 text-sm text-stone-700">
              3 habits complete
            </div>
          </div>

          <div className="mt-8 grid gap-4">
            {habits.map((habit) => (
              <div
                key={habit.name}
                className="grid gap-4 rounded-[22px] border border-stone-300 bg-[#fbf8f2] px-5 py-5 sm:grid-cols-[100px_minmax(0,1fr)_100px]"
              >
                <div className="text-xs uppercase tracking-[0.16em] text-stone-500">
                  {habit.category}
                </div>
                <div>
                  <p className="text-xl font-medium tracking-[-0.03em] text-stone-950">
                    {habit.name}
                  </p>
                  <p className="mt-2 text-sm text-stone-600">{habit.progress}</p>
                </div>
                <div className="flex items-center justify-end">
                  <div
                    className={[
                      "rounded-full px-4 py-2 text-sm",
                      habit.complete
                        ? "bg-stone-950 text-[#f4efe6]"
                        : "border border-stone-300 text-stone-700",
                    ].join(" ")}
                  >
                    {habit.complete ? "Done" : "Open"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>

        <aside className="border-t border-stone-300 bg-[#ede5d9] px-7 py-8 lg:border-l lg:border-t-0">
          <div className="rounded-[24px] border border-stone-300 bg-[#f8f3ea] p-5">
            <div className="flex items-center gap-2 text-stone-700">
              <MoonStar className="h-4 w-4" />
                <SectionLabel>Week</SectionLabel>
            </div>
            <div className="mt-5 flex gap-2">
              {dates.map((item, index) => (
                <div
                  key={item.label}
                  className={[
                    "flex min-w-[54px] flex-col items-center rounded-2xl px-3 py-3 text-sm",
                    index === 4 ? "bg-stone-950 text-[#f4efe6]" : "bg-white text-stone-600",
                  ].join(" ")}
                >
                  <span className="text-[11px] uppercase tracking-[0.15em]">{item.day}</span>
                  <span className="mt-2 text-base font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-[24px] border border-stone-300 bg-[#f8f3ea] p-5">
            <SectionLabel>Consistency</SectionLabel>
            <div className="mt-4 grid grid-cols-7 gap-2">
              {Array.from({ length: 28 }, (_, index) => (
                <div
                  key={index}
                  className={[
                    "aspect-square rounded-[10px]",
                    index > 17
                      ? "bg-stone-700"
                      : index > 12
                        ? "bg-stone-400"
                        : "bg-stone-200",
                  ].join(" ")}
                />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function PixelAccentConcept() {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-300 bg-[#f2f4ef] shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
      <div className="min-h-[760px] px-6 py-8 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#456b52]" />
              <SectionLabel>Today</SectionLabel>
            </div>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-slate-950">
              Sunday, 23 Mar
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-slate-300 bg-white p-3">
            {["19", "20", "21", "22", "23", "24"].map((item, index) => (
              <div
                key={item}
                className={[
                  "rounded-xl px-3 py-2 text-center text-sm",
                  index === 4 ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600",
                ].join(" ")}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-3">
            {habits.map((habit) => (
              <div
                key={habit.name}
                className="flex flex-col gap-4 rounded-[22px] border border-slate-300 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <PixelMark active={habit.complete} />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-950">{habit.name}</p>
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] uppercase tracking-[0.14em] text-slate-500">
                        {habit.category}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{habit.progress}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {habit.complete ? (
                    <div className="inline-flex items-center gap-2 rounded-xl bg-[#d5ebc9] px-3 py-2 text-sm text-[#23422d]">
                      <Check className="h-4 w-4" />
                      done
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-600">
                      <Minus className="h-4 w-4" />
                      open
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <aside className="space-y-4">
            <div className="rounded-[22px] border border-slate-300 bg-white p-5">
              <SectionLabel>Status</SectionLabel>
              <div className="mt-4 flex items-center gap-3 text-sm text-slate-600">
                <PixelMark active />
                <span>done</span>
              </div>
              <div className="mt-3 flex items-center gap-3 text-sm text-slate-600">
                <PixelMark active={false} />
                <span>open</span>
              </div>
            </div>

            <div className="rounded-[22px] border border-slate-300 bg-white p-5">
              <SectionLabel>Consistency</SectionLabel>
              <div className="mt-4 grid grid-cols-7 gap-[6px]">
                {Array.from({ length: 35 }, (_, index) => (
                  <div
                    key={index}
                    className={[
                      "aspect-square rounded-[6px] border",
                      index > 20
                        ? "border-slate-900 bg-slate-900"
                        : index > 13
                          ? "border-slate-500 bg-slate-500"
                          : "border-slate-200 bg-slate-100",
                    ].join(" ")}
                  />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function EditorialConcept() {
  return (
    <section className="overflow-hidden rounded-[32px] border border-slate-800/10 bg-[#0d1117] text-[#f3efe7] shadow-[0_32px_120px_rgba(15,23,42,0.28)]">
      <div className="relative min-h-[760px] overflow-hidden px-6 py-8 sm:px-8 lg:px-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,168,97,0.16),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(104,137,219,0.12),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_22%)]" />

        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_320px]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white/60">
                Today
              </span>
              <span className="text-[11px] uppercase tracking-[0.2em] text-white/35">
                23 Mar 2026 / Sunday / 7:19 a.m.
              </span>
            </div>

            <div className="mt-8 max-w-4xl">
              <h2 className="mt-5 text-5xl font-semibold leading-[0.94] tracking-[-0.07em] text-[#f7f2e8] sm:text-6xl lg:text-7xl">
                Sunday, 23 March
              </h2>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Completion</p>
                <p className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[#f7f2e8]">
                  62%
                </p>
                <p className="mt-2 text-sm text-white/50">3 of 6</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Streak</p>
                <p className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[#f7f2e8]">
                  12d
                </p>
                <p className="mt-2 text-sm text-white/50">Current</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Weekly</p>
                <p className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[#f7f2e8]">
                  68%
                </p>
                <p className="mt-2 text-sm text-white/50">Average</p>
              </div>
            </div>

            <div className="mt-10 space-y-3">
              {habits.map((habit) => (
                <div
                  key={habit.name}
                  className="grid gap-4 rounded-[26px] border border-white/10 bg-black/20 px-5 py-5 backdrop-blur-sm sm:grid-cols-[minmax(0,1fr)_140px_130px]"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="truncate text-lg font-medium tracking-[-0.03em] text-[#f7f2e8]">
                        {habit.name}
                      </p>
                      <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-white/45">
                        {habit.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-white/56">{habit.progress}</div>
                  <div className="flex items-center justify-start sm:justify-end">
                    <div
                      className={[
                        "rounded-full px-4 py-2 text-sm",
                        habit.complete
                          ? "bg-[#f7f2e8] text-slate-950"
                          : "border border-white/12 bg-white/[0.03] text-white/72",
                      ].join(" ")}
                    >
                      {habit.complete ? "Done" : "Open"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="relative">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/42">Dates</p>
              <div className="mt-5 space-y-2">
                {dates.map((item, index) => (
                  <div
                    key={`${item.day}-${item.label}`}
                    className={[
                      "flex items-center justify-between rounded-2xl px-4 py-3",
                      index === 4
                        ? "bg-[#f7f2e8] text-slate-950"
                        : "bg-black/20 text-white/58",
                    ].join(" ")}
                  >
                    <span className="text-xs uppercase tracking-[0.16em]">{item.day}</span>
                    <span className="text-lg font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-[#c9a861]">
                <Flame className="h-4 w-4" />
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/42">Consistency</p>
              </div>
              <div className="mt-5 grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }, (_, index) => (
                  <div
                    key={index}
                    className={[
                      "aspect-square rounded-[8px]",
                      index > 24
                        ? "bg-[#f7f2e8]"
                        : index > 16
                          ? "bg-[#8e97ae]"
                          : index > 9
                            ? "bg-[#434c62]"
                            : "bg-white/8",
                    ].join(" ")}
                  />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function WorldbuildingConcept() {
  return (
    <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_32px_120px_rgba(15,23,42,0.08)]">
      <div className="grid min-h-[820px] lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="flex flex-col justify-between border-b border-slate-200 px-7 py-8 lg:border-r lg:border-b-0">
          <div>
            <div className="relative h-36 w-24 overflow-hidden rounded-[20px] border border-slate-200 bg-slate-50">
              <Image
                src="/images/explorer-scene.png"
                alt="Pixel explorer scene"
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
            <p className="mt-6 text-[12px] uppercase tracking-[0.24em] text-slate-400">
              Progress
            </p>
            <h2 className="mt-3 text-[2.1rem] leading-none tracking-[-0.06em] text-slate-950">
              Progress
              <br />
              tracker
            </h2>
          </div>

          <nav className="mt-10 space-y-1.5 text-[15px] text-slate-500">
            {["Today", "Weekly", "Consistency", "Setup", "Archive"].map((item, index) => (
              <div
                key={item}
                className={[
                  "w-fit rounded-lg px-3 py-1.5 transition-colors",
                  index === 0
                    ? "bg-[#E9F2FF] text-[#0C66E4]"
                    : "hover:bg-slate-100 hover:text-slate-700",
                ].join(" ")}
              >
                {item}
              </div>
            ))}
          </nav>

        </aside>

        <main className="grid lg:grid-rows-[auto_minmax(0,1fr)]">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-7 py-7">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Today</p>
              <h3 className="mt-2 text-[2.6rem] leading-none tracking-[-0.06em] text-slate-950">
                Sunday, 23 March
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600">
                3 / 6 complete
              </span>
              <span className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm text-white">
                68% weekly
              </span>
            </div>
          </header>

          <div className="grid min-h-[0] lg:grid-cols-[minmax(0,1.1fr)_360px]">
            <div className="border-b border-slate-200 p-6 lg:border-r lg:border-b-0">
              <div className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-slate-100">
                <div className="relative aspect-[1.15/0.9]">
                  <Image
                    src="/images/lake-scene.png"
                    alt="Pixel landscape scene"
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 60vw, 100vw"
                    priority
                  />
                </div>

                <div className="absolute left-1/2 top-1/2 w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-[20px] border border-white/60 bg-white/82 p-4 shadow-[0_18px_48px_rgba(15,23,42,0.14)] backdrop-blur-md sm:p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-medium tracking-[-0.03em] text-slate-900">
                      List
                    </p>
                    <span className="rounded-md bg-[#E9F2FF] px-2.5 py-1 text-sm text-[#0C66E4]">
                      50%
                    </span>
                  </div>

                  <div className="mt-4 divide-y divide-slate-200/80">
                    {habits.slice(0, 5).map((habit) => (
                      <div key={habit.name} className="flex items-center justify-between gap-4 py-4">
                        <div>
                          <p className="text-base text-slate-900">{habit.name}</p>
                          <p className="mt-1 text-sm text-slate-600">{habit.progress}</p>
                        </div>
                        <div className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 shadow-sm">
                          <Check className="h-4 w-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <aside className="grid grid-rows-[auto_auto_1fr]">
              <div className="border-b border-slate-200 px-7 py-6">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Selected day</p>
                <p className="mt-4 text-4xl leading-[1.02] tracking-[-0.06em] text-slate-950">
                  Sunday, 23 March
                </p>
              </div>

              <div className="border-b border-slate-200 px-7 py-6" />

              <div className="grid gap-5 px-7 py-6">
                <div className="rounded-[20px] border border-slate-200 bg-white p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Week</p>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {dates.map((item, index) => (
                      <div
                        key={item.label}
                        className={[
                          "rounded-xl px-3 py-3 text-center",
                          index === 4
                            ? "bg-[#E9F2FF] text-[#0C66E4]"
                            : "bg-slate-50 text-slate-600",
                        ].join(" ")}
                      >
                        <div className="text-[11px] uppercase tracking-[0.16em]">{item.day}</div>
                        <div className="mt-1 text-base">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[20px] border border-slate-200 bg-white p-5">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-amber-500" />
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Consistency</p>
                  </div>
                  <div className="mt-4 grid grid-cols-7 gap-2">
                    {Array.from({ length: 28 }, (_, index) => (
                      <div
                        key={index}
                        className={[
                          "aspect-square rounded-[10px]",
                          index > 19 ? "bg-slate-900" : index > 12 ? "bg-slate-500" : "bg-slate-200",
                        ].join(" ")}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </section>
  );
}

function ProductMatureConcept() {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
      <div className="grid min-h-[780px] lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="border-b border-slate-200 bg-slate-50/80 px-6 py-7 lg:border-r lg:border-b-0">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Progress tracker</p>
          <div className="mt-6 space-y-1">
            {["Today", "Weekly", "Consistency", "Setup"].map((item, index) => (
              <div
                key={item}
                className={[
                  "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium",
                  index === 0
                    ? "bg-[#E9F2FF] text-[#0C66E4]"
                    : "text-slate-600 hover:bg-white hover:text-slate-900",
                ].join(" ")}
              >
                {item}
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Summary</p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between text-slate-600">
                <span>Completion</span>
                <span className="font-medium text-slate-900">3 / 6</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Weekly average</span>
                <span className="font-medium text-slate-900">68%</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Current streak</span>
                <span className="font-medium text-slate-900">12d</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="grid lg:grid-rows-[auto_auto_minmax(0,1fr)]">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-7 py-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Today</p>
              <h3 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-slate-950">
                Sunday, 23 March
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                3 / 6 complete
              </button>
              <button className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white">
                Review week
              </button>
            </div>
          </header>

          <div className="grid gap-4 border-b border-slate-200 px-7 py-5 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-900">Selected day</p>
                <span className="rounded-md bg-white px-2 py-1 text-xs text-slate-500">
                  23 Mar
                </span>
              </div>
              <div className="mt-4 grid grid-cols-6 gap-2">
                {dates.map((item, index) => (
                  <div
                    key={`${item.day}-${item.label}`}
                    className={[
                      "rounded-lg border px-3 py-3 text-center",
                      index === 4
                        ? "border-[#85B8FF] bg-[#E9F2FF] text-[#0C66E4]"
                        : "border-slate-200 bg-white text-slate-600",
                    ].join(" ")}
                  >
                    <div className="text-[11px] uppercase tracking-[0.14em]">{item.day}</div>
                    <div className="mt-1 text-sm font-medium">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-4">
              <p className="text-sm font-medium text-slate-900">Consistency</p>
              <div className="mt-4 grid grid-cols-7 gap-2">
                {Array.from({ length: 21 }, (_, index) => (
                  <div
                    key={index}
                    className={[
                      "aspect-square rounded-[6px]",
                      index > 14 ? "bg-slate-900" : index > 9 ? "bg-slate-500" : "bg-slate-200",
                    ].join(" ")}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 px-7 py-6 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="rounded-xl border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-4 py-3">
                <p className="text-sm font-medium text-slate-900">Habits</p>
              </div>
              <div className="divide-y divide-slate-200">
                {habits.map((habit) => (
                  <div
                    key={habit.name}
                    className="grid items-center gap-4 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_130px_110px]"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-slate-900">{habit.name}</p>
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] text-slate-500">
                          {habit.category}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-slate-600">{habit.progress}</div>
                    <div className="flex justify-start sm:justify-end">
                      <button
                        className={[
                          "rounded-md px-3 py-2 text-sm font-medium",
                          habit.complete
                            ? "bg-emerald-50 text-emerald-700"
                            : "border border-slate-200 bg-white text-slate-700",
                        ].join(" ")}
                      >
                        {habit.complete ? "Done" : "Open"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-medium text-slate-900">Weekly progress</p>
                <div className="mt-4 space-y-3">
                  {["Design", "Reading", "Workout"].map((item, index) => (
                    <div key={item} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm text-slate-600">
                        <span>{item}</span>
                        <span>{[72, 84, 41][index]}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-slate-900"
                          style={{ width: `${[72, 84, 41][index]}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-amber-500" />
                  <p className="text-sm font-medium text-slate-900">Streaks</p>
                </div>
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Journalling</span>
                    <span className="font-medium text-slate-900">12d</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Reading</span>
                    <span className="font-medium text-slate-900">5d</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Minoxidil</span>
                    <span className="font-medium text-slate-900">4d</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </section>
  );
}

export function UiExplorations() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Explorations</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-slate-950 sm:text-5xl">
            Progress tracker
          </h1>
        </div>

        <div className="mt-10 space-y-12">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-900">1. Worldbuilding / cofounder-inspired</p>
            </div>
            <WorldbuildingConcept />
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-900">2. Product-mature / Atlassian-inspired</p>
            </div>
            <ProductMatureConcept />
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-900">3. Editorial / atmospheric</p>
            </div>
            <EditorialConcept />
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-900">4. Tool-like</p>
            </div>
            <ToolLikeConcept />
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-900">5. Journal-like</p>
            </div>
            <JournalLikeConcept />
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-900">6. Pixel-accent</p>
            </div>
            <PixelAccentConcept />
          </div>
        </div>
      </div>
    </div>
  );
}
