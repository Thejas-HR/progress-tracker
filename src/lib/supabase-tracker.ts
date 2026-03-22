import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { buildSeedTrackerState, Habit, HabitLogMap, TrackerState } from "@/lib/tracker-data";

type HabitRow = {
  id: string;
  name: string;
  category: string;
  type: Habit["type"];
  goal_target: number;
  goal_period: Habit["goalPeriod"];
  created_at: string;
};

type HabitLogRow = {
  habit_id: string;
  log_date: string;
  value: number;
};

function mapHabitRow(row: HabitRow): Habit {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    type: row.type,
    goalTarget: row.goal_target,
    goalPeriod: row.goal_period,
    createdAt: row.created_at,
  };
}

function toHabitInsert(habit: Habit, userId: string) {
  return {
    id: habit.id,
    user_id: userId,
    name: habit.name,
    category: habit.category,
    type: habit.type,
    goal_target: habit.goalTarget,
    goal_period: habit.goalPeriod,
    created_at: habit.createdAt,
  };
}

export async function getSession() {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}

export function subscribeToAuthChanges(callback: (session: Session | null) => void) {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return () => undefined;
  }

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });

  return () => subscription.unsubscribe();
}

export async function sendMagicLink(email: string) {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: typeof window === "undefined" ? undefined : window.location.origin,
    },
  });

  if (error) {
    throw error;
  }
}

export async function signOut() {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return;
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function loadTrackerState(): Promise<TrackerState> {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const [{ data: habitRows, error: habitError }, { data: logRows, error: logError }] =
    await Promise.all([
      supabase.from("habits").select("*").order("created_at", { ascending: true }),
      supabase.from("habit_logs").select("habit_id, log_date, value").order("log_date", {
        ascending: true,
      }),
    ]);

  if (habitError) {
    throw habitError;
  }

  if (logError) {
    throw logError;
  }

  return {
    habits: ((habitRows ?? []) as HabitRow[]).map(mapHabitRow),
    logs: buildLogMap((logRows ?? []) as HabitLogRow[]),
  };
}

export async function seedTrackerState(): Promise<TrackerState> {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You need to sign in before seeding data.");
  }

  const seedState = buildSeedTrackerState();
  const habitRows = seedState.habits.map((habit) => toHabitInsert(habit, user.id));

  const { error: habitError } = await supabase.from("habits").insert(habitRows);

  if (habitError) {
    throw habitError;
  }

  const logRows = Object.entries(seedState.logs).flatMap(([logDate, dayLogs]) =>
    Object.entries(dayLogs).map(([habitId, value]) => ({
      user_id: user.id,
      habit_id: habitId,
      log_date: logDate,
      value,
    })),
  );

  const { error: logError } = await supabase.from("habit_logs").insert(logRows);

  if (logError) {
    throw logError;
  }

  return seedState;
}

export async function createHabit(habit: Habit) {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You need to sign in before creating habits.");
  }

  const { data, error } = await supabase
    .from("habits")
    .insert(toHabitInsert(habit, user.id))
    .select()
    .single();

  if (error) {
    throw error;
  }

  return mapHabitRow(data as HabitRow);
}

export async function removeHabit(habitId: string) {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase.from("habits").delete().eq("id", habitId);

  if (error) {
    throw error;
  }
}

export async function upsertHabitLog(habitId: string, logDate: string, value: number) {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You need to sign in before updating progress.");
  }

  const { error } = await supabase.from("habit_logs").upsert(
    {
      user_id: user.id,
      habit_id: habitId,
      log_date: logDate,
      value,
    },
    {
      onConflict: "user_id,habit_id,log_date",
    },
  );

  if (error) {
    throw error;
  }
}

function buildLogMap(rows: HabitLogRow[]) {
  return rows.reduce<HabitLogMap>((accumulator, row) => {
    accumulator[row.log_date] = {
      ...(accumulator[row.log_date] ?? {}),
      [row.habit_id]: row.value,
    };

    return accumulator;
  }, {});
}
