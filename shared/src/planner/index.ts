import { Task, DayPlan, EnergyLevel, TaskStatus, BreakItem } from "../types";

/**
 * Adjusts energy value based on sleep hours
 * Optimal sleep: 7-9 hours
 * Less than 6 hours: reduce energy by 1-2 points
 * More than 9 hours: slight boost
 */
function adjustEnergyForSleep(baseEnergy: number, sleepHours?: number): number {
  if (!sleepHours) return baseEnergy;
  
  let adjusted = baseEnergy;
  
  if (sleepHours < 6) {
    // Very little sleep - significant reduction
    adjusted = Math.max(1, baseEnergy - 2);
  } else if (sleepHours < 7) {
    // Low sleep - moderate reduction
    adjusted = Math.max(1, baseEnergy - 1);
  } else if (sleepHours >= 7 && sleepHours <= 9) {
    // Optimal sleep - slight boost
    adjusted = Math.min(5, baseEnergy + 0.5);
  } else if (sleepHours > 9 && sleepHours <= 11) {
    // Oversleeping - slight reduction (can feel groggy)
    adjusted = Math.max(1, baseEnergy - 0.5);
  } else {
    // Excessive sleep - more reduction
    adjusted = Math.max(1, baseEnergy - 1);
  }
  
  return Math.round(adjusted * 2) / 2; // Round to nearest 0.5
}

/**
 * Maps energy value (1-5) to EnergyLevel
 * 1-2: low
 * 3: medium
 * 4-5: high
 */
function getEnergyLevel(value: number): EnergyLevel {
  if (value <= 2) return "low";
  if (value === 3) return "medium";
  return "high";
}

/**
 * Maps energy level to numeric value for comparison
 */
function energyLevelToNumber(level: EnergyLevel): number {
  switch (level) {
    case "low": return 1;
    case "medium": return 3;
    case "high": return 5;
  }
}

/**
 * Determines if a task type matches current energy level
 * High energy: focus, creative, physical
 * Medium energy: admin, creative
 * Low energy: admin
 */
function taskTypeMatchesEnergy(type: string, energy: EnergyLevel): boolean {
  if (energy === "high") {
    return type === "focus" || type === "creative" || type === "physical";
  }
  if (energy === "medium") {
    return type === "admin" || type === "creative";
  }
  return type === "admin";
}

/**
 * Maps task priority to numeric value
 */
function priorityToNumber(priority: string): number {
  switch (priority) {
    case "critical": return 4;
    case "high": return 3;
    case "medium": return 2;
    case "low": return 1;
    default: return 2;
  }
}

/**
 * Calculates priority score for a task
 * Higher score = should be done earlier
 */
function calculateTaskScore(
  task: Task,
  currentEnergy: EnergyLevel,
  hasDeadline: boolean
): number {
  let score = 0;

  // Energy match: tasks that match current energy get priority
  const energyMatch = taskTypeMatchesEnergy(task.type, currentEnergy);
  if (energyMatch) {
    score += 100;
  }

  // Energy cost compatibility: prefer tasks whose cost <= current energy
  const currentEnergyNum = energyLevelToNumber(currentEnergy);
  const taskCostNum = energyLevelToNumber(task.energyCost);
  if (taskCostNum <= currentEnergyNum) {
    score += 50;
  } else {
    // Penalize tasks that require more energy than available
    score -= 30;
  }

  // Task priority influence (but energy still takes precedence)
  const priorityNum = priorityToNumber(task.priority);
  score += priorityNum * 15; // Critical = +60, High = +45, Medium = +30, Low = +15

  // Status influence: in-progress tasks get slight boost
  if (task.status === "in-progress") {
    score += 25;
  } else if (task.status === "blocked") {
    score -= 50; // Blocked tasks go lower
  }

  // Deadline influence: tasks with deadlines get a boost, but not overriding energy
  if (hasDeadline && task.deadline) {
    const deadlineDate = new Date(task.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysUntilDeadline = Math.ceil(
      (deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysUntilDeadline <= 0) {
      score += 40; // Due today or overdue
    } else if (daysUntilDeadline === 1) {
      score += 20; // Due tomorrow
    } else if (daysUntilDeadline <= 3) {
      score += 10; // Due soon
    }
  }

  // Completed/done tasks go to the end
  if (task.completed || task.status === "done") {
    score -= 1000;
  }

  return score;
}

/**
 * Creates break items to insert between tasks
 */
function createBreakItems(): BreakItem[] {
  return [
    {
      id: "break-coffee-morning",
      type: "coffee",
      title: "☕ Coffee Break",
      duration: 15
    },
    {
      id: "break-lunch",
      type: "lunch",
      title: "🍽️ Lunch Break",
      duration: 45
    },
    {
      id: "break-coffee-afternoon",
      type: "coffee",
      title: "☕ Afternoon Coffee",
      duration: 15
    },
    {
      id: "break-short-1",
      type: "short-break",
      title: "💆 Short Break",
      duration: 10
    },
    {
      id: "break-short-2",
      type: "short-break",
      title: "💆 Short Break",
      duration: 10
    }
  ];
}

/**
 * Inserts breaks into the task list at appropriate intervals
 */
function insertBreaksIntoTasks(
  tasks: Task[],
  startHour: number = 9
): (Task | BreakItem)[] {
  const breaks = createBreakItems();
  const result: (Task | BreakItem)[] = [];
  let currentHour = startHour;
  let currentMinute = 0;
  let breakIndex = 0;
  let tasksSinceLastBreak = 0;
  let totalTaskMinutes = 0;

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    
    // Skip completed tasks for break scheduling
    if (task.completed || task.status === "done") {
      result.push(task);
      continue;
    }

    // Add task
    result.push(task);
    tasksSinceLastBreak++;
    const taskDuration = task.estimatedMinutes || 30; // Default 30 min if not specified
    totalTaskMinutes += taskDuration;

    // Calculate next time
    currentMinute += taskDuration;
    while (currentMinute >= 60) {
      currentHour++;
      currentMinute -= 60;
    }

    // Insert breaks at appropriate intervals
    // Coffee break after 2-3 tasks or 2 hours of work
    if (breakIndex === 0 && (tasksSinceLastBreak >= 2 || totalTaskMinutes >= 120)) {
      if (currentHour < 11) { // Morning coffee
        result.push(breaks[0]);
        currentMinute += breaks[0].duration;
        while (currentMinute >= 60) {
          currentHour++;
          currentMinute -= 60;
        }
        breakIndex++;
        tasksSinceLastBreak = 0;
      }
    }

    // Lunch break around 12-1 PM
    if (breakIndex === 1 && currentHour >= 12 && currentHour < 13) {
      result.push(breaks[1]);
      currentMinute += breaks[1].duration;
      while (currentMinute >= 60) {
        currentHour++;
        currentMinute -= 60;
      }
      breakIndex++;
      tasksSinceLastBreak = 0;
      totalTaskMinutes = 0;
    }

    // Afternoon coffee after 2-3 tasks post-lunch
    if (breakIndex === 2 && tasksSinceLastBreak >= 2 && currentHour >= 14) {
      result.push(breaks[2]);
      currentMinute += breaks[2].duration;
      while (currentMinute >= 60) {
        currentHour++;
        currentMinute -= 60;
      }
      breakIndex++;
      tasksSinceLastBreak = 0;
    }

    // Short breaks every 3-4 tasks or every 90 minutes
    if (tasksSinceLastBreak >= 3 || totalTaskMinutes >= 90) {
      if (breakIndex < breaks.length - 1) {
        const shortBreak = breaks[breakIndex + 1];
        if (shortBreak && shortBreak.type === "short-break") {
          result.push(shortBreak);
          currentMinute += shortBreak.duration;
          while (currentMinute >= 60) {
            currentHour++;
            currentMinute -= 60;
          }
          breakIndex++;
          tasksSinceLastBreak = 0;
          totalTaskMinutes = 0;
        }
      }
    }
  }

  return result;
}

/**
 * Generates a human-readable explanation for the plan
 */
function isBreakItem(item: Task | BreakItem): item is BreakItem {
  return 'type' in item && ['coffee', 'lunch', 'short-break', 'long-break'].includes((item as BreakItem).type);
}

function generateExplanation(
  orderedItems: (Task | BreakItem)[],
  currentEnergy: EnergyLevel,
  totalTasks: number,
  sleepHours?: number
): string {
  // Filter out break items - only keep actual tasks
  const tasks = orderedItems.filter((item): item is Task => !isBreakItem(item));
  
  if (tasks.length === 0) {
    return "No tasks to plan today. Take a moment to rest.";
  }

  const energyDescriptions = {
    low: "lower energy",
    medium: "moderate energy",
    high: "higher energy"
  };

  const energyDesc = energyDescriptions[currentEnergy];
  const incompleteTasks = tasks.filter(t => !t.completed);
  
  if (incompleteTasks.length === 0) {
    return "All tasks are complete. Well done.";
  }

  let explanation = "";
  
  if (sleepHours !== undefined) {
    if (sleepHours < 6) {
      explanation += `With ${sleepHours} hours of sleep, we've adjusted your plan for lower energy. `;
    } else if (sleepHours >= 7 && sleepHours <= 9) {
      explanation += `With ${sleepHours} hours of restful sleep, `;
    } else {
      explanation += `With ${sleepHours} hours of sleep, `;
    }
  }
  
  explanation += `Based on your ${energyDesc} right now, `;
  
  const firstTask = incompleteTasks[0];
  const matchingTasks = incompleteTasks.filter(t => 
    taskTypeMatchesEnergy(t.type, currentEnergy)
  );

  if (matchingTasks.length > 0) {
    explanation += `we've prioritized tasks that align with your current energy level. `;
    explanation += `Starting with "${firstTask.title}" which matches your energy.`;
  } else {
    explanation += `we've arranged lighter tasks first. `;
    explanation += `Starting with "${firstTask.title}" which fits your current capacity.`;
  }

  const breakCount = orderedItems.filter(item => 'type' in item && (item as BreakItem).type).length;
  if (breakCount > 0) {
    explanation += ` We've also scheduled ${breakCount} break${breakCount > 1 ? 's' : ''} throughout your day to help maintain your energy.`;
  }

  const deadlineTasks = incompleteTasks.filter(t => t.deadline);
  if (deadlineTasks.length > 0) {
    explanation += ` Tasks with deadlines have been considered while keeping your energy in mind.`;
  }

  return explanation;
}

/**
 * Main planning function
 * Takes tasks and current energy, returns ordered plan with explanation
 */
export interface PlanOptions {
  filterTags?: string[];
  filterProject?: string;
  filterStatus?: TaskStatus[];
  excludeBlocked?: boolean;
  sleepHours?: number;
  startHour?: number; // Hour of day to start planning (default 9 AM)
}

export function planDay(
  tasks: Task[],
  currentEnergyValue: number, // 1-5
  date: string = new Date().toISOString().split("T")[0],
  options: PlanOptions = {}
): DayPlan {
  // Adjust energy based on sleep
  let adjustedEnergy = currentEnergyValue;
  if (options.sleepHours !== undefined) {
    adjustedEnergy = adjustEnergyForSleep(currentEnergyValue, options.sleepHours);
  }
  
  const currentEnergy = getEnergyLevel(adjustedEnergy);
  
  // Apply filters
  let filteredTasks = tasks;
  
  if (options.filterTags && options.filterTags.length > 0) {
    filteredTasks = filteredTasks.filter(t => 
      options.filterTags!.some(tag => t.tags.includes(tag))
    );
  }
  
  if (options.filterProject) {
    filteredTasks = filteredTasks.filter(t => t.project === options.filterProject);
  }
  
  if (options.filterStatus && options.filterStatus.length > 0) {
    filteredTasks = filteredTasks.filter(t => options.filterStatus!.includes(t.status));
  }
  
  if (options.excludeBlocked) {
    filteredTasks = filteredTasks.filter(t => t.status !== "blocked");
  }
  
  // Filter out completed/done tasks from planning (but keep them in the list)
  const incompleteTasks = filteredTasks.filter(t => !t.completed && t.status !== "done");
  const completedTasks = filteredTasks.filter(t => t.completed || t.status === "done");
  
  // Check if any tasks have deadlines
  const hasDeadlines = incompleteTasks.some(t => t.deadline);
  
  // Sort tasks by priority score
  const sortedTasks = [...incompleteTasks].sort((a, b) => {
    const scoreA = calculateTaskScore(a, currentEnergy, hasDeadlines);
    const scoreB = calculateTaskScore(b, currentEnergy, hasDeadlines);
    return scoreB - scoreA; // Higher score first
  });
  
  // Combine sorted incomplete tasks with completed tasks at the end
  const orderedTasks = [...sortedTasks, ...completedTasks];
  
  // Insert breaks into the plan (only if we have tasks)
  const planWithBreaks = orderedTasks.length > 0 
    ? insertBreaksIntoTasks(orderedTasks, options.startHour || 9)
    : orderedTasks;
  
  const explanation = generateExplanation(planWithBreaks, currentEnergy, filteredTasks.length, options.sleepHours);
  
  return {
    date,
    orderedTasks: planWithBreaks,
    explanation
  };
}
