// components/AuthForm.jsx
// -----------------------
// Shows either a Login form or a Register form, toggled by a link.
// On success it calls the onAuthSuccess(token, userName) prop that
// App.jsx provides so the parent can store the token and switch views.
// Errors are displayed inline — no alert() popups.

import { useState } from 'react';
import { login, register } from '../api';

/**
 * @param {{ onAuthSuccess: (token: string, userName: string) => void }} props
 */
function AuthForm({ onAuthSuccess }) {
  // 'login' | 'register' — which form is currently visible
  const [mode, setMode] = useState('login');

  // Controlled field state shared between the two forms
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');

  // Inline error message; null means no error to show
  const [error, setError] = useState(null);

  // Prevents double-submission while the fetch is in flight
  const [loading, setLoading] = useState(false);

  // Reset fields and clear errors when switching between forms
  const switchMode = () => {
    setMode((m) => (m === 'login' ? 'register' : 'login'));
    setName('');
    setEmail('');
    setPassword('');
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();   // stop the browser from reloading the page
    setError(null);
    setLoading(true);

    try {
      let data;
      if (mode === 'login') {
        data = await login(email, password);
      } else {
        data = await register(name, email, password);
      }
      // data.token is the JWT; data.user.name is the display name
      onAuthSuccess(data.token, data.user.name);
    } catch (err) {
      // Show the server's error message (set in api.js handleResponse)
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>{mode === 'login' ? 'Log In' : 'Create Account'}</h2>

      {/* Inline error banner — only rendered when there is an error */}
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit} noValidate>
        {/* Name field only shown in register mode */}
        {mode === 'register' && (
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Register'}
        </button>
      </form>

      {/* Toggle between login and register */}
      <p className="switch-mode">
        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
        <button type="button" className="link-btn" onClick={switchMode}>
          {mode === 'login' ? 'Register' : 'Log In'}
        </button>
      </p>
    </div>
  );
}

export default AuthForm;
