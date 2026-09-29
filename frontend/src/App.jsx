// App.jsx
// -------
// Root component. Owns the single piece of "are we logged in?" state
// and decides which top-level view to render.
//
// Flow:
//   • On first load, check localStorage for a saved token + userName.
//     If found, go straight to TaskManager (it will fetch tasks itself).
//   • AuthForm calls onAuthSuccess → store token + userName in
//     localStorage and flip state to show TaskManager.
//   • TaskManager calls onLogout (or a 401 causes it) → clear
//     localStorage and flip back to AuthForm.

import { useState } from 'react';
import AuthForm from './components/AuthForm';
import TaskManager from './components/TaskManager';
import './App.css';

function App() {
  // Initialise state directly from localStorage so a page refresh
  // doesn't send the user back to the login screen.
  const [token, setToken]       = useState(() => localStorage.getItem('token'));
  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || '');

  // Called by AuthForm when login / register succeeds.
  const handleAuthSuccess = (newToken, name) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('userName', name);
    setToken(newToken);
    setUserName(name);
  };

  // Called by TaskManager's logout button, or when any task API call
  // returns 401 (expired / invalid token).
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    setToken(null);
    setUserName('');
  };

  return (
    <div className="app-wrapper">
      {token ? (
        // User is authenticated — show the task manager.
        <TaskManager
          token={token}
          userName={userName}
          onLogout={handleLogout}
        />
      ) : (
        // No token — show the auth form.
        <AuthForm onAuthSuccess={handleAuthSuccess} />
      )}
    </div>
  );
}

export default App;
