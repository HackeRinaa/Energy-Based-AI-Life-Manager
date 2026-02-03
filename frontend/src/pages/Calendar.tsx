import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { taskStore } from "../stores/TaskStore";
import { Task } from "@energy-manager/shared";
import TaskDetail from "./TaskDetail";
import "./Calendar.css";

function toISODate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function clampToMidnight(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getMonthGrid(viewDate: Date): Date[] {
  const start = startOfMonth(viewDate);
  const end = endOfMonth(viewDate);

  // Week starts on Monday (1). JS getDay(): Sunday=0..Saturday=6.
  const startDay = start.getDay() === 0 ? 7 : start.getDay();
  const gridStart = addDays(start, -(startDay - 1));

  const endDay = end.getDay() === 0 ? 7 : end.getDay();
  const gridEnd = addDays(end, 7 - endDay);

  const days: Date[] = [];
  for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) {
    days.push(clampToMidnight(d));
  }
  return days;
}

function groupTasksByDeadline(tasks: Task[]): Record<string, Task[]> {
  const map: Record<string, Task[]> = {};
  for (const t of tasks) {
    if (!t.deadline) continue;
    const key = t.deadline;
    map[key] = map[key] ? [...map[key], t] : [t];
  }
  return map;
}

const Calendar = observer(() => {
  const [viewDate, setViewDate] = useState(() => clampToMidnight(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => toISODate(new Date()));
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  useEffect(() => {
    // Ensure tasks are loaded; calendar uses deadlines.
    taskStore.fetchTasks();
  }, []);

  const gridDays = useMemo(() => getMonthGrid(viewDate), [viewDate]);
  const byDeadline = useMemo(() => groupTasksByDeadline(taskStore.tasks), [taskStore.tasks]);

  const selectedDayTasks = useMemo(() => {
    return byDeadline[selectedDate] || [];
  }, [byDeadline, selectedDate]);

  const undatedTasks = useMemo(() => {
    return taskStore.tasks.filter(t => !t.deadline && t.status !== "done" && !t.completed);
  }, [taskStore.tasks]);

  const monthLabel = useMemo(() => {
    return viewDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  }, [viewDate]);

  const todayISO = toISODate(new Date());

  return (
    <div className="calendar-page">
      <div className="calendar-header">
        <h1>Calendar</h1>
        <div className="calendar-controls">
          <button
            className="cal-button"
            onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
            aria-label="Previous month"
          >
            ←
          </button>
          <div className="calendar-month">{monthLabel}</div>
          <button
            className="cal-button"
            onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
            aria-label="Next month"
          >
            →
          </button>
        </div>
      </div>

      <div className="calendar-layout">
        <div className="calendar-grid-card">
          <div className="calendar-weekdays">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="weekday">
                {d}
              </div>
            ))}
          </div>

          <div className="calendar-grid">
            {gridDays.map((d) => {
              const iso = toISODate(d);
              const isCurrentMonth = d.getMonth() === viewDate.getMonth();
              const isSelected = iso === selectedDate;
              const isToday = iso === todayISO;
              const dayTasks = byDeadline[iso] || [];
              const openCount = dayTasks.filter(t => t.status !== "done" && !t.completed).length;

              return (
                <button
                  key={iso}
                  className={[
                    "day-cell",
                    isCurrentMonth ? "current-month" : "other-month",
                    isSelected ? "selected" : "",
                    isToday ? "today" : ""
                  ].join(" ")}
                  onClick={() => setSelectedDate(iso)}
                >
                  <div className="day-top">
                    <span className="day-number">{d.getDate()}</span>
                    {openCount > 0 && <span className="day-count">{openCount}</span>}
                  </div>
                  <div className="day-dots" aria-hidden="true">
                    {dayTasks.slice(0, 3).map((t) => (
                      <span
                        key={t.id}
                        className={`dot ${t.status === "blocked" ? "blocked" : t.status === "in-progress" ? "inprogress" : "todo"}`}
                      />
                    ))}
                    {dayTasks.length > 3 && <span className="dot more" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="calendar-side">
          <div className="side-card">
            <h2>{selectedDate === todayISO ? "Today’s deadlines" : `Due ${new Date(selectedDate).toLocaleDateString()}`}</h2>
            {selectedDayTasks.length === 0 ? (
              <p className="muted">Nothing due on this day.</p>
            ) : (
              <div className="side-list">
                {selectedDayTasks.map((t) => (
                  <button
                    key={t.id}
                    className={`side-task ${t.status === "done" || t.completed ? "done" : ""}`}
                    onClick={() => setSelectedTaskId(t.id)}
                  >
                    <div className="side-task-title">{t.title}</div>
                    <div className="side-task-meta">
                      <span className="pill">{t.project || "No project"}</span>
                      <span className="pill">{t.priority}</span>
                      <span className="pill">{t.energyCost}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="side-card">
            <h2>No deadline</h2>
            {undatedTasks.length === 0 ? (
              <p className="muted">All set for now.</p>
            ) : (
              <div className="side-list">
                {undatedTasks.slice(0, 8).map((t) => (
                  <button key={t.id} className="side-task" onClick={() => setSelectedTaskId(t.id)}>
                    <div className="side-task-title">{t.title}</div>
                    <div className="side-task-meta">
                      <span className="pill">{t.project || "No project"}</span>
                      <span className="pill">{t.priority}</span>
                      <span className="pill">{t.energyCost}</span>
                    </div>
                  </button>
                ))}
                {undatedTasks.length > 8 && (
                  <p className="muted">+{undatedTasks.length - 8} more…</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedTaskId && (
        <TaskDetail
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          onTaskUpdated={() => {
            taskStore.fetchTasks();
            setSelectedTaskId(null);
          }}
        />
      )}
    </div>
  );
});

export default Calendar;

