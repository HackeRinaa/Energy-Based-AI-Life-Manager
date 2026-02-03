import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { taskStore } from "./stores/TaskStore";
import { energyStore } from "./stores/EnergyStore";
import { planStore } from "./stores/PlanStore";
import Dashboard from "./pages/Dashboard";
import TaskCreation from "./pages/TaskCreation";
import Calendar from "./pages/Calendar";
import "./App.css";

const App = observer(() => {
  useEffect(() => {
    // Load initial data
    taskStore.fetchTasks();
    energyStore.fetchLatestEnergy();
    planStore.fetchTodayPlan();
  }, []);

  // Simple routing - in a real app, use React Router
  const [currentPage, setCurrentPage] = useState<"dashboard" | "calendar" | "create">("dashboard");

  return (
    <div className="app">
      <nav className="nav">
        <button
          className={`nav-button ${currentPage === "dashboard" ? "active" : ""}`}
          onClick={() => setCurrentPage("dashboard")}
        >
          Today
        </button>
        <button
          className={`nav-button ${currentPage === "calendar" ? "active" : ""}`}
          onClick={() => setCurrentPage("calendar")}
        >
          Calendar
        </button>
        <button
          className={`nav-button ${currentPage === "create" ? "active" : ""}`}
          onClick={() => setCurrentPage("create")}
        >
          Add Task
        </button>
      </nav>

      <main className="main-content">
        {currentPage === "dashboard" && <Dashboard />}
        {currentPage === "calendar" && <Calendar />}
        {currentPage === "create" && <TaskCreation onTaskCreated={() => {
          setCurrentPage("dashboard");
          planStore.refresh();
        }} />}
      </main>
    </div>
  );
});

export default App;
