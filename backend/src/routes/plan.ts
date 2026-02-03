import { Router } from "express";
import { planDay, PlanOptions, TaskStatus } from "@energy-manager/shared";
import { dataStore } from "../store.js";

const router = Router();

// GET /plan/today - Generate today's DayPlan with optional filters
router.get("/today", (req, res) => {
  try {
    // Get all tasks
    const tasks = dataStore.getTasks();
    
    // Debug: log task count
    console.log(`[Plan] Total tasks in store: ${tasks.length}`);
    
    // Get latest energy entry (default to 3 if none exists)
    const latestEnergy = dataStore.getLatestEnergy();
    const currentEnergy = latestEnergy?.value || 3;

    // Parse filter options from query params
    const options: PlanOptions = {};
    
    if (req.query.tags) {
      options.filterTags = Array.isArray(req.query.tags)
        ? req.query.tags as string[]
        : [req.query.tags as string];
    }
    
    if (req.query.project) {
      options.filterProject = req.query.project as string;
    }
    
    if (req.query.status) {
      const statusArray = Array.isArray(req.query.status)
        ? req.query.status
        : [req.query.status];
      options.filterStatus = statusArray as TaskStatus[];
    }
    
    if (req.query.excludeBlocked === "true") {
      options.excludeBlocked = true;
    }
    
    // Include sleep hours from latest energy entry
    if (latestEnergy?.sleepHours !== undefined) {
      options.sleepHours = latestEnergy.sleepHours;
    }
    
    // Optional start hour (default 9 AM)
    if (req.query.startHour) {
      options.startHour = parseInt(req.query.startHour as string);
    }

    const today = new Date().toISOString().split("T")[0];
    const plan = planDay(tasks, currentEnergy, today, options);
    
    // Debug: log plan details
    console.log(`[Plan] Generated plan with ${plan.orderedTasks.length} items (tasks + breaks)`);
    const taskCount = plan.orderedTasks.filter(item => 'energyCost' in item).length;
    console.log(`[Plan] Actual tasks in plan: ${taskCount}`);

    res.json(plan);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to generate plan" });
  }
});

export { router as planRoutes };
