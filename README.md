# Energy-Based AI Life Manager

An AI Life Manager that plans your day based on energy, not just deadlines.

## Features

- **Energy-based planning**: Tasks are ordered based on your current energy level
- **Energy check-ins**: Track how you're feeling (1-5 scale)
- **Task management**: Create tasks with energy cost and type
- **Jira-like features**: Tags, priorities, status, projects, subtasks, and more
- **Intelligent filtering**: Filter by tags, projects, status, priority, and search
- **Intelligent ordering**: The planner prioritizes tasks that match your energy
- **Calm, intentional design**: Built with a focus on reducing stress, not adding pressure

## Tech Stack

- **Frontend**: React + TypeScript + MobX + Vite
- **Backend**: Node.js + Express + TypeScript
- **Shared**: Common types and planning logic

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies for all workspaces:
```bash
npm install
```

2. Build the shared package:
```bash
cd shared
npm run build
cd ..
```

### Running the Application

**IMPORTANT**: You need to run both the backend and frontend servers.

1. Start the backend server (in one terminal):
```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:3001`

2. Start the frontend (in another terminal):
```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:3000`

### Usage

1. **Check in your energy**: On the Dashboard, select how you're feeling (1-5)
2. **Add tasks**: Click "Add Task" to create tasks with energy requirements, tags, priorities, etc.
3. **Filter tasks**: Use the Filters button to filter by tags, projects, status, priority, or search
4. **View your plan**: The Dashboard shows your tasks ordered by energy compatibility
5. **Complete tasks**: Click the checkmark to mark tasks as done
6. **View task details**: Click on any task to see full details and edit

## Project Structure

```
├── shared/          # Shared types and planning logic
├── backend/         # Express API server
├── frontend/        # React application
└── package.json     # Workspace root
```

## API Endpoints

- `POST /energy` - Store an energy check-in
- `GET /energy/latest` - Get the most recent energy entry
- `POST /tasks` - Create a task
- `GET /tasks` - Get all tasks (with optional filters)
- `GET /tasks/:id` - Get a single task
- `PATCH /tasks/:id` - Update a task
- `PATCH /tasks/:id/complete` - Mark a task as completed
- `DELETE /tasks/:id` - Delete a task
- `GET /tasks/projects/list` - Get list of all projects
- `GET /tasks/tags/list` - Get list of all tags
- `GET /plan/today` - Generate today's plan (with optional filters)

## Task Features

- **Tags**: Categorize tasks with multiple tags
- **Priority**: Low, Medium, High, Critical
- **Status**: To Do, In Progress, Blocked, Done
- **Projects**: Organize tasks by project
- **Time Estimates**: Plan your day with time estimates
- **Subtasks**: Break down complex tasks
- **Notes**: Add additional context

## Design Philosophy

This app is designed to be:
- **Calm**: Soft colors, generous spacing, no pressure
- **Supportive**: Non-judgmental language and interactions
- **Intentional**: Every feature serves the goal of energy-aware planning

## Troubleshooting

### Connection Refused Errors

If you see `ECONNREFUSED` errors, make sure:
1. The backend server is running on port 3001
2. Both servers are running simultaneously
3. No firewall is blocking the connection

### Filters Not Working

Filters are now properly wired to the plan endpoint. Make sure:
1. The backend is running
2. You've created some tasks with tags/projects to filter by
3. The filters are applied when you click "Apply" in the filter panel

## Future Enhancements

- AI integration for more sophisticated planning
- Calendar sync
- Wearable device integration
- User authentication and persistence
- Task templates
- Recurring tasks
