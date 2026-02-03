import { Task, DayPlan } from "@energy-manager/shared";

/**
 * AI Integration Module (Placeholder)
 * 
 * This module is scaffolded for future AI integration.
 * It accepts tasks and energy context, and returns a reordered task list with explanation.
 * 
 * When ready to integrate:
 * 1. Add AI service client (OpenAI, Anthropic, etc.)
 * 2. Implement prompt engineering for energy-based planning
 * 3. Parse AI response into DayPlan format
 * 4. Add fallback to rule-based planner if AI fails
 */

export interface AIContext {
  tasks: Task[];
  currentEnergy: number; // 1-5
  recentEnergyHistory?: number[]; // Optional history for context
  userPreferences?: Record<string, any>; // Future: user preferences
}

/**
 * Generate plan using AI (placeholder implementation)
 * Currently returns null to indicate AI is not yet integrated
 */
export async function generateAIPlan(context: AIContext): Promise<DayPlan | null> {
  // TODO: Implement AI integration
  // 1. Format context into prompt
  // 2. Call AI service
  // 3. Parse response into DayPlan
  // 4. Validate and return
  
  return null; // AI not enabled yet
}

/**
 * Check if AI is enabled/available
 */
export function isAIEnabled(): boolean {
  return process.env.AI_ENABLED === "true" && !!process.env.AI_API_KEY;
}
