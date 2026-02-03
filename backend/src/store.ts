import { Task, EnergyEntry } from "@energy-manager/shared";

// Simple in-memory data store
class DataStore {
  private tasks: Task[] = [];
  private energyEntries: EnergyEntry[] = [];

  // Task methods
  addTask(task: Task): void {
    this.tasks.push(task);
  }

  getTasks(): Task[] {
    return [...this.tasks];
  }

  updateTask(id: string, updates: Partial<Task>): Task | null {
    const task = this.tasks.find(t => t.id === id);
    if (!task) return null;
    Object.assign(task, updates);
    return task;
  }

  deleteTask(id: string): boolean {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) return false;
    this.tasks.splice(index, 1);
    return true;
  }

  // Energy methods
  addEnergyEntry(entry: EnergyEntry): void {
    this.energyEntries.push(entry);
  }

  getEnergyEntries(): EnergyEntry[] {
    return [...this.energyEntries];
  }

  getLatestEnergy(): EnergyEntry | null {
    if (this.energyEntries.length === 0) return null;
    return this.energyEntries[this.energyEntries.length - 1];
  }
}

export const dataStore = new DataStore();
