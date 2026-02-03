import { Router } from "express";
import { Task, EnergyLevel, TaskType, TaskPriority, TaskStatus } from "@energy-manager/shared";
import { dataStore } from "../store.js";

const router = Router();

// POST /tasks - Create a task
router.post("/", (req, res) => {
  const { 
    title, 
    description,
    energyCost, 
    type, 
    priority,
    status,
    tags,
    assignee,
    deadline,
    estimatedMinutes,
    project,
    subtasks,
    notes
  } = req.body;

  if (!title || typeof title !== "string") {
    return res.status(400).json({ error: "Title is required" });
  }

  if (!energyCost || !["low", "medium", "high"].includes(energyCost)) {
    return res.status(400).json({ 
      error: "energyCost must be 'low', 'medium', or 'high'" 
    });
  }

  if (!type || !["focus", "admin", "creative", "physical"].includes(type)) {
    return res.status(400).json({ 
      error: "type must be 'focus', 'admin', 'creative', or 'physical'" 
    });
  }

  const now = new Date().toISOString();
  const taskStatus = (status || "todo") as TaskStatus;
  const taskPriority = (priority || "medium") as TaskPriority;

  const task: Task = {
    id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title,
    description: description || undefined,
    energyCost: energyCost as EnergyLevel,
    type: type as TaskType,
    priority: taskPriority,
    status: taskStatus,
    tags: Array.isArray(tags) ? tags : [],
    assignee: assignee || undefined,
    deadline: deadline || undefined,
    estimatedMinutes: estimatedMinutes || undefined,
    project: project || undefined,
    subtasks: Array.isArray(subtasks) ? subtasks : [],
    notes: notes || undefined,
    createdAt: now,
    updatedAt: now,
    completed: taskStatus === "done"
  };

  dataStore.addTask(task);
  res.status(201).json(task);
});

// GET /tasks - Get all tasks with optional filtering
router.get("/", (req, res) => {
  let tasks = dataStore.getTasks();
  
  // Filter by tags
  if (req.query.tags) {
    const filterTags = Array.isArray(req.query.tags) 
      ? req.query.tags as string[]
      : [req.query.tags as string];
    tasks = tasks.filter(t => filterTags.some(tag => t.tags.includes(tag)));
  }
  
  // Filter by project
  if (req.query.project) {
    tasks = tasks.filter(t => t.project === req.query.project);
  }
  
  // Filter by status
  if (req.query.status) {
    const filterStatus = Array.isArray(req.query.status)
      ? req.query.status as string[]
      : [req.query.status as string];
    tasks = tasks.filter(t => filterStatus.includes(t.status));
  }
  
  // Filter by priority
  if (req.query.priority) {
    tasks = tasks.filter(t => t.priority === req.query.priority);
  }
  
  // Filter by type
  if (req.query.type) {
    tasks = tasks.filter(t => t.type === req.query.type);
  }
  
  // Search by title/description
  if (req.query.search) {
    const searchTerm = (req.query.search as string).toLowerCase();
    tasks = tasks.filter(t => 
      t.title.toLowerCase().includes(searchTerm) ||
      (t.description && t.description.toLowerCase().includes(searchTerm))
    );
  }
  
  // Sort options
  const sortBy = req.query.sortBy as string || "updatedAt";
  const sortOrder = req.query.sortOrder as string || "desc";
  
  tasks.sort((a, b) => {
    let aVal: any = a[sortBy as keyof Task];
    let bVal: any = b[sortBy as keyof Task];
    
    if (sortBy === "updatedAt" || sortBy === "createdAt") {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }
    
    if (sortOrder === "asc") {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });
  
  res.json(tasks);
});

// IMPORTANT: These specific routes must come BEFORE /:id route
// GET /tasks/projects/list - Get list of all projects
router.get("/projects/list", (req, res) => {
  const tasks = dataStore.getTasks();
  const projects = [...new Set(tasks.map(t => t.project).filter(Boolean))];
  res.json(projects);
});

// GET /tasks/tags/list - Get list of all tags
router.get("/tags/list", (req, res) => {
  const tasks = dataStore.getTasks();
  const allTags = tasks.flatMap(t => t.tags);
  const uniqueTags = [...new Set(allTags)];
  res.json(uniqueTags);
});

// GET /tasks/:id - Get a single task (must be after specific routes)
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const tasks = dataStore.getTasks();
  const task = tasks.find(t => t.id === id);

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  res.json(task);
});

// PATCH /tasks/:id - Update a task
router.patch("/:id", (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  // Ensure updatedAt is set
  updates.updatedAt = new Date().toISOString();
  
  // Sync completed with status
  if (updates.status === "done") {
    updates.completed = true;
  } else if (updates.status && updates.status !== "done") {
    updates.completed = false;
  }
  
  const task = dataStore.updateTask(id, updates);

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  res.json(task);
});

// PATCH /tasks/:id/complete - Mark a task as completed (legacy)
router.patch("/:id/complete", (req, res) => {
  const { id } = req.params;
  const task = dataStore.updateTask(id, { 
    completed: true,
    status: "done",
    updatedAt: new Date().toISOString()
  });

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  res.json(task);
});

// DELETE /tasks/:id - Delete a task
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const deleted = dataStore.deleteTask(id);

  if (!deleted) {
    return res.status(404).json({ error: "Task not found" });
  }

  res.status(204).send();
});

export { router as taskRoutes };
