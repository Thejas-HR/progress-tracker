export type ActivityType = "checkbox" | "count" | "minutes";
export type HabitPeriod = "daily" | "weekly";

export type Habit = {
  id: string;
  name: string;
  category: string;
  type: ActivityType;
  goalTarget: number;
  goalPeriod: HabitPeriod;
  createdAt: string;
};

export type HabitDraft = {
  name: string;
  category: string;
  type: ActivityType;
  goalTarget: number;
  goalPeriod: HabitPeriod;
};

export type HabitLogMap = Record<string, Record<string, number>>;

export type TrackerState = {
  habits: Habit[];
  logs: HabitLogMap;
};

export const emptyTrackerState: TrackerState = {
  habits: [],
  logs: {},
};

type HabitTemplate = {
  key: string;
  name: string;
  category: string;
  type: ActivityType;
  goalTarget: number;
  goalPeriod: HabitPeriod;
};

const habitTemplates: HabitTemplate[] = [
  {
    key: "minoxidil",
    name: "Minoxidil",
    category: "Health",
    type: "checkbox",
    goalTarget: 1,
    goalPeriod: "daily",
  },
  {
    key: "design",
    name: "Design",
    category: "Learning",
    type: "minutes",
    goalTarget: 60,
    goalPeriod: "daily",
  },
  {
    key: "reading",
    name: "Reading",
    category: "Learning",
    type: "minutes",
    goalTarget: 30,
    goalPeriod: "daily",
  },
  {
    key: "bhagavad-gita",
    name: "Bhagavad Gita",
    category: "Spiritual",
    type: "minutes",
    goalTarget: 15,
    goalPeriod: "daily",
  },
  {
    key: "no-porn",
    name: "No porn",
    category: "Discipline",
    type: "checkbox",
    goalTarget: 1,
    goalPeriod: "daily",
  },
  {
    key: "journalling",
    name: "Journalling",
    category: "Discipline",
    type: "checkbox",
    goalTarget: 1,
    goalPeriod: "daily",
  },
  {
    key: "workout",
    name: "Workout",
    category: "Health",
    type: "checkbox",
    goalTarget: 1,
    goalPeriod: "daily",
  },
  {
    key: "job-applications",
    name: "Job applications",
    category: "Career",
    type: "count",
    goalTarget: 5,
    goalPeriod: "weekly",
  },
];

const templateLogs: Record<string, Record<string, number>> = {
  "2026-03-11": {
    minoxidil: 1,
    design: 45,
    reading: 20,
    "bhagavad-gita": 15,
    "no-porn": 1,
    journalling: 1,
    workout: 0,
    "job-applications": 1,
  },
  "2026-03-12": {
    minoxidil: 1,
    design: 60,
    reading: 30,
    "bhagavad-gita": 10,
    "no-porn": 1,
    journalling: 1,
    workout: 1,
    "job-applications": 0,
  },
  "2026-03-13": {
    minoxidil: 1,
    design: 20,
    reading: 35,
    "bhagavad-gita": 15,
    "no-porn": 1,
    journalling: 0,
    workout: 1,
    "job-applications": 2,
  },
  "2026-03-14": {
    minoxidil: 1,
    design: 75,
    reading: 25,
    "bhagavad-gita": 15,
    "no-porn": 1,
    journalling: 1,
    workout: 1,
    "job-applications": 0,
  },
  "2026-03-15": {
    minoxidil: 1,
    design: 30,
    reading: 30,
    "bhagavad-gita": 15,
    "no-porn": 1,
    journalling: 1,
    workout: 0,
    "job-applications": 1,
  },
  "2026-03-16": {
    minoxidil: 1,
    design: 90,
    reading: 10,
    "bhagavad-gita": 5,
    "no-porn": 1,
    journalling: 1,
    workout: 1,
    "job-applications": 1,
  },
  "2026-03-17": {
    minoxidil: 1,
    design: 55,
    reading: 30,
    "bhagavad-gita": 15,
    "no-porn": 1,
    journalling: 1,
    workout: 1,
    "job-applications": 0,
  },
  "2026-03-18": {
    minoxidil: 1,
    design: 40,
    reading: 15,
    "bhagavad-gita": 15,
    "no-porn": 1,
    journalling: 0,
    workout: 1,
    "job-applications": 0,
  },
  "2026-03-19": {
    minoxidil: 1,
    design: 80,
    reading: 30,
    "bhagavad-gita": 20,
    "no-porn": 1,
    journalling: 1,
    workout: 1,
    "job-applications": 1,
  },
  "2026-03-20": {
    minoxidil: 1,
    design: 25,
    reading: 40,
    "bhagavad-gita": 10,
    "no-porn": 1,
    journalling: 1,
    workout: 0,
    "job-applications": 0,
  },
  "2026-03-21": {
    minoxidil: 1,
    design: 65,
    reading: 30,
    "bhagavad-gita": 15,
    "no-porn": 1,
    journalling: 1,
    workout: 1,
    "job-applications": 1,
  },
};

function buildHabitsFromTemplates(idMap: Record<string, string>) {
  return habitTemplates.map((template) => ({
    id: idMap[template.key],
    name: template.name,
    category: template.category,
    type: template.type,
    goalTarget: template.goalTarget,
    goalPeriod: template.goalPeriod,
    createdAt: "2026-03-01T00:00:00.000Z",
  }));
}

function buildLogsFromTemplates(idMap: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(templateLogs).map(([date, dayLogs]) => [
      date,
      Object.fromEntries(
        Object.entries(dayLogs).map(([templateKey, value]) => [idMap[templateKey], value]),
      ),
    ]),
  ) as HabitLogMap;
}

export function buildSeedTrackerState(): TrackerState {
  const idMap = Object.fromEntries(
    habitTemplates.map((template) => [template.key, crypto.randomUUID()]),
  ) as Record<string, string>;

  return {
    habits: buildHabitsFromTemplates(idMap),
    logs: buildLogsFromTemplates(idMap),
  };
}

export const habitTypeCopy: Record<ActivityType, string> = {
  checkbox: "Checkbox",
  count: "Count",
  minutes: "Minutes",
};
