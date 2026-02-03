import { makeAutoObservable, runInAction } from "mobx";
import { Task, EnergyLevel, TaskType, TaskPriority, TaskStatus } from "@energy-manager/shared";

const API_BASE = "/api";

export interface TaskFilters {
  tags?: string[];
  project?: string;
  status?: string[];
  priority?: string;
  type?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

class TaskStore {
  tasks: Task[] = [];
  allTags: string[] = [];
  allProjects: string[] = [];
  filters: TaskFilters = {};
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchTasks(filters?: TaskFilters) {
    this.loading = true;
    this.error = null;
    
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        if (filters.tags) filters.tags.forEach(tag => queryParams.append("tags", tag));
        if (filters.project) queryParams.append("project", filters.project);
        if (filters.status) filters.status.forEach(s => queryParams.append("status", s));
        if (filters.priority) queryParams.append("priority", filters.priority);
        if (filters.type) queryParams.append("type", filters.type);
        if (filters.search) queryParams.append("search", filters.search);
        if (filters.sortBy) queryParams.append("sortBy", filters.sortBy);
        if (filters.sortOrder) queryParams.append("sortOrder", filters.sortOrder);
      }
      
      const url = `${API_BASE}/tasks${queryParams.toString() ? `?${queryParams}` : ""}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch tasks");
      const tasks = await response.json();
      
      runInAction(() => {
        this.tasks = tasks;
        if (filters) this.filters = filters;
        this.loading = false;
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.message;
        this.loading = false;
      });
    }
  }

  async fetchTags() {
    try {
      const response = await fetch(`${API_BASE}/tasks/tags/list`);
      if (!response.ok) throw new Error("Failed to fetch tags");
      const tags = await response.json();
      runInAction(() => {
        this.allTags = tags;
      });
    } catch (err: any) {
      console.error("Failed to fetch tags", err);
    }
  }

  async fetchProjects() {
    try {
      const response = await fetch(`${API_BASE}/tasks/projects/list`);
      if (!response.ok) throw new Error("Failed to fetch projects");
      const projects = await response.json();
      runInAction(() => {
        this.allProjects = projects;
      });
    } catch (err: any) {
      console.error("Failed to fetch projects", err);
    }
  }

  async createTask(taskData: Partial<Task>) {
    this.loading = true;
    this.error = null;

    try {
      const response = await fetch(`${API_BASE}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) throw new Error("Failed to create task");
      const task = await response.json();

      runInAction(() => {
        this.tasks.push(task);
        this.loading = false;
      });

      // Refresh tags and projects
      this.fetchTags();
      this.fetchProjects();

      return task;
    } catch (err: any) {
      runInAction(() => {
        this.error = err.message;
        this.loading = false;
      });
      throw err;
    }
  }

  async updateTask(id: string, updates: Partial<Task>) {
    this.loading = true;
    this.error = null;

    try {
      const response = await fetch(`${API_BASE}/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error("Failed to update task");
      const updatedTask = await response.json();

      runInAction(() => {
        const index = this.tasks.findIndex(t => t.id === id);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
        }
        this.loading = false;
      });

      return updatedTask;
    } catch (err: any) {
      runInAction(() => {
        this.error = err.message;
        this.loading = false;
      });
      throw err;
    }
  }

  async completeTask(id: string) {
    return this.updateTask(id, { status: "done", completed: true });
  }

  async changeStatus(id: string, status: TaskStatus) {
    return this.updateTask(id, { 
      status, 
      completed: status === "done" 
    });
  }

  async deleteTask(id: string) {
    try {
      const response = await fetch(`${API_BASE}/tasks/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete task");

      runInAction(() => {
        this.tasks = this.tasks.filter(t => t.id !== id);
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.message;
      });
    }
  }
}

export const taskStore = new TaskStore();
