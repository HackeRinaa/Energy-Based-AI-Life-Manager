import { makeAutoObservable, runInAction } from "mobx";
import { EnergyEntry } from "@energy-manager/shared";

const API_BASE = "/api";

class EnergyStore {
  currentEnergy: number | null = null;
  currentSleepHours: number | undefined = undefined;
  energyEntries: EnergyEntry[] = [];
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchLatestEnergy() {
    this.loading = true;
    this.error = null;

    try {
      const response = await fetch(`${API_BASE}/energy/latest`);
      if (response.status === 404) {
        // No energy entry yet, that's okay
        runInAction(() => {
          this.currentEnergy = null;
          this.currentSleepHours = undefined;
          this.loading = false;
        });
        return;
      }

      if (!response.ok) throw new Error("Failed to fetch energy");
      const entry = await response.json();

      runInAction(() => {
        this.currentEnergy = entry.value;
        this.currentSleepHours = entry.sleepHours;
        this.loading = false;
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.message;
        this.loading = false;
      });
    }
  }

  async checkInEnergy(value: number, sleepHours?: number) {
    this.loading = true;
    this.error = null;

    try {
      const response = await fetch(`${API_BASE}/energy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value, sleepHours }),
      });

      if (!response.ok) throw new Error("Failed to check in energy");
      const entry = await response.json();

      runInAction(() => {
        this.currentEnergy = entry.value;
        this.currentSleepHours = entry.sleepHours;
        this.energyEntries.push(entry);
        this.loading = false;
      });

      return entry;
    } catch (err: any) {
      runInAction(() => {
        this.error = err.message;
        this.loading = false;
      });
      throw err;
    }
  }
}

export const energyStore = new EnergyStore();
