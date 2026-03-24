"use client";

import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  CheckCircle2,
  Cloud,
  Flame,
  LoaderCircle,
  LogIn,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  createHabit,
  getSession,
  loadTrackerState,
  removeHabit,
  seedTrackerState,
  sendMagicLink,
  signOut,
  subscribeToAuthChanges,
  upsertHabitLog,
} from "@/lib/supabase-tracker";
import {
  buildDailyRollup,
  buildHeatmapDays,
  buildWeeklyRangeLabel,
  calculateStreak,
  clampValue,
  formatShortDate,
  getLastNDates,
  getTodayKey,
  startOfWeek,
  toDateInputValue,
} from "@/lib/time";
import {
  ActivityType,
  Habit,
  HabitDraft,
  HabitLogMap,
  HabitPeriod,
  TrackerState,
  emptyTrackerState,
} from "@/lib/tracker-data";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "progress-tracker-v1";
const sectionTabs = [
  { id: "today", label: "Today" },
  { id: "weekly", label: "Weekly" },
  { id: "consistency", label: "Consistency" },
  { id: "setup", label: "Setup" },
] as const;

const categories = ["Health", "Learning", "Spiritual", "Discipline", "Career"] as const;

const categoryTone: Record<string, string> = {
  Health: "border-emerald-100 bg-emerald-50 text-emerald-700",
  Learning: "border-amber-100 bg-amber-50 text-amber-700",
  Spiritual: "border-sky-100 bg-sky-50 text-sky-700",
  Discipline: "border-rose-100 bg-rose-50 text-rose-700",
  Career: "border-violet-100 bg-violet-50 text-violet-700",
};

const defaultDraft: HabitDraft = {
  name: "",
  category: "Health",
  type: "checkbox",
  goalTarget: 1,
  goalPeriod: "daily",
};

function readStoredState(): TrackerState {
  if (typeof window === "undefined") {
    return emptyTrackerState;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return emptyTrackerState;
  }

  try {
    const parsed = JSON.parse(raw) as TrackerState;

    return {
      habits: parsed.habits ?? emptyTrackerState.habits,
      logs: parsed.logs ?? emptyTrackerState.logs,
    };
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return emptyTrackerState;
  }
}

function completionLabel(habit: Habit, value: number) {
  if (habit.type === "checkbox") {
    return value >= 1 ? "Done" : "Open";
  }

  const unit = habit.type === "minutes" ? "min" : "count";
  return `${value}/${habit.goalTarget} ${unit}`;
}

function inputStep(type: ActivityType) {
  return type === "checkbox" ? 1 : 5;
}

function isRemoteSession(session: Session | null) {
  return Boolean(isSupabaseConfigured && session?.user);
}

function metricCopy(habit: Habit) {
  if (habit.type === "minutes") {
    return "min";
  }

  if (habit.type === "count") {
    return "count";
  }

  return "check";
}

function heatmapTone(intensity: number) {
  if (intensity === 0) {
    return "bg-slate-100";
  }

  if (intensity === 1) {
    return "bg-slate-300";
  }

  if (intensity === 2) {
    return "bg-slate-500";
  }

  if (intensity === 3) {
    return "bg-slate-700";
  }

  return "bg-slate-900";
}

function normalizeHabitName(name: string) {
  return name.trim().toLowerCase();
}

function formatLongDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(`${value}T00:00:00`));
}

export function HabitDashboard() {
  const [storedState] = useState<TrackerState>(() => readStoredState());
  const [habits, setHabits] = useState<Habit[]>(storedState.habits);
  const [logs, setLogs] = useState<HabitLogMap>(storedState.logs);
  const [draft, setDraft] = useState<HabitDraft>(defaultDraft);
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [statusMessage, setStatusMessage] = useState(
    isSupabaseConfigured
      ? "Connect your email to sync progress across devices."
      : "Local mode is active. Add Supabase keys when you are ready for cloud sync.",
  );
  const [isBootstrapping, setIsBootstrapping] = useState(isSupabaseConfigured);
  const [isSendingLink, setIsSendingLink] = useState(false);
  const [isRemoteBusy, setIsRemoteBusy] = useState(false);
  const [activeTab, setActiveTab] = useState<(typeof sectionTabs)[number]["id"]>("today");
  const [localTodayKey, setLocalTodayKey] = useState(() => getTodayKey());
  const [selectedDateKey, setSelectedDateKey] = useState(() => getTodayKey());

  const todayKey = localTodayKey;
  const currentWeekStart = useMemo(
    () => startOfWeek(new Date(`${selectedDateKey}T00:00:00`)),
    [selectedDateKey],
  );
  const selectedDateLabel = useMemo(() => formatLongDate(selectedDateKey), [selectedDateKey]);
  const todayLogs = useMemo(() => logs[selectedDateKey] ?? {}, [logs, selectedDateKey]);
  const lastSevenDays = useMemo(() => getLastNDates(7, selectedDateKey), [selectedDateKey]);
  const canUseCloud = isRemoteSession(session);
  const hasLocalImportData = useMemo(
    () =>
      storedState.habits.length > 0 &&
      Object.values(storedState.logs).some((dayLogs) =>
        Object.values(dayLogs).some((value) => value > 0),
      ),
    [storedState],
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ habits, logs }));
  }, [habits, logs]);

  useEffect(() => {
    const syncLocalDate = () => setLocalTodayKey(getTodayKey());
    syncLocalDate();
    const interval = window.setInterval(syncLocalDate, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const currentLocalDate = getTodayKey();
    setSelectedDateKey((current) => (current === todayKey ? currentLocalDate : current));
  }, [todayKey]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    let active = true;

    async function bootstrapAuth() {
      try {
        const nextSession = await getSession();

        if (!active) {
          return;
        }

        setSession(nextSession);
        setEmail(nextSession?.user.email ?? "");

        if (nextSession?.user) {
          await refreshFromSupabase();
        } else {
          setStatusMessage("Signed out. Local data remains on this device.");
        }
      } catch (error) {
        if (!active) {
          return;
        }

        setStatusMessage(
          error instanceof Error ? error.message : "Could not connect to Supabase.",
        );
      } finally {
        if (active) {
          setIsBootstrapping(false);
        }
      }
    }

    const unsubscribe = subscribeToAuthChanges((nextSession) => {
      setSession(nextSession);
      setEmail(nextSession?.user.email ?? "");

      if (nextSession?.user) {
        void refreshFromSupabase();
      } else {
        const local = readStoredState();
        setHabits(local.habits);
        setLogs(local.logs);
        setStatusMessage("Signed out. Local data remains on this device.");
      }
    });

    void bootstrapAuth();

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  async function refreshFromSupabase() {
    setIsRemoteBusy(true);

    try {
      const trackerState = await loadTrackerState();
      setHabits(trackerState.habits);
      setLogs(trackerState.logs);
      setStatusMessage(
        trackerState.habits.length > 0
          ? "Synced with Supabase."
          : "Cloud account ready. Add habits or load the starter set.",
      );
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Cloud sync failed.");
    } finally {
      setIsRemoteBusy(false);
    }
  }

  const dailyCompletion = useMemo(() => {
    const completed = habits.filter((habit) => {
      const value = todayLogs[habit.id] ?? 0;
      return value >= habit.goalTarget;
    }).length;

    return habits.length === 0 ? 0 : Math.round((completed / habits.length) * 100);
  }, [habits, todayLogs]);

  const completedTodayCount = useMemo(
    () =>
      habits.filter((habit) => {
        const value = todayLogs[habit.id] ?? 0;
        return value >= habit.goalTarget;
      }).length,
    [habits, todayLogs],
  );

  const weeklySummary = useMemo(() => {
    return habits.map((habit) => {
      if (habit.goalPeriod === "daily") {
        const completedDays = lastSevenDays.filter((day) => {
          const value = logs[day]?.[habit.id] ?? 0;
          return value >= habit.goalTarget;
        }).length;

        return {
          habit,
          actual: completedDays,
          target: 7,
          percent: Math.round((completedDays / 7) * 100),
          helper: `${completedDays}/7 days`,
        };
      }

      const total = lastSevenDays.reduce((sum, day) => sum + (logs[day]?.[habit.id] ?? 0), 0);
      const percent = Math.round((Math.min(total, habit.goalTarget) / habit.goalTarget) * 100);

      return {
        habit,
        actual: total,
        target: habit.goalTarget,
        percent,
        helper:
          habit.type === "minutes"
            ? `${total}/${habit.goalTarget} min`
            : `${total}/${habit.goalTarget}`,
      };
    });
  }, [habits, lastSevenDays, logs]);

  const streaks = useMemo(() => {
    return habits
      .map((habit) => ({ habit, days: calculateStreak(habit, logs) }))
      .sort((left, right) => right.days - left.days);
  }, [habits, logs]);

  const heatmapDays = useMemo(() => buildHeatmapDays(habits, logs), [habits, logs]);
  const bestDay = useMemo(() => buildDailyRollup(habits, logs), [habits, logs]);
  const weeklyAverage = weeklySummary.length
    ? Math.round(
        weeklySummary.reduce((sum, item) => sum + Math.min(item.percent, 100), 0) /
          weeklySummary.length,
      )
    : 0;

  async function persistLog(habit: Habit, value: number) {
    const nextValue = clampValue(value);

    setLogs((current) => ({
      ...current,
      [selectedDateKey]: {
        ...(current[selectedDateKey] ?? {}),
        [habit.id]: nextValue,
      },
    }));

    if (!canUseCloud) {
      return;
    }

    try {
      await upsertHabitLog(habit.id, selectedDateKey, nextValue);
      setStatusMessage(`Saved ${habit.name} to cloud sync.`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not save your progress.");
    }
  }

  function toggleCheckbox(habit: Habit) {
    const value = todayLogs[habit.id] ?? 0;
    void persistLog(habit, value >= 1 ? 0 : 1);
  }

  function updateNumericHabit(habit: Habit, nextValue: string) {
    const parsed = Number(nextValue);
    void persistLog(habit, Number.isFinite(parsed) ? parsed : 0);
  }

  async function addHabit() {
    if (!draft.name.trim()) {
      return;
    }

    const nextHabit: Habit = {
      id: crypto.randomUUID(),
      name: draft.name.trim(),
      category: draft.category,
      type: draft.type,
      goalTarget: draft.type === "checkbox" ? 1 : clampValue(draft.goalTarget),
      goalPeriod: draft.goalPeriod,
      createdAt: new Date().toISOString(),
    };

    if (canUseCloud) {
      try {
        const savedHabit = await createHabit(nextHabit);
        setHabits((current) => [savedHabit, ...current]);
        setStatusMessage(`${savedHabit.name} added to your synced dashboard.`);
      } catch (error) {
        setStatusMessage(error instanceof Error ? error.message : "Could not create the habit.");
        return;
      }
    } else {
      setHabits((current) => [nextHabit, ...current]);
    }

    setDraft(defaultDraft);
  }

  async function deleteHabit(id: string) {
    const habitName = habits.find((habit) => habit.id === id)?.name ?? "Habit";

    setHabits((current) => current.filter((habit) => habit.id !== id));
    setLogs((current) =>
      Object.fromEntries(
        Object.entries(current).map(([day, dayLogs]) => {
          const nextDayLogs = { ...dayLogs };
          delete nextDayLogs[id];
          return [day, nextDayLogs];
        }),
      ),
    );

    if (!canUseCloud) {
      return;
    }

    try {
      await removeHabit(id);
      setStatusMessage(`${habitName} removed from your synced dashboard.`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not delete the habit.");
      await refreshFromSupabase();
    }
  }

  async function handleMagicLink() {
    if (!email.trim()) {
      setStatusMessage("Add your email first so a login link has somewhere to go.");
      return;
    }

    setIsSendingLink(true);

    try {
      await sendMagicLink(email.trim());
      setStatusMessage("Magic link sent. Open it from your email to sign in.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not send magic link.");
    } finally {
      setIsSendingLink(false);
    }
  }

  async function handleSeedStarterHabits() {
    if (!canUseCloud) {
      return;
    }

    setIsRemoteBusy(true);

    try {
      const seeded = await seedTrackerState();
      setHabits(seeded.habits);
      setLogs(seeded.logs);
      setStatusMessage("Starter habits loaded into your cloud account.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not load starter habits.");
    } finally {
      setIsRemoteBusy(false);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not sign out.");
    }
  }

  async function handleImportLocalData() {
    if (!canUseCloud) {
      return;
    }

    setIsRemoteBusy(true);

    try {
      const sourceState = storedState;
      const cloudState = await loadTrackerState();
      const habitMap = new Map(
        cloudState.habits.map((habit) => [normalizeHabitName(habit.name), habit]),
      );
      const localToCloudId = new Map<string, string>();

      for (const localHabit of sourceState.habits) {
        const existingHabit = habitMap.get(normalizeHabitName(localHabit.name));

        if (existingHabit) {
          localToCloudId.set(localHabit.id, existingHabit.id);
          continue;
        }

        const createdHabit = await createHabit({
          ...localHabit,
          id: crypto.randomUUID(),
        });

        habitMap.set(normalizeHabitName(createdHabit.name), createdHabit);
        localToCloudId.set(localHabit.id, createdHabit.id);
      }

      for (const [logDate, dayLogs] of Object.entries(sourceState.logs)) {
        for (const [localHabitId, value] of Object.entries(dayLogs)) {
          if (value <= 0) {
            continue;
          }

          const cloudHabitId = localToCloudId.get(localHabitId);

          if (!cloudHabitId) {
            continue;
          }

          await upsertHabitLog(cloudHabitId, logDate, value);
        }
      }

      await refreshFromSupabase();
      setStatusMessage("Imported your localhost progress into cloud sync.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not import local data.");
    } finally {
      setIsRemoteBusy(false);
    }
  }

  const syncBadge = isSupabaseConfigured
    ? canUseCloud
      ? "Cloud sync on"
      : "Cloud ready"
    : "Local only";

  function renderTodayView() {
    const isViewingToday = selectedDateKey === todayKey;

    return (
      <div className="space-y-10">
        <section className="grid gap-10 lg:grid-cols-[180px_minmax(0,1fr)]">
          <div className="pt-3">
            <p className="text-sm leading-6 text-slate-400">Progress tracker</p>
            <p className="text-xl leading-tight text-slate-900">Today</p>
          </div>

          <div className="space-y-8">
            <div className="max-w-4xl">
              <h1 className="text-4xl leading-[1.02] tracking-[-0.06em] text-slate-950 sm:text-5xl lg:text-6xl">
                {selectedDateLabel}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#85B8FF] px-3 py-1 text-sm text-[#0C66E4]">
                {completedTodayCount} / {habits.length}
              </span>
              <span className="rounded-full border border-[#85B8FF] px-3 py-1 text-sm text-[#0C66E4]">
                {dailyCompletion}%
              </span>
              <span className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-500">
                {weeklyAverage}% weekly
              </span>
            </div>

            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
              <div className="space-y-3">
                {habits.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 px-5 py-10 text-sm text-slate-500">
                    No habits yet.
                  </div>
                ) : (
                  habits.map((habit) => {
                    const value = todayLogs[habit.id] ?? 0;
                    const percent = Math.min(100, Math.round((value / habit.goalTarget) * 100));
                    const complete = value >= habit.goalTarget;

                    return (
                      <div
                        key={habit.id}
                        className="grid gap-4 rounded-2xl border border-slate-200 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_140px_170px_44px]"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-medium text-slate-900">
                              {habit.name}
                            </p>
                            <Badge
                              variant="outline"
                              className={cn("border", categoryTone[habit.category])}
                            >
                              {habit.category}
                            </Badge>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                            <span>
                              {habit.goalPeriod === "daily" ? "Daily" : "Weekly"} {habit.goalTarget}{" "}
                              {metricCopy(habit)}
                            </span>
                            <span>{completionLabel(habit, value)}</span>
                          </div>
                          <div className="mt-3 h-1 rounded-full bg-slate-100">
                            <div
                              className={cn(
                                "h-1 rounded-full",
                                complete ? "bg-[#0C66E4]" : "bg-slate-900",
                              )}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center text-sm text-slate-600">
                          {habit.type === "checkbox" ? "1 / 1" : `${value} ${metricCopy(habit)}`}
                        </div>

                        <div className="flex items-center">
                          {habit.type === "checkbox" ? (
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full rounded-full",
                                complete && "border-[#85B8FF] text-[#0C66E4]",
                              )}
                              onClick={() => toggleCheckbox(habit)}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              {complete ? "Done" : "Open"}
                            </Button>
                          ) : (
                            <div className="flex w-full items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5">
                              <Input
                                className="h-8 w-full border-0 bg-transparent px-1 text-right shadow-none focus-visible:ring-0"
                                min={0}
                                step={inputStep(habit.type)}
                                type="number"
                                value={value}
                                onChange={(event) => updateNumericHabit(habit, event.target.value)}
                              />
                              <span className="text-xs text-slate-500">{metricCopy(habit)}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-end">
                          <Button variant="ghost" size="icon" onClick={() => void deleteHabit(habit.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 p-5">
                  <p className="text-sm text-slate-400">Selected day</p>
                  <div className="mt-4 space-y-3">
                    <Input
                      type="date"
                      className="h-10 rounded-full border-slate-200 shadow-none focus-visible:ring-[#0C66E4]/20"
                      value={selectedDateKey}
                      max={toDateInputValue(new Date())}
                      onChange={(event) => setSelectedDateKey(event.target.value)}
                    />
                    {!isViewingToday ? (
                      <Button
                        variant="outline"
                        className="w-full rounded-full border-[#85B8FF] text-[#0C66E4]"
                        onClick={() => setSelectedDateKey(todayKey)}
                      >
                        Jump to today
                      </Button>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-5">
                  <p className="text-sm text-slate-400">Week</p>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {lastSevenDays.slice(-6).map((date) => (
                      <button
                        key={date}
                        className={cn(
                          "rounded-2xl border px-3 py-3 text-center",
                          date === selectedDateKey
                            ? "border-[#85B8FF] text-[#0C66E4]"
                            : "border-slate-200 text-slate-500",
                        )}
                        onClick={() => setSelectedDateKey(date)}
                      >
                        <div className="text-[11px] uppercase tracking-[0.14em]">
                          {formatShortDate(date).split(",")[0]}
                        </div>
                        <div className="mt-1 text-sm">{date.slice(8, 10)}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  function renderWeeklyView() {
    return (
      <div className="grid gap-10 lg:grid-cols-[180px_minmax(0,1fr)]">
        <div className="pt-3">
          <p className="text-sm leading-6 text-slate-400">Progress tracker</p>
          <p className="text-xl leading-tight text-slate-900">Weekly</p>
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-5">
            <div>
              <h2 className="text-4xl leading-[1.02] tracking-[-0.06em] text-slate-950 sm:text-5xl">
                Weekly progress
              </h2>
              <p className="mt-3 text-sm text-slate-500">{buildWeeklyRangeLabel(currentWeekStart)}</p>
            </div>

            <div className="space-y-4">
              {weeklySummary.map(({ habit, actual, target, percent, helper }) => (
                <div key={habit.id} className="rounded-2xl border border-slate-200 px-4 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{habit.name}</p>
                      <p className="text-xs text-slate-500">{helper}</p>
                    </div>
                    <span className="text-sm text-slate-600">
                      {actual}/{target}
                    </span>
                  </div>
                  <div className="mt-3">
                    <Progress value={percent} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-amber-500" />
              <p className="text-sm text-slate-900">Streaks</p>
            </div>
            <div className="mt-4 space-y-4">
              {streaks.slice(0, 5).map(({ habit, days }) => (
                <div key={habit.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{habit.name}</p>
                    <p className="text-xs text-slate-500">{habit.category}</p>
                  </div>
                  <span className="text-sm text-slate-700">{days}d</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderConsistencyView() {
    return (
      <div className="grid gap-10 lg:grid-cols-[180px_minmax(0,1fr)]">
        <div className="pt-3">
          <p className="text-sm leading-6 text-slate-400">Progress tracker</p>
          <p className="text-xl leading-tight text-slate-900">Consistency</p>
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-5">
            <div>
              <h2 className="text-4xl leading-[1.02] tracking-[-0.06em] text-slate-950 sm:text-5xl">
                Consistency
              </h2>
              <p className="mt-3 text-sm text-slate-500">
                {bestDay.best.date ? `Best day: ${formatShortDate(bestDay.best.date)}` : "No history yet"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5">
              <div className="grid grid-cols-7 gap-2 sm:grid-cols-12 lg:grid-cols-14">
                {heatmapDays.map(({ date, intensity, completed, total }) => (
                  <div key={date}>
                    <div
                      className={cn(
                        "aspect-square rounded-md border border-slate-200",
                        heatmapTone(intensity),
                      )}
                      title={`${formatShortDate(date)}: ${completed}/${total}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="text-sm text-slate-400">Best day</p>
              <p className="mt-2 text-sm text-slate-700">
                {bestDay.best.date
                  ? `${formatShortDate(bestDay.best.date)} · ${bestDay.best.completed}/${bestDay.best.total}`
                  : "No history yet."}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="text-sm text-slate-400">Active habits</p>
              <p className="mt-2 text-sm text-slate-700">{habits.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="text-sm text-slate-400">Current view</p>
              <p className="mt-2 text-sm text-slate-700">{selectedDateLabel}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderSetupView() {
    return (
      <div className="grid gap-10 lg:grid-cols-[180px_minmax(0,1fr)]">
        <div className="pt-3">
          <p className="text-sm leading-6 text-slate-400">Progress tracker</p>
          <p className="text-xl leading-tight text-slate-900">Setup</p>
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-2xl border border-slate-200 p-5">
            <p className="text-sm font-medium text-slate-900">Add habit</p>
            <div className="mt-4 space-y-3">
              <Input
                placeholder="Habit name"
                value={draft.name}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, name: event.target.value }))
                }
              />

              <select
                className="flex h-9 w-full rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-900 shadow-none outline-none focus-visible:ring-2 focus-visible:ring-[#0C66E4]/15"
                value={draft.category}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, category: event.target.value }))
                }
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-3">
                <select
                  className="flex h-9 w-full rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-900 shadow-none outline-none focus-visible:ring-2 focus-visible:ring-[#0C66E4]/15"
                  value={draft.type}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      type: event.target.value as ActivityType,
                      goalTarget: event.target.value === "checkbox" ? 1 : current.goalTarget,
                    }))
                  }
                >
                  <option value="checkbox">Checkbox</option>
                  <option value="count">Count</option>
                  <option value="minutes">Minutes</option>
                </select>

                <select
                  className="flex h-9 w-full rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-900 shadow-none outline-none focus-visible:ring-2 focus-visible:ring-[#0C66E4]/15"
                  value={draft.goalPeriod}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      goalPeriod: event.target.value as HabitPeriod,
                    }))
                  }
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <Input
                type="number"
                min={1}
                step={inputStep(draft.type)}
                disabled={draft.type === "checkbox"}
                value={draft.goalTarget}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    goalTarget: Number(event.target.value),
                  }))
                }
              />

              <Button className="w-full rounded-full bg-slate-900 text-white hover:bg-slate-800" onClick={() => void addHabit()}>
                <Plus className="h-4 w-4" />
                Add habit
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="text-sm text-slate-400">Sync</p>
              <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">
                {statusMessage}
              </div>
            </div>

            {isSupabaseConfigured ? (
              canUseCloud ? (
                <div className="space-y-3 rounded-2xl border border-slate-200 p-5">
                  <div className="rounded-2xl border border-slate-200 px-3 py-3">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Signed in</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{session?.user.email}</p>
                  </div>
                  {habits.length === 0 ? (
                    <Button
                      variant="outline"
                      className="w-full rounded-full border-[#85B8FF] text-[#0C66E4]"
                      onClick={() => void handleSeedStarterHabits()}
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Load starter habits
                    </Button>
                  ) : null}
                  <Button variant="outline" className="w-full rounded-full" onClick={() => void refreshFromSupabase()}>
                    <RefreshCw className="h-4 w-4" />
                    Refresh from cloud
                  </Button>
                  <Button variant="ghost" className="w-full rounded-full" onClick={() => void handleSignOut()}>
                    Sign out
                  </Button>
                  {hasLocalImportData ? (
                    <Button variant="outline" className="w-full rounded-full" onClick={() => void handleImportLocalData()}>
                      Import local data
                    </Button>
                  ) : null}
                </div>
              ) : (
                <div className="space-y-3 rounded-2xl border border-slate-200 p-5">
                  <Input
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                  <Button
                    className="w-full rounded-full bg-slate-900 text-white hover:bg-slate-800"
                    disabled={isSendingLink}
                    onClick={() => void handleMagicLink()}
                  >
                    <LogIn className="h-4 w-4" />
                    {isSendingLink ? "Sending link..." : "Send magic link"}
                  </Button>
                </div>
              )
            ) : (
              <div className="rounded-2xl border border-slate-200 p-5 text-sm text-slate-500">
                Supabase keys are not set yet, so this build is staying in local mode.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-[1500px] px-6 py-8">
        <header className="flex flex-wrap items-center justify-between gap-6 border-b border-slate-100 pb-8">
          <div className="mx-auto flex items-center gap-2 rounded-full bg-slate-100/70 p-1 sm:mx-0">
            {sectionTabs.map((tab) => (
              <button
                key={tab.id}
                className={cn(
                  "rounded-full px-5 py-3 text-sm transition-colors",
                  activeTab === tab.id
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-600 hover:text-slate-950",
                )}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="rounded-full border-[#85B8FF] text-[#0C66E4]">
              <Cloud className="mr-1 h-3.5 w-3.5" />
              {syncBadge}
            </Badge>
            <Badge variant="outline" className="rounded-full text-slate-500">
              {formatShortDate(selectedDateKey)}
            </Badge>
            {(isBootstrapping || isRemoteBusy) ? (
              <Badge variant="outline" className="rounded-full gap-1">
                <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                Working
              </Badge>
            ) : null}
          </div>
        </header>

        <div className="mt-12">
          {activeTab === "today" ? renderTodayView() : null}
          {activeTab === "weekly" ? renderWeeklyView() : null}
          {activeTab === "consistency" ? renderConsistencyView() : null}
          {activeTab === "setup" ? renderSetupView() : null}
        </div>
      </div>
    </main>
  );
}
