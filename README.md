# 📋 Personal Task Manager

A full-stack task management app built with React and Node.js. Users can create, view, update, and delete personal tasks, with filters, search, drag-and-drop reordering, and overdue highlighting.

---

## 🔗 Live Demo

- **Frontend:** https://personal-task-manager-zeta.vercel.app/
- **Backend API:** https://personal-task-manager-api-bydr.onrender.com

> ⚠️ The backend is hosted on Render's free tier. It may take 30–60 seconds to wake up on the first request.

---

## 🛠 Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React 19 + Vite | Fast dev server, modern React with hooks |
| Backend | Node.js + Express | Simple REST API, easy to read and extend |
| Storage | JSON file | No database setup needed; persists across server restarts |
| Styling | Plain CSS | Full control, no extra dependencies |

---

## ✅ Features

### **Must Have**
- Add a task with title (required), description, and due date
- View all tasks sorted by creation date (newest first)
- Mark a task as complete or incomplete (toggle)
- Edit a task's title, description, or due date (inline — no popups)
- Delete a task with a confirmation prompt
- Filter by All, Active, Completed

### **Should Have**
- Active vs completed count shown on screen
- Overdue tasks visually highlighted with a red border
- Empty state UI when no tasks are present

### **Bonus**
- Search tasks by title (with live result count)
- Tasks persist across server restarts (written to `data/tasks.json`)
- Drag-and-drop to reorder tasks — works on desktop and mobile (long press on mobile to avoid scroll conflicts)

---

## 🚀 How to Run Locally

You only need Node.js installed. Clone the repo and run these commands exactly.

**Step 1 — Clone the repository**
```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git
cd task-manager
```

**Step 2 — Start the backend**
```bash
cd server
npm install
node server.js
```
The API will run at `http://localhost:5000`

**Step 3 — Start the frontend (open a new terminal)**
```bash
cd client
npm install
npm run dev
```
The app will open at `http://localhost:5173`

---

## 📡 API Documentation

Base URL (local): `http://localhost:5000`

| Method | Endpoint | Request Body | Response |
|---|---|---|---|
| GET | `/tasks` | — | Array of all task objects |
| POST | `/tasks` | `{ title, description?, dueDate? }` | The newly created task object |
| PUT | `/tasks/:id` | — | `{ message: "Task updated successfully" }` |
| PUT | `/tasks/edit/:id` | `{ title, description, dueDate }` | `{ message: "Task updated successfully" }` |
| PUT | `/tasks/reorder` | `{ orderedTaskIds: [id, id, ...] }` | `{ message: "Order updated successfully" }` |
| DELETE | `/tasks/:id` | — | `{ message: "Task deleted successfully" }` |

**Task object shape:**
```json
{
  "id": 1780905827528,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "dueDate": "2026-06-15",
  "completed": false,
  "createdAt": "2026-06-08T08:03:47.528Z"
}
```

---

## 📁 Project Structure

```
task-manager/
│
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── App.jsx          # Main component — all features and API calls
│   │   ├── App.css          # All styling (dark theme, responsive, two-column layout)
│   │   ├── main.jsx         # React entry point
│   │   └── index.css        # Global reset styles
│   └── package.json
│
├── server/                  # Node.js backend (Express)
│   ├── server.js            # All API routes (GET, POST, PUT, DELETE)
│   ├── data/
│   │   └── tasks.json       # Persistent task storage (auto-created)
│   └── package.json
│
└── README.md                # This file
```

---

## 🔮 Next Steps

### **What I chose not to build (due to time):**
- User authentication (currently single-user, no login)
- Task categories or priority levels
- Due date reminder notifications
- Unit tests (backend or frontend)

### **What I would build next with more time:**
- **User authentication** — allow multiple users with their own task lists
- **Task categories** — organise tasks by Work, Personal, Shopping, etc.
- **Email reminders** — notify users when a task is approaching or past due
- **Database upgrade** — replace the JSON file with PostgreSQL or MongoDB for scale
- **Testing** — Jest for backend endpoints, React Testing Library for frontend components
- **Analytics** — a dashboard showing completion rates and productivity trends over time
