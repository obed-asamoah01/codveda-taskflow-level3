// components/TaskManager.jsx
// --------------------------
// The main "logged-in" view. Responsibilities:
//   1. Fetch the initial list of tasks from the REST API on mount.
//   2. Open a Socket.io connection and keep the task list in sync with
//      real-time events emitted by the server (taskCreated, taskUpdated,
//      taskDeleted).
//   3. Provide handlers for adding, toggling, and deleting tasks.
//      The handlers call the API; the resulting socket event is what
//      actually updates the UI — this avoids double-adding the same task.
//   4. Disconnect the socket cleanly on unmount (logout or page leave).

import { useState, useEffect, useRef } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from '../api';
import { connectSocket } from '../socket';
import TaskList from './TaskList';

/**
 * @param {{
 *   token:    string,
 *   userName: string,
 *   onLogout: () => void,
 * }} props
 */
function TaskManager({ token, userName, onLogout }) {
  const [tasks, setTasks]     = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [addError, setAddError] = useState(null);
  const [adding, setAdding]   = useState(false);

  // Keep a ref to the socket so we can disconnect it from the logout
  // handler (which lives outside the useEffect cleanup).
  const socketRef = useRef(null);

  // -------------------------------------------------------------------------
  // Mount effect: fetch initial tasks + establish the socket connection.
  // The cleanup function runs when the component unmounts (logout / navigation).
  // -------------------------------------------------------------------------
  useEffect(() => {
    // 1. Fetch the initial task list via REST so the UI isn't empty on first load.
    getTasks()
      .then(setTasks)
      .catch((err) => {
        // A 401 means the stored token has expired; log the user out.
        if (err.message.includes('401') || err.message.toLowerCase().includes('unauthorized')) {
          onLogout();
        }
      });

    // 2. Open the socket connection.  The server verifies the JWT in io.use().
    const socket = connectSocket(token);
    socketRef.current = socket;

    // taskCreated — add the new task to the top of the list.
    // Because we rely on this event to update state after createTask(),
    // we do NOT add the task optimistically in the form handler, so there
    // is no risk of duplicates.
    socket.on('taskCreated', (task) => {
      setTasks((prev) => [task, ...prev]);
    });

    // taskUpdated — replace the matching task in place.
    socket.on('taskUpdated', (updatedTask) => {
      setTasks((prev) =>
        prev.map((t) => (t._id === updatedTask._id ? updatedTask : t))
      );
    });

    // taskDeleted — remove the task whose id matches.
    socket.on('taskDeleted', ({ id }) => {
      setTasks((prev) => prev.filter((t) => t._id !== id));
    });

    // Cleanup: disconnect the socket when the component unmounts.
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, onLogout]); // re-run only if the token changes (i.e. re-login)

  // -------------------------------------------------------------------------
  // Add a new task.
  // We call createTask() then clear the input and wait for the 'taskCreated'
  // socket event to actually add the task to state — no optimistic update.
  // -------------------------------------------------------------------------
  const handleAdd = async (e) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;

    setAdding(true);
    setAddError(null);
    try {
      await createTask(title);
      setNewTitle(''); // clear the input; the socket event will update the list
    } catch (err) {
      setAddError(err.message);
    } finally {
      setAdding(false);
    }
  };

  // -------------------------------------------------------------------------
  // Toggle a task's completed flag.
  // Calls the API with the flipped value; the 'taskUpdated' socket event
  // updates the UI so there is no need to touch state here directly.
  // -------------------------------------------------------------------------
  const handleToggle = async (task) => {
    try {
      await updateTask(task._id, { completed: !task.completed });
    } catch (err) {
      console.error('Failed to toggle task:', err.message);
    }
  };

  // -------------------------------------------------------------------------
  // Delete a task.
  // Calls the API; the 'taskDeleted' socket event removes it from state.
  // -------------------------------------------------------------------------
  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
    } catch (err) {
      console.error('Failed to delete task:', err.message);
    }
  };

  // -------------------------------------------------------------------------
  // Logout: disconnect the socket immediately, then let App clear storage.
  // -------------------------------------------------------------------------
  const handleLogout = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    onLogout();
  };

  return (
    <div className="card task-manager">
      {/* Header row with greeting and logout button */}
      <header className="tm-header">
        <h2>Welcome, {userName}!</h2>
        <button type="button" className="btn-logout" onClick={handleLogout}>
          Log Out
        </button>
      </header>

      {/* Add-task form */}
      <form onSubmit={handleAdd} className="add-form">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a new task…"
          disabled={adding}
        />
        <button type="submit" className="btn-primary" disabled={adding || !newTitle.trim()}>
          {adding ? '…' : 'Add'}
        </button>
      </form>

      {/* Inline error if adding failed */}
      {addError && <p className="error">{addError}</p>}

      {/* Task list — passes action handlers down to TaskItem via TaskList */}
      <TaskList tasks={tasks} onToggle={handleToggle} onDelete={handleDelete} />
    </div>
  );
}

export default TaskManager;
