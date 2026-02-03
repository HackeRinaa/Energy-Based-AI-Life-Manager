import { makeAutoObservable, runInAction } from "mobx";
import { DayPlan } from "@energy-manager/shared";
import { TaskFilters } from "./TaskStore";

const API_BASE = "/api";

class PlanStore {
  plan: DayPlan | null = null;
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchTodayPlan(filters?: TaskFilters) {
    this.loading = true;
    this.error = null;

    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        if (filters.tags) filters.tags.forEach(tag => queryParams.append("tags", tag));
        if (filters.project) queryParams.append("project", filters.project);
        if (filters.status) filters.status.forEach(s => queryParams.append("status", s));
        if (filters.excludeBlocked) queryParams.append("excludeBlocked", "true");
      }
      
      const url = `${API_BASE}/plan/today${queryParams.toString() ? `?${queryParams}` : ""}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch plan");
      const plan = await response.json();

      runInAction(() => {
        this.plan = plan;
        this.loading = false;
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.message;
        this.loading = false;
      });
    }
  }

  refresh(filters?: TaskFilters) {
    this.fetchTodayPlan(filters);
  }
}

export const planStore = new PlanStore();
