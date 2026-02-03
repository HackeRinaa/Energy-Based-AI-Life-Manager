import { Task, TaskStatus, BreakItem } from "@energy-manager/shared";
import "./TaskList.css";

interface TaskListProps {
  tasks: (Task | BreakItem)[];
  onTaskComplete: (taskId: string) => void;
  onTaskClick?: (task: Task) => void;
  loading: boolean;
}

const TaskList = ({ tasks, onTaskComplete, onTaskClick, loading }: TaskListProps) => {
  if (tasks.length === 0) {
    return (
      <div className="task-list-empty">
        <p>No tasks planned for today.</p>
      </div>
    );
  }

  const getEnergyLabel = (level: string) => {
    switch (level) {
      case "low": return "Low";
      case "medium": return "Medium";
      case "high": return "High";
      default: return level;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "admin": return "Admin";
      case "focus": return "Focus";
      case "creative": return "Creative";
      case "physical": return "Physical";
      default: return type;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "low": return "Low";
      case "medium": return "Med";
      case "high": return "High";
      case "critical": return "Critical";
      default: return priority;
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case "todo": return "To Do";
      case "in-progress": return "In Progress";
      case "blocked": return "Blocked";
      case "done": return "Done";
      default: return status;
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case "critical": return "priority-critical";
      case "high": return "priority-high";
      case "medium": return "priority-medium";
      case "low": return "priority-low";
      default: return "";
    }
  };

  const getStatusClass = (status: TaskStatus) => {
    switch (status) {
      case "done": return "status-done";
      case "in-progress": return "status-in-progress";
      case "blocked": return "status-blocked";
      case "todo": return "status-todo";
      default: return "";
    }
  };

  const isBreakItem = (item: Task | BreakItem): item is BreakItem => {
    return 'type' in item && ['coffee', 'lunch', 'short-break', 'long-break'].includes((item as BreakItem).type);
  };

  // Count only tasks (not breaks) for numbering
  let taskNumber = 0;

  return (
    <div className="task-list">
      {tasks.map((item, index) => {
        // Handle break items
        if (isBreakItem(item)) {
          const breakItem = item as BreakItem;
          return (
            <div key={breakItem.id} className={`break-item break-item-${breakItem.type}`}>
              <div className="break-content">
                <span className="break-icon">
                  {breakItem.type === "coffee" && "☕"}
                  {breakItem.type === "lunch" && "🍽️"}
                  {(breakItem.type === "short-break" || breakItem.type === "long-break") && "💆"}
                </span>
                <div className="break-details">
                  <h3 className="break-title">{breakItem.title}</h3>
                  <span className="break-duration">{breakItem.duration} min</span>
                </div>
              </div>
            </div>
          );
        }

        // Handle task items
        taskNumber++;
        const task = item as Task;
        return (
          <div
          key={task.id}
          className={`task-item ${task.completed || task.status === "done" ? "completed" : ""} ${getStatusClass(task.status)}`}
          onClick={() => onTaskClick?.(task)}
          style={{ cursor: onTaskClick ? "pointer" : "default" }}
        >
          <div className="task-content">
            <div className="task-order">{taskNumber}</div>
            <div className="task-details">
              <div className="task-header">
                <h3 className="task-title">{task.title}</h3>
                {task.priority && (
                  <span className={`task-priority ${getPriorityClass(task.priority)}`}>
                    {getPriorityLabel(task.priority)}
                  </span>
                )}
              </div>
              {task.description && (
                <p className="task-description">{task.description}</p>
              )}
              <div className="task-meta">
                <span className="task-badge">{getEnergyLabel(task.energyCost)}</span>
                <span className="task-badge">{getTypeLabel(task.type)}</span>
                <span className={`task-status ${getStatusClass(task.status)}`}>
                  {getStatusLabel(task.status)}
                </span>
                {task.project && (
                  <span className="task-project">{task.project}</span>
                )}
                {task.estimatedMinutes && (
                  <span className="task-estimate">~{task.estimatedMinutes}m</span>
                )}
                {task.deadline && (
                  <span className="task-deadline">
                    Due: {new Date(task.deadline).toLocaleDateString()}
                  </span>
                )}
              </div>
              {task.tags && task.tags.length > 0 && (
                <div className="task-tags">
                  {task.tags.map(tag => (
                    <span key={tag} className="task-tag">{tag}</span>
                  ))}
                </div>
              )}
              {task.subtasks && task.subtasks.length > 0 && (
                <div className="task-subtasks">
                  <span className="subtasks-count">{task.subtasks.length} subtask{task.subtasks.length !== 1 ? "s" : ""}</span>
                </div>
              )}
            </div>
          </div>
          {task.status !== "done" && !task.completed && (
            <button
              className="task-complete-button"
              onClick={(e) => {
                e.stopPropagation();
                onTaskComplete(task.id);
              }}
              disabled={loading}
              aria-label={`Complete ${task.title}`}
            >
              ✓
            </button>
          )}
          </div>
        );
      })}
    </div>
  );
};

export default TaskList;
