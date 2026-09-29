// components/TaskList.jsx
// -----------------------
// Renders the full list of tasks, or a friendly empty-state message.
// Delegates individual task rendering to TaskItem so each concern
// lives in exactly one place.

import TaskItem from './TaskItem';

/**
 * @param {{
 *   tasks:    Array<{ _id: string, title: string, completed: boolean }>,
 *   onToggle: (task: object) => void,
 *   onDelete: (id: string) => void,
 * }} props
 */
function TaskList({ tasks, onToggle, onDelete }) {
  // Empty-state message so the user isn't staring at a blank screen
  if (tasks.length === 0) {
    return <p className="empty-state">No tasks yet — add one above!</p>;
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task._id}   // React needs a stable key; MongoDB's _id is perfect
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}

export default TaskList;
