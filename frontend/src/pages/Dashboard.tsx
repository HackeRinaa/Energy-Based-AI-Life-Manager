import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { energyStore } from "../stores/EnergyStore";
import { planStore } from "../stores/PlanStore";
import { taskStore, TaskFilters } from "../stores/TaskStore";
import { Task } from "@energy-manager/shared";
import EnergyCheckIn from "../components/EnergyCheckIn";
import TaskList from "../components/TaskList";
import PlanExplanation from "../components/PlanExplanation";
import TaskFiltersComponent from "../components/TaskFilters";
import TaskDetail from "./TaskDetail";
import "./Dashboard.css";

const Dashboard = observer(() => {
  const [filters, setFilters] = useState<TaskFilters>({});
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    planStore.fetchTodayPlan(filters);
    taskStore.fetchTags();
    taskStore.fetchProjects();
  }, []);

  const handleEnergyCheckIn = async (value: number, sleepHours?: number) => {
    await energyStore.checkInEnergy(value, sleepHours);
    // Refresh plan after energy check-in
    planStore.refresh(filters);
  };

  const handleTaskComplete = async (taskId: string) => {
    await taskStore.completeTask(taskId);
    planStore.refresh(filters);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleFiltersChange = (newFilters: TaskFilters) => {
    setFilters(newFilters);
    // Apply filters to plan
    planStore.refresh(newFilters);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Today</h1>
        <TaskFiltersComponent
          onFiltersChange={handleFiltersChange}
          currentFilters={filters}
        />
      </div>
      
      <section className="dashboard-section">
        <h2>How are you feeling?</h2>
        <EnergyCheckIn
          currentEnergy={energyStore.currentEnergy}
          currentSleepHours={energyStore.currentSleepHours}
          onCheckIn={handleEnergyCheckIn}
          loading={energyStore.loading}
        />
      </section>

      {planStore.plan && (
        <>
          <section className="dashboard-section">
            <PlanExplanation explanation={planStore.plan.explanation} />
          </section>

          <section className="dashboard-section">
            <h2>Your plan</h2>
            <TaskList
              tasks={planStore.plan.orderedTasks}
              onTaskComplete={handleTaskComplete}
              onTaskClick={handleTaskClick}
              loading={planStore.loading}
            />
          </section>
        </>
      )}

      {planStore.loading && !planStore.plan && (
        <div className="loading">Loading your plan...</div>
      )}

      {planStore.error && (
        <div className="error">Unable to load plan. Please try again.</div>
      )}

      {selectedTask && (
        <TaskDetail
          taskId={selectedTask.id}
          onClose={() => setSelectedTask(null)}
          onTaskUpdated={() => {
            planStore.refresh();
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
});

export default Dashboard;
