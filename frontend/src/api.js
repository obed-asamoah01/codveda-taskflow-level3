// api.js
// ------
// Central module for all HTTP calls to the backend REST API.
// Auth routes are unauthenticated; task routes attach a JWT from localStorage.

const BASE_URL = 'http://localhost:5000/api';

// ---------------------------------------------------------------------------
// Helper: read the stored JWT and build the Authorization header value.
// ---------------------------------------------------------------------------
const authHeader = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

// ---------------------------------------------------------------------------
// Helper: throw a meaningful error when the server returns a non-2xx status.
// Tries to parse the server's JSON error body first.
// ---------------------------------------------------------------------------
const handleResponse = async (res) => {
  if (res.ok) return res.json();

  // Attempt to extract the server's error message for a better DX.
  let message = `Request failed with status ${res.status}.`;
  try {
    const body = await res.json();
    if (body.message) message = body.message;
  } catch {
    // Body wasn't JSON — keep the generic message.
  }
  throw new Error(message);
};

// ---------------------------------------------------------------------------
// Auth helpers — no JWT needed, server issues one on success.
// ---------------------------------------------------------------------------

/** Register a new account. Returns { token, user }. */
export const register = (name, email, password) =>
  fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  }).then(handleResponse);

/** Log in to an existing account. Returns { token, user }. */
export const login = (email, password) =>
  fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }).then(handleResponse);

// ---------------------------------------------------------------------------
// Task helpers — each one sends the JWT stored in localStorage.
// ---------------------------------------------------------------------------

/** Fetch all tasks belonging to the logged-in user. Returns Task[]. */
export const getTasks = () =>
  fetch(`${BASE_URL}/tasks`, { headers: authHeader() }).then(handleResponse);

/** Create a new task with the given title. Returns the created Task. */
export const createTask = (title) =>
  fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify({ title }),
  }).then(handleResponse);

/** Partially update a task (e.g. { completed: true }). Returns the updated Task. */
export const updateTask = (id, updates) =>
  fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: authHeader(),
    body: JSON.stringify(updates),
  }).then(handleResponse);

/** Delete a task by id. Returns { message }. */
export const deleteTask = (id) =>
  fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: authHeader(),
  }).then(handleResponse);
