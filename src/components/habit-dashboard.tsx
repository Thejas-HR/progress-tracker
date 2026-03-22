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
} from "@/lib/time";
import {
  ActivityType,
  Habit,
  HabitDraft,
  HabitLogMap,
  HabitPeriod,
  emptyTrackerState,
  habitTypeCopy,
  TrackerState,
} from "@/lib/tracker-data";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

const STORAGE_KEY = "progress-tracker-v1";
const sectionTabs = [
  { id: "today", label: "Today" },
  { id: "weekly", label: "Weekly" },
  { id: "consistency", label: "Consistency" },
  { id: "setup", label: "Setup" },
] as const;

const categories = ["Health", "Learning", "Spiritual", "Discipline", "Career"] as const;

const categoryTone: Record<string, string> = {
  Health: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Learning: "bg-amber-50 text-amber-700 border-amber-100",
  Spiritual: "bg-sky-50 text-sky-700 border-sky-100",
  Discipline: "bg-rose-50 text-rose-700 border-rose-100",
  Career: "bg-violet-50 text-violet-700 border-violet-100",
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
    return value >= 1 ? "Completed" : "Open";
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

  const todayKey = getTodayKey();
  const currentWeekStart = useMemo(() => startOfWeek(new Date()), []);
  const todayLogs = useMemo(() => logs[todayKey] ?? {}, [logs, todayKey]);
  const lastSevenDays = useMemo(() => getLastNDates(7), []);
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

  useEffect(() => {
    const observers = sectionTabs
      .map(({ id }) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (observers.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

        if (visible?.target?.id) {
          setActiveTab(visible.target.id as (typeof sectionTabs)[number]["id"]);
        }
      },
      {
        rootMargin: "-30% 0px -55% 0px",
        threshold: [0.1, 0.25, 0.5, 0.75],
      },
    );

    observers.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
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
          helper: `${completedDays}/7 days hit`,
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
            ? `${total}/${habit.goalTarget} min this week`
            : `${total}/${habit.goalTarget} this week`,
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
      [todayKey]: {
        ...(current[todayKey] ?? {}),
        [habit.id]: nextValue,
      },
    }));

    if (!canUseCloud) {
      return;
    }

    try {
      await upsertHabitLog(habit.id, todayKey, nextValue);
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

  function handleTabClick(sectionId: (typeof sectionTabs)[number]["id"]) {
    setActiveTab(sectionId);
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <Badge variant="outline" className="w-fit border-slate-200 text-slate-600">
              Progress Tracker
            </Badge>
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Daily system, weekly signal
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-500">
                Track what matters, keep the logging friction low, and measure your progress
                against your own targets.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Cloud className="h-3.5 w-3.5" />
              {syncBadge}
            </Badge>
            {(isBootstrapping || isRemoteBusy) && (
              <Badge variant="outline" className="gap-1">
                <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                Working
              </Badge>
            )}
            <Badge variant="outline" className="text-slate-500">
              {formatShortDate(todayKey)}
            </Badge>
          </div>
        </header>

        <div className="sticky top-0 z-20 -mx-4 border-b border-slate-200/80 bg-slate-50/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-slate-50/80 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="overflow-x-auto">
            <div className="flex min-w-max items-center gap-2">
              {sectionTabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "rounded-full",
                    activeTab === tab.id
                      ? "bg-slate-950 text-white"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
                  )}
                  onClick={() => handleTabClick(tab.id)}
                >
                  {tab.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="grid gap-6">
            <Card id="today" className="scroll-mt-28">
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <div className="space-y-1">
                  <CardTitle>Today</CardTitle>
                  <CardDescription>
                    Clean, fast logging for the habits you want to touch every day.
                  </CardDescription>
                </div>
                <div className="hidden items-center gap-2 md:flex">
                  <Badge variant="outline">{completedTodayCount} complete</Badge>
                  <Badge variant="secondary">{dailyCompletion}% today</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Today</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">{dailyCompletion}%</p>
                    <p className="text-xs text-slate-500">Completion rate</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Completed</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      {completedTodayCount}/{habits.length}
                    </p>
                    <p className="text-xs text-slate-500">Habits at target</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">This week</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">{weeklyAverage}%</p>
                    <p className="text-xs text-slate-500">Average progress</p>
                  </div>
                </div>

                {habits.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                    No habits yet. Add your first one from the setup panel.
                  </div>
                ) : (
                  habits.map((habit) => {
                    const value = todayLogs[habit.id] ?? 0;
                    const percent = Math.min(100, Math.round((value / habit.goalTarget) * 100));
                    const complete = value >= habit.goalTarget;

                    return (
                      <div
                        key={habit.id}
                        className="rounded-lg border border-slate-200 bg-white px-4 py-3"
                      >
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                          <div className="min-w-0 space-y-2">
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
                              <Badge variant="secondary">{habitTypeCopy[habit.type]}</Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                              <span>
                                {habit.goalPeriod === "daily" ? "Daily" : "Weekly"} target:{" "}
                                {habit.goalTarget} {metricCopy(habit)}
                              </span>
                              <span>{completionLabel(habit, value)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {habit.type === "checkbox" ? (
                              <Button
                                variant={complete ? "secondary" : "default"}
                                size="sm"
                                onClick={() => toggleCheckbox(habit)}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                {complete ? "Done" : "Mark done"}
                              </Button>
                            ) : (
                              <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2 py-1">
                                <Input
                                  className="h-8 w-20 border-0 bg-transparent px-1 text-right shadow-none focus-visible:ring-0"
                                  min={0}
                                  step={inputStep(habit.type)}
                                  type="number"
                                  value={value}
                                  onChange={(event) => updateNumericHabit(habit, event.target.value)}
                                />
                                <span className="text-xs text-slate-500">{metricCopy(habit)}</span>
                              </div>
                            )}

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => void deleteHabit(habit.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="mt-3">
                          <Progress
                            value={percent}
                            indicatorClassName={complete ? "bg-emerald-600" : "bg-slate-900"}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <Card id="weekly" className="scroll-mt-28">
                <CardHeader>
                  <CardTitle>Weekly progress</CardTitle>
                  <CardDescription>
                    {buildWeeklyRangeLabel(currentWeekStart)} across daily and weekly goals.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {weeklySummary.map(({ habit, actual, target, percent, helper }) => (
                    <div key={habit.id} className="space-y-2">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{habit.name}</p>
                          <p className="text-xs text-slate-500">{helper}</p>
                        </div>
                        <span className="text-xs font-medium text-slate-600">
                          {actual}/{target}
                        </span>
                      </div>
                      <Progress value={percent} />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Streaks</CardTitle>
                  <CardDescription>Small wins compound.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {streaks.slice(0, 5).map(({ habit, days }) => (
                    <div key={habit.id} className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">{habit.name}</p>
                        <p className="text-xs text-slate-500">{habit.category}</p>
                      </div>
                      <div className="flex items-center gap-1 text-sm font-medium text-slate-700">
                        <Flame className="h-4 w-4 text-amber-500" />
                        {days}d
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card id="consistency" className="scroll-mt-28">
              <CardHeader>
                <CardTitle>Consistency map</CardTitle>
                <CardDescription>
                  Last 12 weeks at a glance. Your strongest day was{" "}
                  {bestDay.best.date ? formatShortDate(bestDay.best.date) : "still loading"}.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-7 gap-2 sm:grid-cols-12 lg:grid-cols-14">
                  {heatmapDays.map(({ date, intensity, completed, total }) => (
                    <div key={date} className="space-y-1">
                      <div
                        className={cn(
                          "aspect-square rounded-md border border-slate-200",
                          heatmapTone(intensity),
                        )}
                        title={`${formatShortDate(date)}: ${completed}/${total} goals hit`}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Less consistent</span>
                  <div className="flex items-center gap-1">
                    {[0, 1, 2, 3, 4].map((intensity) => (
                      <div
                        key={intensity}
                        className={cn(
                          "h-3 w-3 rounded-[4px] border border-slate-200",
                          heatmapTone(intensity),
                        )}
                      />
                    ))}
                  </div>
                  <span>More consistent</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="grid gap-6">
            <Card id="setup" className="scroll-mt-28">
              <CardHeader>
                <CardTitle>Setup</CardTitle>
                <CardDescription>Keep admin tasks off the main flow, but close at hand.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Add habit</p>
                    <p className="text-xs text-slate-500">
                      Create a new tracker without leaving the dashboard.
                    </p>
                  </div>
                  <Input
                    placeholder="Habit name"
                    value={draft.name}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, name: event.target.value }))
                    }
                  />

                  <select
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-900 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-slate-950/10"
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
                      className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-900 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-slate-950/10"
                      value={draft.type}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          type: event.target.value as ActivityType,
                          goalTarget: event.target.value === "checkbox" ? 1 : current.goalTarget,
                        }))
                      }
                    >
                      {Object.entries(habitTypeCopy).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>

                    <select
                      className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-900 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-slate-950/10"
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

                  <Button className="w-full" onClick={() => void addHabit()}>
                    <Plus className="h-4 w-4" />
                    Add habit
                  </Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Sync and access</p>
                    <p className="text-xs text-slate-500">
                      Sign in if you want the same dashboard on laptop and phone.
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    {statusMessage}
                  </div>

                  {isSupabaseConfigured ? (
                    canUseCloud ? (
                      <div className="space-y-3">
                        <div className="rounded-lg border border-slate-200 px-3 py-2">
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            Signed in
                          </p>
                          <p className="mt-1 text-sm font-medium text-slate-900">
                            {session?.user.email}
                          </p>
                        </div>
                        {habits.length === 0 && (
                          <Button
                            variant="secondary"
                            className="w-full"
                            onClick={() => void handleSeedStarterHabits()}
                          >
                            <ShieldCheck className="h-4 w-4" />
                            Load starter habits
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => void refreshFromSupabase()}
                        >
                          <RefreshCw className="h-4 w-4" />
                          Refresh from cloud
                        </Button>
                        <Button variant="ghost" className="w-full" onClick={() => void handleSignOut()}>
                          Sign out
                        </Button>
                        {hasLocalImportData ? (
                          <Button
                            variant="secondary"
                            className="w-full"
                            onClick={() => void handleImportLocalData()}
                          >
                            Import local data
                          </Button>
                        ) : null}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Input
                          placeholder="you@example.com"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                        />
                        <Button
                          className="w-full"
                          disabled={isSendingLink}
                          onClick={() => void handleMagicLink()}
                        >
                          <LogIn className="h-4 w-4" />
                          {isSendingLink ? "Sending link..." : "Send magic link"}
                        </Button>
                      </div>
                    )
                  ) : (
                    <p className="text-sm text-slate-500">
                      Supabase keys are not set yet, so this build is staying in local mode.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Focus</CardTitle>
                <CardDescription>Helpful context, without stealing attention from today.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Best day</p>
                  <p className="mt-1 text-sm text-slate-700">
                    {bestDay.best.date
                      ? `${formatShortDate(bestDay.best.date)} with ${bestDay.best.completed}/${bestDay.best.total} habits completed.`
                      : "No history yet."}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Active habits</p>
                  <p className="mt-1 text-sm text-slate-700">
                    {habits.length} habits across health, learning, discipline, and career.
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Daily principle</p>
                  <p className="mt-1 text-sm text-slate-700">
                    Show up, log quickly, and let consistency matter more than perfection.
                  </p>
                </div>
              </CardContent>
            </Card>
          </aside>
        </section>
      </div>
    </main>
  );
}
