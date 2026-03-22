import { Habit, HabitLogMap } from "@/lib/tracker-data";

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getTodayKey() {
  return toDateKey(new Date());
}

export function toDateInputValue(date: Date) {
  return toDateKey(date);
}

export function addDays(date: Date, amount: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

export function startOfWeek(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() + diff);
  return copy;
}

export function getLastNDates(total: number, anchorDateKey?: string) {
  const today = anchorDateKey ? new Date(`${anchorDateKey}T00:00:00`) : new Date();
  return Array.from({ length: total }, (_, index) => {
    const offset = total - index - 1;
    return toDateKey(addDays(today, -offset));
  });
}

export function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(`${value}T00:00:00`));
}

export function buildWeeklyRangeLabel(weekStart: Date) {
  const weekEnd = addDays(weekStart, 6);

  return `${new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
  }).format(weekStart)} - ${new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
  }).format(weekEnd)}`;
}

export function clampValue(value: number) {
  return Math.max(0, Math.round(value));
}

function isHabitComplete(habit: Habit, value: number) {
  return value >= habit.goalTarget;
}

export function calculateStreak(habit: Habit, logs: HabitLogMap) {
  let streak = 0;
  const sortedDates = Object.keys(logs).sort().reverse();

  for (const date of sortedDates) {
    const value = logs[date]?.[habit.id] ?? 0;

    if (!isHabitComplete(habit, value)) {
      if (streak === 0) {
        continue;
      }

      break;
    }

    streak += 1;
  }

  return streak;
}

export function buildHeatmapDays(habits: Habit[], logs: HabitLogMap) {
  const start = addDays(new Date(), -83);

  return Array.from({ length: 84 }, (_, index) => {
    const date = addDays(start, index);
    const dateKey = toDateKey(date);
    const dayLogs = logs[dateKey] ?? {};
    const completed = habits.filter((habit) => isHabitComplete(habit, dayLogs[habit.id] ?? 0)).length;
    const total = habits.length;
    const ratio = total === 0 ? 0 : completed / total;

    let intensity = 0;

    if (ratio >= 1) {
      intensity = 4;
    } else if (ratio >= 0.75) {
      intensity = 3;
    } else if (ratio >= 0.45) {
      intensity = 2;
    } else if (ratio > 0) {
      intensity = 1;
    }

    return {
      date: dateKey,
      completed,
      total,
      intensity,
    };
  });
}

export function buildDailyRollup(habits: Habit[], logs: HabitLogMap) {
  const days = Object.keys(logs);

  if (days.length === 0) {
    return {
      best: {
        date: "",
        completed: 0,
        total: 0,
      },
    };
  }

  const best = days
    .map((date) => {
      const dayLogs = logs[date] ?? {};
      const completed = habits.filter((habit) => isHabitComplete(habit, dayLogs[habit.id] ?? 0)).length;

      return {
        date,
        completed,
        total: habits.length,
      };
    })
    .sort((left, right) => right.completed - left.completed)[0];

  return { best };
}
