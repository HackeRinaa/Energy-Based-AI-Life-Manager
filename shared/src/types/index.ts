export type EnergyLevel = "low" | "medium" | "high";
export type TaskType = "focus" | "admin" | "creative" | "physical";
export type TaskPriority = "low" | "medium" | "high" | "critical";
export type TaskStatus = "todo" | "in-progress" | "done" | "blocked";

export interface Task {
  id: string;
  title: string;
  description?: string;
  energyCost: EnergyLevel;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  tags: string[];
  assignee?: string;
  deadline?: string;
  estimatedMinutes?: number;
  project?: string;
  subtasks: string[]; // Array of subtask titles or IDs
  notes?: string;
  createdAt: string;
  updatedAt: string;
  completed: boolean; // Legacy field, maps to status === "done"
}

export interface EnergyEntry {
  id: string;
  value: number; // 1–5
  sleepHours?: number; // Hours of sleep from previous night
  timestamp: string;
}

export interface BreakItem {
  id: string;
  type: "coffee" | "lunch" | "short-break" | "long-break";
  title: string;
  duration: number; // minutes
  scheduledTime?: string; // ISO time string
}

export interface DayPlan {
  date: string;
  orderedTasks: (Task | BreakItem)[];
  explanation: string;
}
