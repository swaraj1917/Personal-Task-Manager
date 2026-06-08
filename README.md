# 📋 Personal Task Manager

A full-stack task management application with drag & drop, search, and filters.

## Features

- ✅ Create, Read, Update, Delete tasks
- ✅ Mark tasks as complete/incomplete
- ✅ Filter by All, Active, Completed
- ✅ Search tasks by title
- ✅ Drag & drop to reorder (works on mobile too)
- ✅ Overdue tasks highlighted in red
- ✅ Responsive design for mobile

## Tech Stack

- **Frontend:** React 19, CSS
- **Backend:** Node.js, Express
- **Storage:** JSON file


## Run Locally

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/task-manager.git
cd task-manager


### 2. Setup Backend
```bash
cd server
npm install
node server.js


### 3. Setup Frontend (Open new terminal)
cd client
npm install
npm run dev

### 4. Open your browser
Go to http://localhost:5173


## API documentation

| Method | Endpoint | What it does |
|--------|----------|--------------|
| GET | /tasks | Get all tasks |
| POST | /tasks | Add a new task |
| PUT | /tasks/:id | Mark task as done/undone |
| PUT | /tasks/edit/:id | Edit a task |
| PUT | /tasks/reorder | Change task order |
| DELETE | /tasks/:id | Delete a task |


## Project Structure
task-manager/
│
├── client/ # React frontend
│ ├── src/
│ │ ├── App.jsx # Main React component (all features)
│ │ ├── App.css # All styling (dark theme, responsive)
│ │ ├── main.jsx # React entry point
│ │ └── index.css # Global styles
│ └── package.json # Frontend dependencies
│
├── server/ # Node.js backend
│ ├── server.js # Express API with all endpoints
│ ├── data/
│ │ └── tasks.json # Tasks stored here (persists after restart)
│ └── package.json # Backend dependencies
│
└── README.md # This file


## Next Steps

### What I chose not to do (due to time):
- User authentication (multiple users)
- Task categories or tags
- Due date reminders/notifications
- Dark/light theme toggle
- Unit tests (backend & frontend)
- Deployment to hosting services

### What I would build next with more time:
- **User authentication** - So multiple users can have their own tasks
- **Task categories** - Organize tasks by Work, Personal, Shopping, etc.
- **Email reminders** - Send notifications when a task is overdue
- **Analytics dashboard** - Charts showing completion rates over time
- **Theme switcher** - Toggle between dark and light mode
- **Mobile app** - Convert to React Native for native mobile experience
- **Database upgrade** - Move from JSON file to PostgreSQL or MongoDB
- **Testing** - Add Jest tests for backend and React Testing Library for frontend
- **Deployment** - Deploy backend to Render and frontend to Vercel