# TaskFlow — Level 3 (Advanced)

Full-Stack Development Internship @ Codveda Technologies

## Overview

Level 3 rebuilds the TaskFlow frontend in React and adds real-time
updates with Socket.io. The backend carries forward the JWT
authentication and MongoDB relationships from Level 2, now serving a
React single-page app instead of vanilla JavaScript, and pushing live
updates to connected clients instead of relying only on page refreshes.

## Tasks Completed

- **Task 1: Full-Stack Application (MERN)**
  A complete MongoDB + Express + React + Node application. Users
  register and log in, and only see their own tasks, enforced both by
  the API and by the JWT attached to every request.

- **Task 2: WebSockets for Real-Time Communication**
  Socket.io keeps every open tab in sync. Creating, completing, or
  deleting a task in one tab updates every other tab for that same
  user instantly, with no page refresh and no polling.

## Tech Stack

| Layer      | Technology                              |
|------------|------------------------------------------|
| Backend    | Node.js, Express.js, Socket.io            |
| Database   | MongoDB Atlas, Mongoose                   |
| Auth       | bcrypt, JSON Web Tokens (JWT)             |
| Frontend   | React (Vite), vanilla CSS                 |
| Real-time  | Socket.io / Socket.io-client              |

## Project Structure

```
LEVEL 3/
├── backend/
│   ├── middleware/auth.js
│   ├── models/User.js
│   ├── models/Task.js
│   ├── routes/auth.js
│   ├── routes/tasks.js
│   ├── server.js
│   ├── .env
│   ├── .gitignore
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthForm.jsx
│   │   │   ├── TaskItem.jsx
│   │   │   ├── TaskList.jsx
│   │   │   └── TaskManager.jsx
│   │   ├── api.js
│   │   ├── socket.js
│   │   ├── App.jsx
│   │   └── App.css
│   ├── .gitignore
│   └── package.json
└── README.md
```

## API Endpoints

| Method | Endpoint             | Auth Required | Description                |
|--------|------------------------|----------------|------------------------------|
| POST   | `/api/auth/register`   | No             | Create an account            |
| POST   | `/api/auth/login`      | No             | Log in and receive a JWT     |
| GET    | `/api/tasks`           | Yes            | List the user's own tasks    |
| GET    | `/api/tasks/:id`       | Yes            | Get one of the user's tasks  |
| POST   | `/api/tasks`           | Yes            | Create a task                |
| PUT    | `/api/tasks/:id`       | Yes            | Update a task                |
| DELETE | `/api/tasks/:id`       | Yes            | Delete a task                |

Protected routes require the header `Authorization: Bearer <token>`.

## How It Works

### REST + Auth (carried forward from Level 2)
Passwords are hashed with bcrypt before being saved. Login returns a
signed JWT, and a `protect` middleware verifies it on every task
request. Each task stores the `user` who created it, taken from the
verified token — never trusted from the request body — so users can
only read or change their own data.

### Real-time updates (new in Level 3)
The Express app is wrapped in a plain Node HTTP server so it can also
host a Socket.io server on the same port. When a browser connects, it
sends its JWT in the socket handshake; the server verifies it the same
way the REST middleware does, and joins that socket to a private room
named after the user's id.

After every successful create, update, or delete in `routes/tasks.js`,
the server emits an event (`taskCreated`, `taskUpdated`, or
`taskDeleted`) to that user's room only. Any other tab or device logged
in as the same user receives the event immediately and updates its
task list — no refresh, no re-fetching, no polling.

### Frontend (React)
`App.jsx` holds the single source of truth for whether a user is
logged in, based on a token stored in `localStorage`. `AuthForm`
handles login/register, `TaskManager` fetches the initial task list on
mount and then hands off to the socket connection for everything after
that, and `TaskItem`/`TaskList` are simple, presentational components
driven entirely by props.

## Getting Started

This app runs as two separate processes — start both, each in its own
terminal.

### Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```
MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_long_random_secret
```

```bash
npm run dev
```

The API and Socket.io server run together at `http://localhost:5000`.

### Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`).

## Testing Real-Time Sync

1. Log in in one browser tab.
2. Open a second tab to the same URL — you'll already be logged in.
3. Add, complete, or delete a task in one tab.
4. Watch it update in the other tab instantly, with no refresh.

## Key Concepts Demonstrated

- Building a full MERN application end to end
- WebSocket communication with Socket.io, authenticated via JWT
- Room-based broadcasting so users only receive their own updates
- React component structure, hooks, and prop-driven state
- Keeping REST and WebSocket responsibilities cleanly separated

