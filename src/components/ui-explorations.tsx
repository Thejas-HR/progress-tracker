"use client";

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
  { name: "No porn", category: "Discipline", progress: "done", complete: true },
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
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Tracker</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">Tool-like</h2>
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
            <SectionLabel>Rhythm</SectionLabel>
            <p className="mt-3 text-3xl font-semibold">68%</p>
            <p className="mt-1 text-sm text-slate-400">weekly average</p>
          </div>
        </aside>

        <main className="px-6 py-8 sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <SectionLabel>Today</SectionLabel>
              <h3 className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-slate-950">
                Sunday, 23 Mar
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                A denser, calmer control panel where logging is the main action and everything
                else stays peripheral.
              </p>
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
                  {habit.complete ? "Logged" : "Update"}
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
                <p className="text-sm font-medium text-slate-900">Current streaks</p>
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
          <SectionLabel>Daily sheet</SectionLabel>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4 border-b border-stone-300 pb-6">
            <div>
              <h2 className="text-5xl font-semibold tracking-[-0.06em] text-stone-950">
                23 March
              </h2>
              <p className="mt-2 text-lg text-stone-600">Sunday morning check-in</p>
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
              <SectionLabel>Week rhythm</SectionLabel>
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
            <SectionLabel>Notes</SectionLabel>
            <p className="mt-4 text-sm leading-7 text-stone-700">
              A quieter layout that treats the tracker more like a daily practice sheet than a
              dashboard. Good if you want the app to feel reflective rather than operational.
            </p>
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
              <SectionLabel>Pixel accent</SectionLabel>
            </div>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-slate-950">
              Sunday, 23 Mar
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Clean structure with tiny pixel motifs used as markers, controls, and category
              accents instead of turning the whole interface retro.
            </p>
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
                      logged
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
              <SectionLabel>Legend</SectionLabel>
              <div className="mt-4 flex items-center gap-3 text-sm text-slate-600">
                <PixelMark active />
                <span>complete</span>
              </div>
              <div className="mt-3 flex items-center gap-3 text-sm text-slate-600">
                <PixelMark active={false} />
                <span>still open</span>
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

export function UiExplorations() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">UI explorations</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-slate-950 sm:text-5xl">
            Three different ways this tracker could feel
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Same product, same data, different visual language. This page is only for exploring
            layout and tone before touching the main experience.
          </p>
        </div>

        <div className="mt-10 space-y-12">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-900">1. Tool-like</p>
              <p className="text-sm text-slate-600">
                Denser, calmer, and more operational. Best if you want it to feel like a serious
                personal control panel.
              </p>
            </div>
            <ToolLikeConcept />
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-900">2. Journal-like</p>
              <p className="text-sm text-slate-600">
                Softer and more date-led. Best if you want the tracker to feel like a daily ritual
                rather than a dashboard.
              </p>
            </div>
            <JournalLikeConcept />
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-900">3. Pixel-accent</p>
              <p className="text-sm text-slate-600">
                Modern layout with tiny pixel motifs. Best if you want a bit of character without
                making the whole app look like a game.
              </p>
            </div>
            <PixelAccentConcept />
          </div>
        </div>
      </div>
    </div>
  );
}
