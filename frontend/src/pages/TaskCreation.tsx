import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { taskStore } from "../stores/TaskStore";
import { EnergyLevel, TaskType, TaskPriority, TaskStatus } from "@energy-manager/shared";
import "./TaskCreation.css";

interface TaskCreationProps {
  onTaskCreated: () => void;
  initialData?: Partial<any>;
}

const TaskCreation = observer(({ onTaskCreated, initialData }: TaskCreationProps) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [energyCost, setEnergyCost] = useState<EnergyLevel>(initialData?.energyCost || "medium");
  const [type, setType] = useState<TaskType>(initialData?.type || "admin");
  const [priority, setPriority] = useState<TaskPriority>(initialData?.priority || "medium");
  const [status, setStatus] = useState<TaskStatus>(initialData?.status || "todo");
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [assignee, setAssignee] = useState(initialData?.assignee || "");
  const [deadline, setDeadline] = useState(initialData?.deadline || "");
  const [estimatedMinutes, setEstimatedMinutes] = useState(initialData?.estimatedMinutes || "");
  const [project, setProject] = useState(initialData?.project || "");
  const [projectInput, setProjectInput] = useState("");
  const [subtasks, setSubtasks] = useState<string[]>(initialData?.subtasks || []);
  const [subtaskInput, setSubtaskInput] = useState("");
  const [notes, setNotes] = useState(initialData?.notes || "");

  useEffect(() => {
    taskStore.fetchTags();
    taskStore.fetchProjects();
  }, []);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleAddSubtask = () => {
    if (subtaskInput.trim() && !subtasks.includes(subtaskInput.trim())) {
      setSubtasks([...subtasks, subtaskInput.trim()]);
      setSubtaskInput("");
    }
  };

  const handleRemoveSubtask = (subtask: string) => {
    setSubtasks(subtasks.filter(s => s !== subtask));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    try {
      const taskData: any = {
        title: title.trim(),
        description: description.trim() || undefined,
        energyCost,
        type,
        priority,
        status,
        tags,
        assignee: assignee.trim() || undefined,
        deadline: deadline || undefined,
        estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : undefined,
        project: project.trim() || undefined,
        subtasks,
        notes: notes.trim() || undefined,
      };

      if (initialData?.id) {
        await taskStore.updateTask(initialData.id, taskData);
      } else {
        await taskStore.createTask(taskData);
      }
      
      // Reset form
      setTitle("");
      setDescription("");
      setEnergyCost("medium");
      setType("admin");
      setPriority("medium");
      setStatus("todo");
      setTags([]);
      setAssignee("");
      setDeadline("");
      setEstimatedMinutes("");
      setProject("");
      setSubtasks([]);
      setNotes("");
      
      onTaskCreated();
    } catch (err) {
      // Error handled by store
    }
  };

  return (
    <div className="task-creation">
      <h1>{initialData?.id ? "Edit Task" : "Add Task"}</h1>
      
      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-group">
          <label htmlFor="title">Task Title *</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="form-input"
            autoFocus
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add more details..."
            className="form-textarea"
            rows={3}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="energyCost">Energy Required</label>
            <select
              id="energyCost"
              value={energyCost}
              onChange={(e) => setEnergyCost(e.target.value as EnergyLevel)}
              className="form-select"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="type">Type</label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as TaskType)}
              className="form-select"
            >
              <option value="admin">Admin</option>
              <option value="focus">Focus</option>
              <option value="creative">Creative</option>
              <option value="physical">Physical</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="form-select"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="form-select"
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="blocked">Blocked</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tags</label>
          <div className="tag-input-group">
            <input
              id="tags"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Add a tag and press Enter"
              className="form-input"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="tag-add-button"
            >
              Add
            </button>
          </div>
          {tags.length > 0 && (
            <div className="tags-list">
              {tags.map(tag => (
                <span key={tag} className="tag-item">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="tag-remove"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          {taskStore.allTags.length > 0 && (
            <div className="suggested-tags">
              <span className="suggested-label">Suggestions:</span>
              {taskStore.allTags
                .filter(tag => !tags.includes(tag))
                .slice(0, 5)
                .map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      if (!tags.includes(tag)) {
                        setTags([...tags, tag]);
                      }
                    }}
                    className="tag-suggestion"
                  >
                    {tag}
                  </button>
                ))}
            </div>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="project">Project</label>
            <div className="project-input-group">
              <input
                id="project"
                type="text"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                placeholder="Project name"
                className="form-input"
                list="projects-list"
              />
              <datalist id="projects-list">
                {taskStore.allProjects.map(p => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="assignee">Assignee</label>
            <input
              id="assignee"
              type="text"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="Who's responsible?"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="deadline">Deadline</label>
            <input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="estimatedMinutes">Time Estimate (minutes)</label>
            <input
              id="estimatedMinutes"
              type="number"
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(e.target.value)}
              placeholder="e.g., 30"
              className="form-input"
              min="0"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="subtasks">Subtasks</label>
          <div className="subtask-input-group">
            <input
              id="subtasks"
              type="text"
              value={subtaskInput}
              onChange={(e) => setSubtaskInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddSubtask();
                }
              }}
              placeholder="Add a subtask and press Enter"
              className="form-input"
            />
            <button
              type="button"
              onClick={handleAddSubtask}
              className="tag-add-button"
            >
              Add
            </button>
          </div>
          {subtasks.length > 0 && (
            <ul className="subtasks-list">
              {subtasks.map((subtask, idx) => (
                <li key={idx} className="subtask-item">
                  {subtask}
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(subtask)}
                    className="tag-remove"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes..."
            className="form-textarea"
            rows={2}
          />
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={!title.trim() || taskStore.loading}
        >
          {taskStore.loading 
            ? (initialData?.id ? "Updating..." : "Adding...") 
            : (initialData?.id ? "Update Task" : "Add Task")}
        </button>

        {taskStore.error && (
          <div className="error">Unable to save task. Please try again.</div>
        )}
      </form>
    </div>
  );
});

export default TaskCreation;
