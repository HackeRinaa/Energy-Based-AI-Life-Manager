import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { taskStore } from "../stores/TaskStore";
import { Task, TaskStatus } from "@energy-manager/shared";
import TaskCreation from "./TaskCreation";
import "./TaskDetail.css";

interface TaskDetailProps {
  taskId: string;
  onClose: () => void;
  onTaskUpdated: () => void;
}

const TaskDetail = observer(({ taskId, onClose, onTaskUpdated }: TaskDetailProps) => {
  const [task, setTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await fetch(`/api/tasks/${taskId}`);
        if (!response.ok) throw new Error("Failed to fetch task");
        const taskData = await response.json();
        setTask(taskData);
      } catch (err) {
        console.error("Failed to fetch task", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!task) return;
    await taskStore.changeStatus(task.id, newStatus);
    const updated = await taskStore.updateTask(task.id, { status: newStatus });
    if (updated) {
      setTask(updated);
      onTaskUpdated();
    }
  };

  if (loading) {
    return (
      <div className="task-detail-overlay" onClick={onClose}>
        <div className="task-detail" onClick={(e) => e.stopPropagation()}>
          <div className="loading">Loading task...</div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="task-detail-overlay" onClick={onClose}>
        <div className="task-detail" onClick={(e) => e.stopPropagation()}>
          <div className="error">Task not found</div>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="task-detail-overlay" onClick={onClose}>
        <div className="task-detail task-detail-editing" onClick={(e) => e.stopPropagation()}>
          <button className="close-button" onClick={onClose}>×</button>
          <TaskCreation
            initialData={task}
            onTaskCreated={() => {
              setIsEditing(false);
              onTaskUpdated();
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="task-detail-overlay" onClick={onClose}>
      <div className="task-detail" onClick={(e) => e.stopPropagation()}>
        <div className="task-detail-header">
          <h1>{task.title}</h1>
          <div className="task-detail-actions">
            <button className="edit-button" onClick={() => setIsEditing(true)}>
              Edit
            </button>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
        </div>

        <div className="task-detail-content">
          {task.description && (
            <section className="task-detail-section">
              <h3>Description</h3>
              <p>{task.description}</p>
            </section>
          )}

          <section className="task-detail-section">
            <h3>Details</h3>
            <div className="task-detail-grid">
              <div className="detail-item">
                <span className="detail-label">Status</span>
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                  className="status-select"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="blocked">Blocked</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div className="detail-item">
                <span className="detail-label">Priority</span>
                <span className="detail-value">{task.priority}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Energy Required</span>
                <span className="detail-value">{task.energyCost}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Type</span>
                <span className="detail-value">{task.type}</span>
              </div>

              {task.project && (
                <div className="detail-item">
                  <span className="detail-label">Project</span>
                  <span className="detail-value">{task.project}</span>
                </div>
              )}

              {task.assignee && (
                <div className="detail-item">
                  <span className="detail-label">Assignee</span>
                  <span className="detail-value">{task.assignee}</span>
                </div>
              )}

              {task.deadline && (
                <div className="detail-item">
                  <span className="detail-label">Deadline</span>
                  <span className="detail-value">
                    {new Date(task.deadline).toLocaleDateString()}
                  </span>
                </div>
              )}

              {task.estimatedMinutes && (
                <div className="detail-item">
                  <span className="detail-label">Time Estimate</span>
                  <span className="detail-value">{task.estimatedMinutes} minutes</span>
                </div>
              )}
            </div>
          </section>

          {task.tags && task.tags.length > 0 && (
            <section className="task-detail-section">
              <h3>Tags</h3>
              <div className="task-tags">
                {task.tags.map(tag => (
                  <span key={tag} className="task-tag">{tag}</span>
                ))}
              </div>
            </section>
          )}

          {task.subtasks && task.subtasks.length > 0 && (
            <section className="task-detail-section">
              <h3>Subtasks</h3>
              <ul className="subtasks-list">
                {task.subtasks.map((subtask, idx) => (
                  <li key={idx}>{subtask}</li>
                ))}
              </ul>
            </section>
          )}

          {task.notes && (
            <section className="task-detail-section">
              <h3>Notes</h3>
              <p>{task.notes}</p>
            </section>
          )}

          <section className="task-detail-section">
            <div className="task-meta-info">
              <span>Created: {new Date(task.createdAt).toLocaleString()}</span>
              <span>Updated: {new Date(task.updatedAt).toLocaleString()}</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
});

export default TaskDetail;
