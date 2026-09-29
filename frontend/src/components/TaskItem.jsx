// components/TaskItem.jsx
// -----------------------
// Renders a single task row with:
//   • a checkbox to toggle completion
//   • the task title (struck-through when completed)
//   • a delete button
//
// This component is intentionally "dumb" — it calls props instead of
// the API directly, keeping all API logic in TaskManager.jsx.

/**
 * @param {{
 *   task:     { _id: string, title: string, completed: boolean },
 *   onToggle: (task: object) => void,
 *   onDelete: (id: string) => void,
 * }} props
 */
function TaskItem({ task, onToggle, onDelete }) {
  return (
    <li className={`task-item ${task.completed ? 'completed' : ''}`}>
      {/* Checkbox reflects and toggles the completed state */}
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task)}
        aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
      />

      {/* Title is struck through via CSS when the .completed class is present */}
      <span className="task-title">{task.title}</span>

      {/* Delete button calls the parent's handler with just the task id */}
      <button
        type="button"
        className="btn-delete"
        onClick={() => onDelete(task._id)}
        aria-label={`Delete "${task.title}"`}
      >
        ✕
      </button>
    </li>
  );
}

export default TaskItem;
