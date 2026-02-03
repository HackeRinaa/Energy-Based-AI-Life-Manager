import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { taskStore, TaskFilters } from "../stores/TaskStore";
import { TaskStatus, TaskPriority } from "@energy-manager/shared";
import "./TaskFilters.css";

interface TaskFiltersProps {
  onFiltersChange: (filters: TaskFilters) => void;
  currentFilters: TaskFilters;
}

const TaskFiltersComponent = observer(({ onFiltersChange, currentFilters }: TaskFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<TaskFilters>(currentFilters);

  useEffect(() => {
    taskStore.fetchTags();
    taskStore.fetchProjects();
  }, []);

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    const cleared: TaskFilters = {};
    setLocalFilters(cleared);
    onFiltersChange(cleared);
    setIsOpen(false);
  };

  const toggleTag = (tag: string) => {
    const currentTags = localFilters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    setLocalFilters({ ...localFilters, tags: newTags });
  };

  return (
    <div className="task-filters">
      <button
        className="filters-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>Filters</span>
        {Object.keys(currentFilters).length > 0 && (
          <span className="filter-count">{Object.keys(currentFilters).length}</span>
        )}
      </button>

      {isOpen && (
        <div
          className="filters-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Task filters"
          onClick={() => setIsOpen(false)}
        >
          <div className="filters-panel" onClick={(e) => e.stopPropagation()}>
            <div className="filters-header">
              <span className="filters-title">Filters</span>
              <button className="filters-close" onClick={() => setIsOpen(false)} aria-label="Close filters">
                ×
              </button>
            </div>
            <div className="filters-content">
            <div className="filter-group">
              <label>Search</label>
              <input
                type="text"
                value={localFilters.search || ""}
                onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
                placeholder="Search tasks..."
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label>Status</label>
              <div className="filter-checkboxes">
                {(["todo", "in-progress", "blocked", "done"] as TaskStatus[]).map(status => (
                  <label key={status} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={(localFilters.status || []).includes(status)}
                      onChange={(e) => {
                        const current = localFilters.status || [];
                        const newStatus = e.target.checked
                          ? [...current, status]
                          : current.filter(s => s !== status);
                        setLocalFilters({ ...localFilters, status: newStatus });
                      }}
                    />
                    <span>{status.replace("-", " ")}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label>Priority</label>
              <select
                value={localFilters.priority || ""}
                onChange={(e) => setLocalFilters({ 
                  ...localFilters, 
                  priority: e.target.value || undefined 
                })}
                className="filter-select"
              >
                <option value="">All</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Project</label>
              <select
                value={localFilters.project || ""}
                onChange={(e) => setLocalFilters({ 
                  ...localFilters, 
                  project: e.target.value || undefined 
                })}
                className="filter-select"
              >
                <option value="">All Projects</option>
                {taskStore.allProjects.map(project => (
                  <option key={project} value={project}>{project}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Tags</label>
              <div className="filter-tags">
                {taskStore.allTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    className={`filter-tag ${(localFilters.tags || []).includes(tag) ? "active" : ""}`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-actions">
              <button onClick={handleApplyFilters} className="filter-button apply">
                Apply
              </button>
              <button onClick={handleClearFilters} className="filter-button clear">
                Clear
              </button>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default TaskFiltersComponent;
